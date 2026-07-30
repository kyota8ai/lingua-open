# lingua-open

**Practice speaking any language with AI. Your conversations never touch our servers, because we don't have any.**

lingua-open is a speaking-practice app for language learners. You have real roleplay conversations with an AI partner, get corrections afterwards, and the vocabulary you save comes back on a spaced-repetition schedule.

It runs entirely in your browser with your own API key. There is no backend, no account, and no database of your conversations anywhere but your own device.

Licensed under [AGPL-3.0](LICENSE).

> **Status: pre-release.** The app is feature-complete and builds cleanly, but the realtime voice providers have not yet been validated against live API endpoints, and dialect quality has not been measured. A keyless demo mode lets you try the whole flow today. See [ROADMAP.md](ROADMAP.md).

## Why this exists

Speaking practice means talking about your life. Your job interview prep, your family, your health. With most language apps, those recordings and transcripts land in a company database governed by terms you never read, and sometimes they become training data.

lingua-open is built so that cannot happen. Not as a promise, but as a structure: there is no server that could receive your conversations.

## What it does

- **Realtime voice conversations** with barge-in, live transcripts, and quick controls for "speak slower", "repeat that" and "suggest something I could say"
- **Dialect presets**, not just textbook standard: Egyptian and Levantine Arabic, Kansai Japanese, Rioplatense and Mexican Spanish, Québécois French, Taiwanese Mandarin and more
- **Scenario roleplays** with goal phrases and a task checklist: order at a café, survive a job interview, report lost luggage, convince an alien commander
- **Post-session feedback**: a correction list with the natural phrasing and a one-line reason, plus vocabulary worth memorizing
- **Tap any word** in a transcript for a contextual translation, and save it to your deck in one more tap
- **Spaced repetition** (SM-2) for saved vocabulary, plus practice statistics and streaks
- **Encrypted backups**: export your data as a passphrase-encrypted file (AES-256-GCM) and import it anywhere

## Privacy architecture

```
  Your browser                                Your AI provider
  ├─ conversations + transcripts   ── voice ──▶  OpenAI or Google,
  ├─ vocabulary + progress            directly   on your own account
  └─ your API key                                and their terms

  lingua-open servers: none exist.
```

- **No backend.** The app is a static site. Audio streams from your browser straight to the API provider you chose
- **Your key stays local.** It lives in `localStorage` and is sent only to that provider. A strict Content-Security-Policy restricts network access to the provider origins, so even a compromised dependency has nowhere to send it
- **Your data stays local.** Sessions, vocabulary and progress live in IndexedDB. Export and import are yours to control
- **Verifiable.** You do not have to take our word for it. The whole app is open source, so anyone can check every claim above

One honest caveat: your audio does reach the AI provider you pick, under their terms. OpenAI's API does not train on it by default, and neither does Google's paid tier. Google's **free** tier may, so the setup screen warns you and recommends a paid key.

## Quick start

```bash
git clone https://github.com/kyota8ai/lingua-open.git
cd lingua-open
npm install
npm run dev
```

Open the printed URL. You can try the full flow immediately in **demo mode** with no API key. For real conversations, add a key in Settings:

- **Google Gemini Live** (cheapest, around $7/month at 20 minutes of practice a day)
- **OpenAI Realtime** (around $9/month at the same usage)

You pay the provider directly, at cost. lingua-open adds nothing on top.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm test` | Unit tests |
| `npm run typecheck` | Type-check only |

## Tech stack

Vite, React 19, TypeScript, Tailwind CSS v4, Zustand, Dexie (IndexedDB), Motion, Phosphor Icons. No backend.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the provider abstraction, data model and privacy mechanics, and [DESIGN.md](DESIGN.md) for the design system.

## A paid plan is planned

Everything the app does is free with your own API key, and that will not change. A future Pro plan will sell **management, not features**: included practice minutes with no API key or provider account to set up, plus automatic end-to-end encrypted sync across devices.

Even then, conversations will not touch our servers. Managed sessions work by handing your browser a short-lived access token so it can talk to the provider directly, and the sync vault is encrypted in your browser before it leaves, so the copy we hold is one we cannot open.

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

Especially useful right now: dialect preset quality reports from native and fluent speakers, new scenarios, and translations of the interface.

## License

AGPL-3.0. You can use, modify and redistribute this, including for a service you run, as long as you publish your modified source under the same license.
