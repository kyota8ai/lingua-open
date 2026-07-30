import type { ProviderId } from "../types";
import type { ConversationProvider } from "./types";
import { OpenAIRealtimeProvider } from "./openai";
import { GeminiLiveProvider } from "./gemini";
import { DemoProvider } from "./demo";

/** `model` comes from settings, which resolves discovery choice or fallback. */
export function createProvider(id: ProviderId, apiKey: string, model?: string): ConversationProvider {
  switch (id) {
    case "openai":
      return new OpenAIRealtimeProvider(apiKey, model);
    case "gemini":
      return new GeminiLiveProvider(apiKey, model);
    case "demo":
      return new DemoProvider();
  }
}

export { ProviderError } from "./types";
export type { ConversationProvider, ProviderEvents, ProviderStatus } from "./types";
