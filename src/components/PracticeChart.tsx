import { useMemo } from "react";
import type { SessionRecord } from "../lib/types";

const DAYS = 14;
const W = 560;
const H = 120;
const GAP = 6;
const LABEL_H = 18;

/**
 * Minutes practiced per day, last 14 days. Inline SVG, single accent series,
 * no decoration; a text summary carries the same information for screen
 * readers.
 */
export function PracticeChart({ sessions }: { sessions: SessionRecord[] }) {
  const days = useMemo(() => {
    const out: Array<{ label: string; minutes: number; isToday: boolean }> = [];
    const now = new Date();
    for (let i = DAYS - 1; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      const key = day.toDateString();
      const ms = sessions
        .filter((s) => new Date(s.startedAt).toDateString() === key)
        .reduce((acc, s) => acc + (s.endedAt - s.startedAt), 0);
      out.push({
        label: day.toLocaleDateString(undefined, { weekday: "narrow" }),
        minutes: Math.round(ms / 60000),
        isToday: i === 0,
      });
    }
    return out;
  }, [sessions]);

  const max = Math.max(5, ...days.map((d) => d.minutes));
  const total = days.reduce((acc, d) => acc + d.minutes, 0);
  const barW = (W - GAP * (DAYS - 1)) / DAYS;
  const chartH = H - LABEL_H;

  return (
    <figure
      aria-label={`Practice minutes per day, last 14 days. Total ${total} minutes; busiest day ${max} minutes.`}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-hidden>
        {days.map((d, i) => {
          const h = d.minutes === 0 ? 2 : Math.max(4, (d.minutes / max) * (chartH - 8));
          const x = i * (barW + GAP);
          const y = chartH - h;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={3}
                className={d.minutes === 0 ? "fill-line" : d.isToday ? "fill-accent-strong" : "fill-accent"}
              >
                <title>{`${d.minutes} min`}</title>
              </rect>
              <text
                x={x + barW / 2}
                y={H - 4}
                textAnchor="middle"
                className="fill-ink-faint font-mono"
                fontSize={10}
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-1 text-[12px] text-ink-faint">
        Last 14 days · <span className="font-mono">{total}</span> min total
      </figcaption>
    </figure>
  );
}
