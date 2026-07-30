# Design system

The design read: a product interface for privacy-conscious adult learners. It
should feel like a calm professional tool, keeping its distance both from the
bright gamified look of children's language apps and from generic AI-product
styling (purple gradients, neon glows).

Dials: variance 5, motion 4, density 4. Restrained, not static.

## Tokens

Defined in [`src/index.css`](src/index.css) as CSS custom properties, exposed to
Tailwind via `@theme inline`. Never hardcode a color in a component.

- **Neutrals** are warm stone. Light: `#FAF9F7` canvas on white surfaces. Dark: `#131211` canvas on `#1C1A19` surfaces. No pure black or pure white
- **One accent**, teal (`#0F766E` light, `#2FBDB0` dark), locked across the whole app. No secondary accent
- **Semantic colors** are reserved: `live` (rose) only for recording and in-call states, `warn` (amber) for honest warnings such as the Gemini free-tier notice, `good` (green) for correct and complete. Never convey meaning by color alone; always pair with an icon or text
- **Type**: Outfit Variable for UI, JetBrains Mono for numbers, timers, API keys and costs. Learner-language text uses `.target-lang` with looser leading, script-aware fallbacks, and `lang` / `dir="auto"` so right-to-left and CJK render correctly
- **Shape lock**: 12px for controls, 16px for containers, full pill for chips. Do not mix other radii

## Screen rules

- Navigation is a left sidebar on desktop and a four-item bottom bar on mobile. The conversation screen is fullscreen with no navigation, and Escape opens the end-session confirmation
- One primary action per screen. Destructive actions use `live` and require confirmation
- Build every state: loading (skeletons that match the final shape), empty (say what to do next), error (say how to recover)
- Touch targets are at least 44px. Focus rings are always visible. Contrast meets WCAG AA in **both** themes, verified rather than assumed
- Modals are native `<dialog>` so Escape, focus trapping and background inerting come from the platform

## Motion

150 to 300ms, `transform` and `opacity` only, and `prefers-reduced-motion` is
respected everywhere. The only continuously animating elements are the waveform
and the recording pulse, because both communicate live state. Motion that
communicates nothing does not ship.

## Things that are not allowed here

- Em dashes in any user-visible string
- Countdown timers, fake scarcity, or punishing cancellation flows. The product's
  credibility depends on not doing this
- Purple gradients, neon glows, decorative glassmorphism
- Emoji as icons, or hand-drawn SVG (icons come from Phosphor only)
- Placeholder text used as a label. Labels go above, errors below
- Invented precise numbers. Cost figures come from measured ranges only
