# Contributing

Thanks for looking. This project is small and opinionated, so a little context
saves everyone time.

## Getting set up

```bash
npm install
npm run dev      # dev server
npm test         # unit tests
npm run build    # type-check and production build
```

You do not need an API key to work on most things. Demo mode exercises the whole
flow, including the conversation screen, feedback and spaced repetition.

Before opening a pull request, make sure `npm run build` and `npm test` pass.

## Especially welcome

- **Dialect preset reports.** If you speak a variety natively or fluently, try
  its preset for a couple of minutes and tell us whether the model holds the
  dialect or drifts toward the standard form. Concrete examples of drift are
  extremely useful. Preset text lives in `src/lib/data/languages.ts`
- **New scenarios.** One entry in `src/lib/data/scenarios.ts` with a situation,
  goal phrases and a short task checklist. Situations that force real language
  work beat generic small talk
- **Interface translations.** The UI is English-only today, which is backwards
  for a language-learning app
- **Accessibility and browser bugs**, particularly on Safari and on mobile

## Ground rules that are not negotiable

These are what the project is for, so changes that break them will not be merged.

1. **No backend, and no telemetry.** No analytics, no error reporting to a third
   party, no phoning home. The app must remain a static site
2. **The API key goes only to the provider the user chose.** Nowhere else, never
   in a URL we construct, never in a log
3. **Honest claims.** In user-facing copy the subject of a privacy claim is
   always "we" (we store nothing, we cannot read it). Never imply that audio
   goes nowhere, because it does go to the user's chosen provider. If a provider
   tier trains on user data, the app says so plainly
4. **No dark patterns.** No countdown timers, no fake scarcity, no punitive
   cancellation flows

## Style

- TypeScript strict mode. No `any` escapes
- Match the surrounding code. Comments explain why, not what
- Design tokens only, never hardcoded colors. See [DESIGN.md](DESIGN.md), which
  the review process treats as the baseline
- No em dashes in user-visible strings
- Every interactive state needs loading, empty and error handling

## Architecture

Read [ARCHITECTURE.md](ARCHITECTURE.md) before changing the provider layer, the
data model or anything touching the key.

## License

Contributions are accepted under AGPL-3.0, the same license as the project.
