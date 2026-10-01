# GrantQuest

Scholarship hunting, turned into an RPG quest log.

Every scholarship is a **quest**. Each quest has **eligibility gates** (clear them to unlock it), a **document inventory** to gather, a **deadline timer** counting down, and a real state machine behind it: discovered → clearing gates → gathering docs → submitted → awarded. Everything earns XP.

Designed steampunk Vitoriano — parchment, brass, mahogany.

Live: https://grantquest.tech
Studio: https://grantquest.sanity.studio

Built for the DEV Sanity Challenge (Path Two).

## What it does

- **Quest board** — all 25 scholarships with live eligibility verdicts against your profile.
- **Quest detail** — briefing, eligibility gates as structured data (not prose), document checklist, deadline countdown.
- **Quest log + XP** — track applications, earn XP per action, level up. Saved locally.
- **Eligibility engine** — profile-vs-gates matching, client-side and transparent.
- **Freshness badges** — scholarship info rots. Every quest shows FRESH or NEEDS RE-VERIFICATION based on verification age and whether the deadline has passed.
- **Verification workflow** — quests move unverified → under review → verified through Sanity's official Workflows API. A daily scheduled function sweeps stale quests back for re-verification and logs every sweep.
- **Quest Master's Board** — a separate Sanity App SDK app for working the verification queue.
- **Guided tour** — 30-second tour for first-time visitors.

## The data

25 real scholarships. Nothing invented — no guessed deadlines, amounts, or requirements. (Fulbright, DAAD, Gates Cambridge, Clarendon, Knight-Hennessy, Schwarzman, Chevening, Eiffel, ETH Zurich, Rhodes ×4, GKS-U ×4, and more.)

## Repo layout
studio/ # Sanity Studio — schemas, verification workflow, deadline sweeper
web/ # Next.js 14 app — board, quest detail, quest log
board/ # Quest Master's Board (Sanity App SDK + React 19)
shared/ # freshness cutoffs shared by Studio and web




## Run it

```sh
cd web
# set NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET in .env.local
npm install && npm run dev
Built by
Muhammad Hashir — web dev, building in the open.
