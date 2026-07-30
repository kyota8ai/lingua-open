import { describe, expect, it } from "vitest";
import { buildFeedbackPrompt, buildSystemPrompt } from "./prompts";
import { SCENARIOS } from "./data/scenarios";

const ctx = {
  languageCode: "ar",
  dialectId: "ar-eg",
  level: "A2" as const,
  profile: { goal: "work" as const, occupation: "nurse" },
  scenario: SCENARIOS.find((s) => s.id === "job-interview")!,
};

describe("buildSystemPrompt", () => {
  it("keeps the dialect instruction verbatim", () => {
    const p = buildSystemPrompt(ctx);
    expect(p).toContain("Egyptian Arabic");
    expect(p).toContain("Never drift into Modern Standard Arabic");
  });

  it("includes level guidance and scenario role", () => {
    const p = buildSystemPrompt(ctx);
    expect(p).toContain("Learner level: A2");
    expect(p).toContain("ROLEPLAY:");
    expect(p).toContain("hiring manager");
  });

  it("injects occupation only when provided", () => {
    const withJob = buildSystemPrompt(ctx);
    expect(withJob).toContain("nurse");
    const withoutJob = buildSystemPrompt({ ...ctx, profile: { goal: "work" } });
    expect(withoutJob).not.toContain("nurse");
  });

  it("free talk prompt has no roleplay block", () => {
    const p = buildSystemPrompt({ ...ctx, scenario: null });
    expect(p).not.toContain("ROLEPLAY:");
    expect(p).toContain("greeting the learner");
  });
});

describe("buildFeedbackPrompt", () => {
  it("embeds the transcript and demands strict JSON", () => {
    const p = buildFeedbackPrompt("LEARNER: hi", ctx);
    expect(p).toContain("LEARNER: hi");
    expect(p).toContain('"corrections"');
    expect(p).toContain("STRICT JSON");
  });
});
