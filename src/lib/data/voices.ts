export interface VoiceOption {
  id: string;
  /** Character of the voice, as the provider describes it. */
  note?: string;
}

/**
 * Voices cannot be discovered through an API the way models can, so these are
 * transcribed from the providers' own documentation. A wrong name here means a
 * failed session, so the defaults below are the ones the docs use in examples.
 */
export const GEMINI_VOICES: VoiceOption[] = [
  { id: "Kore", note: "Firm" },
  { id: "Aoede", note: "Breezy" },
  { id: "Achird", note: "Friendly" },
  { id: "Sulafat", note: "Warm" },
  { id: "Vindemiatrix", note: "Gentle" },
  { id: "Zubenelgenubi", note: "Casual" },
  { id: "Puck", note: "Upbeat" },
  { id: "Laomedeia", note: "Upbeat" },
  { id: "Zephyr", note: "Bright" },
  { id: "Autonoe", note: "Bright" },
  { id: "Charon", note: "Informative" },
  { id: "Rasalgethi", note: "Informative" },
  { id: "Sadaltager", note: "Knowledgeable" },
  { id: "Iapetus", note: "Clear" },
  { id: "Erinome", note: "Clear" },
  { id: "Leda", note: "Youthful" },
  { id: "Sadachbia", note: "Lively" },
  { id: "Fenrir", note: "Excitable" },
  { id: "Orus", note: "Firm" },
  { id: "Alnilam", note: "Firm" },
  { id: "Callirrhoe", note: "Easy-going" },
  { id: "Umbriel", note: "Easy-going" },
  { id: "Algieba", note: "Smooth" },
  { id: "Despina", note: "Smooth" },
  { id: "Achernar", note: "Soft" },
  { id: "Enceladus", note: "Breathy" },
  { id: "Algenib", note: "Gravelly" },
  { id: "Schedar", note: "Even" },
  { id: "Gacrux", note: "Mature" },
  { id: "Pulcherrima", note: "Forward" },
];

export const OPENAI_VOICES: VoiceOption[] = [
  { id: "marin" },
  { id: "cedar" },
  { id: "alloy" },
  { id: "ash" },
  { id: "ballad" },
  { id: "coral" },
  { id: "echo" },
  { id: "sage" },
  { id: "shimmer" },
  { id: "verse" },
];

export const DEFAULT_VOICES = { gemini: "Kore", openai: "marin" } as const;

export function voicesFor(provider: "openai" | "gemini"): VoiceOption[] {
  return provider === "openai" ? OPENAI_VOICES : GEMINI_VOICES;
}

export function voiceLabel(v: VoiceOption): string {
  return v.note ? `${v.id} (${v.note})` : v.id;
}
