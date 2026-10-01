import {scheduledEventHandler} from '@sanity/functions'
import {createClient} from '@sanity/client'
import {
  createEngine,
  ENGINE_API_VERSION,
  type WorkflowClient,
} from '@sanity/workflow-engine'

const PROJECT_ID = 'aitdwcxh'
const DATASET = 'production'
const TAG = 'production'
const DEFINITION = 'quest-verification'

// Mirrors shared/freshness.ts: stale when lastVerified is missing/invalid or
// older than 30 days (data decay), or the deadline has already passed (strictly
// before now). A missing/unset deadline is not passed. Deadline urgency for
// near-but-future deadlines is the web countdown's job, not the badge's — so the
// sweeper no longer reopens instances the web badge still calls FRESH.
const STALE_AFTER_DAYS = 30
const DAY_MS = 86_400_000

const STALE_FILTER = `(!defined(lastVerified) || dateTime(lastVerified) == null || dateTime(lastVerified) < dateTime($staleCutoff) || (defined(deadline) && dateTime(deadline) != null && dateTime(deadline) < dateTime($nowCutoff)))`

interface QuestRow {
  _id: string
  title?: string
  lastVerified?: string | null
  deadline?: string | null
}

interface InstanceRow {
  _id: string
  currentStage: string
  fields?: {name?: string; value?: {id?: string}}[]
}

function subjectDocId(instance: InstanceRow): string | undefined {
  const subject = (instance.fields ?? []).find((field) => field.name === 'subject')
  const gdr = subject?.value?.id
  return gdr ? gdr.split(':').pop() : undefined
}

function reasonFor(quest: QuestRow, staleCutoff: string, nowCutoff: string): string {
  const reasons: string[] = []
  if (!quest.lastVerified) reasons.push('never verified')
  else if (Date.parse(quest.lastVerified) < Date.parse(staleCutoff)) {
    reasons.push(`lastVerified older than ${STALE_AFTER_DAYS} days`)
  }
  if (quest.deadline && Date.parse(quest.deadline) < Date.parse(nowCutoff)) {
    reasons.push('deadline passed')
  }
  return reasons.join('; ') || 'stale'
}

/**
 * deadline-sweeper — runs daily. Finds stale quests (derived freshness) whose
 * quest-verification instance is `verified`, fires the workflow's real
 * `flag-for-reverification` transition back to `unverified`, and appends one
 * immutable `sweepLog` document per reopened quest.
 */
export const handler = scheduledEventHandler(async ({context}) => {
  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: ENGINE_API_VERSION,
    token: context.clientOptions?.token,
    useCdn: false,
    perspective: 'raw',
  })
  const engine = createEngine({
    client: client as unknown as WorkflowClient,
    workflowResource: {type: 'dataset', id: `${PROJECT_ID}.${DATASET}`},
    tag: TAG,
  })

  const now = Date.now()
  const staleCutoff = new Date(now - STALE_AFTER_DAYS * DAY_MS).toISOString()
  const nowCutoff = new Date(now).toISOString()

  const staleQuests = await client.fetch<QuestRow[]>(
    `*[_type == "quest" && !(_id in path("drafts.**")) && ${STALE_FILTER}]{_id, title, lastVerified, deadline}`,
    {staleCutoff, nowCutoff},
  )

  const instances = await engine.query<InstanceRow[]>({
    groq: `*[_type == "sanity.workflow.instance" && tag == $tag && definition == "${DEFINITION}"]{_id, currentStage, fields}`,
  })
  const instanceByDoc = new Map<string, InstanceRow>()
  for (const instance of instances) {
    const docId = subjectDocId(instance)
    if (docId) instanceByDoc.set(docId, instance)
  }

  let reopened = 0
  let skipped = 0
  for (const quest of staleQuests) {
    const instance = instanceByDoc.get(quest._id)
    // Only a verified instance can reach `unverified` through a declared
    // transition; anything already unverified/underReview/disputed is left alone.
    if (!instance || instance.currentStage !== 'verified') {
      skipped += 1
      continue
    }

    await engine.fireAction({
      instanceId: instance._id,
      activity: 'monitor',
      action: 'flag-for-reverification',
    })

    // Append-only: created once, never updated.
    await client.create({
      _type: 'sweepLog',
      quest: {_type: 'reference', _ref: quest._id},
      ranAt: new Date().toISOString(),
      reason: reasonFor(quest, staleCutoff, nowCutoff),
    })
    reopened += 1
  }

  console.log(
    `deadline-sweeper ran at ${new Date().toISOString()}: stale=${staleQuests.length} reopened=${reopened} skipped=${skipped}`,
  )
})
