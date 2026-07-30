import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { CardsThree, CheckCircle } from "@phosphor-icons/react";
import { db } from "../lib/db";
import { isDue, schedule } from "../lib/srs";
import { findLanguage } from "../lib/data/languages";
import type { ReviewGrade, VocabCard } from "../lib/types";
import { Button, buttonClasses, EmptyState, Skeleton } from "../components/ui";

const GRADES: Array<{ id: ReviewGrade; label: string; hint: string }> = [
  { id: "again", label: "Again", hint: "10 min" },
  { id: "hard", label: "Hard", hint: "" },
  { id: "good", label: "Good", hint: "" },
  { id: "easy", label: "Easy", hint: "" },
];

export default function Review() {
  const vocab = useLiveQuery(() => db.vocab.toArray(), []);
  const [revealed, setRevealed] = useState(false);
  const [doneCount, setDoneCount] = useState(0);

  const queue = useMemo(() => {
    const now = Date.now();
    return (vocab ?? []).filter((v) => isDue(v, now)).sort((a, b) => a.dueAt - b.dueAt);
  }, [vocab]);

  const current = queue[0];

  async function grade(g: ReviewGrade) {
    if (!current) return;
    const updated = schedule(current, g);
    await db.vocab.update(current.id!, {
      interval: updated.interval,
      ease: updated.ease,
      reps: updated.reps,
      dueAt: updated.dueAt,
    });
    setRevealed(false);
    setDoneCount((c) => c + 1);
  }

  if (vocab === undefined) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-semibold tracking-tight mb-8">Review</h1>
        <Skeleton className="h-56 w-full" />
      </main>
    );
  }

  if (vocab.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-semibold tracking-tight mb-8">Review</h1>
        <EmptyState
          icon={<CardsThree size={40} aria-hidden />}
          title="No vocabulary yet"
          body="Finish a practice session and save words from your feedback. They come back here on a spaced-repetition schedule."
          action={
            <Link to="/" className={buttonClasses("primary", "md")}>
              Start a session
            </Link>
          }
        />
      </main>
    );
  }

  if (!current) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-3xl font-semibold tracking-tight mb-8">Review</h1>
        <EmptyState
          icon={<CheckCircle size={40} weight="fill" className="text-good" aria-hidden />}
          title={doneCount > 0 ? `Done. ${doneCount} card${doneCount === 1 ? "" : "s"} reviewed` : "All caught up"}
          body={`Your next card is due ${nextDueLabel(vocab)}. Come back then, or add more words from a new session.`}
          action={
            <Link to="/" className={buttonClasses("secondary", "md")}>
              Practice speaking
            </Link>
          }
        />
      </main>
    );
  }

  const lang = findLanguage(current.languageCode);

  return (
    <main className="max-w-xl mx-auto px-4 sm:px-6 py-8 flex flex-col min-h-[calc(100dvh-5rem)] lg:min-h-dvh">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Review</h1>
        <p className="text-[14px] text-ink-muted">
          <span className="font-mono font-medium text-ink">{queue.length}</span> due
        </p>
      </header>

      <div className="flex-1 flex flex-col justify-center">
        <button
          type="button"
          onClick={() => setRevealed((r) => !r)}
          aria-expanded={revealed}
          className="w-full rounded-(--radius-card) border border-line bg-surface px-6 py-12 text-center cursor-pointer transition-colors duration-150 hover:border-line-strong focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          <p className="target-lang text-3xl font-semibold text-ink" lang={lang.code} dir="auto">
            {current.term}
          </p>
          {current.reading && <p className="mt-2 text-[15px] text-ink-faint">{current.reading}</p>}
          {revealed ? (
            <div className="mt-6 pt-6 border-t border-line">
              <p className="text-[17px] text-ink">{current.meaning}</p>
              {current.example && (
                <p className="target-lang mt-3 text-[15px] text-ink-muted" lang={lang.code} dir="auto">
                  {current.example}
                </p>
              )}
            </div>
          ) : (
            <p className="mt-6 text-[13px] text-ink-faint">Tap to reveal</p>
          )}
        </button>
      </div>

      <div className="mt-8 grid grid-cols-4 gap-2">
        {GRADES.map((g) => (
          <Button
            key={g.id}
            variant={g.id === "again" ? "secondary" : g.id === "good" ? "primary" : "secondary"}
            onClick={() => (revealed ? grade(g.id) : setRevealed(true))}
            disabled={!revealed}
            className="flex-col h-14 gap-0 !px-1"
          >
            <span>{g.label}</span>
            <span className="text-[11px] font-mono">{g.id === "again" ? g.hint : previewInterval(current, g.id)}</span>
          </Button>
        ))}
      </div>
      {!revealed && <p className="mt-3 text-center text-[13px] text-ink-faint">Reveal the answer to grade yourself.</p>}
    </main>
  );
}

function previewInterval(card: VocabCard, g: ReviewGrade): string {
  const next = schedule(card, g);
  return next.interval >= 1 ? `${next.interval}d` : "today";
}

function nextDueLabel(vocab: VocabCard[]): string {
  const future = vocab.filter((v) => v.dueAt > Date.now()).sort((a, b) => a.dueAt - b.dueAt)[0];
  if (!future) return "after your next session";
  const days = Math.round((future.dueAt - Date.now()) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "later today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
}
