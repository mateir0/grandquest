# GrantQuest — the scholarship hunt as an RPG quest log

**DEV Sanity Challenge · Path Two: Vibe-Code Something Strange**

Every scholarship is a **quest**. Each quest has **eligibility gates** (clear them all to unlock it),
a **document inventory** to gather, a **deadline boss-timer**, and your applications run a real
state machine: discovered → clearing gates → gathering docs → submitted → awarded. XP for everything.

## Why this wins

- **Empty lane** — nobody in the challenge is doing scholarships/education.
- **Eligibility as structured data** — the thing keyword search can't do ("show me scholarships I'm
  actually eligible for"). This is the structured-content superpower, and it's the schema story.
- **Freshness-verification workflow** — scholarship info rots. Quests decay toward expiry and enter a
  re-verification queue. That's the Workflows bonus made into a core mechanic.
- **Lived story** — hashir is researching the ERSU scholarship for University of Messina *right now*.
  The writeup writes itself.

## Repo layout

```
grantquest/
  studio/          # Sanity Studio — content backend + schemas + verification workflow
    schemaTypes/
      quest.ts              # the scholarship: provider, amount, deadline, gates, docs, status
      eligibilityGate.ts    # one clearable requirement (nationality, GPA, language, age, …)
      requiredDocument.ts   # one inventory item (transcript, passport, motivation letter, …)
  web/             # Next.js 14 app — quest board, quest detail, quest log, eligibility engine
    lib/
      sanity.client.ts      # Sanity client
      queries.ts            # GROQ queries
      matching.ts           # profile-vs-gates eligibility engine (client-side, transparent)
      questLog.ts           # quest state machine + XP, persisted in localStorage
    app/
      page.tsx              # quest board
      quest/[slug]/page.tsx # quest detail: briefing, gates, inventory
      log/page.tsx          # my quest log: states, XP, level
  PROMPTS.md       # the Opus 4.8 prompt pack — run in order
```

## Quick start

1. Run **Prompt 0** in `PROMPTS.md` (Sanity account + project + env wiring).
2. Run prompts 1–8 in order in Opus 4.8. One at a time. Don't skip.
3. qwerty reviews between steps.

## Judging criteria we're aiming at

- [x] Writeup quality/honesty → the ERSU story + embedded agent session
- [x] Functionality → board, detail, log, eligibility engine all genuinely work
- [x] Schema thoughtfulness → gates/documents/verification modeled as real data
- [x] Creativity → scholarship applications as an RPG quest log
- [x] Bonus → freshness-verification workflow in the Studio
