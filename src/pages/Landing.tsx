import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  BookOpenText,
  ChatsCircle,
  CheckCircle,
  GithubLogo,
  LockKey,
  Prohibit,
  XCircle,
} from "@phosphor-icons/react";
import { REPO_URL } from "../lib/constants";
import { buttonClasses } from "../components/ui";
import { Logo } from "../components/Logo";

/*
 * Marketing page for non-onboarded visitors. Copy order is the documented
 * positioning: empathy -> structure -> verifiability. Honesty
 * rule applies to every claim: the subject is always "we".
 */

export default function Landing() {
  return (
    <div className="min-h-dvh bg-canvas text-ink">
      <header className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Logo />
        <nav className="flex items-center gap-2" aria-label="Main">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 min-h-11 px-3 text-[14px] font-medium text-ink-muted hover:text-ink"
          >
            <GithubLogo size={18} aria-hidden />
            GitHub
          </a>
          <Link to="/welcome" className={buttonClasses("primary", "sm")}>
            Start practicing
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero: asymmetric split, real demo on the right */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-16 grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.08] text-balance">
              Practice speaking any language with AI
            </h1>
            <p className="mt-4 text-[17px] text-ink-muted leading-relaxed max-w-[46ch]">
              Real roleplay conversations with your own API key. Your voice never touches our servers. We don't have
              any.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/welcome" className={buttonClasses("primary", "lg")}>
                Start practicing
                <ArrowRight size={18} aria-hidden />
              </Link>
              <a href={REPO_URL} target="_blank" rel="noreferrer" className={buttonClasses("secondary", "lg")}>
                Read the code
              </a>
            </div>
          </div>
          <DemoLoop />
        </section>

        {/* Empathy + structure */}
        <section className="border-y border-line bg-surface">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
              Speaking practice means talking about your life.
            </h2>
            <p className="mt-4 text-[16px] text-ink-muted leading-relaxed">
              Your job interview prep. Your family. Your health. With most language apps, those recordings and
              transcripts land in a company database, governed by terms you never read. Sometimes they become training
              data.
            </p>
            <p className="mt-3 text-[16px] leading-relaxed">
              We built lingua-open so that can't happen. Not "we promise not to look". There is no place where your
              conversations could arrive.
            </p>
            <PrivacyDiagram />
            <p className="mt-6 text-[15px] text-ink-muted leading-relaxed">
              You don't have to take our word for it. The entire app is open source, so anyone in the world can verify
              every claim on this page.{" "}
              <a href={REPO_URL} target="_blank" rel="noreferrer" className="font-medium text-accent-text-text hover:underline">
                And if you read code: don't trust us, read it.
              </a>
            </p>
          </div>
        </section>

        {/* Dialects: the wedge, full-width feature */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-balance">
                Speak the dialect people actually speak
              </h2>
              <p className="mt-4 text-[16px] text-ink-muted leading-relaxed">
                The big apps teach textbook standard. Real life happens in Egyptian Arabic, Kansai Japanese and
                Rioplatense Spanish. Pick the variety, and your partner stays in it for the whole conversation.
              </p>
            </div>
            <ul className="flex flex-wrap gap-2.5" aria-label="Example dialect presets">
              {[
                ["Egyptian Arabic", "مصري"],
                ["Levantine Arabic", "شامي"],
                ["Kansai Japanese", "関西弁"],
                ["Rioplatense Spanish", "vos"],
                ["Mexican Spanish", "MX"],
                ["Québécois French", "QC"],
                ["Taiwanese Mandarin", "台灣"],
              ].map(([label, native]) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-2 h-11 px-4 rounded-full border border-line bg-surface text-[15px] font-medium"
                >
                  {label}
                  <span className="text-ink-faint font-normal">{native}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What a session gives you */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-4">
            <article className="rounded-(--radius-card) border border-line bg-surface p-6">
              <ChatsCircle size={24} className="text-accent-text" aria-hidden />
              <h3 className="mt-3 text-[18px] font-semibold">Missions, not lectures</h3>
              <p className="mt-1.5 text-[14px] text-ink-muted leading-relaxed">
                Order at a café, survive a job interview, convince an alien commander. Each scenario gives you goal
                phrases and a task checklist, then gets out of your way.
              </p>
            </article>
            <article className="rounded-(--radius-card) border border-line bg-surface p-6">
              <BookOpenText size={24} className="text-accent-text" aria-hidden />
              <h3 className="mt-3 text-[18px] font-semibold">Feedback that sticks</h3>
              <p className="mt-1.5 text-[14px] text-ink-muted leading-relaxed">
                Every session ends with corrections and vocabulary, and the vocabulary comes back on a spaced-repetition
                schedule. The two things reviewers say the big apps skip.
              </p>
            </article>
          </div>
        </section>

        {/* Cost */}
        <section className="border-y border-line bg-surface">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
            <h2 className="text-3xl font-semibold tracking-tight">Free software. You bring the AI.</h2>
            <p className="mt-4 text-[16px] text-ink-muted leading-relaxed">
              lingua-open is free and open source. Conversations run on your own API key, billed by the provider to you
              directly, at cost. We add nothing on top.
            </p>
            <div className="mt-6 rounded-(--radius-card) border border-line overflow-hidden">
              {[
                ["Google Gemini Live", "about $7/mo"],
                ["OpenAI Realtime", "about $9/mo"],
              ].map(([name, cost], i) => (
                <div
                  key={name}
                  className={`flex items-center justify-between gap-4 px-5 py-4 ${i > 0 ? "border-t border-line" : ""}`}
                >
                  <span className="text-[15px] font-medium">{name}</span>
                  <span className="font-mono text-[14px] text-ink-muted">{cost}</span>
                </div>
              ))}
              <div className="border-t border-line px-5 py-3 bg-sunken">
                <p className="text-[13px] text-ink-faint">
                  Estimates assume about 20 minutes of conversation per day. TalkPal Premium is $14.99/mo; Speak runs
                  $80 to $200 per year.
                </p>
              </div>
            </div>
            <p className="mt-5 flex items-start gap-2.5 text-[14px] leading-relaxed rounded-(--radius-field) border border-warn/40 bg-warn-soft text-on-warn-soft px-4 py-3">
              <LockKey size={17} className="shrink-0 mt-0.5 text-warn" aria-hidden />
              <span>
                Honest note: on Gemini's free tier, Google may use conversations for training. That defeats the point,
                so the app tells you and recommends a paid-tier key. This is the level of honesty you should demand
                from a privacy product.
              </span>
            </p>
            <p className="mt-5 text-[15px] text-ink-muted">
              No subscription. No countdown timers. No account. Not even an email field.
            </p>
          </div>
        </section>

        {/* Comparison */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <h2 className="text-3xl font-semibold tracking-tight">Compared honestly</h2>
          <p className="mt-3 text-[15px] text-ink-muted">
            TalkPal and Speak are polished products. Here is where they and lingua-open actually differ.
          </p>
          <div className="mt-6 overflow-x-auto rounded-(--radius-card) border border-line">
            <table className="w-full min-w-[640px] text-[14px]">
              <thead>
                <tr className="bg-sunken text-left">
                  <th scope="col" className="px-4 py-3 font-medium text-ink-muted"></th>
                  <th scope="col" className="px-4 py-3 font-semibold">lingua-open</th>
                  <th scope="col" className="px-4 py-3 font-medium text-ink-muted">TalkPal</th>
                  <th scope="col" className="px-4 py-3 font-medium text-ink-muted">Speak</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Price", "free, API at cost (~$7-9/mo)", "$14.99/mo", "$80-200/yr"],
                  ["Where conversations live", "your browser only", "company servers", "company servers"],
                  ["Vocabulary spaced repetition", "yes", "no", "no"],
                  ["Deep post-session feedback", "yes", "no session summary", "brief"],
                  ["Dialect presets", "yes", "limited", "no"],
                  ["Open source", "AGPL-3.0", "no", "no"],
                ].map(([row, ours, talkpal, speak]) => (
                  <tr key={row} className="border-t border-line">
                    <th scope="row" className="px-4 py-3 text-left font-medium text-ink-muted whitespace-nowrap">
                      {row}
                    </th>
                    <td className="px-4 py-3 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        {(ours.startsWith("yes") || ours.startsWith("free") || ours.startsWith("your") || ours.startsWith("AGPL")) && (
                          <CheckCircle size={15} weight="fill" className="text-good shrink-0" aria-hidden />
                        )}
                        {ours}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      <span className="inline-flex items-center gap-1.5">
                        {talkpal === "no" && <XCircle size={15} className="text-ink-faint shrink-0" aria-hidden />}
                        {talkpal}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      <span className="inline-flex items-center gap-1.5">
                        {speak === "no" && <XCircle size={15} className="text-ink-faint shrink-0" aria-hidden />}
                        {speak}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[13px] text-ink-faint">
            Feature comparison based on public reviews and product pages, July 2026.
          </p>
        </section>

        {/* Pro teaser, kept honest and small */}
        <section className="border-y border-line bg-surface">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
            <h2 className="text-xl font-semibold tracking-tight">A Pro plan is coming</h2>
            <p className="mt-2 text-[15px] text-ink-muted leading-relaxed">
              Everything stays free with your own key. Pro is for people who'd rather not manage one: practice minutes
              included with no API key or provider account, plus automatic encrypted sync. Even then, your
              conversations never touch our servers. We only hand your browser a short-lived access ticket, and we hold
              a sync vault we cannot open. The "we can't see your data" rule doesn't get an exception for paying
              customers. Follow the repository to hear when it ships.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <h2 className="text-3xl font-semibold tracking-tight mb-6">Questions people ask</h2>
          <div className="flex flex-col gap-3">
            {[
              [
                "Is it really free?",
                "The app is free software (AGPL-3.0). You pay your AI provider for what you use, typically $7 to $9 a month for daily practice. We never touch the money or the data.",
              ],
              [
                "Do I need an API key?",
                "For real conversations, yes: an OpenAI or Google AI Studio key, created in a few minutes. The setup screen walks you through it. There is also a keyless demo mode to try the full flow first, and the upcoming Pro plan will include practice minutes with no key at all.",
              ],
              [
                "How is this different from talking to ChatGPT?",
                "ChatGPT is a great conversation partner, but it isn't a teacher. lingua-open adds the learning structure around the talk: scenarios with missions, a partner that stays at your level and in your exact dialect, corrections after every session, and vocabulary that comes back on a spaced-repetition schedule. It also keeps your history in your browser instead of a chat log on someone's servers, and the API it runs on doesn't train on your conversations by default, unlike consumer chat apps.",
              ],
              [
                "Where is my data stored?",
                "Conversations, vocabulary and progress live in your browser's local storage. You can export a backup file anytime. We run no servers, so there is nothing for us to store, lose or sell.",
              ],
              [
                "Is my audio used to train AI models?",
                "We never receive your audio at all. It goes only to the provider you chose. OpenAI's API does not train on it by default; Google's paid tier does not either. The app warns you about Gemini's free tier, which may.",
              ],
              [
                "What happens if I clear my browser data?",
                "Local data is deleted, which is the flip side of us not keeping a copy. Export a backup now and then; import merges it back. Encrypted cross-device sync is planned as the Pro feature.",
              ],
            ].map(([q, a]) => (
              <details key={q} className="group rounded-(--radius-card) border border-line bg-surface open:border-line-strong">
                <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none text-[15px] font-medium min-h-11">
                  {q}
                  <ArrowRight size={16} className="shrink-0 text-ink-faint transition-transform duration-150 group-open:rotate-90" aria-hidden />
                </summary>
                <p className="px-5 pb-4 text-[14px] text-ink-muted leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-balance">
            Your next language, out loud.
          </h2>
          <p className="mt-3 text-[15px] text-ink-muted">Two minutes to set up. Nothing to sign up for.</p>
          <div className="mt-6 flex justify-center">
            <Link to="/welcome" className={buttonClasses("primary", "lg")}>
              Start practicing
              <ArrowRight size={18} aria-hidden />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <Logo />
          <p className="text-[13px] text-ink-faint">
            AGPL-3.0 · Built for learners who read privacy policies ·{" "}
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="text-accent-text-text hover:underline">
              Source
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ---------- privacy structure diagram ---------- */

function PrivacyDiagram() {
  return (
    <figure className="mt-8" aria-label="Data flow diagram: your browser talks directly to your AI provider; no lingua-open server exists">
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-stretch gap-3">
        <div className="rounded-(--radius-card) border border-accent bg-accent-soft p-4">
          <p className="text-[13px] font-semibold text-on-accent-soft">Your browser</p>
          <ul className="mt-2 text-[13px] text-on-accent-soft leading-relaxed">
            <li>conversations + transcripts</li>
            <li>vocabulary + progress</li>
            <li>your API key</li>
          </ul>
        </div>
        <div className="flex sm:flex-col items-center justify-center gap-1 text-ink-faint" aria-hidden>
          <ArrowRight size={20} className="rotate-90 sm:rotate-0" />
          <span className="text-[11px] font-mono">voice, directly</span>
        </div>
        <div className="rounded-(--radius-card) border border-line bg-surface p-4">
          <p className="text-[13px] font-semibold">Your AI provider</p>
          <p className="mt-2 text-[13px] text-ink-muted leading-relaxed">
            OpenAI or Google, on your own account and their terms. The only place audio ever goes.
          </p>
        </div>
      </div>
      <figcaption className="mt-3 flex items-center gap-2 rounded-(--radius-field) border border-dashed border-line-strong px-4 py-2.5 text-[13px] text-ink-muted">
        <Prohibit size={16} className="shrink-0" aria-hidden />
        lingua-open servers: none exist. Nothing to breach, subpoena or train on.
      </figcaption>
    </figure>
  );
}

/* ---------- looping demo built from the real transcript UI ---------- */

const DEMO_TURNS: Array<{ role: "user" | "assistant"; text: string; note?: string }> = [
  { role: "assistant", text: "أهلا! اتفضل، تحب تشرب ايه النهارده؟", note: "Welcome! What would you like to drink today?" },
  { role: "user", text: "عايز قهوة باللبن، لو سمحت", note: "I'd like a coffee with milk, please" },
  { role: "assistant", text: "تمام. سخنة ولا مثلجة؟", note: "Sure. Hot or iced?" },
  { role: "user", text: "سخنة… وبكام؟", note: "Hot... and how much is it?" },
  { role: "assistant", text: "خمسين جنيه. اسمك ايه؟", note: "Fifty pounds. What's your name?" },
];

function DemoLoop() {
  const [count, setCount] = useState(0);
  const reduce = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  ).current;

  useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => {
      setCount((c) => (c >= DEMO_TURNS.length ? 1 : c + 1));
    }, 1900);
    return () => window.clearInterval(t);
  }, [reduce]);

  const visible = reduce ? DEMO_TURNS.length : count;

  return (
    <div className="rounded-(--radius-card) border border-line bg-surface overflow-hidden" aria-label="Example session: ordering at a café in Egyptian Arabic">
      <div className="flex items-center justify-between gap-3 px-4 h-12 border-b border-line">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="size-2 rounded-full bg-live animate-pulse" aria-hidden />
          <p className="text-[13px] font-semibold truncate">Order at a café</p>
        </div>
        <p className="text-[12px] text-ink-muted font-mono">Egyptian Arabic</p>
      </div>
      <div className="p-4 flex flex-col gap-2.5 min-h-[320px]">
        {DEMO_TURNS.slice(0, visible).map((t, i) => (
          <div
            key={i}
            className={[
              "max-w-[88%] rounded-(--radius-card) px-3.5 py-2.5",
              t.role === "user" ? "self-end bg-accent-soft text-on-accent-soft rounded-br-md" : "self-start bg-sunken text-ink rounded-bl-md",
            ].join(" ")}
          >
            <p className="target-lang text-[15px]" lang="ar" dir="auto">
              {t.text}
            </p>
            {t.note && <p className="mt-1 text-[12px] text-ink-faint">{t.note}</p>}
          </div>
        ))}
      </div>
      <div className="px-4 py-3 border-t border-line bg-sunken">
        <p className="text-[12px] text-ink-muted">
          The real interface, replaying a session. <Link to="/welcome" className="font-medium text-accent-text-text hover:underline">Try it live in demo mode</Link>, no key needed.
        </p>
      </div>
    </div>
  );
}
