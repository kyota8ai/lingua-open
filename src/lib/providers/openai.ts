import type { ConversationProvider, ProviderEvents } from "./types";
import { ProviderError } from "./types";
import type { PromptContext } from "../prompts";
import { buildSystemPrompt } from "../prompts";
import { FALLBACK_MODELS } from "../models";
import { DEFAULT_VOICES } from "../data/voices";
import { normalizeTranscript } from "../transcript";

/**
 * OpenAI Realtime over WebRTC, key sent directly from the browser (BYOK).
 * The official recommendation for hosted products is an ephemeral-token
 * backend; with BYOK the user talks to OpenAI with their own key on purpose
 * key on purpose. No middleman exists to mint ephemeral tokens.
 */
const BASE_URL = "https://api.openai.com/v1/realtime/calls";

export class OpenAIRealtimeProvider implements ConversationProvider {
  readonly id = "openai";
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private mic: MediaStream | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private levelTimer: number | null = null;
  private events: ProviderEvents | null = null;
  private closing = false;

  constructor(
    private apiKey: string,
    private model: string = FALLBACK_MODELS.openai.conversation,
    private voice: string = DEFAULT_VOICES.openai,
  ) {}

  async connect(ctx: PromptContext, events: ProviderEvents): Promise<void> {
    this.events = events;
    events.onStatus("connecting");

    let mic: MediaStream;
    try {
      mic = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      throw new ProviderError("Microphone access was denied.", "Allow microphone access in your browser and try again.");
    }
    this.mic = mic;

    try {
      const pc = new RTCPeerConnection();
      this.pc = pc;

      const audioEl = new Audio();
      audioEl.autoplay = true;
      this.audioEl = audioEl;

      pc.ontrack = (e) => {
        audioEl.srcObject = e.streams[0];
        this.startLevelMeter(e.streams[0]);
      };
      pc.onconnectionstatechange = () => {
        if (this.closing) return;
        if (pc.connectionState === "failed" || pc.connectionState === "disconnected") {
          this.events?.onStatus("error", "Connection lost");
          this.events?.onError("The connection to OpenAI dropped mid-session.");
        }
      };

      for (const track of mic.getTracks()) pc.addTrack(track, mic);

      const dc = pc.createDataChannel("oai-events");
      this.dc = dc;
      dc.onmessage = (e) => this.handleEvent(e.data as string);
      dc.onopen = () => {
        this.sendEvent({
          type: "session.update",
          session: {
            type: "realtime",
            instructions: buildSystemPrompt(ctx),
            audio: {
              input: { transcription: { model: "gpt-4o-mini-transcribe" }, turn_detection: { type: "semantic_vad" } },
              output: { voice: this.voice },
            },
          },
        });
        // Ask the model to open the conversation (the prompt tells it how).
        this.sendEvent({ type: "response.create" });
        this.events?.onStatus("live");
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const res = await fetch(`${BASE_URL}?model=${encodeURIComponent(this.model)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/sdp" },
        body: offer.sdp,
      });
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        if (res.status === 401) {
          throw new ProviderError("OpenAI rejected the API key.", "Check the key in Settings. It stays in this browser only.");
        }
        throw new ProviderError(`OpenAI connection failed (${res.status}).`, body.slice(0, 200));
      }
      const answerSdp = await res.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });
    } catch (e) {
      // Any failure after the mic was acquired must release everything.
      await this.disconnect();
      if (e instanceof ProviderError) throw e;
      throw new ProviderError("Could not reach the OpenAI Realtime API.", "Check your network connection and try again.");
    }
  }

  private pendingAssistant = new Map<string, string>();

  private handleEvent(raw: string) {
    let ev: Record<string, unknown>;
    try {
      ev = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return;
    }
    const type = ev.type as string;

    if (type === "conversation.item.input_audio_transcription.completed") {
      const text = clean((ev.transcript as string | undefined) ?? "");
      if (text) {
        this.events?.onTranscript({ id: (ev.item_id as string) ?? crypto.randomUUID(), role: "user", text, final: true });
      }
    } else if (type === "response.output_audio_transcript.delta" || type === "response.audio_transcript.delta") {
      const id = (ev.item_id as string) ?? "assistant";
      const acc = (this.pendingAssistant.get(id) ?? "") + ((ev.delta as string) ?? "");
      this.pendingAssistant.set(id, acc);
      this.events?.onTranscript({ id, role: "assistant", text: clean(acc), final: false });
    } else if (type === "response.output_audio_transcript.done" || type === "response.audio_transcript.done") {
      const id = (ev.item_id as string) ?? "assistant";
      const text = (ev.transcript as string | undefined) ?? this.pendingAssistant.get(id) ?? "";
      this.pendingAssistant.delete(id);
      const done = clean(text);
      if (done) this.events?.onTranscript({ id, role: "assistant", text: done, final: true });
    } else if (type === "error") {
      const err = ev.error as { message?: string } | undefined;
      this.events?.onError(err?.message ?? "Realtime API error");
    }
  }

  private sendEvent(payload: unknown) {
    if (this.dc?.readyState === "open") this.dc.send(JSON.stringify(payload));
  }

  repeatLast() {
    this.sendEvent({
      type: "response.create",
      response: { instructions: "Repeat your previous reply verbatim, a little slower and clearly." },
    });
  }

  nudge(instruction: string) {
    this.sendEvent({ type: "response.create", response: { instructions: instruction } });
  }

  sendText(text: string) {
    this.sendEvent({
      type: "conversation.item.create",
      item: { type: "message", role: "user", content: [{ type: "input_text", text }] },
    });
    this.sendEvent({ type: "response.create" });
    this.events?.onTranscript({ id: crypto.randomUUID(), role: "user", text, final: true });
  }

  setMuted(muted: boolean) {
    this.mic?.getAudioTracks().forEach((t) => (t.enabled = !muted));
    this.events?.onStatus(muted ? "muted" : "live");
  }

  private startLevelMeter(stream: MediaStream) {
    try {
      const ctx = new AudioContext();
      this.audioCtx = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (const v of data) sum += v;
        this.events?.onLevel(Math.min(1, sum / data.length / 140));
      };
      this.levelTimer = window.setInterval(tick, 80);
    } catch {
      // level meter is cosmetic; ignore failures
    }
  }

  private tornDown = false;

  async disconnect(): Promise<void> {
    if (this.tornDown) return;
    this.tornDown = true;
    this.closing = true;
    if (this.levelTimer) window.clearInterval(this.levelTimer);
    this.levelTimer = null;
    if (this.audioCtx) {
      await this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
    }
    if (this.dc) {
      this.dc.onmessage = null;
      this.dc.close();
      this.dc = null;
    }
    if (this.pc) {
      this.pc.onconnectionstatechange = null;
      this.pc.ontrack = null;
      this.pc.close();
      this.pc = null;
    }
    this.mic?.getTracks().forEach((t) => t.stop());
    this.mic = null;
    if (this.audioEl) {
      this.audioEl.srcObject = null;
      this.audioEl = null;
    }
    this.events?.onStatus("ended");
  }
}

/** Recognizer output needs script-aware whitespace cleanup before display. */
function clean(text: string): string {
  return normalizeTranscript(text.trim());
}
