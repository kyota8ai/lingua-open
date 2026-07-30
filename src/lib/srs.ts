import type { ReviewGrade, VocabCard } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_EASE = 1.3;

/**
 * SM-2 style scheduling, simplified for a 4-button review flow.
 * "again" resets the card; the others grow the interval by the ease factor.
 */
export function schedule(card: VocabCard, grade: ReviewGrade, now = Date.now()): VocabCard {
  let { interval, ease, reps } = card;

  if (grade === "again") {
    return { ...card, interval: 0, reps: 0, ease: Math.max(MIN_EASE, ease - 0.2), dueAt: now + 10 * 60 * 1000 };
  }

  const quality = grade === "hard" ? 3 : grade === "good" ? 4 : 5;
  ease = Math.max(MIN_EASE, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  reps += 1;

  if (reps === 1) interval = 1;
  else if (reps === 2) interval = grade === "hard" ? 3 : 6;
  else interval = Math.round(interval * (grade === "hard" ? Math.max(1.2, ease - 0.15) : ease));

  if (grade === "easy") interval = Math.round(interval * 1.3);
  interval = Math.max(1, interval);

  return { ...card, interval, ease, reps, dueAt: now + interval * DAY_MS };
}

export function newCard(base: Omit<VocabCard, "interval" | "ease" | "reps" | "dueAt" | "addedAt">, now = Date.now()): VocabCard {
  return { ...base, addedAt: now, interval: 0, ease: 2.5, reps: 0, dueAt: now };
}

export function isDue(card: VocabCard, now = Date.now()): boolean {
  return card.dueAt <= now;
}
