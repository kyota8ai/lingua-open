# Roadmap

## Now: validation before release

The app is feature-complete and builds cleanly, but two things must be measured
before it can be called ready.

- [ ] **Live provider validation.** The OpenAI Realtime and Gemini Live
      implementations follow the documented APIs but have not been exercised
      against live endpoints. Expect small fixes to model names and event shapes
- [ ] **Dialect quality measurement.** Two minutes of conversation per preset,
      checking whether the model actually holds the variety or drifts to the
      standard form. Presets that drift get marked beta or removed
- [ ] **Key-leak verification.** Confirm in the network panel that the API key
      reaches only the chosen provider. This is the claim the product rests on
- [ ] Offline history browsing, and the browser-data-clearing warning path
- [ ] CI (type-check, tests, build) and a static deployment

## Next: reach

- Comparison pages for people evaluating alternatives, and per-dialect pages for
  the varieties the big apps do not teach
- Interface translations. The UI is English-only today, while learners search in
  their own language
- More scenarios, especially profession-specific ones
- Install polish for the PWA on real iOS and Android devices

## Later: the paid plan

Everything in the app stays free with your own API key. A Pro plan will sell
management rather than features:

- **Included practice minutes** with no API key or provider account to set up.
  Managed sessions mint a short-lived access token so the browser still talks to
  the provider directly, which keeps conversations off our infrastructure
- **Automatic end-to-end encrypted sync** across devices, replacing manual
  export and import. Encrypted in the browser, so the copy we store is one we
  cannot read

Deliberately excluded: any unlimited tier. Metered minutes are what keep the
economics honest, and anyone who needs more than the top tier is genuinely
better off using their own key, which the free version fully supports.

## Not planned

- **Phoneme-level pronunciation scoring.** No realtime API offers it, and
  coverage for non-standard varieties is absent across the industry. Rather than
  ship something misleading, this is left out
- A full curriculum school. Scenarios, feedback and spaced repetition are the
  scope
- Reimplementing a general-purpose voice assistant. The value here is the
  learning structure around the conversation, the dialect presets, and the
  privacy architecture
