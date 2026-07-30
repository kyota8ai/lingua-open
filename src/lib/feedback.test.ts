import { describe, expect, it } from "vitest";
import { parseFeedbackJson } from "./feedback";

describe("parseFeedbackJson", () => {
  it("parses a clean payload", () => {
    const out = parseFeedbackJson(
      JSON.stringify({
        summary: "Nice work.",
        corrections: [{ said: "a", better: "b", why: "c" }],
        vocab: [{ term: "x", meaning: "y" }],
      }),
    );
    expect(out.summary).toBe("Nice work.");
    expect(out.corrections).toHaveLength(1);
    expect(out.vocab[0].term).toBe("x");
  });

  it("strips markdown fences the model sometimes adds", () => {
    const raw = '```json\n{"summary":"ok","corrections":[],"vocab":[]}\n```';
    expect(parseFeedbackJson(raw).summary).toBe("ok");
  });

  it("drops malformed items instead of failing", () => {
    const out = parseFeedbackJson(
      JSON.stringify({
        summary: "s",
        corrections: [{ said: "only-said" }, { said: "a", better: "b" }],
        vocab: [{ term: "no-meaning" }, { term: "t", meaning: "m" }],
      }),
    );
    expect(out.corrections).toHaveLength(1);
    expect(out.vocab).toHaveLength(1);
  });

  it("throws a readable error on non-JSON", () => {
    expect(() => parseFeedbackJson("the model rambled")).toThrow(/malformed/i);
  });

  it("caps list lengths", () => {
    const many = Array.from({ length: 20 }, (_, i) => ({ said: `s${i}`, better: `b${i}`, why: "w" }));
    const out = parseFeedbackJson(JSON.stringify({ summary: "s", corrections: many, vocab: [] }));
    expect(out.corrections.length).toBeLessThanOrEqual(8);
  });
});
