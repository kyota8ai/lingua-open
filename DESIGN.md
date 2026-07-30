# Design system

The design read: a product interface for privacy-conscious adult learners. It
should feel like a calm professional tool, keeping its distance both from the
bright gamified look of children's language apps and from generic AI-product
styling (purple gradients, neon glows).

Dials: variance 5, motion 4, density 4. Restrained, not static.

## Color

Color is Material 3. No hex value is chosen by hand anywhere in the app.

[`scripts/gen-theme.mjs`](scripts/gen-theme.mjs) generates every color token in
[`src/theme.css`](src/theme.css) from a single seed, `#4A6572` (slate blue-grey),
using Google's `material-color-utilities`. To change the palette, change the seed
and re-run it:

```
npx vite-node -c scripts/vite.theme.config.mjs scripts/gen-theme.mjs
```

`src/theme.css` is generated output. Edit the script, never the CSS.

Three decisions in that script are load-bearing:

- **`SchemeTonalSpot`, not `SchemeContent`.** Content pins `primary-container` to the seed itself in both themes, so every filled area lands as dark as the seed and light mode stops being light. TonalSpot places containers at tone 90 in light and tone 30 in dark, so a fill stays pale in light mode and its paired text is comfortably readable. The seed then contributes only the hue
- **Status colors are not derived from the seed.** M3 builds `tertiary` by rotating the seed hue, which from this seed lands on purple, and a purple warning reads as decoration rather than as a warning. `warning` (amber) and `success` (green) are generated from their own fixed hues at M3's own tone assignments; `error` already ships fixed
- **A third text tone.** M3 stops at `on-surface-variant`, so the faintest text was borrowing `outline`, a role meant for borders and too light to read as body text. `on-surface-faint` sits one step below `on-surface-variant` and still clears 4.5:1 on every surface the app uses

[`src/index.css`](src/index.css) is a thin alias layer over the `md-sys` roles
(`--accent`, `--ink`, `--surface`, …) so components read as what they mean and a
reseed changes every screen at once. Components use only these aliases; never a
hex value, and never a raw `md-sys` role.

**Every fill has a partner.** Put a fill on the background and its `on-` partner
on the text. Reaching for `--ink` on top of a tinted fill is what once made the
Gemini warning banner invisible: it survives one theme by luck and disappears in
the other. Depth follows M3 too — a container's tone carries elevation, not a
shadow — and hover/press are the M3 state layer (`.state-layer`, a wash of the
content color at 0.08 / 0.12), not a per-component hover color.

Contrast is verified, not assumed: every fill/text pair clears WCAG AA in both
themes.

## Logo

The mark is a speech bubble with the voice cut out of it, defined once in
[`src/components/Logo.tsx`](src/components/Logo.tsx) as a single `evenodd` path
in `currentColor`. It was three bars on their own, which reads as an equaliser
or a bar chart: it says "audio levels", not "someone speaking". The bubble keeps
the same three-beat rhythm and fixes the meaning.

The tail sits bottom-left. A tail on the right is the convention for the app
talking at you, and in this product the learner does the talking.

Two lockups, and the difference is deliberate:

- **App icons** ([`public/pwa-*.png`](public), `apple-touch-icon.png`) keep the rounded-square plate, because that is the tile every platform expects
- **The favicon** ([`public/favicon.svg`](public/favicon.svg)) drops the plate. A tab already supplies the container, so losing it gives the mark about 40% more area, which is what keeps the three bars separable at 16px. It also carries a `prefers-color-scheme` rule so the mark uses light or dark `primary`

## Other tokens

- **Type**: Outfit Variable for UI, JetBrains Mono for numbers, timers, API keys and costs. Learner-language text uses `.target-lang` with looser leading, script-aware fallbacks, and `lang` / `dir="auto"` so right-to-left and CJK render correctly
- **Shape scale**: `--radius-control` pill for buttons and chips, `--radius-field` 8px for inputs, `--radius-card` 12px for cards, `--radius-sheet` 28px for dialogs and sheets. Do not mix other radii
- **Meaning is never carried by color alone.** `live` marks recording and in-call states, `warn` honest warnings such as the Gemini free-tier notice, `good` correct and complete — each always paired with an icon or text

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
