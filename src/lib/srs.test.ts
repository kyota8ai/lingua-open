import { describe, expect, it } from "vitest";
import { isDue, newCard, schedule } from "./srs";

const base = () =>
  newCard({ term: "قهوة", meaning: "coffee", languageCode: "ar" }, 1_000_000);

describe("srs schedule", () => {
  it("new cards are due immediately", () => {
    const c = base();
    expect(isDue(c, 1_000_000)).toBe(true);
  });

  it("again resets reps and comes back in 10 minutes", () => {
    const c = schedule({ ...base(), reps: 5, interval: 30 }, "again", 0);
    expect(c.reps).toBe(0);
    expect(c.interval).toBe(0);
    expect(c.dueAt).toBe(10 * 60 * 1000);
  });

  it("first good review schedules 1 day out", () => {
    const c = schedule(base(), "good", 0);
    expect(c.interval).toBe(1);
    expect(c.reps).toBe(1);
    expect(c.dueAt).toBe(24 * 60 * 60 * 1000);
  });

  it("intervals grow across consecutive good reviews", () => {
    let c = base();
    const intervals: number[] = [];
    for (let i = 0; i < 4; i++) {
      c = schedule(c, "good", 0);
      intervals.push(c.interval);
    }
    for (let i = 1; i < intervals.length; i++) {
      expect(intervals[i]).toBeGreaterThan(intervals[i - 1]);
    }
  });

  it("easy grows faster than good", () => {
    let good = base();
    let easy = base();
    for (let i = 0; i < 3; i++) {
      good = schedule(good, "good", 0);
      easy = schedule(easy, "easy", 0);
    }
    expect(easy.interval).toBeGreaterThan(good.interval);
  });

  it("ease never drops below 1.3", () => {
    let c = base();
    for (let i = 0; i < 20; i++) c = schedule(c, "again", 0);
    expect(c.ease).toBeGreaterThanOrEqual(1.3);
  });
});
