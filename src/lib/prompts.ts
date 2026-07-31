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
  const scenario = ctx.scenario;

  /*
   * Sectioned rather than a flat list of sentences, and the two things that
   * break most visibly — who is speaking, and which variety they speak — are
   * both stated near the start and restated at the very end, because models
   * attend most strongly to the start and end of an instruction block.
   *
   * The role-boundary rules exist because a flat prompt let the model perform
   * the learner's side of the conversation (a barista asking the customer for
   * recommendations). The dialect section exists for the same reason one step
   * later: the dialect note used to be one bullet in the middle of "How to
   * speak" and was never restated, so a Kansai session came back in textbook
   * standard Japanese.
   */
  const parts: string[] = [];

  if (scenario) {
    parts.push(
      "# Who you are",
      `You are playing a character in a spoken roleplay that helps an adult learner practice ${lang.label}.`,
      scenario.situation,
      "",
      ...dialectSection(dialect),
      "",
      "# Role boundaries (most important rules)",
      "- You are NOT the learner. Never speak the learner's side of the conversation for them.",
      "- Never ask the learner to do your character's job. If your character is the one who serves, advises or interviews, you do that; the learner responds.",
      "- Stay in character for the entire session, even if the learner goes off topic.",
      "- If the learner hesitates or goes quiet, stay in character and gently prompt them.",
    );

    if (scenario.tasks.length > 0) {
      parts.push(
        "",
        "# What the LEARNER is practicing (their job, not yours)",
        "Create natural openings so they can do these. Do not do them yourself:",
        ...scenario.tasks.map((t) => `- ${t}`),
      );
    }

    if (scenario.goalPhrases.length > 0) {
      parts.push(
        "",
        "# Expressions the LEARNER is trying to use",
        "These are the learner's lines, not yours. Steer the conversation so each one becomes usable, but do not say them yourself:",
        ...scenario.goalPhrases.map((p) => `- ${p}`),
      );
    }
  } else {
    parts.push(
      "# Who you are",
      `You are a warm, curious conversation partner helping an adult learner practice speaking ${lang.label}.`,
      "Let the learner steer the topic. Start by greeting them and asking an easy, open question about their day.",
      "",
      ...dialectSection(dialect),
    );
  }

  parts.push(
    "",
    "# How to speak",
    `Learner level: ${ctx.level}. ${LEVEL_NOTES[ctx.level]}`,
    "Always stay in the target language. If the learner is stuck, briefly help, then return to the target language.",
    "Keep your turns short (one to three sentences) so the learner speaks at least half of the time.",
    "Ask questions that fit your character and move the situation forward.",
    "Do not correct every mistake mid-flow. Only recast serious errors naturally in your reply.",
    'If the learner says "slower please" or similar, slow down and simplify.',
  );

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

  /*
   * The closing block is the last thing the model reads, so it carries both
   * failure modes at once and ends on the variety.
   */
  parts.push("", "# Before you speak, remember");
  if (scenario) {
    parts.push(
      `Your character: ${firstSentence(scenario.situation)}`,
      "You are not the learner, and you never take their turn.",
    );
  }
  parts.push(
    `Open the conversation now with one short, natural line that fits the situation, spoken in ${dialect.label}.`,
  );

  return parts.join("\n");
}

/**
 * The variety gets its own section instead of a bullet inside "How to speak".
 * Placed directly under the role at the top, and restated at the very end:
 * mentioned once in the middle, it was reliably ignored.
 */
function dialectSection(dialect: { label: string; promptNote: string }): string[] {
  return [
    "# Which variety you speak (this governs every word you say)",
    dialect.promptNote,
    `Every single line you speak must be recognisably ${dialect.label}, from your very first sentence onward.`,
  ];
}

/** The opening sentence of a situation carries the role, so it works as a reminder. */
function firstSentence(text: string): string {
  const match = text.match(/^[^.!?]*[.!?]/);
  return (match ? match[0] : text).trim();
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
