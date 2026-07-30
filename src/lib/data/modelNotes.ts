/**
 * What we can honestly say about a conversation model: what it costs and what
 * it trades away. Figures are transcribed from the providers' pricing pages;
 * a model we have no verified figure for gets no figure rather than a guess.
 * Unknown models simply fall through, so this table going stale degrades to
 * showing less rather than showing something wrong.
 */
export interface ModelNote {
  /** Provider rate, quoted as the provider states it. */
  price?: string;
  /** Rough monthly cost, with the assumption stated so it can be checked. */
  monthly?: string;
  /** Anything the learner gives up by picking this one. */
  tradeoff?: string;
}

const NOTES: Array<{ match: RegExp; note: ModelNote }> = [
  {
    match: /gemini-3\.\d+-flash-live/i,
    note: {
      price: "$0.005 per minute of your audio, $0.018 per minute of the reply",
      monthly: "roughly $8 a month at 20 minutes a day",
    },
  },
  {
    match: /gemini-.*native-audio/i,
    note: {
      price: "$3 per million audio input tokens, $12 per million audio output tokens",
      tradeoff: "Picks the language itself, so a short answer can be transcribed in the wrong script.",
    },
  },
  {
    match: /gemini-live-2\.5-flash/i,
    note: { price: "$3 per million audio input tokens, $12 per million audio output tokens" },
  },
  {
    match: /gpt-realtime-mini/i,
    note: { monthly: "roughly $9 a month at 20 minutes a day" },
  },
];

export function modelNote(id: string): ModelNote | null {
  return NOTES.find((n) => n.match.test(id))?.note ?? null;
}
