import type { ConversationProvider, ProviderEvents } from "./types";
import { ProviderError } from "./types";
import type { PromptContext } from "../prompts";
import { buildSystemPrompt } from "../prompts";

/**
 * Gemini Live API over WebSocket, key sent directly from the browser (BYOK).
 * Mic audio: 16 kHz PCM16 chunks. Model audio: 24 kHz PCM16, played through
 * a scheduled AudioContext queue.
 */
export const GEMINI_LIVE_MODEL = "gemini-2.5-flash-native-audio-preview-09-2025";
const WS_URL =
  "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";

const IN_RATE = 16000;
const OUT_RATE = 24000;

export class GeminiLiveProvider implements ConversationProvider {
  readonly id = "gemini";
  private ws: WebSocket | null = null;
  private mic: MediaStream | null = null;
  private inCtx: AudioContext | null = null;
  private outCtx: AudioContext | null = null;
  private worklet: AudioWorkletNode | null = null;
  private playCursor = 0;
  private muted = false;
  private closing = false;
  private events: ProviderEvents | null = null;
  private userBuf = "";
  private modelBuf = "";
  private userTurnId = crypto.randomUUID();
  private modelTurnId = crypto.randomUUID();

  constructor(
    private apiKey: string,
    private model: string = GEMINI_LIVE_MODEL,
  ) {}

  async connect(ctx: PromptContext, events: ProviderEvents): Promise<void> {
    this.events = events;
    events.onStatus("connecting");

    let mic: MediaStream;
    try {
      mic = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: IN_RATE, channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
    } catch {
      throw new ProviderError("Microphone access was denied.", "Allow microphone access in your browser and try again.");
    }
    this.mic = mic;

    try {
      await new Promise<void>((resolve, reject) => {
        let settled = false;
        const settle = (fn: () => void) => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timeout);
          fn();
        };
        // A close with an unexpected code (quota, bad model, server error) fires
        // no error event; without this the connect promise would hang forever.
        const timeout = window.setTimeout(() => {
          settle(() =>
            reject(new ProviderError("Connecting to Gemini timed out.", "Check your network and API key, then try again.")),
          );
        }, 15000);

        const ws = new WebSocket(`${WS_URL}?key=${encodeURIComponent(this.apiKey)}`);
        this.ws = ws;

        ws.onopen = () => {
          ws.send(
            JSON.stringify({
              setup: {
                model: `models/${this.model}`,
                generationConfig: { responseModalities: ["AUDIO"] },
                systemInstruction: { parts: [{ text: buildSystemPrompt(ctx) }] },
                inputAudioTranscription: {},
                outputAudioTranscription: {},
              },
            }),
          );
        };

        ws.onmessage = async (e) => {
          const data = typeof e.data === "string" ? e.data : await (e.data as Blob).text();
          let msg: Record<string, unknown>;
          try {
            msg = JSON.parse(data) as Record<string, unknown>;
          } catch {
            return;
          }
          if (msg.setupComplete !== undefined) {
            await this.startMicPipeline();
            // Kick off the model's opening line per the system prompt.
            this.sendClientText("(The session has started. Open the conversation as instructed.)", false);
            this.events?.onStatus("live");
            settle(resolve);
            return;
          }
          this.handleServerMessage(msg);
        };

        ws.onerror = () => {
          settle(() =>
            reject(
              new ProviderError("Could not reach the Gemini Live API.", "Check the API key in Settings and your network."),
            ),
          );
        };
        ws.onclose = (ev) => {
          if (!settled) {
            // Closed before setup completed: surface it, whatever the code.
            const keyProblem = ev.code === 1008 || ev.code === 4001;
            settle(() =>
              reject(
                keyProblem
                  ? new ProviderError("Gemini rejected the API key.", "Check the key in Settings. It stays in this browser only.")
                  : new ProviderError(`Gemini closed the connection (${ev.code}).`, ev.reason || "Try again in a moment."),
              ),
            );
            return;
          }
          if (!this.closing) {
            this.events?.onError("The connection to Gemini dropped mid-session.");
            this.events?.onStatus("error", "Connection lost");
          } else {
            this.events?.onStatus("ended");
          }
        };
      });
    } catch (e) {
      // Release the mic and socket from the failed attempt.
      await this.disconnect().catch(() => {});
      throw e;
    }
  }

  private handleServerMessage(msg: Record<string, unknown>) {
    const content = msg.serverContent as
      | {
          modelTurn?: { parts?: Array<{ inlineData?: { mimeType?: string; data?: string } }> };
          inputTranscription?: { text?: string };
          outputTranscription?: { text?: string };
          turnComplete?: boolean;
          interrupted?: boolean;
        }
      | undefined;
    if (!content) return;

    if (content.inputTranscription?.text) {
      this.userBuf += content.inputTranscription.text;
      this.events?.onTranscript({ id: this.userTurnId, role: "user", text: this.userBuf.trim(), final: false });
    }
    if (content.outputTranscription?.text) {
      // Model reply started: finalize the user's turn first.
      if (this.userBuf.trim()) {
        this.events?.onTranscript({ id: this.userTurnId, role: "user", text: this.userBuf.trim(), final: true });
        this.userBuf = "";
        this.userTurnId = crypto.randomUUID();
      }
      this.modelBuf += content.outputTranscription.text;
      this.events?.onTranscript({ id: this.modelTurnId, role: "assistant", text: this.modelBuf.trim(), final: false });
    }

    const parts = content.modelTurn?.parts ?? [];
    for (const part of parts) {
      const inline = part.inlineData;
      if (inline?.data && inline.mimeType?.startsWith("audio/pcm")) this.playPcmChunk(inline.data);
    }

    if (content.interrupted) {
      this.flushPlayback();
    }
    if (content.turnComplete) {
      if (this.modelBuf.trim()) {
        this.events?.onTranscript({ id: this.modelTurnId, role: "assistant", text: this.modelBuf.trim(), final: true });
      }
      this.modelBuf = "";
      this.modelTurnId = crypto.randomUUID();
    }
  }

  private async startMicPipeline() {
    if (!this.mic) return;
    const ctx = new AudioContext({ sampleRate: IN_RATE });
    this.inCtx = ctx;
    const src = ctx.createMediaStreamSource(this.mic);

    const workletUrl = URL.createObjectURL(
      new Blob(
        [
          `class PcmCapture extends AudioWorkletProcessor {
            process(inputs) {
              const ch = inputs[0]?.[0];
              if (ch) this.port.postMessage(ch.slice(0));
              return true;
            }
          }
          registerProcessor("pcm-capture", PcmCapture);`,
        ],
        { type: "application/javascript" },
      ),
    );
    await ctx.audioWorklet.addModule(workletUrl);
    URL.revokeObjectURL(workletUrl);

    const node = new AudioWorkletNode(ctx, "pcm-capture");
    this.worklet = node;
    let level = 0;
    node.port.onmessage = (e: MessageEvent<Float32Array>) => {
      if (this.muted || this.ws?.readyState !== WebSocket.OPEN) return;
      const f32 = e.data;
      let peak = 0;
      const pcm = new Int16Array(f32.length);
      for (let i = 0; i < f32.length; i++) {
        const s = Math.max(-1, Math.min(1, f32[i]));
        pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        peak = Math.max(peak, Math.abs(s));
      }
      level = level * 0.8 + peak * 0.2;
      this.events?.onLevel(Math.min(1, level * 1.6));
      this.ws.send(
        JSON.stringify({
          realtimeInput: {
            audio: { mimeType: `audio/pcm;rate=${IN_RATE}`, data: base64FromBytes(new Uint8Array(pcm.buffer)) },
          },
        }),
      );
    };
    src.connect(node);
    // Worklet output is not routed to speakers; capture only.
  }

  private ensureOutCtx(): AudioContext {
    if (!this.outCtx) {
      this.outCtx = new AudioContext({ sampleRate: OUT_RATE });
      this.playCursor = this.outCtx.currentTime;
    }
    return this.outCtx;
  }

  private playPcmChunk(b64: string) {
    try {
      this.playPcmChunkUnsafe(b64);
    } catch {
      // A malformed audio chunk is dropped; the next chunk resyncs playback.
    }
  }

  private playPcmChunkUnsafe(b64: string) {
    const ctx = this.ensureOutCtx();
    const bytes = bytesFromBase64(b64);
    const pcm = new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 2));
    const f32 = new Float32Array(pcm.length);
    for (let i = 0; i < pcm.length; i++) f32[i] = pcm[i] / 0x8000;
    const buffer = ctx.createBuffer(1, f32.length, OUT_RATE);
    buffer.copyToChannel(f32, 0);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);
    const startAt = Math.max(ctx.currentTime, this.playCursor);
    src.start(startAt);
    this.playCursor = startAt + buffer.duration;
  }

  private flushPlayback() {
    // Drop queued audio on barge-in: reset the schedule cursor.
    if (this.outCtx) {
      this.outCtx.close().catch(() => {});
      this.outCtx = null;
    }
  }

  private sendClientText(text: string, echo: boolean) {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    this.ws.send(
      JSON.stringify({
        clientContent: { turns: [{ role: "user", parts: [{ text }] }], turnComplete: true },
      }),
    );
    if (echo) this.events?.onTranscript({ id: crypto.randomUUID(), role: "user", text, final: true });
  }

  repeatLast() {
    this.sendClientText("(Please repeat your previous reply, a little slower and clearly.)", false);
  }

  nudge(instruction: string) {
    this.sendClientText(`(${instruction})`, false);
  }

  sendText(text: string) {
    this.sendClientText(text, true);
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.events?.onStatus(muted ? "muted" : "live");
  }

  private tornDown = false;

  async disconnect(): Promise<void> {
    if (this.tornDown) return;
    this.tornDown = true;
    this.closing = true;
    this.worklet?.disconnect();
    this.worklet = null;
    if (this.inCtx) {
      await this.inCtx.close().catch(() => {});
      this.inCtx = null;
    }
    this.flushPlayback();
    this.mic?.getTracks().forEach((t) => t.stop());
    this.mic = null;
    if (this.ws) {
      // Detach handlers first: the async close event must not fire status
      // updates after teardown (it would overwrite an error state).
      this.ws.onopen = this.ws.onmessage = this.ws.onerror = this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
    }
    this.events?.onStatus("ended");
  }
}

function base64FromBytes(bytes: Uint8Array): string {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

function bytesFromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
