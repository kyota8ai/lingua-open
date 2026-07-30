import type { ProviderId, SessionFeedback, TranscriptTurn } from "./types";
import type { PromptContext } from "./prompts";
import { buildFeedbackPrompt } from "./prompts";

/**
 * Post-session feedback: send the transcript to a text model with the same
 * key. The model ID comes from settings (discovery choice or fallback) rather
 * than a constant here, because hardcoded IDs eventually 404. Failures must
 * degrade gracefully and never block saving the session.
 */
export async function generateFeedback(
  provider: ProviderId,
  apiKey: string,
  transcript: TranscriptTurn[],
  ctx: PromptContext,
  model: string,
): Promise<SessionFeedback> {
  const text = transcript.map((t) => `${t.role === "user" ? "LEARNER" : "PARTNER"}: ${t.text}`).join("\n");
  const prompt = buildFeedbackPrompt(text, ctx);

  if (provider === "demo") return demoFeedback();

  const raw = provider === "openai" ? await callOpenAI(apiKey, prompt, model) : await callGemini(apiKey, prompt, model);
  const parsed = parseFeedbackJson(raw);
  return { ...parsed, generatedAt: Date.now() };
}

async function callOpenAI(apiKey: string, prompt: string, model: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`Feedback request failed (${res.status})`);
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? "";
}

async function callGemini(apiKey: string, prompt: string, model: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    },
  );
  if (!res.ok) throw new Error(`Feedback request failed (${res.status})`);
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
}

export function parseFeedbackJson(raw: string): Omit<SessionFeedback, "generatedAt"> {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  let obj: unknown;
  try {
    obj = JSON.parse(cleaned);
  } catch {
    throw new Error("The model returned malformed feedback JSON.");
  }
  const o = obj as Partial<Omit<SessionFeedback, "generatedAt">>;
  return {
    summary: typeof o.summary === "string" ? o.summary : "",
    corrections: Array.isArray(o.corrections)
      ? o.corrections
          .filter((c) => c && typeof c.said === "string" && typeof c.better === "string")
          .map((c) => ({ said: c.said, better: c.better, why: typeof c.why === "string" ? c.why : "" }))
          .slice(0, 8)
      : [],
    vocab: Array.isArray(o.vocab)
      ? o.vocab
          .filter((v) => v && typeof v.term === "string" && typeof v.meaning === "string")
          .map((v) => ({
            term: v.term,
            meaning: v.meaning,
            reading: typeof v.reading === "string" ? v.reading : undefined,
            example: typeof v.example === "string" ? v.example : undefined,
          }))
          .slice(0, 10)
      : [],
  };
}

function demoFeedback(): SessionFeedback {
  return {
    summary:
      "Demo feedback: in a real session, this summary reviews your speaking with your own AI provider. You kept the conversation going and covered the scenario tasks. Focus next on longer answers.",
    corrections: [
      {
        said: "I want order coffee",
        better: "I'd like to order a coffee",
        why: "Polite requests use \"I'd like to\" plus the article.",
      },
      {
        said: "How much cost it?",
        better: "How much does it cost?",
        why: "Questions need the auxiliary \"does\" before the subject.",
      },
    ],
    vocab: [
      { term: "to go", meaning: "takeaway (drink or food you take with you)", example: "One latte to go, please." },
      { term: "recommend", meaning: "to suggest something as good", example: "What do you recommend?" },
      { term: "receipt", meaning: "the paper proof of payment", example: "Could I have the receipt?" },
    ],
    generatedAt: Date.now(),
  };
}
