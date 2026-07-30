/**
 * Generates the Material 3 colour tokens in src/theme.css from one seed colour,
 * using Google's own material-color-utilities rather than hand-picked hex
 * values. Change SEED and re-run:
 *
 *   npx vite-node -c scripts/vite.theme.config.mjs scripts/gen-theme.mjs
 *
 * SchemeTonalSpot (the M3 default) is deliberate. SchemeContent pins
 * primary-container to the seed itself in both light and dark, which makes
 * every filled container as dark as the seed and forces white text onto it.
 * TonalSpot instead places containers at tone 90 in light and tone 30 in dark,
 * so a filled area stays pale in light mode and the paired on-colour is
 * comfortably readable. The seed then only sets the hue.
 *
 * Status colours are not taken from the seed. M3 derives tertiary by rotating
 * the seed hue, which here lands on purple — a purple "warning" reads as
 * decoration, not as a warning. Warning and success get their own fixed hues so
 * they mean what they look like; error already ships fixed in M3.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  argbFromHex,
  hexFromArgb,
  Hct,
  MaterialDynamicColors,
  SchemeTonalSpot,
  TonalPalette,
} from "@material/material-color-utilities";

const SEED = "#4A6572"; // slate blue-grey

/** Fixed status hues, kept out of the seed-derived scheme on purpose. */
const STATUS = {
  warning: "#B26A00", // amber
  success: "#2E7D32", // green
};

/** Roles the app actually consumes, in output order. */
const ROLES = [
  "primary", "onPrimary", "primaryContainer", "onPrimaryContainer",
  "secondary", "onSecondary", "secondaryContainer", "onSecondaryContainer",
  "tertiary", "onTertiary", "tertiaryContainer", "onTertiaryContainer",
  "error", "onError", "errorContainer", "onErrorContainer",
  "background", "onBackground",
  "surface", "onSurface", "surfaceVariant", "onSurfaceVariant",
  "surfaceDim", "surfaceBright",
  "surfaceContainerLowest", "surfaceContainerLow", "surfaceContainer",
  "surfaceContainerHigh", "surfaceContainerHighest",
  "outline", "outlineVariant", "scrim",
  "inverseSurface", "inverseOnSurface", "inversePrimary",
];

const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/**
 * Same tone assignments M3 uses for its own error role, applied to the fixed
 * status hues so they sit at the same weight as the generated roles.
 */
function statusBlock(dark) {
  return Object.entries(STATUS)
    .map(([name, hex]) => {
      const src = Hct.fromInt(argbFromHex(hex));
      const palette = TonalPalette.fromHueAndChroma(src.hue, src.chroma);
      const tone = (light, darkTone) => hexFromArgb(palette.tone(dark ? darkTone : light));
      return [
        `  --md-sys-color-${name}: ${tone(40, 80)};`,
        `  --md-sys-color-on-${name}: ${tone(100, 20)};`,
        `  --md-sys-color-${name}-container: ${tone(90, 30)};`,
        `  --md-sys-color-on-${name}-container: ${tone(10, 90)};`,
      ].join("\n");
    })
    .join("\n");
}

function block(dark) {
  const scheme = new SchemeTonalSpot(Hct.fromInt(argbFromHex(SEED)), dark, 0);
  const roles = ROLES.map((role) => {
    const hex = hexFromArgb(MaterialDynamicColors[role].getArgb(scheme));
    return `  --md-sys-color-${kebab(role)}: ${hex};`;
  }).join("\n");
  /*
   * A third text tone. M3 stops at on-surface-variant, so the faintest text in
   * the app had been borrowing `outline` — a role meant for borders, and too
   * light to read as body text. This sits one step below on-surface-variant
   * and still clears 4.5:1 on every surface the app uses.
   */
  const faint = hexFromArgb(scheme.neutralVariantPalette.tone(dark ? 75 : 40));
  return `${roles}\n  --md-sys-color-on-surface-faint: ${faint};\n${statusBlock(dark)}`;
}

const css = `/*
 * Material 3 colour tokens, generated from the seed ${SEED} with SchemeTonalSpot,
 * plus fixed-hue warning and success roles.
 * Do not edit by hand: re-run scripts/gen-theme.mjs instead.
 */
:root {
${block(false)}
}

[data-theme="dark"] {
${block(true)}
}
`;

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "theme.css");
writeFileSync(out, css);
console.log(`wrote ${out} from seed ${SEED}`);
