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
    expect(p).not.toContain("Role boundaries");
    expect(p).not.toContain("What the LEARNER is practicing");
    expect(p).toContain("greeting them and asking an easy, open question");
  });

  /*
   * Regression: a flat prompt let the model take the learner's turn. A barista
   * asked the customer "what do you recommend?", which is a goal phrase the
   * learner was supposed to say.
   */
  describe("role boundaries", () => {
    const cafe = SCENARIOS.find((s) => s.id === "cafe-order")!;
    const p = buildSystemPrompt({ ...ctx, scenario: cafe });

    it("states the role first and restates it last", () => {
      expect(p.indexOf("# Who you are")).toBe(0);
      expect(p).toContain("# Before you speak, remember");
      expect(p.trimEnd().endsWith("that fits the situation.")).toBe(true);
      // The role reminder repeats the character, so "barista" appears twice.
      expect(p.match(/barista/g)!.length).toBeGreaterThanOrEqual(2);
    });

    it("forbids taking the learner's turn", () => {
      expect(p).toContain("You are NOT the learner");
      expect(p).toContain("Never ask the learner to do your character's job");
    });

    it("labels the tasks as the learner's, not the model's", () => {
      expect(p).toContain("What the LEARNER is practicing (their job, not yours)");
      expect(p).toContain("Do not do them yourself");
      for (const task of cafe.tasks) expect(p).toContain(`- ${task}`);
    });

    it("passes goal phrases through as the learner's lines", () => {
      expect(p).toContain("Expressions the LEARNER is trying to use");
      expect(p).toContain("do not say them yourself");
      // The exact phrase behind the observed bug.
      expect(p).toContain("- What do you recommend?");
    });

    it("does not tell the model to ask questions unconditionally", () => {
      expect(p).not.toMatch(/\bAsk questions\.\s/);
      expect(p).toContain("Ask questions that fit your character");
    });
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
