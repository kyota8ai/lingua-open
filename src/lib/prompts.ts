import type { CEFRLevel, OnboardingProfile, Scenario } from "./types";
import { findDialect, findLanguage } from "./data/languages";

const LEVEL_NOTES: Record<CEFRLevel, string> = {
  A1: "Use very simple, short sentences and common words. Speak slowly. One idea per sentence.",
  A2: "Use simple everyday language. Short sentences. Rephrase instead of using rare words.",
  B1: "Use clear everyday language with some variety. Natural pace, but avoid slang-heavy or very fast speech.",
  B2: "Speak naturally with a good range of vocabulary. Occasional idioms are fine.",
  C1: "Speak like a native, including idioms and cultural references.",
};

export interface PromptContext {
  languageCode: string;
  dialectId: string;
  level: CEFRLevel;
  profile?: Pick<OnboardingProfile, "goal" | "occupation">;
  scenario?: Scenario | null;
}

/**
 * Builds the realtime-session system prompt. This is the product's actual
 * "dialect preset" mechanism: a preset is a prompt template, not a model.
 */
export function buildSystemPrompt(ctx: PromptContext): string {
  const lang = findLanguage(ctx.languageCode);
  const dialect = findDialect(ctx.languageCode, ctx.dialectId);

  const parts: string[] = [
    `You are a friendly ${dialect.label} conversation partner helping an adult learner practice speaking ${lang.label}.`,
    dialect.promptNote,
    `Learner level: ${ctx.level}. ${LEVEL_NOTES[ctx.level]}`,
    "Always stay in the target language. If the learner is stuck, briefly help, then return to the target language.",
    "Keep your turns short (one to three sentences) so the learner speaks at least half of the time. Ask questions.",
    "Do not correct every mistake mid-flow. Only recast serious errors naturally in your reply.",
    'If the learner says "slower please" or similar, slow down and simplify.',
  ];

  if (ctx.profile?.goal) {
    const goalNote: Record<string, string> = {
      travel: "The learner is preparing for travel. Prefer practical, situational vocabulary.",
      work: "The learner needs the language for work. Prefer professional, workplace vocabulary.",
      family: "The learner speaks with family in this language. Prefer warm, everyday vocabulary.",
      culture: "The learner loves the culture. Sprinkle in cultural notes when natural.",
      exam: "The learner is preparing for an exam. Prefer precise, standard usage.",
    };
    parts.push(goalNote[ctx.profile.goal]);
  }
  if (ctx.profile?.occupation) {
    parts.push(`The learner works as: ${ctx.profile.occupation}. Use this for personalized examples when relevant.`);
  }

  if (ctx.scenario) {
    parts.push(
      `ROLEPLAY: ${ctx.scenario.situation}`,
      "Stay in this role for the whole session. Start the conversation yourself with a short, natural opening line for the situation.",
    );
    if (ctx.scenario.tasks.length > 0) {
      parts.push(
        `The learner is trying to complete these tasks: ${ctx.scenario.tasks.join("; ")}. Give them natural openings to do so.`,
      );
    }
  } else {
    parts.push("Start by greeting the learner and asking an easy, open question about their day.");
  }

  return parts.join("\n");
}

/** Prompt for the post-session feedback call (text LLM, same key). */
export function buildFeedbackPrompt(transcript: string, ctx: PromptContext): string {
  const lang = findLanguage(ctx.languageCode);
  const dialect = findDialect(ctx.languageCode, ctx.dialectId);
  return [
    `You are a ${dialect.label} teacher reviewing a learner's speaking practice transcript (level ${ctx.level}).`,
    "Return STRICT JSON, no markdown fences, matching exactly this TypeScript shape:",
    `{"summary": string, "corrections": [{"said": string, "better": string, "why": string}], "vocab": [{"term": string, "reading"?: string, "meaning": string, "example"?: string}]}`,
    `Rules:`,
    `- summary: 2-3 encouraging sentences in English about what went well and the one main thing to improve.`,
    `- corrections: up to 6 items. Only real errors from the LEARNER's lines (ignore the assistant's lines). "said" is the learner's sentence, "better" the natural ${dialect.label} version, "why" one short English sentence.`,
    `- vocab: 4-8 useful words or phrases from this conversation worth memorizing, in ${lang.label}${dialect.label !== lang.label ? ` (${dialect.label})` : ""}. "meaning" in English. "reading" only for non-Latin scripts.`,
    "",
    "TRANSCRIPT:",
    transcript,
  ].join("\n");
}
