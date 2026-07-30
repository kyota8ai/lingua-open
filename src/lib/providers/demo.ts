import type { ConversationProvider, ProviderEvents } from "./types";
import type { PromptContext } from "../prompts";
import { findScenario } from "../data/scenarios";

/**
 * Keyless demo provider. Lets anyone try the whole flow (conversation UI,
 * feedback, SRS) before adding an API key. Replies are scripted; audio uses
 * the browser's speech synthesis where available. Clearly labeled in the UI.
 */
export class DemoProvider implements ConversationProvider {
  readonly id = "demo";
  private events: ProviderEvents | null = null;
  private step = 0;
  private timers: number[] = [];
  private script: string[] = [];
  private lastLine = "";
  private ctx: PromptContext | null = null;
  private levelTimer: number | null = null;

  async connect(ctx: PromptContext, events: ProviderEvents): Promise<void> {
    this.events = events;
    this.ctx = ctx;
    events.onStatus("connecting");

    const scenario = findScenario(ctx.scenario?.id ?? null);
    const opening = scenario
      ? `Hi! Demo mode is on, so I'll reply with scripted lines instead of a live AI. We're playing "${scenario.title}". Type or dictate your reply below, exactly like a real session.`
      : "Hi! Demo mode is on, so I'll reply with scripted lines instead of a live AI. Tell me about your day, typing works like speech here.";

    this.script = [
      opening,
      "Nice. In a real session I would answer in your target language and keep my turns short so you talk more than me.",
      "Good, keep going. Notice the task checklist on the left ticking off as you cover each goal.",
      "One more exchange and we can wrap up. When you end the session, I'll generate corrections and vocabulary to review.",
      "Great practice! Tap the red end button whenever you're ready and check your feedback.",
    ];

    this.timers.push(
      window.setTimeout(() => {
        this.events?.onStatus("live");
        this.say(this.script[0]);
      }, 700),
    );
  }

  private say(text: string) {
    this.lastLine = text;
    const id = crypto.randomUUID();
    // Simulate streaming for realistic transcript behavior.
    const words = text.split(" ");
    let acc = "";
    words.forEach((w, i) => {
      this.timers.push(
        window.setTimeout(() => {
          acc = acc ? `${acc} ${w}` : w;
          this.events?.onTranscript({ id, role: "assistant", text: acc, final: i === words.length - 1 });
          this.events?.onLevel(0.35 + Math.random() * 0.4);
          if (i === words.length - 1) this.events?.onLevel(0);
        }, 90 * i),
      );
    });
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.02;
      window.speechSynthesis.speak(u);
    }
  }

  repeatLast() {
    if (this.lastLine) this.say(this.lastLine);
  }

  nudge(instruction: string) {
    this.say(`(Demo) Noted: "${instruction}". A live provider would adapt its speech now.`);
  }

  sendText(text: string) {
    this.events?.onTranscript({ id: crypto.randomUUID(), role: "user", text, final: true });
    this.step = Math.min(this.step + 1, this.script.length - 1);
    const reply = this.script[this.step];
    this.timers.push(window.setTimeout(() => this.say(reply), 500));
  }

  setMuted(muted: boolean) {
    this.events?.onStatus(muted ? "muted" : "live");
  }

  async disconnect(): Promise<void> {
    this.timers.forEach((t) => window.clearTimeout(t));
    this.timers = [];
    if (this.levelTimer) window.clearInterval(this.levelTimer);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    this.events?.onStatus("ended");
    void this.ctx;
  }
}
