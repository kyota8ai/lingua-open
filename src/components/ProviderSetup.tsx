import { useEffect, useRef, useState } from "react";
import { ArrowsClockwise, CheckCircle, Eye, EyeSlash, Warning } from "@phosphor-icons/react";
import { useSettings } from "../store/settings";
import type { ProviderId } from "../lib/types";
import { listModels, pickDefault } from "../lib/models";
import { voiceLabel, voicesFor } from "../lib/data/voices";
import { Button, Field, Select } from "./ui";

/**
 * BYOK setup. The cost comparison is shown as-is and the Gemini free-tier
 * training warning is treated as a headline, not fine print: being honest about
 * the one case where the privacy promise weakens is the point of the product.
 */
const OPTIONS: Array<{
  id: ProviderId;
  name: string;
  cost: string;
  note: string;
}> = [
  {
    id: "gemini",
    name: "Google Gemini Live",
    cost: "about $7/mo",
    note: "Cheapest. 97 languages.",
  },
  {
    id: "openai",
    name: "OpenAI Realtime",
    cost: "about $9/mo",
    note: "Balanced quality and price.",
  },
  {
    id: "demo",
    name: "Keyless demo",
    cost: "$0",
    note: "Scripted partner, no AI. Try the flow first.",
  },
];

export function ProviderSetup() {
  const settings = useSettings();
  const [showKey, setShowKey] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<{ message: string; hint?: string } | null>(null);

  const keyValue = settings.provider === "openai" ? settings.openaiKey : settings.geminiKey;
  const vendor = settings.provider === "openai" ? "openai" : "gemini";
  // Cached in settings, so the pickers are there after a reload.
  const catalog = vendor === "openai" ? settings.openaiCatalog : settings.geminiCatalog;
  const nativeAudioSelected = /native-audio/i.test(settings.activeConversationModel());

  /*
   * Asking the provider what this key can use serves two purposes: it verifies
   * the key without starting a paid session, and it replaces hardcoded model
   * IDs, which eventually stop resolving and return 404.
   */
  async function loadModels() {
    setChecking(true);
    setCheckError(null);
    try {
      const found = await listModels(settings.provider, keyValue);
      const patch: Record<string, unknown> = {
        [vendor === "openai" ? "openaiCatalog" : "geminiCatalog"]: found,
      };
      // Only preselect where the learner has not chosen already.
      const chosenConversation = vendor === "openai" ? settings.openaiConversationModel : settings.geminiConversationModel;
      const chosenText = vendor === "openai" ? settings.openaiTextModel : settings.geminiTextModel;
      if (!chosenConversation && found.conversation.length > 0) {
        patch[vendor === "openai" ? "openaiConversationModel" : "geminiConversationModel"] = pickDefault(
          found.conversation,
          vendor,
          "conversation",
        );
      }
      if (!chosenText && found.text.length > 0) {
        patch[vendor === "openai" ? "openaiTextModel" : "geminiTextModel"] = pickDefault(found.text, vendor, "text");
      }
      settings.setPartial(patch);
    } catch (e) {
      const err = e as { message?: string; hint?: string };
      setCheckError({ message: err.message ?? "Could not check the key.", hint: err.hint });
    } finally {
      setChecking(false);
    }
  }

  /*
   * Load once on arrival when there is a key but no cached list, so a learner
   * who has entered a key never has to discover the button to get pickers.
   */
  const autoTried = useRef(false);
  useEffect(() => {
    if (autoTried.current || catalog || !keyValue || settings.provider === "demo") return;
    autoTried.current = true;
    void loadModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyValue, settings.provider, catalog]);

  return (
    <div>
      {/* Toggle-button group, not ARIA radios: buttons stay natively
          tab-navigable, so no custom arrow-key handling is required. */}
      <div className="flex flex-col gap-2" role="group" aria-label="AI provider">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={settings.provider === o.id}
            onClick={() => settings.setPartial({ provider: o.id })}
            className={[
              "flex items-center justify-between gap-3 min-h-14 px-4 py-3 rounded-(--radius-control) border text-left cursor-pointer transition-colors duration-150",
              settings.provider === o.id ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-line-strong",
            ].join(" ")}
          >
            <span>
              <span className="block text-[15px] font-medium text-ink">{o.name}</span>
              <span className="block text-[13px] text-ink-muted">{o.note}</span>
            </span>
            <span className="font-mono text-[13px] text-ink-muted whitespace-nowrap">{o.cost}</span>
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink-faint leading-relaxed">
        Cost estimates assume around 20 minutes of conversation per day, billed by the provider to you directly. We add
        nothing on top.
      </p>

      {settings.provider === "gemini" && (
        <div className="mt-4 flex items-start gap-2.5 rounded-(--radius-control) border border-warn/40 bg-warn-soft px-3.5 py-3">
          <Warning size={18} className="shrink-0 mt-0.5 text-warn" aria-hidden />
          <p className="text-[13px] leading-relaxed text-ink">
            <strong>Honest warning:</strong> on Gemini's free tier, Google may use your conversations to train its
            models. That defeats the point of this app. Use a paid-tier key, where Google states data is not used for
            training.
          </p>
        </div>
      )}

      {settings.provider !== "demo" && (
        <div className="mt-4">
          <Field
            label={settings.provider === "openai" ? "OpenAI API key" : "Gemini API key"}
            htmlFor="api-key"
            helper={
              settings.provider === "openai" ? (
                <>
                  Create one at platform.openai.com. Stored in this browser's localStorage only.
                </>
              ) : (
                <>Create one in Google AI Studio (paid tier recommended). Stored in this browser's localStorage only.</>
              )
            }
          >
            <div className="relative">
              <input
                id="api-key"
                type={showKey ? "text" : "password"}
                value={keyValue}
                onChange={(e) =>
                  settings.setPartial(
                    settings.provider === "openai" ? { openaiKey: e.target.value.trim() } : { geminiKey: e.target.value.trim() },
                  )
                }
                placeholder={settings.provider === "openai" ? "sk-..." : "AIza..."}
                autoComplete="off"
                spellCheck={false}
                className="h-11 w-full pl-3.5 pr-12 rounded-(--radius-control) bg-surface border border-line-strong font-mono text-[14px] text-ink placeholder:text-ink-faint focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-0 focus-visible:border-accent"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                aria-label={showKey ? "Hide API key" : "Show API key"}
                className="absolute right-0 top-1/2 -translate-y-1/2 grid place-items-center size-11 rounded-(--radius-control) text-ink-faint hover:text-ink cursor-pointer"
              >
                {showKey ? <EyeSlash size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
              </button>
            </div>
          </Field>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button variant="secondary" size="sm" onClick={loadModels} disabled={!keyValue || checking}>
              {catalog && <ArrowsClockwise size={15} aria-hidden />}
              {checking ? "Checking..." : catalog ? "Refresh models" : "Check key and load models"}
            </Button>
            {catalog && !checkError && !checking && (
              <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-good">
                <CheckCircle size={15} weight="fill" aria-hidden />
                Key works
              </span>
            )}
          </div>

          {checkError && (
            <p className="mt-2 text-[13px] text-live leading-snug" role="alert">
              {checkError.message}
              {checkError.hint && <span className="text-ink-muted"> {checkError.hint}</span>}
            </p>
          )}

          {catalog && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Conversation model"
                htmlFor="model-conversation"
                helper={
                  nativeAudioSelected
                    ? "Native audio sounds the most natural, but it detects the language itself, so a short answer can be transcribed in the wrong script."
                    : "Used for the live voice session. This one takes a language hint, so transcripts stay in your target language."
                }
              >
                <Select
                  id="model-conversation"
                  value={vendor === "openai" ? settings.openaiConversationModel : settings.geminiConversationModel}
                  onChange={(e) =>
                    settings.setPartial(
                      vendor === "openai"
                        ? { openaiConversationModel: e.target.value }
                        : { geminiConversationModel: e.target.value },
                    )
                  }
                >
                  {catalog.conversation.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Text model" htmlFor="model-text" helper="Used for feedback and tap-to-translate.">
                <Select
                  id="model-text"
                  value={vendor === "openai" ? settings.openaiTextModel : settings.geminiTextModel}
                  onChange={(e) =>
                    settings.setPartial(
                      vendor === "openai" ? { openaiTextModel: e.target.value } : { geminiTextModel: e.target.value },
                    )
                  }
                >
                  {catalog.text.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </Select>
              </Field>
              {catalog.conversation.length === 0 && (
                <p className="sm:col-span-2 text-[13px] text-warn leading-snug">
                  This key has no realtime voice model available. Voice conversations will not connect until the
                  provider grants access to one.
                </p>
              )}
            </div>
          )}

          <div className="mt-4">
            <Field label="Voice" htmlFor="voice" helper="How your conversation partner sounds.">
              <Select
                id="voice"
                value={settings.activeVoice()}
                onChange={(e) =>
                  settings.setPartial(
                    vendor === "openai" ? { openaiVoice: e.target.value } : { geminiVoice: e.target.value },
                  )
                }
              >
                {voicesFor(vendor).map((v) => (
                  <option key={v.id} value={v.id}>
                    {voiceLabel(v)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}
