import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { ArrowRight, ChatsCircle, Fire, Timer } from "@phosphor-icons/react";
import { db } from "../lib/db";
import { SCENARIOS, FREE_TALK } from "../lib/data/scenarios";
import { findDialect, findLanguage } from "../lib/data/languages";
import { useSettings } from "../store/settings";
import type { Scenario, ScenarioCategory } from "../lib/types";
import { Badge, Chip } from "../components/ui";

const CATEGORIES: Array<{ id: ScenarioCategory | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "daily", label: "Daily life" },
  { id: "work", label: "Work" },
  { id: "travel", label: "Travel" },
  { id: "fun", label: "Just fun" },
];

function streakFrom(dates: number[]): number {
  if (dates.length === 0) return 0;
  const days = new Set(dates.map((d) => new Date(d).toDateString()));
  let streak = 0;
  const cursor = new Date();
  // Today counts if practiced; otherwise start from yesterday.
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default function Home() {
  const { languageCode, dialectId } = useSettings();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["id"]>("all");

  const sessions = useLiveQuery(() => db.sessions.toArray(), []);
  const stats = useMemo(() => {
    const list = sessions ?? [];
    const minutes = Math.round(list.reduce((acc, s) => acc + (s.endedAt - s.startedAt), 0) / 60000);
    return { minutes, count: list.length, streak: streakFrom(list.map((s) => s.startedAt)) };
  }, [sessions]);

  const lang = findLanguage(languageCode);
  const dialect = findDialect(languageCode, dialectId);
  const filtered = category === "all" ? SCENARIOS : SCENARIOS.filter((s) => s.category === category);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <header className="mb-8">
        <p className="text-[15px] text-ink-muted">
          Practicing <span className="font-medium text-ink">{dialect.label}</span>
          {dialect.beta && (
            <span className="ml-2">
              <Badge tone="warn">beta preset</Badge>
            </span>
          )}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">What do you want to say today?</h1>
        {stats.count > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <Timer size={17} aria-hidden />
              <span className="font-mono font-medium text-ink">{stats.minutes}</span> min practiced
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Fire size={17} aria-hidden />
              <span className="font-mono font-medium text-ink">{stats.streak}</span> day streak
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ChatsCircle size={17} aria-hidden />
              <span className="font-mono font-medium text-ink">{stats.count}</span> sessions
            </span>
          </div>
        )}
      </header>

      <Link
        to={`/talk/${FREE_TALK.id}`}
        className="group flex items-center justify-between gap-4 rounded-(--radius-card) bg-accent text-on-accent p-5 sm:p-6 mb-8 transition-transform duration-150 active:translate-y-px focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
      >
        <div>
          <h2 className="text-lg font-semibold">Free talk</h2>
          <p className="text-[14px] opacity-85 mt-0.5">No script. Just start speaking {lang.label}.</p>
        </div>
        <ArrowRight size={22} className="shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden />
      </Link>

      <div className="flex flex-wrap gap-2 mb-5" role="group" aria-label="Scenario category">
        {CATEGORIES.map((c) => (
          <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
            {c.label}
          </Chip>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <ScenarioCard key={s.id} scenario={s} />
        ))}
      </div>
    </main>
  );
}

function ScenarioCard({ scenario }: { scenario: Scenario }) {
  return (
    <Link
      to={`/talk/${scenario.id}`}
      className="group flex flex-col rounded-(--radius-card) border border-line bg-surface p-5 transition-colors duration-150 hover:border-accent focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[17px] font-semibold text-ink leading-snug">{scenario.title}</h3>
        {scenario.levelHint && <Badge tone="neutral">{scenario.levelHint}</Badge>}
      </div>
      <p className="mt-1.5 text-[14px] text-ink-muted leading-relaxed">{scenario.description}</p>
      <div className="mt-auto pt-4 flex items-center justify-between text-[13px] text-ink-faint">
        <span className="font-mono">{scenario.minutes} min</span>
        <span className="inline-flex items-center gap-1 font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          Start
          <ArrowRight size={14} aria-hidden />
        </span>
      </div>
    </Link>
  );
}
