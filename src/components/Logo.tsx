/*
 * The mark: a speech bubble with the voice cut out of it.
 *
 * The previous mark was three bars on their own, which reads as an equaliser or
 * a bar chart. It says "audio levels", not "someone speaking". Keeping the same
 * three-beat rhythm but cutting it out of a speech bubble keeps the continuity
 * and fixes the meaning.
 *
 * The tail sits bottom-left, on the speaker's side. A tail on the right is the
 * convention for the app talking at you; in this product the learner does the
 * talking, and the mark should say which way round that is.
 *
 * One path, `evenodd`, `currentColor`: the bars are true negative space, so the
 * mark works at any size, in one colour, on any background, with no mask ids to
 * collide when several instances render on one page.
 */
const MARK =
  // Bubble body, clockwise from the top-left corner, with the tail on the bottom-left edge.
  "M7 2h10a5 5 0 0 1 5 5v5a5 5 0 0 1-5 5h-5.5L6.2 21 8.2 17H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z" +
  // The voice: short, tall, mid.
  "M8 7a1.25 1.25 0 0 1 1.25 1.25v2.5a1.25 1.25 0 0 1-2.5 0v-2.5A1.25 1.25 0 0 1 8 7Z" +
  "M12 5a1.25 1.25 0 0 1 1.25 1.25v6.5a1.25 1.25 0 0 1-2.5 0v-6.5A1.25 1.25 0 0 1 12 5Z" +
  "M16 6.25a1.25 1.25 0 0 1 1.25 1.25v4a1.25 1.25 0 0 1-2.5 0v-4a1.25 1.25 0 0 1 1.25-1.25Z";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
      <path d={MARK} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}

/** Mark in its badge plus the wordmark. The one lockup every screen uses. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={["flex items-center gap-2.5", className].filter(Boolean).join(" ")}>
      <span className="grid place-items-center size-8 rounded-[10px] bg-accent text-on-accent" aria-hidden>
        <LogoMark className="size-5" />
      </span>
      <span className="text-[17px] font-semibold tracking-tight">lingua-open</span>
    </span>
  );
}
