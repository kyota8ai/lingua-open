import type { ProviderId } from "../types";
import type { ConversationProvider } from "./types";
import { OpenAIRealtimeProvider } from "./openai";
import { GeminiLiveProvider } from "./gemini";
import { DemoProvider } from "./demo";

export function createProvider(id: ProviderId, apiKey: string): ConversationProvider {
  switch (id) {
    case "openai":
      return new OpenAIRealtimeProvider(apiKey);
    case "gemini":
      return new GeminiLiveProvider(apiKey);
    case "demo":
      return new DemoProvider();
  }
}

export { ProviderError } from "./types";
export type { ConversationProvider, ProviderEvents, ProviderStatus } from "./types";
