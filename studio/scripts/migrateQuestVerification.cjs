/**
 * One-off migration: put every quest under the official `quest-verification`
 * workflow. Idempotent and resumable — a quest that already has an instance is
 * skipped (and repaired if it is stuck short of its mapped stage).
 *
 * Mapping (per the rebuild prompt):
 *   status=published            -> verified   (walked through underReview)
 *   status=needsReverification  -> unverified
 *   status=draft                -> unverified
 * Any other status is left unverified (the safe default: it shows up in the
 * verification queue rather than being silently marked verified).
 *
 * Run from studio/:
 *   node scripts/migrateQuestVerification.cjs
 */
const fs = require('fs')
const os = require('os')
const path = require('path')
const {createClient} = require('@sanity/client')
const {createEngine, refDataset, ENGINE_API_VERSION} = require('@sanity/workflow-engine')

const PROJECT_ID = 'aitdwcxh'
const DATASET = 'production'
const TAG = 'production'
const DEFINITION = 'quest-verification'

function readToken() {
  if (process.env.SANITY_AUTH_TOKEN) return process.env.SANITY_AUTH_TOKEN
  const configPath = path.join(os.homedir(), '.config', 'sanity', 'config.json')
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
  if (!config.authToken) throw new Error('No Sanity token: run `npx sanity login` first.')
  return config.authToken
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function getStage(engine, instanceId) {
  const stage = await engine.query({
    groq: `*[_id == "${instanceId}" && tag == $tag][0].currentStage`,
  })
  return stage
}

async function fireWithRetry(engine, instanceId, activity, action, attempts = 6) {
  let lastErr
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await engine.fireAction({instanceId, activity, action})
      return
    } catch (err) {
      lastErr = err
      await sleep(1000 * attempt)
    }
  }
  throw lastErr
}

/** Drive a published quest's instance to `verified`, however far along it is. */
async function advanceToVerified(engine, instanceId, relabel) {
  for (let step = 0; step < 10; step += 1) {
    const stage = await getStage(engine, instanceId)
    if (stage === 'verified') return
    if (stage === 'unverified') {
      await fireWithRetry(engine, instanceId, 'triage', 'start-review')
    } else if (stage === 'underReview') {
      await fireWithRetry(engine, instanceId, 'review', 'mark-verified')
    } else {
      throw new Error(`unexpected stage "${stage}" for ${instanceId} (${relabel})`)
    }
  }
  throw new Error(`could not reach verified for ${instanceId} (${relabel})`)
}

async function main() {
  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: ENGINE_API_VERSION,
    token: readToken(),
    useCdn: false,
  })
  const engine = createEngine({
    client,
    workflowResource: {type: 'dataset', id: `${PROJECT_ID}.${DATASET}`},
    tag: TAG,
  })

  const quests = await client.fetch(
    `*[_type == "quest" && !(_id in path("drafts.**"))]{_id, title, status} | order(_id asc)`,
  )

  const instances = await engine.query({
    groq: `*[_type == "sanity.workflow.instance" && tag == $tag && definition == "${DEFINITION}"]{_id, currentStage, fields}`,
  })
  const startedFor = new Map()
  for (const inst of instances) {
    const subject = (inst.fields || []).find((f) => f.name === 'subject')
    const gdr = subject && subject.value && subject.value.id
    if (gdr) startedFor.set(gdr.split(':').pop(), inst)
  }

  let created = 0
  let repaired = 0
  let skipped = 0
  let verified = 0
  let leftUnverified = 0

  for (const quest of quests) {
    const existing = startedFor.get(quest._id)

    if (existing) {
      if (quest.status === 'published' && existing.currentStage !== 'verified') {
        await advanceToVerified(engine, existing._id, quest._id)
        repaired += 1
        verified += 1
        console.log(`repair ${quest._id} (${existing._id}) -> verified`)
      } else {
        skipped += 1
        console.log(`skip   ${quest._id} (${existing._id} @ ${existing.currentStage})`)
      }
      continue
    }

    const {instance} = await engine.startInstance({
      definition: DEFINITION,
      initialFields: [
        {
          type: 'subject',
          name: 'subject',
          value: refDataset({
            projectId: PROJECT_ID,
            dataset: DATASET,
            documentId: quest._id,
            type: 'quest',
          }),
        },
      ],
    })
    created += 1

    if (quest.status === 'published') {
      await advanceToVerified(engine, instance._id, quest._id)
      verified += 1
      console.log(`start  ${quest._id} (${quest.status}) -> ${instance._id} @ verified`)
    } else {
      leftUnverified += 1
      console.log(`start  ${quest._id} (${quest.status}) -> ${instance._id} @ unverified`)
    }
  }

  console.log(
    `\nquests=${quests.length} created=${created} repaired=${repaired} skipped=${skipped} verified=${verified} unverified=${leftUnverified}`,
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
