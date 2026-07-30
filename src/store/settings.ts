import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CEFRLevel, OnboardingProfile, ProviderId } from "../lib/types";

interface SettingsState {
  onboarded: boolean;
  provider: ProviderId;
  /** BYOK keys, localStorage only, never sent anywhere except the chosen provider */
  openaiKey: string;
  geminiKey: string;
  languageCode: string;
  dialectId: string;
  level: CEFRLevel;
  goal: OnboardingProfile["goal"];
  occupation: string;
  theme: "system" | "light" | "dark";
  setPartial: (patch: Partial<Omit<SettingsState, "setPartial" | "activeKey">>) => void;
  activeKey: () => string;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      onboarded: false,
      provider: "demo",
      openaiKey: "",
      geminiKey: "",
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
