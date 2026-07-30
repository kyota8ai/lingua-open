# Architecture

## Principle: no backend

lingua-open is a static single-page app. There is no server component, and that is a privacy guarantee rather than a cost decision: if no server receives your conversations, none can leak, be subpoenaed or be trained on.

```
Browser
  ├─ UI                  Vite + React 19 + TypeScript + Tailwind v4
  ├─ Conversation        WebRTC / WebSocket straight to the AI provider
  ├─ API key             localStorage, sent only to the chosen provider
  ├─ Sessions + vocab    IndexedDB via Dexie
  └─ Backup              JSON export/import, optionally encrypted
```

Deployment is any static host. `public/_headers` carries the production
Content-Security-Policy for hosts that support header files; a build-only
`<meta>` CSP covers hosts that do not.

## Provider abstraction

Conversation engines sit behind one interface (`src/lib/providers/types.ts`) so
the UI never knows which provider is live:

```ts
interface ConversationProvider {
  connect(ctx: PromptContext, events: ProviderEvents): Promise<void>
  repeatLast(): void
  nudge(instruction: string): void   // "speak slower", "suggest a reply"
  sendText(text: string): void       // text fallback
  setMuted(muted: boolean): void
  disconnect(): Promise<void>
}
```

Three implementations:

| Provider | Transport | Notes |
|---|---|---|
| `openai.ts` | WebRTC, SDP exchange over HTTPS | `gpt-realtime-mini`, semantic VAD, transcript deltas over a data channel |
| `gemini.ts` | WebSocket | Native audio, 16 kHz PCM in via AudioWorklet, 24 kHz PCM out on a scheduled queue |
| `demo.ts` | none | Scripted partner plus `speechSynthesis`. Lets anyone try the full flow with no key |

Both live providers use the user's own key directly from the browser. That is
deliberate: with bring-your-own-key there is no middleman that could mint
ephemeral tokens, and the user is spending their own quota. Providers are
responsible for releasing the microphone, sockets and audio contexts on any
failure path, and `disconnect()` is idempotent.

Cost estimates shown in the setup UI, at roughly 20 minutes of conversation per
day:

| Provider | Rough cost to the user |
|---|---|
| Gemini Live (native audio) | ~$7/month |
| OpenAI `gpt-realtime-mini` | ~$9/month |

These are shown as-is in the app. Transparency is the product.

## Dialect presets

A preset is a prompt template, not a model. `src/lib/data/languages.ts` holds
each variety with a `promptNote` that is injected verbatim, for example:

> Speak exclusively in Egyptian Arabic (Cairene). Never drift into Modern
> Standard Arabic. Use everyday Cairo vocabulary and pronunciation.

`src/lib/prompts.ts` assembles the system prompt from the dialect note, the
learner's CEFR level, their stated goal and occupation, and the scenario. This is
how varieties the big apps ignore become first-class.

## Data model

`src/lib/db.ts` defines two Dexie tables:

- `sessions` — timestamps, provider, language, dialect, scenario, full transcript, completed tasks, and generated feedback
- `vocab` — term, meaning, example, plus SM-2 scheduling state (`interval`, `ease`, `reps`, `dueAt`)

Nothing else is persisted server-side because there is no server. Settings and
the API key live in `localStorage` via a Zustand persisted store
(`src/store/settings.ts`).

## Feedback and translation

After a session, the transcript goes to a text model on the same key
(`src/lib/feedback.ts`), which returns strict JSON: an encouraging summary, up
to eight corrections (said / better / why), and vocabulary worth saving.
Malformed items are dropped rather than failing the whole session, and a
feedback failure never blocks saving the session itself.

Tapping a word in a transcript (`src/lib/translate.ts`) asks the same model for
a contextual gloss, cached in memory, with one tap to add it to the SRS deck.
Word segmentation uses `Intl.Segmenter`, so Japanese, Chinese and Arabic split
correctly rather than on whitespace.

## Spaced repetition

`src/lib/srs.ts` implements SM-2 simplified to four grades. `again` resets the
card and returns it in ten minutes; the others grow the interval by the ease
factor, with ease floored at 1.3. Unit-tested in `srs.test.ts`.

## Backup encryption

`src/lib/crypto.ts` encrypts an export with a passphrase using PBKDF2-SHA256
(600k iterations) to derive an AES-256-GCM key. Salt and IV are fresh per file.
Because an imported file is untrusted input, the stored iteration count is
range-checked before use, and every record is re-validated field by field on
import (`src/lib/exportData.ts`) rather than spread into the database. Import
merges and never overwrites.

## Security posture

The API key lives in `localStorage`, so script injection would be able to read
it. The control that matters is therefore `connect-src`: the CSP allows network
access only to the two provider origins, so even a compromised dependency has
nowhere to exfiltrate to. `blob:` is allowed in `script-src`/`worker-src`
because the Gemini pipeline builds its AudioWorklet from a blob URL.

The service worker precaches static assets only. API calls are never
intercepted or cached.

## Testing

The realtime conversation loop is impractical to test end to end, so unit tests
cover the deterministic layer: prompt assembly, feedback JSON parsing, SRS
scheduling, and backup encryption. Everything else is verified against the
production build in a browser, including both themes and mobile width.
