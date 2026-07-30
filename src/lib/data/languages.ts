import type { Language } from "../types";

/**
 * Dialect presets cover the varieties the big apps don't teach. Each
 * promptNote is injected into the system prompt verbatim.
 */
export const LANGUAGES: Language[] = [
  {
    code: "ar",
    label: "Arabic",
    nativeLabel: "العربية",
    rtl: true,
    dialects: [
      {
        id: "ar-eg",
        label: "Egyptian Arabic",
        nativeLabel: "مصري",
        promptNote:
          "Speak exclusively in Egyptian Arabic (Cairene). Never drift into Modern Standard Arabic. Use everyday Cairo vocabulary and pronunciation (g for ج).",
      },
      {
        id: "ar-lev",
        label: "Levantine Arabic",
        nativeLabel: "شامي",
        promptNote:
          "Speak exclusively in Levantine Arabic as spoken in Damascus and Beirut. Never drift into Modern Standard Arabic.",
      },
      {
        id: "ar-msa",
        label: "Modern Standard Arabic",
        nativeLabel: "الفصحى",
        promptNote: "Speak in clear Modern Standard Arabic, slightly simplified for a learner.",
      },
    ],
  },
  {
    code: "es",
    label: "Spanish",
    nativeLabel: "Español",
    dialects: [
      {
        id: "es-mx",
        label: "Mexican Spanish",
        promptNote: "Speak Mexican Spanish with everyday Mexico City vocabulary. Avoid Castilian forms like vosotros.",
      },
      {
        id: "es-es",
        label: "Castilian Spanish",
        promptNote: "Speak Castilian Spanish as spoken in Madrid, including vosotros forms.",
      },
      {
        id: "es-ar",
        label: "Rioplatense Spanish",
        promptNote: "Speak Rioplatense Spanish (Buenos Aires): voseo, sh-sound for ll/y.",
      },
    ],
  },
  {
    code: "pt",
    label: "Portuguese",
    nativeLabel: "Português",
    dialects: [
      { id: "pt-br", label: "Brazilian Portuguese", promptNote: "Speak Brazilian Portuguese (São Paulo register)." },
      { id: "pt-pt", label: "European Portuguese", promptNote: "Speak European Portuguese as spoken in Lisbon." },
    ],
  },
  {
    code: "en",
    label: "English",
    nativeLabel: "English",
    dialects: [
      { id: "en-us", label: "American English", promptNote: "Speak natural American English." },
      { id: "en-gb", label: "British English", promptNote: "Speak natural British English." },
    ],
  },
  {
    code: "fr",
    label: "French",
    nativeLabel: "Français",
    dialects: [
      { id: "fr-fr", label: "Metropolitan French", promptNote: "Speak everyday Metropolitan French." },
      {
        id: "fr-qc",
        label: "Québécois French",
        promptNote: "Speak Québécois French with common Quebec vocabulary and pronunciation.",
        beta: true,
      },
    ],
  },
  {
    code: "de",
    label: "German",
    nativeLabel: "Deutsch",
    dialects: [{ id: "de-de", label: "Standard German", promptNote: "Speak clear Standard German (Hochdeutsch)." }],
  },
  {
    code: "ja",
    label: "Japanese",
    nativeLabel: "日本語",
    dialects: [
      { id: "ja-std", label: "Standard Japanese", promptNote: "Speak natural standard Japanese (標準語)." },
      {
        id: "ja-kansai",
        label: "Kansai Japanese",
        nativeLabel: "関西弁",
        promptNote: "Speak Kansai-ben consistently (Osaka register). Do not drift into standard Japanese.",
        beta: true,
      },
    ],
  },
  {
    code: "ko",
    label: "Korean",
    nativeLabel: "한국어",
    dialects: [{ id: "ko-std", label: "Standard Korean", promptNote: "Speak natural standard Seoul Korean." }],
  },
  {
    code: "zh",
    label: "Mandarin",
    nativeLabel: "中文",
    dialects: [
      { id: "zh-cn", label: "Mainland Mandarin", promptNote: "Speak Mainland Standard Mandarin (Beijing register)." },
      { id: "zh-tw", label: "Taiwanese Mandarin", promptNote: "Speak Taiwanese Mandarin with Taiwan vocabulary.", beta: true },
    ],
  },
  {
    code: "it",
    label: "Italian",
    nativeLabel: "Italiano",
    dialects: [{ id: "it-it", label: "Standard Italian", promptNote: "Speak clear Standard Italian." }],
  },
];

export function findLanguage(code: string): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

export function findDialect(languageCode: string, dialectId: string) {
  const lang = findLanguage(languageCode);
  return lang.dialects.find((d) => d.id === dialectId) ?? lang.dialects[0];
}
