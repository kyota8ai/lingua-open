import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowCounterClockwise,
  CheckCircle,
  Circle,
  Lightbulb,
  Microphone,
  MicrophoneSlash,
  PaperPlaneRight,
  PhoneDisconnect,
  SpeakerLow,
  X,
} from "@phosphor-icons/react";
import { findScenario, FREE_TALK } from "../lib/data/scenarios";
import { findDialect, findLanguage } from "../lib/data/languages";
import { createProvider, ProviderError, type ConversationProvider } from "../lib/providers";
import { generateFeedback } from "../lib/feedback";
import { db } from "../lib/db";
import { useSettings } from "../store/settings";
import { useSession } from "../store/session";
import { Badge, Button, Modal } from "../components/ui";
import { Waveform } from "../components/Waveform";
import { TappableText } from "../components/TappableText";

type Phase = "briefing" | "live" | "saving";

export default function Conversation() {
  const { scenarioId } = useParams();
  const nav = useNavigate();
  const settings = useSettings();
  const session = useSession();
  const [phase, setPhase] = useState<Phase>("briefing");
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [textInput, setTextInput] = useState("");
  const providerRef = useRef<ConversationProvider | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  /* Audio level lives in a ref, not React state: Gemini emits it ~125x/s and
     re-rendering the whole live screen per tick would burn the frame budget. */
  const levelRef = useRef(0);

  const scenario = findScenario(scenarioId ?? null) ?? FREE_TALK;
  const lang = findLanguage(settings.languageCode);
  const dialect = findDialect(settings.languageCode, settings.dialectId);
  const isDemo = settings.provider === "demo" || settings.activeKey() === "";

  const promptCtx = {
    languageCode: settings.languageCode,
    dialectId: settings.dialectId,
    level: settings.level,
    profile: { goal: settings.goal, occupation: settings.occupation || undefined },
    scenario,
  };

  const begin = useCallback(async () => {
    // A retry may run while a half-connected provider still holds the mic.
    const stale = providerRef.current;
    providerRef.current = null;
    if (stale) await stale.disconnect().catch(() => {});

    session.start();
    setPhase("live");
    const provider = createProvider(
      isDemo ? "demo" : settings.provider,
      settings.activeKey(),
      settings.activeConversationModel(),
      settings.activeVoice(),
    );
    providerRef.current = provider;
    try {
      await provider.connect(promptCtx, {
        onStatus: session.setStatus,
        onTranscript: session.upsertTurn,
        onLevel: (l) => {
          levelRef.current = l;
        },
        onError: (m) => session.setError(m),
      });
    } catch (e) {
      // Release mic/socket/audio resources from the failed attempt before surfacing the error.
      if (providerRef.current === provider) providerRef.current = null;
      await provider.disconnect().catch(() => {});
      const err = e instanceof ProviderError ? e : new ProviderError("Could not start the session.");
      session.setError(err.message, err.hint);
      session.setStatus("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.provider, settings.languageCode, settings.dialectId, settings.level, settings.goal, settings.occupation, scenario.id]);

  useEffect(() => {
    return () => {
      providerRef.current?.disconnect();
      providerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [session.turns]);

  // DESIGN.md: on the fullscreen conversation screen, Esc opens the end-confirm
  // modal. When a native <dialog> is open, Esc closes it first (platform default).
  useEffect(() => {
    if (phase !== "live") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !confirmEnd && !showTasks) setConfirmEnd(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, confirmEnd, showTasks]);

  async function endSession() {
    setConfirmEnd(false);
    setPhase("saving");
    const provider = providerRef.current;
    providerRef.current = null;
    await provider?.disconnect();

    const startedAt = session.startedAt ?? Date.now();
    const endedAt = Date.now();
    const finalTurns = session.turns.filter((t) => !t.pending || t.text.trim() !== "");

    if (finalTurns.length === 0) {
      session.reset();
      nav("/", { replace: true });
      return;
    }

    const id = await db.sessions.add({
      startedAt,
      endedAt,
      provider: isDemo ? "demo" : settings.provider,
      languageCode: settings.languageCode,
      dialectId: settings.dialectId,
      scenarioId: scenario.id,
      transcript: finalTurns,
      tasksDone: session.tasksDone,
      feedback: null,
    });

    // Feedback generation happens on the feedback page (it shows progress there),
    // but we kick it off here so the result is ready sooner.
    void generateFeedback(
      isDemo ? "demo" : settings.provider,
      settings.activeKey(),
      finalTurns,
      promptCtx,
      settings.activeTextModel(),
    )
      .then((fb) => db.sessions.update(id, { feedback: fb }))
      .catch(() => {
        /* feedback failure never blocks the session record */
      });

    session.reset();
    nav(`/session/${id}?fresh=1`, { replace: true });
  }

  const live = session.status === "live" || session.status === "muted";
  const muted = session.status === "muted";

  /* ---------- briefing: show the goal before talking ---------- */
  if (phase === "briefing") {
    return (
      <main className="min-h-dvh bg-canvas">
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
          <button
            type="button"
            onClick={() => nav(-1)}
            className="inline-flex items-center gap-1.5 min-h-11 px-2 -mx-2 text-[14px] text-ink-muted hover:text-ink cursor-pointer mb-6"
          >
            <X size={16} aria-hidden />
            Cancel
          </button>
          <p className="text-[14px] text-ink-muted">
            {dialect.label} · {scenario.minutes} min
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{scenario.title}</h1>
          <p className="mt-2 text-[15px] text-ink-muted leading-relaxed">{scenario.description}</p>

          {scenario.goalPhrases.length > 0 && (
            <section className="mt-8" aria-labelledby="goal-phrases">
              <h2 id="goal-phrases" className="text-sm font-semibold text-ink mb-2.5">
                Try to use
              </h2>
              <ul className="flex flex-col gap-2">
                {scenario.goalPhrases.map((p) => (
                  <li
                    key={p}
                    className="px-4 py-2.5 rounded-(--radius-field) bg-surface border border-line text-[15px] text-ink"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {scenario.tasks.length > 0 && (
            <section className="mt-6" aria-labelledby="mission-tasks">
              <h2 id="mission-tasks" className="text-sm font-semibold text-ink mb-2.5">
                Your mission
              </h2>
              <ul className="flex flex-col gap-1.5">
                {scenario.tasks.map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-[15px] text-ink-muted">
                    <Circle size={16} className="shrink-0 text-ink-faint" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {isDemo && (
            <div className="mt-6">
              <Badge tone="accent">Demo mode: scripted partner, no key needed</Badge>
            </div>
          )}

          <Button size="lg" className="w-full mt-8" onClick={begin}>
            <Microphone size={20} aria-hidden />
            Start speaking
          </Button>
        </div>
      </main>
    );
  }

  /* ---------- saving ---------- */
  if (phase === "saving") {
    return (
      <main className="min-h-dvh grid place-items-center bg-canvas">
        <div className="text-center">
          <div className="mx-auto mb-4 size-10 rounded-full border-2 border-line border-t-accent animate-spin" aria-hidden />
          <p className="text-[15px] text-ink-muted">Saving your session in this browser...</p>
        </div>
      </main>
    );
  }

  /* ---------- live ---------- */
  return (
    <main className="h-dvh flex flex-col bg-canvas">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-3 px-4 sm:px-6 h-16 border-b border-line bg-surface">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={[
              "size-2.5 rounded-full shrink-0",
              live ? "bg-live animate-pulse" : session.status === "error" ? "bg-warn" : "bg-ink-faint",
            ].join(" ")}
            aria-hidden
          />
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold truncate">{scenario.title}</h1>
            <p className="text-[12px] text-ink-muted truncate">
              {dialect.label}
              {isDemo ? " · demo" : ""}
              {session.startedAt && <SessionClock startedAt={session.startedAt} />}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {scenario.tasks.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              className="md:hidden"
              onClick={() => setShowTasks(true)}
              aria-haspopup="dialog"
            >
              <CheckCircle size={16} aria-hidden />
              <span className="font-mono text-[13px]">
                {session.tasksDone.length}/{scenario.tasks.length}
              </span>
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={() => setConfirmEnd(true)}>
            <PhoneDisconnect size={16} aria-hidden />
            End
          </Button>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex">
        {/* Task checklist, desktop side rail */}
        {scenario.tasks.length > 0 && (
          <aside className="hidden md:block w-64 border-r border-line bg-surface p-4 overflow-y-auto">
            <h2 className="text-[13px] font-semibold text-ink-muted mb-3">Mission</h2>
            <TaskChecklist tasks={scenario.tasks} done={session.tasksDone} onToggle={session.toggleTask} />
          </aside>
        )}

        {/* Transcript */}
        <div ref={transcriptRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="max-w-2xl mx-auto flex flex-col gap-4">
            {session.status === "connecting" && (
              <div className="flex flex-col gap-3" aria-label="Connecting">
                <div className="h-12 w-3/5 rounded-(--radius-card) bg-sunken animate-pulse" />
                <div className="h-12 w-2/5 self-end rounded-(--radius-card) bg-sunken animate-pulse" />
              </div>
            )}
            {session.error && (
              <div className="rounded-(--radius-card) border border-live/40 bg-live-soft p-4" role="alert">
                <p className="text-[15px] font-medium text-on-live-soft">{session.error}</p>
                {session.errorHint && <p className="mt-1 text-[13px] text-on-live-soft/80">{session.errorHint}</p>}
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={begin}>Try again</Button>
                  <Button size="sm" variant="secondary" onClick={() => nav("/settings")}>
                    Open Settings
                  </Button>
                </div>
              </div>
            )}
            {session.turns.map((t) => (
              <div
                key={t.id}
                className={[
                  "max-w-[85%] rounded-(--radius-card) px-4 py-3",
                  t.role === "user"
                    ? "self-end bg-accent-soft text-on-accent-soft rounded-br-md"
                    : "self-start bg-sunken text-ink rounded-bl-md",
                  t.pending ? "opacity-80" : "",
                ].join(" ")}
              >
                {t.pending ? (
                  <p className="target-lang text-[16px]" lang={lang.code} dir="auto">
                    {t.text}
                    <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-ink-faint animate-pulse" aria-hidden />
                  </p>
                ) : (
                  <TappableText
                    text={t.text}
                    langCode={lang.code}
                    langLabel={dialect.label}
                    provider={isDemo ? "demo" : settings.provider}
                    apiKey={settings.activeKey()}
                    textModel={settings.activeTextModel()}
                    className="target-lang text-[16px]"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <footer className="border-t border-line bg-surface px-4 sm:px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3" aria-hidden>
            <Waveform levelRef={levelRef} live={live && !muted} />
          </div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => providerRef.current?.nudge("Please speak slower and use simpler words.")}
              disabled={!live}
            >
              <SpeakerLow size={16} aria-hidden />
              Slower
            </Button>
            <Button variant="secondary" size="sm" onClick={() => providerRef.current?.repeatLast()} disabled={!live}>
              <ArrowCounterClockwise size={16} aria-hidden />
              Repeat
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                providerRef.current?.nudge(
                  "Give me one short example of what I could say next, then wait for me to try it.",
                )
              }
              disabled={!live}
            >
              <Lightbulb size={16} aria-hidden />
              Suggest
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => providerRef.current?.setMuted(!muted)}
              disabled={!live}
              aria-pressed={muted}
            >
              {muted ? <MicrophoneSlash size={16} aria-hidden /> : <Microphone size={16} aria-hidden />}
              {muted ? "Unmute" : "Mute"}
            </Button>
          </div>

          {/* Text fallback: primary input in demo mode, escape hatch otherwise */}
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const text = textInput.trim();
              if (!text) return;
              providerRef.current?.sendText(text);
              setTextInput("");
            }}
          >
            <label htmlFor="text-fallback" className="sr-only">
              Type instead of speaking
            </label>
            <input
              id="text-fallback"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={isDemo ? "Type your reply (demo mode)" : "Type instead of speaking"}
              autoComplete="off"
              className="flex-1 h-12 px-5 rounded-(--radius-control) bg-sunken border border-transparent text-[15px] text-ink placeholder:text-ink-faint focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-0"
              disabled={!live}
            />
            <Button type="submit" variant="secondary" disabled={!live || !textInput.trim()} aria-label="Send text">
              <PaperPlaneRight size={18} aria-hidden />
            </Button>
          </form>
        </div>
      </footer>

      {/* Mobile mission sheet */}
      {scenario.tasks.length > 0 && (
        <Modal open={showTasks} onClose={() => setShowTasks(false)} labelledBy="tasks-title" variant="sheet">
          <div className="flex items-center justify-between mb-3">
            <h2 id="tasks-title" className="text-[15px] font-semibold">
              Mission
            </h2>
            <button
              type="button"
              onClick={() => setShowTasks(false)}
              aria-label="Close mission list"
              className="grid place-items-center size-11 rounded-[10px] text-ink-faint hover:text-ink cursor-pointer"
            >
              <X size={18} aria-hidden />
            </button>
          </div>
          <TaskChecklist tasks={scenario.tasks} done={session.tasksDone} onToggle={session.toggleTask} />
        </Modal>
      )}

      {/* End confirmation */}
      <Modal open={confirmEnd} onClose={() => setConfirmEnd(false)} labelledBy="end-title">
        <h2 id="end-title" className="text-lg font-semibold">
          End this session?
        </h2>
        <p className="mt-1.5 text-[14px] text-ink-muted leading-relaxed">
          You'll get corrections and vocabulary from this conversation right after.
        </p>
        <div className="mt-5 flex gap-2.5">
          <Button variant="secondary" className="flex-1" onClick={() => setConfirmEnd(false)}>
            Keep talking
          </Button>
          <Button variant="danger" className="flex-1" onClick={endSession}>
            End session
          </Button>
        </div>
      </Modal>
    </main>
  );
}

function TaskChecklist({
  tasks,
  done,
  onToggle,
}: {
  tasks: string[];
  done: number[];
  onToggle: (index: number) => void;
}) {
  return (
    <ul className="flex flex-col gap-1">
      {tasks.map((t, i) => {
        const isDone = done.includes(i);
        return (
          <li key={t}>
            <button
              type="button"
              onClick={() => onToggle(i)}
              aria-pressed={isDone}
              className="flex items-start gap-2.5 w-full text-left px-2 py-2 rounded-(--radius-field) hover:bg-sunken cursor-pointer transition-colors"
            >
              {isDone ? (
                <CheckCircle size={18} weight="fill" className="shrink-0 mt-0.5 text-good" aria-hidden />
              ) : (
                <Circle size={18} className="shrink-0 mt-0.5 text-ink-faint" aria-hidden />
              )}
              <span className={["text-[14px] leading-snug", isDone ? "text-ink-faint line-through" : "text-ink"].join(" ")}>
                {t}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function SessionClock({ startedAt }: { startedAt: number }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const secs = Math.max(0, Math.floor((now - startedAt) / 1000));
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  return (
    <span className="font-mono">
      {" · "}
      {mm}:{ss}
    </span>
  );
}
