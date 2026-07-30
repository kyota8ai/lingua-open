import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CEFRLevel, OnboardingProfile, ProviderId } from "../lib/types";
import { FALLBACK_MODELS, type ModelCatalog } from "../lib/models";
import { DEFAULT_VOICES } from "../lib/data/voices";

type Derived = "setPartial" | "activeKey" | "activeConversationModel" | "activeTextModel" | "activeVoice";

interface SettingsState {
  onboarded: boolean;
  provider: ProviderId;
  /** BYOK keys, localStorage only, never sent anywhere except the chosen provider */
  openaiKey: string;
  geminiKey: string;
  /** Chosen via model discovery. Empty means "use the fallback default". */
  openaiConversationModel: string;
  openaiTextModel: string;
  geminiConversationModel: string;
  geminiTextModel: string;
  openaiVoice: string;
  geminiVoice: string;
  /** Cached discovery result, so the pickers survive a reload. */
  openaiCatalog: ModelCatalog | null;
  geminiCatalog: ModelCatalog | null;
  languageCode: string;
  dialectId: string;
  level: CEFRLevel;
  goal: OnboardingProfile["goal"];
  occupation: string;
  theme: "system" | "light" | "dark";
  setPartial: (patch: Partial<Omit<SettingsState, Derived>>) => void;
  activeKey: () => string;
  activeConversationModel: () => string;
  activeTextModel: () => string;
  activeVoice: () => string;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      onboarded: false,
      provider: "demo",
      openaiKey: "",
      geminiKey: "",
      openaiConversationModel: "",
      openaiTextModel: "",
      geminiConversationModel: "",
      geminiTextModel: "",
      openaiVoice: "",
      geminiVoice: "",
      openaiCatalog: null,
      geminiCatalog: null,
      languageCode: "ar",
      dialectId: "ar-eg",
      level: "A2",
      goal: "travel",
      occupation: "",
      theme: "system",
      setPartial: (patch) => set(patch),
      activeKey: () => {
        const s = get();
        return s.provider === "openai" ? s.openaiKey : s.provider === "gemini" ? s.geminiKey : "";
      },
      activeConversationModel: () => {
        const s = get();
        if (s.provider === "openai") return s.openaiConversationModel || FALLBACK_MODELS.openai.conversation;
        if (s.provider === "gemini") return s.geminiConversationModel || FALLBACK_MODELS.gemini.conversation;
        return "";
      },
      activeTextModel: () => {
        const s = get();
        if (s.provider === "openai") return s.openaiTextModel || FALLBACK_MODELS.openai.text;
        if (s.provider === "gemini") return s.geminiTextModel || FALLBACK_MODELS.gemini.text;
        return "";
      },
      activeVoice: () => {
        const s = get();
        if (s.provider === "openai") return s.openaiVoice || DEFAULT_VOICES.openai;
        if (s.provider === "gemini") return s.geminiVoice || DEFAULT_VOICES.gemini;
        return "";
      },
    }),
    {
      name: "lingua-settings",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function applyTheme(theme: "system" | "light" | "dark") {
  const resolved =
    theme === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme;
  document.documentElement.dataset.theme = resolved;
  try {
    if (theme === "system") localStorage.removeItem("lingua-theme");
    else localStorage.setItem("lingua-theme", theme);
  } catch {
    // private mode: theme just won't persist
  }
}
