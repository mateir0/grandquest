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

## Derived quest freshness

`shared/freshness.ts` owns the 30-day verification / 60-day deadline cutoffs,
the Studio badge evaluator, and the GROQ projection used by board, detail, and log.
Verification strictly older than 30 days is stale; deadlines at or before the
60-day cutoff are stale (including expired deadlines). Missing/invalid verification
is stale; missing/invalid deadlines do not independently trigger staleness.
Freshness never writes or depends on the workflow `status` field.

The verification queue retains manually flagged quests, but filters other entries
by derived freshness and sorts stale first, then deadline. It follows draft edits
and refreshes cutoffs every minute while open. Document actions are unchanged.

After installing dependencies in `web/` and `studio/`, run `npm test` at the root
for TS/GROQ parity, cutoff boundaries, query coverage, queue ordering, and badges.
Run `npx tsc --noEmit` and `npm run build` in **both** app directories.

Manual check: set a quest's `lastVerified` to 60 days ago without changing `status`.
The Studio badge turns red on the draft. Publish with the standard Publish action
(not Mark verified, which resets the date), then reload the web board/detail/log
to see the red badge. The public web reads published content, not Studio drafts.

## Verification workflow (official Workflows API)

Quest verification is modeled as a real workflow on the official Sanity
Workflows packages (https://www.sanity.io/docs/workflows):

- `studio/workflows/quest-verification.ts` — the definition. Stages
  `unverified → underReview → verified`, with `disputed` reachable from every
  stage. `verified` can be flagged back to `unverified`. Deployed under tag
  `production` to the `aitdwcxh.production` workflow resource.
- `studio/sanity.workflow.ts` — the deployment config read by
  `@sanity/workflow-cli`.
- `studio/scripts/migrateQuestVerification.cjs` — one-off, idempotent backfill
  that starts one instance per quest (`published → verified`,
  `needsReverification`/`draft → unverified`).

```sh
cd studio
npx @sanity/workflow-cli deploy --check --deployment production   # offline validation
npx @sanity/workflow-cli deploy --deployment production            # write definitions
npx @sanity/workflow-cli list --definition quest-verification --include-completed --tag production
```

The engine, the CLI and this definition have **no** dependency on a Studio
version. The Studio-facing pieces (document actions, the queue view, the web
verification chip) still run on the Sanity 3 custom implementation until the
Studio is upgraded to **6.15+ / React 19**, which the official
`@sanity/workflow-studio-plugin` and `@sanity/workflow-studio` adapter require.
Until then `quest.status` and the workflow instance co-exist, and the old
document actions remain the only Studio UI.

## Deadline sweeper (Scheduled Function)

`deadline-sweeper` is a daily cron Sanity Function (`sanity.function.cron`,
03:00 UTC) defined in `sanity.blueprint.ts`. Each run it:

1. finds quests whose derived freshness is stale (the Prompt 10 cutoffs) or whose
   deadline has already passed;
2. fires the `quest-verification` workflow's real `flag-for-reverification`
   transition (`verified → unverified`) through the workflow engine;
3. appends one immutable `sweepLog` document per reopened quest, shown in the
   Studio under **Sweep log** (newest first, read-only).

It deliberately does **not** write the legacy `quest.status` string: the public
web app filters on `status == "published"`, so setting `needsReverification`
would de-list the quests from the board. The derived badge is the source of truth.

```sh
# from the repo root (the blueprint directory)
npm_config_userconfig="$PWD/.npmrc.deploy" npx sanity@latest blueprints plan
npm_config_userconfig="$PWD/.npmrc.deploy" npx sanity@latest blueprints deploy
npm_config_userconfig="$PWD/.npmrc.deploy" npx sanity@latest functions test deadline-sweeper --with-user-token
npx sanity@latest functions logs deadline-sweeper
```

The `npm_config_userconfig` workaround is required because the deploy/test
tooling runs `npm i --omit=dev`, and npm 11.19 rejects a user-level
`allow-scripts` setting inside project-scoped installs (npm/cli#9783).
`.npmrc.deploy` is an intentionally empty npmrc.

## Judging criteria we're aiming at

- [x] Writeup quality/honesty → the ERSU story + embedded agent session
- [x] Functionality → board, detail, log, eligibility engine all genuinely work
- [x] Schema thoughtfulness → gates/documents/verification modeled as real data
- [x] Creativity → scholarship applications as an RPG quest log
- [x] Bonus → freshness-verification workflow in the Studio
