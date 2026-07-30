export type ProviderId = "openai" | "gemini" | "demo";

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export interface DialectPreset {
  id: string;
  /** English label, e.g. "Egyptian Arabic" */
  label: string;
  /** Native-script label, e.g. "مصري" */
  nativeLabel?: string;
  /** Extra system-prompt instructions that keep the model in this variety */
  promptNote: string;
  /**
   * BCP-47 tag for the speech recognizer. Without it, a short utterance can be
   * transcribed into the wrong script entirely.
   */
  bcp47: string;
  beta?: boolean;
}

export interface Language {
  code: string; // BCP-47 base, e.g. "ar", "es"
  label: string;
  nativeLabel: string;
  rtl?: boolean;
  dialects: DialectPreset[];
}

export type ScenarioCategory = "daily" | "work" | "travel" | "debate" | "character" | "fun";

export interface Scenario {
  id: string;
  category: ScenarioCategory;
  title: string;
  description: string;
  /** Persona + situation instructions appended to the system prompt */
  situation: string;
  /** Phrases the learner should try to use (LEARN step, shown before start) */
  goalPhrases: string[];
  /** Tasks to complete during the conversation (Speak-style checklist) */
  tasks: string[];
  minutes: number;
  levelHint?: CEFRLevel;
}

export type TurnRole = "user" | "assistant";

export interface TranscriptTurn {
  id: string;
  role: TurnRole;
  text: string;
  /** true while streaming, false once finalized */
  pending?: boolean;
  at: number;
}

export interface Correction {
  said: string;
  better: string;
  why: string;
}

export interface VocabSuggestion {
  term: string;
  reading?: string;
  meaning: string;
  example?: string;
}

export interface SessionFeedback {
  summary: string;
  corrections: Correction[];
  vocab: VocabSuggestion[];
  generatedAt: number;
}

export interface SessionRecord {
  id?: number;
  startedAt: number;
  endedAt: number;
  provider: ProviderId;
  languageCode: string;
  dialectId: string;
  scenarioId: string | null;
  transcript: TranscriptTurn[];
  tasksDone: number[];
  feedback: SessionFeedback | null;
}

/** SM-2 state on a vocabulary card */
export interface VocabCard {
  id?: number;
  term: string;
  reading?: string;
  meaning: string;
  example?: string;
  languageCode: string;
  addedAt: number;
  /** SM-2 */
  interval: number; // days
  ease: number;
  reps: number;
  dueAt: number;
}

export type ReviewGrade = "again" | "hard" | "good" | "easy";

export interface OnboardingProfile {
  level: CEFRLevel;
  goal: "travel" | "work" | "family" | "culture" | "exam";
  occupation?: string;
}

export interface ExportBundle {
  app: "lingua-open";
  version: 1;
  exportedAt: number;
  sessions: SessionRecord[];
  vocab: VocabCard[];
}
