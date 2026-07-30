/**
 * Speech recognition returns Japanese and Chinese as space-separated tokens
 * ("まだ 決まっ て ない です 。"), which is not how the language is written and
 * makes the transcript look broken. Strip spaces that sit between characters
 * from a script that does not use them, and leave everything else alone so
 * embedded Latin words, Arabic and European text keep their spacing.
 */

const SCRIPTLESS = String.raw`\p{sc=Han}\p{sc=Hiragana}\p{sc=Katakana}\p{sc=Hangul}\p{sc=Thai}` + String.raw`　-〿！-｠`;

const BETWEEN_SCRIPTLESS = new RegExp(String.raw`([${SCRIPTLESS}])[ \t]+(?=[${SCRIPTLESS}])`, "gu");

/*
 * Recognizers mix ASCII punctuation into Japanese ("か ? こんにちは"), so a space
 * before closing punctuation is dropped too. The space that follows it is kept:
 * it reads as a sentence break and is never wrong.
 */
const BEFORE_PUNCTUATION = new RegExp(String.raw`([${SCRIPTLESS}])[ \t]+(?=[?!,.;:)\]}])`, "gu");

export function normalizeTranscript(text: string): string {
  if (!text) return text;
  let out = text.replace(BEFORE_PUNCTUATION, "$1");
  // Repeat: one pass leaves the space in "A B C" chains where matches overlap.
  for (let i = 0; i < 3; i++) {
    const next = out.replace(BETWEEN_SCRIPTLESS, "$1");
    if (next === out) break;
    out = next;
  }
  return out;
}
