import type { ProviderId } from "./types";

/**
 * Model discovery. Hardcoded model IDs rot: a name that works today returns 404
 * next quarter, and a key may not have access to what the docs advertise. So we
 * ask the provider what this key can actually use, and let the learner choose.
 * Doubles as a key validity check.
 */

export interface ModelOption {
  id: string;
  label: string;
}

export interface ModelCatalog {
  /** Realtime voice models */
  conversation: ModelOption[];
  /** Text models, used for post-session feedback and tap-to-translate */
  text: ModelOption[];
}

/** Used when discovery has not run: the last IDs known to work. */
export const FALLBACK_MODELS: Record<"openai" | "gemini", { conversation: string; text: string }> = {
  openai: { conversation: "gpt-realtime-mini", text: "gpt-4.1-mini" },
  gemini: { conversation: "gemini-2.5-flash-native-audio-preview-12-2025", text: "gemini-2.5-flash" },
};

/*
 * Preferred picks when present in the discovered list. Anything missing simply
 * falls through to the freshest model the key offers, so this list going stale
 * degrades gracefully instead of breaking.
 */
const PREFERRED: Record<"openai" | "gemini", { conversation: string[]; text: string[] }> = {
  openai: {
    conversation: ["gpt-realtime-mini", "gpt-realtime"],
    text: ["gpt-4.1-mini", "gpt-4o-mini"],
  },
  gemini: {
    conversation: [
      "gemini-3.1-flash-live-preview",
      "gemini-2.5-flash-native-audio-preview-12-2025",
      "gemini-2.5-flash-native-audio-preview-09-2025",
    ],
    text: ["gemini-2.5-flash", "gemini-3.5-flash", "gemini-2.5-flash-lite"],
  },
};

export class ModelListError extends Error {
  constructor(
    message: string,
    public hint?: string,
  ) {
    super(message);
  }
}

export async function listModels(provider: ProviderId, apiKey: string): Promise<ModelCatalog> {
  if (provider === "demo") return { conversation: [], text: [] };
  if (!apiKey) throw new ModelListError("Add an API key first.");
  const catalog = provider === "openai" ? await listOpenAI(apiKey) : await listGemini(apiKey);
  return {
    conversation: catalog.conversation.sort(byFreshness),
    text: catalog.text.sort(byFreshness),
  };
}

/** First preferred model that the key actually offers, else the freshest one. */
export function pickDefault(options: ModelOption[], provider: "openai" | "gemini", kind: "conversation" | "text"): string {
  for (const id of PREFERRED[provider][kind]) {
    if (options.some((o) => o.id === id)) return id;
  }
  return options[0]?.id ?? FALLBACK_MODELS[provider][kind];
}

async function listGemini(apiKey: string): Promise<ModelCatalog> {
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000", {
    headers: { "x-goog-api-key": apiKey },
  }).catch(() => {
    throw new ModelListError("Could not reach Google's API.", "Check your network connection.");
  });
  if (!res.ok) throw listError(res.status, "Google");

  const data = (await res.json()) as {
    models?: Array<{ name?: string; displayName?: string; supportedGenerationMethods?: string[] }>;
  };
  const conversation: ModelOption[] = [];
  const text: ModelOption[] = [];

  for (const m of data.models ?? []) {
    const id = m.name?.replace(/^models\//, "");
    if (!id) continue;
    const methods = m.supportedGenerationMethods ?? [];
    const option = { id, label: m.displayName || id };
    if (methods.includes("bidiGenerateContent")) conversation.push(option);
    // Speech and embedding models also expose generateContent; they are not chat models.
    else if (methods.includes("generateContent") && !/tts|embedding|aqa|image|imagen|veo/i.test(id)) text.push(option);
  }
  return { conversation, text };
}

async function listOpenAI(apiKey: string): Promise<ModelCatalog> {
  const res = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  }).catch(() => {
    throw new ModelListError("Could not reach OpenAI's API.", "Check your network connection.");
  });
  if (!res.ok) throw listError(res.status, "OpenAI");

  const data = (await res.json()) as { data?: Array<{ id?: string }> };
  const conversation: ModelOption[] = [];
  const text: ModelOption[] = [];

  for (const m of data.data ?? []) {
    const id = m.id;
    if (!id) continue;
    if (/realtime/i.test(id)) conversation.push({ id, label: id });
    else if (/^(gpt|o\d)/i.test(id) && !/audio|transcribe|tts|image|embedding|moderation|search|dall-e|whisper/i.test(id)) {
      text.push({ id, label: id });
    }
  }
  return { conversation, text };
}

function listError(status: number, vendor: string): ModelListError {
  // Listing models takes no arguments, so a 400 here means the key itself.
  // Google answers a malformed key with 400 rather than 401.
  if (status === 400 || status === 401 || status === 403) {
    return new ModelListError(`${vendor} rejected the API key.`, "Check that you pasted the whole key.");
  }
  return new ModelListError(`${vendor} returned an error (${status}).`, "Try again in a moment.");
}

/**
 * Rough recency ranking, used only to order the list and pick a sensible
 * fallback: a version number if the ID carries one, then a mm-yyyy suffix.
 */
function freshness(id: string): number {
  const version = Number(/(\d+(?:\.\d+)?)/.exec(id)?.[1] ?? 0);
  const dated = /(\d{2})-(\d{4})/.exec(id);
  return version * 100_000 + (dated ? Number(dated[2]) * 12 + Number(dated[1]) : 0);
}

function byFreshness(a: ModelOption, b: ModelOption): number {
  return freshness(b.id) - freshness(a.id) || a.id.localeCompare(b.id);
}
