import type { ProviderId } from "./types";
import { GEMINI_TEXT_MODEL, OPENAI_TEXT_MODEL } from "./feedback";

export interface WordGloss {
  meaning: string;
  note?: string;
}

const cache = new Map<string, WordGloss>();

/**
 * Contextual word/phrase gloss for tap-to-translate: a word in context beats
 * translating the whole message. Same BYOK key, tiny call.
 */
export async function glossWord(
  provider: ProviderId,
  apiKey: string,
  term: string,
  sentence: string,
  langLabel: string,
): Promise<WordGloss> {
  const key = `${langLabel}:${term}:${sentence.slice(0, 60)}`;
  const hit = cache.get(key);
  if (hit) return hit;

  if (provider === "demo" || !apiKey) {
    return { meaning: "Demo mode: connect an API key for tap-to-translate." };
  }

  const prompt = [
    `You are a concise ${langLabel} dictionary. The learner tapped the word or phrase below inside a sentence.`,
    'Reply with STRICT JSON only: {"meaning": string, "note"?: string}.',
    "- meaning: English translation as used in this sentence, max 8 words.",
    "- note: optional, max 10 words (register, root, or a false-friend warning). Omit when obvious.",
    "",
    `Word: ${term}`,
    `Sentence: ${sentence}`,
  ].join("\n");

  const raw = provider === "openai" ? await callOpenAI(apiKey, prompt) : await callGemini(apiKey, prompt);
  const parsed = parseGloss(raw);
  cache.set(key, parsed);
  return parsed;
}

function parseGloss(raw: string): WordGloss {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  try {
    const obj = JSON.parse(cleaned) as Partial<WordGloss>;
    if (typeof obj.meaning === "string" && obj.meaning.trim()) {
      return { meaning: obj.meaning.trim(), note: typeof obj.note === "string" ? obj.note.trim() : undefined };
    }
  } catch {
    // fall through: some models answer with the bare translation
  }
  if (cleaned && cleaned.length <= 120) return { meaning: cleaned };
  throw new Error("Could not read the translation.");
}

async function callOpenAI(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OPENAI_TEXT_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 80,
    }),
  });
  if (!res.ok) throw new Error(`Translation failed (${res.status}).`);
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? "";
}

async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT_MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", maxOutputTokens: 80 },
      }),
    },
  );
  if (!res.ok) throw new Error(`Translation failed (${res.status}).`);
  const data = (await res.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
}

/** Split text into tappable word segments, script-aware. */
export function segmentWords(text: string, langCode: string): Array<{ text: string; word: boolean }> {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    try {
      const seg = new Intl.Segmenter(langCode, { granularity: "word" });
      return Array.from(seg.segment(text)).map((s) => ({ text: s.segment, word: s.isWordLike === true }));
    } catch {
      // unknown locale: fall through to whitespace split
    }
  }
  return text
    .split(/(\s+)/)
    .filter((part) => part !== "")
    .map((part) => ({ text: part, word: /\S/.test(part) }));
}
