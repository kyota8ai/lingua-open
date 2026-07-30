import { useState } from "react";
import { Eye, EyeSlash, Warning } from "@phosphor-icons/react";
import { useSettings } from "../store/settings";
import type { ProviderId } from "../lib/types";
import { Field } from "./ui";

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

  const keyValue = settings.provider === "openai" ? settings.openaiKey : settings.geminiKey;

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
        </div>
      )}
    </div>
  );
}
