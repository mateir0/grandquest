/**
 * Re-verify every published quest and refresh its verification stamp.
 *
 * For each published quest (ERSU — the private test record — is skipped) this
 * drives its `quest-verification` workflow instance back through the REAL
 * transitions to `verified` and sets `lastVerified` to now (UTC):
 *
 *   verified     -> unverified   (monitor / flag-for-reverification)
 *   unverified   -> underReview  (triage  / start-review)
 *   underReview  -> verified     (review  / mark-verified)
 *
 * so a quest at any stage ends `verified` through declared transitions rather
 * than a string edit. The legacy `quest.status` is left untouched. Idempotent
 * and resumable — safe to re-run.
 *
 * Derived freshness (shared/freshness.ts) is deadline-dominated: a re-verified
 * quest whose deadline has passed or is within 60 days stays NEEDS
 * RE-VERIFICATION by design; the script reports that split at the end.
 *
 * Token: VITE_SANITY_WRITE_TOKEN from board/.env (read + write on this
 * dataset), falling back to SANITY_AUTH_TOKEN. Never logged.
 *
 * Run from studio/:
 *   node scripts/reverifyQuests.cjs            # dry run (inspect only)
 *   node scripts/reverifyQuests.cjs --apply    # write
 */
const fs = require('fs')
const path = require('path')
const {createClient} = require('@sanity/client')
const {createEngine, refDataset, ENGINE_API_VERSION} = require('@sanity/workflow-engine')

const PROJECT_ID = 'aitdwcxh'
const DATASET = 'production'
const TAG = 'production'
const DEFINITION = 'quest-verification'
const STALE_AFTER_DAYS = 30
const NEAR_DEADLINE_DAYS = 60
const DAY_MS = 86_400_000

const APPLY = process.argv.includes('--apply')
const isERSU = (q) => /ersu/i.test(q.title || '') || /ersu/i.test(q._id)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function readToken() {
  const envPath = path.join(__dirname, '..', '..', 'board', '.env')
  try {
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*VITE_SANITY_WRITE_TOKEN\s*=\s*(.+?)\s*$/)
      if (m) return m[1].replace(/^["']|["']$/g, '')
    }
  } catch {
    /* fall through to env var */
  }
  if (process.env.SANITY_AUTH_TOKEN) return process.env.SANITY_AUTH_TOKEN
  throw new Error('No write token: set VITE_SANITY_WRITE_TOKEN in board/.env or SANITY_AUTH_TOKEN.')
}

async function getStage(engine, instanceId) {
  return engine.query({groq: `*[_id == "${instanceId}" && tag == $tag][0].currentStage`})
}

async function fireWithRetry(engine, instanceId, activity, action, attempts = 6) {
  let lastErr
  for (let a = 1; a <= attempts; a += 1) {
    try {
      await engine.fireAction({instanceId, activity, action})
      return
    } catch (err) {
      lastErr = err
      await sleep(1000 * a)
    }
  }
  throw lastErr
}

/** Walk an instance to `verified` from any stage; re-open first if already verified. */
async function reverifyToVerified(engine, instanceId, label) {
  for (let step = 0; step < 12; step += 1) {
    const stage = await getStage(engine, instanceId)
    if (stage === 'verified' && step === 0) {
      await fireWithRetry(engine, instanceId, 'monitor', 'flag-for-reverification')
    } else if (stage === 'verified') {
      return
    } else if (stage === 'unverified') {
      await fireWithRetry(engine, instanceId, 'triage', 'start-review')
    } else if (stage === 'underReview') {
      await fireWithRetry(engine, instanceId, 'review', 'mark-verified')
    } else {
      throw new Error(`unexpected stage "${stage}" for ${label} (${instanceId})`)
    }
  }
  throw new Error(`could not reach verified for ${label} (${instanceId})`)
}

async function main() {
  const token = readToken()
  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: ENGINE_API_VERSION,
    token,
    useCdn: false,
    perspective: 'raw',
  })
  const engine = createEngine({
    client,
    workflowResource: {type: 'dataset', id: `${PROJECT_ID}.${DATASET}`},
    tag: TAG,
  })

  const quests = await client.fetch(
    `*[_type == "quest" && !(_id in path("drafts.**"))]{_id, title, status, deadline, lastVerified} | order(title asc)`,
  )
  const instances = await engine.query({
    groq: `*[_type == "sanity.workflow.instance" && tag == $tag && definition == "${DEFINITION}"]{_id, currentStage, fields}`,
  })
  const instByDoc = new Map()
  for (const inst of instances) {
    const subject = (inst.fields || []).find((f) => f.name === 'subject')
    const gdr = subject && subject.value && subject.value.id
    if (gdr) instByDoc.set(gdr.split(':').pop(), inst)
  }

  const targets = quests.filter((q) => q.status === 'published' && !isERSU(q))
  console.log(`published targets (excluding ERSU): ${targets.length}`)

  if (!APPLY) {
    for (const q of targets) {
      const inst = instByDoc.get(q._id)
      console.log(`- ${q.title} | stage=${inst ? inst.currentStage : 'NO-INSTANCE'} | deadline=${q.deadline || '-'}`)
    }
    console.log('\n(dry run — pass --apply to write)')
    return
  }

  const now = new Date().toISOString()
  for (const q of targets) {
    let inst = instByDoc.get(q._id)
    if (!inst) {
      const {instance} = await engine.startInstance({
        definition: DEFINITION,
        initialFields: [
          {
            type: 'subject',
            name: 'subject',
            value: refDataset({projectId: PROJECT_ID, dataset: DATASET, documentId: q._id, type: 'quest'}),
          },
        ],
      })
      inst = {_id: instance._id}
    }
    await reverifyToVerified(engine, inst._id, q.title)
    await client.patch(q._id).set({lastVerified: now}).commit()
    console.log(`verified + stamped: ${q.title}`)
  }
  console.log(`\nre-verified ${targets.length} quests; lastVerified=${now}`)

  // Derived-freshness report (mirrors shared/freshness.ts).
  const staleCutoff = new Date(Date.now() - STALE_AFTER_DAYS * DAY_MS).toISOString()
  const soonCutoff = new Date(Date.now() + NEAR_DEADLINE_DAYS * DAY_MS).toISOString()
  const after = await client.fetch(
    `*[_type == "quest" && !(_id in path("drafts.**")) && status == "published"]{_id, title, deadline, lastVerified} | order(deadline asc)`,
  )
  const fresh = []
  const stale = []
  for (const q of after) {
    if (isERSU(q)) continue
    const lv = q.lastVerified ? Date.parse(q.lastVerified) : NaN
    const isStale =
      Number.isNaN(lv) ||
      lv < Date.parse(staleCutoff) ||
      (q.deadline && Date.parse(q.deadline) <= Date.parse(soonCutoff))
    ;(isStale ? stale : fresh).push(q)
  }
  console.log(`\nFRESH: ${fresh.length}`)
  for (const q of fresh) console.log(`  + ${q.title} | deadline=${q.deadline || '-'}`)
  console.log(`NEEDS RE-VERIFICATION (near/passed deadline, expected): ${stale.length}`)
  for (const q of stale) console.log(`  - ${q.title} | deadline=${q.deadline || '-'}`)
}

main().catch((err) => {
  console.error(err && err.message ? err.message : err)
  process.exit(1)
})
