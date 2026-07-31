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
        bcp47: "ar-EG",
        label: "Egyptian Arabic",
        nativeLabel: "مصري",
        promptNote:
          "Speak exclusively in Egyptian Arabic (Cairene). Never drift into Modern Standard Arabic. Use everyday Cairo vocabulary and pronunciation (g for ج).",
      },
      {
        id: "ar-lev",
        bcp47: "ar-LB",
        label: "Levantine Arabic",
        nativeLabel: "شامي",
        promptNote:
          "Speak exclusively in Levantine Arabic as spoken in Damascus and Beirut. Never drift into Modern Standard Arabic.",
      },
      {
        id: "ar-msa",
        bcp47: "ar-SA",
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
        bcp47: "es-MX",
        label: "Mexican Spanish",
        promptNote: "Speak Mexican Spanish with everyday Mexico City vocabulary. Avoid Castilian forms like vosotros.",
      },
      {
        id: "es-es",
        bcp47: "es-ES",
        label: "Castilian Spanish",
        promptNote: "Speak Castilian Spanish as spoken in Madrid, including vosotros forms.",
      },
      {
        id: "es-ar",
        bcp47: "es-AR",
        label: "Rioplatense Spanish",
        promptNote:
          "Speak Rioplatense Spanish (Buenos Aires). Use voseo throughout (vos tenés, vos podés, vení, mirá, decime) and never tú or vosotros, the sh-sound for ll and y, and everyday porteño words like che, dale, laburo, bárbaro, boludo (only when friendly and appropriate). If a sentence would be word-for-word identical in neutral Latin American Spanish, rewrite it with voseo before speaking.",
      },
    ],
  },
  {
    code: "pt",
    label: "Portuguese",
    nativeLabel: "Português",
    dialects: [
      {
        id: "pt-br",
        bcp47: "pt-BR",
        label: "Brazilian Portuguese",
        promptNote: "Speak Brazilian Portuguese (São Paulo register).",
      },
      {
        id: "pt-pt",
        bcp47: "pt-PT",
        label: "European Portuguese",
        promptNote: "Speak European Portuguese as spoken in Lisbon.",
      },
    ],
  },
  {
    code: "en",
    label: "English",
    nativeLabel: "English",
    dialects: [
      {
        id: "en-us",
        bcp47: "en-US",
        label: "American English",
        promptNote: "Speak natural American English.",
      },
      {
        id: "en-gb",
        bcp47: "en-GB",
        label: "British English",
        promptNote: "Speak natural British English.",
      },
    ],
  },
  {
    code: "fr",
    label: "French",
    nativeLabel: "Français",
    dialects: [
      {
        id: "fr-fr",
        bcp47: "fr-FR",
        label: "Metropolitan French",
        promptNote: "Speak everyday Metropolitan French.",
      },
      {
        id: "fr-qc",
        bcp47: "fr-CA",
        label: "Québécois French",
        promptNote:
          "Speak Québécois French. Use the interrogative particle -tu (tu viens-tu?, c'est-tu loin?), Quebec vocabulary (char, chum, blonde, dépanneur, magasiner, présentement, c'est correct, pantoute), and Quebec expressions rather than French-from-France slang. If a sentence would be word-for-word identical in Metropolitan French, rewrite it the way someone in Montreal would say it.",
        beta: true,
      },
    ],
  },
  {
    code: "de",
    label: "German",
    nativeLabel: "Deutsch",
    dialects: [
      {
        id: "de-de",
        bcp47: "de-DE",
        label: "Standard German",
        promptNote: "Speak clear Standard German (Hochdeutsch).",
      },
    ],
  },
  {
    code: "ja",
    label: "Japanese",
    nativeLabel: "日本語",
    dialects: [
      {
        id: "ja-std",
        bcp47: "ja-JP",
        label: "Standard Japanese",
        promptNote: "Speak natural standard Japanese (標準語).",
      },
      {
        id: "ja-kansai",
        bcp47: "ja-JP",
        label: "Kansai Japanese",
        nativeLabel: "関西弁",
        promptNote:
          "Speak Osaka Kansai-ben. Use や and やん where standard Japanese uses だ (ええで, せやな), ～へん or ～ひん for the negative (わからへん, できひん), sentence-final ～ねん and ～やん, ～とる for ～ている (何しとん), and ええ, あかん, ほんま, めっちゃ, なんでやねん. For polite speech prefer ～はる (どこ行かはるん) over plain textbook keigo. If a sentence you are about to say would be word-for-word identical in 標準語, rewrite it in Kansai-ben before speaking.",
        beta: true,
      },
    ],
  },
  {
    code: "ko",
    label: "Korean",
    nativeLabel: "한국어",
    dialects: [
      {
        id: "ko-std",
        bcp47: "ko-KR",
        label: "Standard Korean",
        promptNote: "Speak natural standard Seoul Korean.",
      },
    ],
  },
  {
    code: "zh",
    label: "Mandarin",
    nativeLabel: "中文",
    dialects: [
      {
        id: "zh-cn",
        bcp47: "zh-CN",
        label: "Mainland Mandarin",
        promptNote: "Speak Mainland Standard Mandarin (Beijing register).",
      },
      {
        id: "zh-tw",
        bcp47: "zh-TW",
        label: "Taiwanese Mandarin",
        promptNote:
          "Speak Taiwanese Mandarin in traditional characters. Use Taiwan vocabulary rather than mainland terms: 腳踏車 not 自行車, 影片 not 視頻, 網路 not 網絡, 軟體 not 軟件, 計程車 not 出租車, 泡麵 not 方便麵. Use the Taiwanese sentence particles 啦, 喔, 耶, 欸 and phrasing like 有沒有..., 這樣子, 好不好. If a sentence would read as mainland Mandarin, rewrite it the way someone in Taipei would say it.",
        beta: true,
      },
    ],
  },
  {
    code: "it",
    label: "Italian",
    nativeLabel: "Italiano",
    dialects: [
      {
        id: "it-it",
        bcp47: "it-IT",
        label: "Standard Italian",
        promptNote: "Speak clear Standard Italian.",
      },
    ],
  },
];

export function findLanguage(code: string): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

export function findDialect(languageCode: string, dialectId: string) {
  const lang = findLanguage(languageCode);
  return lang.dialects.find((d) => d.id === dialectId) ?? lang.dialects[0];
}
