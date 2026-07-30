import { Link } from "react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { ChatsCircle, StackSimple } from "@phosphor-icons/react";
import { db } from "../lib/db";
import { isDue } from "../lib/srs";
import { findDialect } from "../lib/data/languages";
import { findScenario } from "../lib/data/scenarios";
import { buttonClasses, Card, EmptyState, Skeleton } from "../components/ui";
import { PracticeChart } from "../components/PracticeChart";

export default function History() {
  const sessions = useLiveQuery(() => db.sessions.orderBy("startedAt").reverse().toArray(), []);
  const vocab = useLiveQuery(() => db.vocab.toArray(), []);
  const dueCount = (vocab ?? []).filter((v) => isDue(v)).length;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-semibold tracking-tight mb-8">History</h1>

      {sessions && sessions.length > 0 && (
        <section aria-labelledby="stats-h" className="mb-10">
          <h2 id="stats-h" className="sr-only">
            Practice statistics
          </h2>
          <Card className="p-5">
            <PracticeChart sessions={sessions} />
          </Card>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Card className="p-5">
              <p className="text-[13px] text-ink-muted">Vocabulary collected</p>
              <p className="mt-1 font-mono text-2xl font-medium text-ink">{vocab?.length ?? 0}</p>
            </Card>
            <Card className="p-5">
              <p className="text-[13px] text-ink-muted">Due for review</p>
              <div className="mt-1 flex items-baseline justify-between gap-3">
                <p className="font-mono text-2xl font-medium text-ink">{dueCount}</p>
                {dueCount > 0 && (
                  <Link to="/review" className="inline-flex items-center gap-1 text-[13px] font-medium text-accent-text-text hover:underline">
                    <StackSimple size={14} aria-hidden />
                    Review now
                  </Link>
                )}
              </div>
            </Card>
          </div>
        </section>
      )}

      {sessions === undefined && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {sessions && sessions.length === 0 && (
        <EmptyState
          icon={<ChatsCircle size={40} aria-hidden />}
          title="No sessions yet"
          body="Every conversation is saved here, in this browser. We never receive it; audio and transcripts go only to the AI provider you chose."
          action={
            <Link to="/" className={buttonClasses("primary", "md")}>
              Start your first session
            </Link>
          }
        />
      )}

      {sessions && sessions.length > 0 && (
        <ul className="flex flex-col gap-3">
          {sessions.map((s) => {
            const scenario = findScenario(s.scenarioId);
            const dialect = findDialect(s.languageCode, s.dialectId);
            const minutes = Math.max(1, Math.round((s.endedAt - s.startedAt) / 60000));
            return (
              <li key={s.id}>
                <Link
                  to={`/session/${s.id}`}
                  className="flex items-center justify-between gap-4 rounded-(--radius-card) border border-line bg-surface p-4 transition-colors duration-150 hover:border-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
                >
                  <div className="min-w-0">
                    <h2 className="text-[16px] font-semibold text-ink truncate">{scenario?.title ?? "Conversation"}</h2>
                    <p className="mt-0.5 text-[13px] text-ink-muted">
                      {dialect.label} · <span className="font-mono">{minutes}</span> min
                      {s.feedback && s.feedback.corrections.length > 0 && (
                        <>
                          {" · "}
                          <span className="font-mono">{s.feedback.corrections.length}</span> corrections
                        </>
                      )}
                    </p>
                  </div>
                  <time className="shrink-0 text-[13px] text-ink-faint font-mono" dateTime={new Date(s.startedAt).toISOString()}>
                    {new Date(s.startedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </time>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
