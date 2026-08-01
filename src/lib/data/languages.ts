import type { Language } from "../types";

/**
 * Dialect presets cover the varieties the big apps don't teach. Each
 * promptNote is injected into the system prompt verbatim.
 *
 * How to write a promptNote for a non-default variety: abstract instructions
 * ("do not drift into the standard") give the model nothing to check a
 * sentence against and were reliably ignored. A note that works names three
 * things:
 *
 *   1. grammar markers — the forms that make the variety what it is
 *      (voseo, بـ prefix, ～へん negation)
 *   2. vocabulary — the everyday words that differ from the sibling variety
 *      the model drifts toward, stated as pairs (carro not coche)
 *   3. a per-sentence rule the model can apply while speaking: if the line
 *      would be identical in the sibling variety, rewrite it first
 *
 * Default varieties (MSA, Hochdeutsch, 標準語...) stay short: they are what
 * models produce anyway, so there is nothing to defend against.
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
          "Speak exclusively in Egyptian Arabic (Cairene). Never drift into Modern Standard Arabic. Use the بـ prefix for the present (بحب، بتعمل إيه؟), هـ for the future (هروح), مش for negation, and everyday Cairo words: عايز، فين، إزيك، كويس، دلوقتي، ليه، إمتى، كده. Pronounce ج as g. If a line you are about to say would be identical in فصحى, rewrite it the way someone in Cairo would actually say it.",
      },
      {
        id: "ar-lev",
        bcp47: "ar-LB",
        label: "Levantine Arabic",
        nativeLabel: "شامي",
        promptNote:
          "Speak exclusively in Levantine Arabic as spoken in Damascus and Beirut. Never drift into Modern Standard Arabic. Use بدي for wanting, عم + verb for the progressive (عم بحكي), رح for the future, مو and مش for negation, and everyday Levantine words: شو، وين، هلق، كيفك، منيح، كتير، لازم. If a line you are about to say would be identical in فصحى, rewrite it the way someone in Beirut would actually say it.",
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
        promptNote:
          "Speak Mexican Spanish (Mexico City). Use ustedes and never vosotros, and Mexican vocabulary over peninsular words: carro not coche, computadora not ordenador, celular not móvil, jugo not zumo, platicar not charlar. Use everyday Mexican expressions where natural: ahorita, órale, ándale, qué padre, ¿mande? when asking someone to repeat. If a sentence would be word-for-word identical in peninsular Spanish, prefer the Mexican phrasing.",
      },
      {
        id: "es-es",
        bcp47: "es-ES",
        label: "Castilian Spanish",
        promptNote:
          "Speak Castilian Spanish as spoken in Madrid. Use vosotros with its conjugations for informal plural (tenéis, queréis, venid), and peninsular vocabulary: coche, ordenador, móvil, zumo, patatas, conducir. Everyday Madrid expressions where natural: vale, venga, tío/tía among friends, qué guay. If a sentence would be word-for-word identical in Latin American Spanish, prefer the Madrid phrasing.",
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
        promptNote:
          "Speak Brazilian Portuguese (São Paulo register). Use você and vocês, a gente with third-person for we, and the gerund for the progressive (estou fazendo, never estou a fazer). Brazilian vocabulary over European words: ônibus not autocarro, trem not comboio, celular not telemóvel, café da manhã not pequeno-almoço, banheiro not casa de banho. Everyday Brazilian expressions where natural: legal, beleza, cara, tudo bem. If a sentence would read as European Portuguese, rewrite it the way someone in São Paulo would say it.",
      },
      {
        id: "pt-pt",
        bcp47: "pt-PT",
        label: "European Portuguese",
        promptNote:
          "Speak European Portuguese as spoken in Lisbon. Use tu with its proper conjugation informally, estar a + infinitive for the progressive (estou a fazer, never estou fazendo), and European vocabulary: autocarro not ônibus, comboio not trem, telemóvel not celular, pequeno-almoço not café da manhã, casa de banho not banheiro. Everyday Lisbon expressions where natural: fixe, giro, pois, está bem. If a sentence would read as Brazilian Portuguese, rewrite it the way someone in Lisbon would say it.",
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
        promptNote:
          "Speak natural British English. Use British vocabulary over American: flat not apartment, lift not elevator, queue not line, holiday not vacation, shop not store, mobile not cell phone, quid for pounds. British phrasing where natural: have you got rather than do you have, brilliant, cheers, fancy a..., a bit, fortnight. If a sentence would be word-for-word identical in American English, prefer the British phrasing and vocabulary.",
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
