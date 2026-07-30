import type { PromptContext } from "../prompts";

export type ProviderStatus =
  | "idle"
  | "connecting"
  | "live"
  | "muted"
  | "ended"
  | "error";

export interface ProviderEvents {
  onStatus: (status: ProviderStatus, detail?: string) => void;
  /** Streaming updates for a turn. `final` marks the turn as complete. */
  onTranscript: (turn: { id: string; role: "user" | "assistant"; text: string; final: boolean }) => void;
  /** 0..1 output level for the waveform */
  onLevel: (level: number) => void;
  onError: (message: string) => void;
}

export interface ConversationProvider {
  readonly id: string;
  connect(ctx: PromptContext, events: ProviderEvents): Promise<void>;
  /** Ask the model to say its last thing again */
  repeatLast(): void;
  /** Send a short out-of-band instruction, e.g. "speak slower" */
  nudge(instruction: string): void;
  /** Text fallback input (demo mode, or push-to-talk unavailable) */
  sendText(text: string): void;
  setMuted(muted: boolean): void;
  disconnect(): Promise<void>;
}

export class ProviderError extends Error {
  constructor(
    message: string,
    /** user-facing recovery hint */
    public hint?: string,
  ) {
    super(message);
  }
}
