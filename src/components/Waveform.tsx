import { useEffect, useRef, type RefObject } from "react";

/**
 * Live audio-level waveform (the one perpetually-moving element in the app,
 * motivated: it communicates "the line is open"). Reads the level from a ref
 * inside rAF so high-frequency level updates never re-render React. Collapses
 * to static bars under reduced motion.
 */
export function Waveform({ levelRef, live }: { levelRef: RefObject<number>; live: boolean }) {
  const bars = 24;
  const refs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let raf = 0;
    let t = 0;
    const tick = () => {
      t += 0.12;
      const l = live ? Math.max(0.08, levelRef.current ?? 0) : 0.06;
      refs.current.forEach((el, i) => {
        if (!el) return;
        const wave = (Math.sin(t + i * 0.7) + 1) / 2;
        const h = 4 + wave * l * 26;
        el.style.height = `${h}px`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [live, levelRef]);

  return (
    <div className="flex items-center gap-[3px] h-8" role="img" aria-label={live ? "Audio level" : "Audio idle"}>
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={["w-[3px] rounded-full transition-colors", live ? "bg-accent" : "bg-line-strong"].join(" ")}
          style={{ height: 4 }}
        />
      ))}
    </div>
  );
}
