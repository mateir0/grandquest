# GrantQuest — Opus 4.8 Prompt Pack

Run these in **Opus 4.8** (your coder), **in order, one at a time**. Each prompt is self-contained:
paste the whole block. The repo lives at `C:\Users\Dell\grandquest/` — that path is already
baked into every prompt below, so just paste and go.

**What GrantQuest is:** a scholarship-hunting app framed as an RPG quest log. Scholarships are
*quests* stored in Sanity with structured *eligibility gates*, *required documents*, deadlines, and a
*verification workflow* (draft → inReview → verified → published → needsReverification). The Next.js
app has a quest board, quest detail pages with interactive gate checklists, a personal quest log
(state machine + XP in localStorage), and an eligibility engine that matches a player profile
against gates. Target: DEV Sanity Challenge Path Two, submit by Oct 3, 2026.

**Conventions:** TypeScript strict. No placeholder links, no lorem ipsum, no mock data in the final
app — every quest is real. Commit-ish discipline: after each prompt, the app must still run.

---

## PROMPT 0 — Connect the Sanity project (hashir runs this first)

```
I already have a Sanity account and a project. Here are the facts — do not ask me about them,
just wire everything up:

- Project ID: aitdwcxh
- Dataset: production
- Studio folder: C:\Users\Dell\grandquest/studio
- Web folder: C:\Users\Dell\grandquest/web

Do this:
1. Create C:\Users\Dell\grandquest/studio/.env containing:
   SANITY_STUDIO_PROJECT_ID=aitdwcxh
   SANITY_STUDIO_DATASET=production
2. Create C:\Users\Dell\grandquest/web/.env.local containing:
   NEXT_PUBLIC_SANITY_PROJECT_ID=aitdwcxh
   NEXT_PUBLIC_SANITY_DATASET=production
3. Verify the connection: run `npx sanity@latest projects list` from the studio folder and
   confirm the project shows up. If the CLI asks to log in, walk me through the login step.

Do NOT create a new project. Do NOT use any other project ID.
Done = both env files exist with the values above, and the CLI lists the project.
```

---

## PROMPT 1 — Studio up with schemas

```
Context: C:\Users\Dell\grandquest/studio is a Sanity Studio (v3) with schema types already defined
in schemaTypes/: quest.ts, eligibilityGate.ts, requiredDocument.ts. The .env has a real
SANITY_STUDIO_PROJECT_ID (verify it exists — if not, stop and tell me to run Prompt 0 first).

Task:
1. npm install in the studio folder.
2. npx sanity dev — confirm the Studio boots with zero schema errors and all three document
   types appear (Quest, Eligibility Gate, Required Document).
3. npx sanity deploy — deploy the Studio to Sanity hosting. Give me the URL.

Done = Studio is live at a *.sanity.studio URL, I can open it, and I can create a Quest document.
```

---

## PROMPT 2 — Seed 12–15 REAL scholarships

```
Context: The Studio is live (Prompt 1 done). Schemas: quest (title, slug, provider, level,
countries, amount, deadline, gates[] -> eligibilityGate, documents[] -> requiredDocument,
description, applyUrl, status, lastVerified), eligibilityGate (title, gateType, allowedValues,
minValue, howToProve), requiredDocument (title, description, tips).

Task: seed 12–15 REAL scholarships for students from Pakistan/South Asia/MENA studying abroad
(undergrad + masters). Must include: ERSU Scholarship (University of Messina, Italy).

Rules:
- Every quest: real provider, real deadline (2026–2027 cycle — verify against the provider site,
  never invent dates; if unsure, ask me), real applyUrl, status="published", lastVerified=today.
- Every quest gets 2–5 eligibilityGate documents (nationality, degreeLevel, minGPA, languageTest,
  ageLimit — use real criteria from the provider) and 2–6 requiredDocument documents.
- Reuse gates/documents across quests where the criteria are identical (references, not copies).
- BEFORE writing anything, ask me for the ERSU details I know (amount, deadline, requirements) —
  I am researching it right now and know it cold.

You may enter data via the Studio UI or via scripted import (your choice, tell me which).
Done = 12+ published quests in the dataset, each with gates + documents, zero invented deadlines.
```

---

## PROMPT 3 — Quest board (web)

```
Context: C:\Users\Dell\grandquest/web is a Next.js 14 (app router) + TypeScript + next-sanity
skeleton. lib/sanity.client.ts and lib/queries.ts exist. .env.local has the real project ID
(verify — if missing, stop and tell me to finish Prompt 0).

Task: build the quest board at app/page.tsx:
1. Fetch published quests via QUESTS_QUERY. Show a loading state and an empty state.
2. QuestCard: title, provider, award amount, deadline COUNTDOWN (days left, red when < 30),
   gate count ("4 gates"), document count, level + country tags, featured quests pinned first.
3. Filters: study level (undergrad/masters/phd), host country, text search. Client-side, instant.
4. Dark RPG-adventure visual theme (quest board / tavern notice-board vibe) in globals.css —
   polished, not purple-gradient generic. Must look deliberate.
5. Clicking a card goes to /quest/[slug] (stub page is fine for now).

Done = npm run dev shows a real board of the seeded quests, filters work, no console errors.
```

---

## PROMPT 4 — Quest detail: briefing, gates, inventory

```
Context: Quest board works (Prompt 3 done). Quest detail route app/quest/[slug]/page.tsx exists
as a stub. lib/queries.ts has QUEST_DETAIL_QUERY (gates[]-> and documents[]-> resolved).

Task:
1. Quest detail page: title, provider, amount, deadline countdown, "briefing" (portable text),
   apply URL button (real link, opens in new tab).
2. GateChecklist component (client): lists each eligibility gate with its title + howToProve.
   Checkboxes persist per-quest in localStorage. "3/5 gates cleared" progress.
3. Inventory component: required documents as checklist, same persistence.
4. "Start quest" button → adds the quest to the quest log (see lib/questLog.ts) and routes to /log.
5. If the player's saved profile (lib/matching.ts PlayerProfile) exists, pre-check gates the
   profile already passes and highlight them.

Done = I can open a quest, check gates/docs, see progress persist on refresh, and start the quest.
```

---

## PROMPT 5 — Eligibility engine (the money-shot demo)

```
Context: Quest detail + checklists work (Prompt 4 done). lib/matching.ts has the PlayerProfile
interface and questUnlocked() evaluator (profile vs gates by gateType). If it's a stub, implement
it: nationality/degreeLevel/fieldOfStudy gates pass when profile value is in allowedValues;
minGPA/ageLimit compare against minValue; languageTest/other always need manual check.

Task:
1. A "Create adventurer profile" form (nationalities, study level, fields, GPA, age, languages).
   Persist in localStorage. Editable.
2. On the quest board, each card shows a gate verdict: "UNLOCKED — all gates clear" or
   "3/5 gates clear" using questUnlocked(). Add an "Unlocked only" toggle filter.
3. The demo flow must be: set profile → board instantly shows which quests unlock. This is the
   30-second judge demo — make it feel magical, not mechanical.

Done = with a Pakistani undergrad profile, ERSU shows UNLOCKED (if its gates allow it — if not,
fix the SEED DATA gates in the Studio, not the engine).
```

---

## PROMPT 6 — Quest log: state machine + XP

```
Context: questLog.ts exists (states + XP helpers). /log page exists as stub.

Task: build the quest log page:
1. Lists my started quests as cards with their STATE: discovered → clearing gates →
   gathering docs → submitted → awarded (or rejected). Advance state with buttons; states persist.
2. XP system: +10 per gate cleared, +15 per document gathered, +50 on submit, +200 on awarded.
   XpBar + level (level = floor(totalXP/100)+1) shown in the header of every page.
3. Progress summary: "2 quests in play · 1 submitted · Level 3 (240 XP)".
4. Empty state with personality ("No quests yet, adventurer. The board awaits →").

Done = full loop works: board → quest → check gates → start → advance states → XP/level rise.
```

---

## PROMPT 7 — Freshness-verification workflow (Studio bonus)

```
Context: Studio live with real quest data. The challenge awards bonus points for Workflows:
"model a process as data next to your content, so an agent can move a draft forward and a person
can approve it through the same transitions."

Task (Sanity Studio customization):
1. A custom document badge on quest documents: "NEEDS RE-VERIFICATION" (red) when
   lastVerified is older than 30 days OR deadline is within 60 days and status is published.
   "FRESH" (green) otherwise.
2. A custom Structure view: "Verification queue" listing all quests with status=needsReverification
   or the red badge, sorted by deadline. One click to open, verify, set status back to published
   with a new lastVerified + verificationNotes.
3. Document action: "Flag for re-verification" (sets status=needsReverification) and
   "Mark verified" (sets status=published, lastVerified=now).

Keep it in plain Structure Builder + badges + actions — no new plugins needed.
Done = the verification queue view works and I can run a full re-verification pass in the Studio.
```

---

## PROMPT 8 — Deploy + submission assets

```
Context: Everything works locally. Time to ship.

1. Deploy web to Vercel (production). Deploy Studio (npx sanity deploy) — already done in
   Prompt 1, redeploy if schemas changed.
2. Set the Sanity dataset CORS + public read so the web app works in production. Verify the
   production URL loads quests (not empty).
3. Write the demo script (60–90 seconds): profile → unlocked quests → open ERSU → clear gates →
   quest log → XP. Record it (screen recording, I'll do the recording — give me the exact script).
4. Sanity project ID + dataset: put them in README.md (needed for the DEV submission post).

Done = live web URL, live Studio URL, project ID documented, demo script ready.
```

---

## PROMPT 9 — DEV submission draft (qwerty co-writes this one)

After Prompt 8, come back to qwerty (me) — we write the DEV post together: the ERSU story,
the build log, schema thinking, agent session embed, screenshots, all required tags.
```
