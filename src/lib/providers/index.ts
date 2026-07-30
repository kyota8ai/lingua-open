import type { ProviderId } from "../types";
import type { ConversationProvider } from "./types";
import { OpenAIRealtimeProvider } from "./openai";
import { GeminiLiveProvider } from "./gemini";
import { DemoProvider } from "./demo";

/** `model` and `voice` come from settings, which resolve choice or fallback. */
export function createProvider(
  id: ProviderId,
  apiKey: string,
  model?: string,
  voice?: string,
): ConversationProvider {
  switch (id) {
    case "openai":
      return new OpenAIRealtimeProvider(apiKey, model, voice);
    case "gemini":
      return new GeminiLiveProvider(apiKey, model, voice);
    case "demo":
      return new DemoProvider();
  }
}

export { ProviderError } from "./types";
export type { ConversationProvider, ProviderEvents, ProviderStatus } from "./types";
