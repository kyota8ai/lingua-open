import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowLeft, BookmarkSimple, CheckCircle, Sparkle } from "@phosphor-icons/react";
import { db } from "../lib/db";
import { newCard } from "../lib/srs";
import { findDialect, findLanguage } from "../lib/data/languages";
import { findScenario } from "../lib/data/scenarios";
import { Badge, Button, Card, Skeleton } from "../components/ui";
import { TappableText } from "../components/TappableText";
import { useSettings } from "../store/settings";
import type { VocabSuggestion } from "../lib/types";

export default function SessionDetail() {
  const { id } = useParams();
  const settings = useSettings();
  const [params] = useSearchParams();
  const fresh = params.get("fresh") === "1";
  const sessionId = Number(id);
  const validId = Number.isInteger(sessionId) && sessionId > 0;

  // undefined = still loading, null = does not exist (bad id or deleted record)
  const session = useLiveQuery(
    async () => (validId ? ((await db.sessions.get(sessionId)) ?? null) : null),
    [sessionId, validId],
  );
  const savedVocab = useLiveQuery(() => db.vocab.toArray(), []);
  const [waited, setWaited] = useState(false);

  // Feedback is generated in the background right after the session; give it
  // a visible "working" window instead of a blank state.
  useEffect(() => {
    const t = window.setTimeout(() => setWaited(true), 20000);
    return () => window.clearTimeout(t);
  }, []);

  const savedTerms = useMemo(
    () => new Set((savedVocab ?? []).map((v) => `${v.languageCode}:${v.term}`)),
    [savedVocab],
  );

  if (session === undefined) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Skeleton className="h-8 w-56 mb-4" />
        <Skeleton className="h-40 w-full" />
      </main>
    );
  }
  if (!session) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-[15px] text-ink-muted">This session does not exist.</p>
        <Link to="/history" className="text-accent font-medium hover:underline text-[15px]">
          Back to history
        </Link>
      </main>
    );
  }

  const lang = findLanguage(session.languageCode);
  const dialect = findDialect(session.languageCode, session.dialectId);
  const glossProvider = settings.provider === "demo" || settings.activeKey() === "" ? "demo" : settings.provider;
  const glossKey = settings.activeKey();
  const scenario = findScenario(session.scenarioId);
  const minutes = Math.max(1, Math.round((session.endedAt - session.startedAt) / 60000));
  const userTurns = session.transcript.filter((t) => t.role === "user").length;
  const fb = session.feedback;

  async function saveVocab(v: VocabSuggestion) {
    await db.vocab.add(
      newCard({
        term: v.term,
        reading: v.reading,
        meaning: v.meaning,
        example: v.example,
        languageCode: session!.languageCode,
      }),
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to="/history"
        className="inline-flex items-center gap-1.5 min-h-11 px-2 -mx-2 text-[14px] text-ink-muted hover:text-ink mb-4"
      >
        <ArrowLeft size={16} aria-hidden />
        History
      </Link>

      <header className="mb-8">
        {fresh && (
          <p className="inline-flex items-center gap-1.5 text-accent text-[14px] font-medium mb-2">
            <CheckCircle size={17} weight="fill" aria-hidden />
            Session saved in this browser
          </p>
        )}
        <h1 className="text-3xl font-semibold tracking-tight">{scenario?.title ?? "Conversation"}</h1>
        <p className="mt-2 text-[14px] text-ink-muted">
          {dialect.label} · <span className="font-mono">{minutes}</span> min ·{" "}
          <span className="font-mono">{userTurns}</span> of your turns ·{" "}
          {new Date(session.startedAt).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        {scenario && scenario.tasks.length > 0 && (
          <p className="mt-2 text-[14px] text-ink-muted">
            Mission: <span className="font-mono text-ink">{session.tasksDone.length}/{scenario.tasks.length}</span> tasks
            done
          </p>
        )}
      </header>

      {/* Feedback */}
      <section aria-labelledby="feedback-h" className="mb-10">
        <h2 id="feedback-h" className="text-xl font-semibold tracking-tight mb-4">
          Feedback
        </h2>
        {!fb && !waited && (
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <Sparkle size={20} className="text-accent animate-pulse" aria-hidden />
              <p className="text-[15px] text-ink-muted">
                Your AI partner is reviewing the transcript with your own key. This usually takes a few seconds.
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
            </div>
          </Card>
        )}
        {!fb && waited && (
          <Card className="p-5">
            <p className="text-[15px] text-ink">Feedback didn't arrive for this session.</p>
            <p className="mt-1 text-[13px] text-ink-muted">
              The transcript below is saved either way. Check your key in Settings if this keeps happening.
            </p>
          </Card>
        )}
        {fb && (
          <div className="flex flex-col gap-6">
            {fb.summary && <p className="text-[15px] leading-relaxed text-ink">{fb.summary}</p>}

            {fb.corrections.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-ink-muted mb-2.5">Corrections</h3>
                <ul className="flex flex-col gap-2.5">
                  {fb.corrections.map((c, i) => (
                    <li key={i}>
                      <Card className="p-4">
                        <p className="target-lang text-[15px] text-ink-faint line-through" lang={lang.code} dir="auto">
                          {c.said}
                        </p>
                        <p className="target-lang mt-1 text-[16px] font-medium text-ink" lang={lang.code} dir="auto">
                          {c.better}
                        </p>
                        {c.why && <p className="mt-1.5 text-[13px] text-ink-muted">{c.why}</p>}
                      </Card>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {fb.vocab.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-ink-muted mb-2.5">Worth memorizing</h3>
                <ul className="flex flex-col gap-2">
                  {fb.vocab.map((v) => {
                    const saved = savedTerms.has(`${session.languageCode}:${v.term}`);
                    return (
                      <li
                        key={v.term}
                        className="flex items-center justify-between gap-3 rounded-(--radius-control) border border-line bg-surface px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="target-lang text-[16px] font-medium text-ink" lang={lang.code} dir="auto">
                            {v.term}
                            {v.reading && <span className="ml-2 text-[13px] text-ink-faint font-normal">{v.reading}</span>}
                          </p>
                          <p className="text-[13px] text-ink-muted truncate">{v.meaning}</p>
                        </div>
                        {saved ? (
                          <Badge tone="good">
                            <CheckCircle size={13} weight="fill" aria-hidden />
                            saved
                          </Badge>
                        ) : (
                          <Button variant="secondary" size="sm" onClick={() => saveVocab(v)}>
                            <BookmarkSimple size={15} aria-hidden />
                            Save
                          </Button>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-4">
                  <Link to="/review" className="text-[14px] font-medium text-accent hover:underline">
                    Review your vocabulary
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Transcript */}
      <section aria-labelledby="transcript-h">
        <h2 id="transcript-h" className="text-xl font-semibold tracking-tight mb-4">
          Transcript
        </h2>
        <div className="flex flex-col gap-3">
          {session.transcript.map((t) => (
            <div
              key={t.id}
              className={[
                "max-w-[85%] rounded-(--radius-card) px-4 py-3",
                t.role === "user" ? "self-end bg-accent-soft rounded-br-md" : "self-start bg-surface border border-line rounded-bl-md",
              ].join(" ")}
            >
              <TappableText
                text={t.text}
                langCode={lang.code}
                langLabel={dialect.label}
                provider={glossProvider}
                apiKey={glossKey}
                textModel={settings.activeTextModel()}
                className="target-lang text-[15px] text-ink"
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
