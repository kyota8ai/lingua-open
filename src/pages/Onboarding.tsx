import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, ArrowRight, LockKey } from "@phosphor-icons/react";
import { LANGUAGES, findLanguage } from "../lib/data/languages";
import { useSettings } from "../store/settings";
import type { CEFRLevel, OnboardingProfile } from "../lib/types";
import { Badge, Button, Field, TextInput } from "../components/ui";
import { ProviderSetup } from "../components/ProviderSetup";

const LEVELS: Array<{ id: CEFRLevel; label: string; hint: string }> = [
  { id: "A1", label: "Just starting", hint: "I know a handful of words" },
  { id: "A2", label: "Basics", hint: "I can handle short, simple exchanges" },
  { id: "B1", label: "Conversational", hint: "I can talk about familiar topics" },
  { id: "B2", label: "Comfortable", hint: "I discuss most things, with rough edges" },
  { id: "C1", label: "Advanced", hint: "I want polish and nuance" },
];

const GOALS: Array<{ id: OnboardingProfile["goal"]; label: string }> = [
  { id: "travel", label: "Travel" },
  { id: "work", label: "Work" },
  { id: "family", label: "Family and friends" },
  { id: "culture", label: "Culture and media" },
  { id: "exam", label: "An exam" },
];

export default function Onboarding() {
  const nav = useNavigate();
  const settings = useSettings();
  const [step, setStep] = useState(0);
  const [languageCode, setLanguageCode] = useState(settings.languageCode);
  const [dialectId, setDialectId] = useState(settings.dialectId);
  const [level, setLevel] = useState<CEFRLevel>(settings.level);
  const [goal, setGoal] = useState<OnboardingProfile["goal"]>(settings.goal);
  const [occupation, setOccupation] = useState(settings.occupation);

  const lang = findLanguage(languageCode);
  const steps = ["Language", "Level", "About you", "Connect AI"];

  function finish() {
    settings.setPartial({ onboarded: true, languageCode, dialectId, level, goal, occupation });
    nav("/", { replace: true });
  }

  return (
    <main className="min-h-dvh bg-canvas">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
        <header className="mb-8">
          <div className="flex items-center gap-2.5 mb-8">
            <span className="grid place-items-center size-8 rounded-[10px] bg-accent" aria-hidden>
              <span className="flex items-end gap-[3px]">
                <span className="w-[3px] h-2 rounded-full bg-on-accent" />
                <span className="w-[3px] h-3.5 rounded-full bg-on-accent" />
                <span className="w-[3px] h-2.5 rounded-full bg-on-accent" />
              </span>
            </span>
            <span className="text-[17px] font-semibold tracking-tight">lingua-open</span>
          </div>
          <nav aria-label="Setup progress" className="flex items-center gap-2">
            {steps.map((label, i) => (
              <div key={label} className="flex-1">
                <div className={["h-1 rounded-full", i <= step ? "bg-accent" : "bg-line"].join(" ")} aria-hidden />
                <span className={["mt-1.5 block text-[11px] font-medium", i <= step ? "text-accent" : "text-ink-faint"].join(" ")}>
                  {label}
                </span>
              </div>
            ))}
          </nav>
        </header>

        {step === 0 && (
          <section aria-labelledby="ob-lang">
            <h1 id="ob-lang" className="text-2xl font-semibold tracking-tight mb-1.5">
              Which language do you want to speak?
            </h1>
            <p className="text-[15px] text-ink-muted mb-6">
              Pick the exact variety people actually speak. Dialects the big apps skip are our specialty.
            </p>
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    setLanguageCode(l.code);
                    setDialectId(l.dialects[0].id);
                  }}
                  aria-pressed={languageCode === l.code}
                  className={[
                    "flex items-center justify-between gap-2 h-12 px-4 rounded-(--radius-control) border text-[15px] font-medium cursor-pointer transition-colors duration-150",
                    languageCode === l.code
                      ? "border-accent bg-accent-soft text-ink"
                      : "border-line bg-surface text-ink-muted hover:border-line-strong",
                  ].join(" ")}
                >
                  <span>{l.label}</span>
                  <span className="text-ink-faint text-sm" lang={l.code}>
                    {l.nativeLabel}
                  </span>
                </button>
              ))}
            </div>

            <h2 className="text-sm font-medium text-ink mb-2.5">Variety</h2>
            <div className="flex flex-col gap-2 mb-8">
              {lang.dialects.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDialectId(d.id)}
                  aria-pressed={dialectId === d.id}
                  className={[
                    "flex items-center justify-between gap-3 min-h-12 px-4 py-2.5 rounded-(--radius-control) border text-left cursor-pointer transition-colors duration-150",
                    dialectId === d.id
                      ? "border-accent bg-accent-soft"
                      : "border-line bg-surface hover:border-line-strong",
                  ].join(" ")}
                >
                  <span className="text-[15px] font-medium text-ink">
                    {d.label}
                    {d.nativeLabel && (
                      <span className="ml-2 text-ink-faint font-normal" lang={lang.code}>
                        {d.nativeLabel}
                      </span>
                    )}
                  </span>
                  {d.beta && <Badge tone="warn">beta</Badge>}
                </button>
              ))}
            </div>
            <Button size="lg" className="w-full" onClick={() => setStep(1)}>
              Continue
              <ArrowRight size={18} aria-hidden />
            </Button>
          </section>
        )}

        {step === 1 && (
          <section aria-labelledby="ob-level">
            <h1 id="ob-level" className="text-2xl font-semibold tracking-tight mb-1.5">
              How much {lang.label} do you already speak?
            </h1>
            <p className="text-[15px] text-ink-muted mb-6">Your partner adjusts speed and vocabulary to this.</p>
            <div className="flex flex-col gap-2 mb-8">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLevel(l.id)}
                  aria-pressed={level === l.id}
                  className={[
                    "flex items-center justify-between gap-3 min-h-14 px-4 py-3 rounded-(--radius-control) border text-left cursor-pointer transition-colors duration-150",
                    level === l.id ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-line-strong",
                  ].join(" ")}
                >
                  <span>
                    <span className="block text-[15px] font-medium text-ink">{l.label}</span>
                    <span className="block text-[13px] text-ink-muted">{l.hint}</span>
                  </span>
                  <span className="font-mono text-sm text-ink-faint">{l.id}</span>
                </button>
              ))}
            </div>
            <StepButtons onBack={() => setStep(0)} onNext={() => setStep(2)} />
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="ob-goal">
            <h1 id="ob-goal" className="text-2xl font-semibold tracking-tight mb-1.5">
              What is this for?
            </h1>
            <p className="text-[15px] text-ink-muted mb-6">
              Scenarios and examples get tailored to your life. This stays in your browser like everything else.
            </p>
            <div className="grid grid-cols-2 gap-2.5 mb-6">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  aria-pressed={goal === g.id}
                  className={[
                    "h-12 px-4 rounded-(--radius-control) border text-[15px] font-medium cursor-pointer transition-colors duration-150",
                    goal === g.id ? "border-accent bg-accent-soft text-ink" : "border-line bg-surface text-ink-muted hover:border-line-strong",
                  ].join(" ")}
                >
                  {g.label}
                </button>
              ))}
            </div>
            <div className="mb-8">
              <Field
                label="Your work or field (optional)"
                htmlFor="occupation"
                helper="Used only inside conversation prompts, e.g. interview practice for your actual job."
              >
                <TextInput
                  id="occupation"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="Nurse, backend engineer, café owner..."
                  autoComplete="organization-title"
                />
              </Field>
            </div>
            <StepButtons onBack={() => setStep(1)} onNext={() => setStep(3)} />
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="ob-key">
            <h1 id="ob-key" className="text-2xl font-semibold tracking-tight mb-1.5">
              Connect your AI
            </h1>
            <p className="text-[15px] text-ink-muted mb-2">
              lingua-open is free software. You bring the AI: your own API key, billed by the provider at cost.
            </p>
            <p className="flex items-start gap-2 text-[13px] text-ink-muted bg-sunken border border-line rounded-(--radius-control) px-3.5 py-2.5 mb-6">
              <LockKey size={16} className="shrink-0 mt-0.5" aria-hidden />
              <span>
                The key is stored in this browser only and sent only to the provider you choose. No account, no middleman.
              </span>
            </p>
            <ProviderSetup />
            <div className="mt-8 flex flex-col gap-3">
              <Button size="lg" className="w-full" onClick={finish}>
                Start practicing
                <ArrowRight size={18} aria-hidden />
              </Button>
              <button
                type="button"
                onClick={finish}
                className="inline-flex items-center justify-center min-h-11 px-2 text-[14px] text-ink-muted hover:text-ink cursor-pointer"
              >
                Skip for now and try the keyless demo
              </button>
            </div>
            <div className="mt-4">
              <BackLink onBack={() => setStep(2)} />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function StepButtons({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <div className="flex items-center gap-3">
      <Button variant="secondary" size="lg" onClick={onBack} aria-label="Back">
        <ArrowLeft size={18} aria-hidden />
      </Button>
      <Button size="lg" className="flex-1" onClick={onNext}>
        Continue
        <ArrowRight size={18} aria-hidden />
      </Button>
    </div>
  );
}

function BackLink({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="inline-flex items-center gap-1.5 min-h-11 px-2 -mx-2 text-[14px] text-ink-muted hover:text-ink cursor-pointer"
    >
      <ArrowLeft size={16} aria-hidden />
      Back
    </button>
  );
}
