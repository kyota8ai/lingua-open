import { useMemo, useState } from "react";
import { BookmarkSimple, CheckCircle, X } from "@phosphor-icons/react";
import { glossWord, segmentWords, type WordGloss } from "../lib/translate";
import { db } from "../lib/db";
import { newCard } from "../lib/srs";
import type { ProviderId } from "../lib/types";

interface Props {
  text: string;
  langCode: string;
  langLabel: string;
  provider: ProviderId;
  apiKey: string;
  textModel: string;
  className?: string;
}

type PanelState =
  | { term: string; status: "loading" }
  | { term: string; status: "done"; gloss: WordGloss; saved: boolean }
  | { term: string; status: "error"; message: string };

/**
 * Transcript text where every word is tappable: tap -> contextual gloss on
 * the learner's own key, one more tap -> saved to the SRS deck.
 */
export function TappableText({ text, langCode, langLabel, provider, apiKey, textModel, className }: Props) {
  const segments = useMemo(() => segmentWords(text, langCode), [text, langCode]);
  const [panel, setPanel] = useState<PanelState | null>(null);

  async function tap(term: string) {
    if (panel?.term === term && panel.status !== "error") {
      setPanel(null);
      return;
    }
    setPanel({ term, status: "loading" });
    try {
      const gloss = await glossWord(provider, apiKey, term, text, langLabel, textModel);
      setPanel((p) => (p?.term === term ? { term, status: "done", gloss, saved: false } : p));
    } catch (e) {
      setPanel((p) =>
        p?.term === term
          ? { term, status: "error", message: e instanceof Error ? e.message : "Translation failed." }
          : p,
      );
    }
  }

  async function save() {
    if (panel?.status !== "done") return;
    await db.vocab.add(
      newCard({ term: panel.term, meaning: panel.gloss.meaning, example: text, languageCode: langCode }),
    );
    setPanel({ ...panel, saved: true });
  }

  return (
    <div>
      <p className={className} lang={langCode} dir="auto">
        {segments.map((s, i) =>
          s.word ? (
            <button
              key={i}
              type="button"
              onClick={() => tap(s.text)}
              className={[
                "cursor-pointer rounded-[4px] px-px -mx-px transition-colors duration-150",
                "hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-accent",
                panel?.term === s.text ? "bg-accent-soft" : "",
              ].join(" ")}
              aria-label={`Translate ${s.text}`}
            >
              {s.text}
            </button>
          ) : (
            <span key={i}>{s.text}</span>
          ),
        )}
      </p>

      {panel && (
        <div className="mt-2 flex items-start justify-between gap-3 rounded-(--radius-control) bg-sunken border border-line px-3 py-2 text-left">
          <div className="min-w-0 text-[13px] leading-snug">
            <span className="target-lang font-medium text-ink" lang={langCode} dir="auto">
              {panel.term}
            </span>
            {panel.status === "loading" && <span className="ml-2 text-ink-faint">translating...</span>}
            {panel.status === "error" && <span className="ml-2 text-live">{panel.message}</span>}
            {panel.status === "done" && (
              <>
                <span className="ml-2 text-ink">{panel.gloss.meaning}</span>
                {panel.gloss.note && <span className="ml-2 text-ink-faint">{panel.gloss.note}</span>}
              </>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {panel.status === "done" &&
              provider !== "demo" &&
              (panel.saved ? (
                <span className="inline-flex items-center gap-1 text-[12px] font-medium text-good">
                  <CheckCircle size={14} weight="fill" aria-hidden />
                  saved
                </span>
              ) : (
                <button
                  type="button"
                  onClick={save}
                  className="inline-flex items-center gap-1 min-h-8 px-2 rounded-[8px] text-[12px] font-medium text-accent hover:bg-accent-soft cursor-pointer"
                >
                  <BookmarkSimple size={14} aria-hidden />
                  Save
                </button>
              ))}
            <button
              type="button"
              onClick={() => setPanel(null)}
              aria-label="Close translation"
              className="grid place-items-center size-8 rounded-[8px] text-ink-faint hover:text-ink cursor-pointer"
            >
              <X size={14} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
