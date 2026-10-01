import {authedClient, authedEngine, DEFINITION} from './sanity'

interface InstanceRow {
  _id: string
  currentStage: string
  fields?: {name?: string; value?: {id?: string}}[]
}

/** Global document reference looks like `dataset:project:dataset:docId`. */
function subjectDocId(instance: InstanceRow): string | undefined {
  const subject = (instance.fields ?? []).find((field) => field.name === 'subject')
  const gdr = subject?.value?.id
  return gdr ? gdr.split(':').pop() : undefined
}

/** Read a stage string off either a raw instance or an OperationResult. */
function stageOf(value: unknown): string {
  const v = value as {instance?: {currentStage?: unknown}; currentStage?: unknown} | null
  const inner = v?.instance?.currentStage ?? v?.currentStage
  return typeof inner === 'string' ? inner : 'unknown'
}

export async function listInstances(): Promise<Map<string, {instanceId: string; stage: string}>> {
  const engine = authedEngine()
  // NOTE: engine.query enforces tag-scoping — the filter must use the bound
  // $tag variable (a "production" literal throws ContractViolationError).
  const rows = await engine.query<InstanceRow[]>({
    groq: `*[_type == "sanity.workflow.instance" && tag == $tag && definition == "${DEFINITION}"]{_id, currentStage, fields}`,
  })
  const byQuest = new Map<string, {instanceId: string; stage: string}>()
  for (const row of rows) {
    const docId = subjectDocId(row)
    if (docId) byQuest.set(docId, {instanceId: row._id, stage: row.currentStage})
  }
  return byQuest
}

async function currentStageOf(instanceId: string): Promise<string> {
  const engine = authedEngine()
  return stageOf(await engine.getInstance({instanceId}))
}

export interface TapResult {
  questId: string
  fromStage: string
  toStage: string
  lastVerified?: string
  note: string
}

/**
 * Verify tap — keeps every surface in agreement:
 * 1. Drives the quest-verification workflow instance to `verified`
 *    (unverified → start-review → underReview → mark-verified → verified).
 * 2. Sets lastVerified=now() AND the legacy status field to `published`
 *    (the web board filters status=="published").
 */
export async function verifyQuest(questId: string): Promise<TapResult> {
  const engine = authedEngine()
  const instances = await listInstances()
  const found = instances.get(questId)
  if (!found) throw new Error(`No ${DEFINITION} instance found for quest ${questId}`)

  const fromStage = found.stage
  let stage = fromStage
  for (let hop = 0; hop < 4 && stage !== 'verified'; hop += 1) {
    if (stage === 'unverified') {
      const res = await engine.fireAction({
        instanceId: found.instanceId,
        activity: 'triage',
        action: 'start-review',
      })
      stage = stageOf(res)
    } else if (stage === 'underReview') {
      const res = await engine.fireAction({
        instanceId: found.instanceId,
        activity: 'review',
        action: 'mark-verified',
      })
      stage = stageOf(res)
    } else if (stage === 'disputed') {
      throw new Error('Instance is disputed (terminal) — resolve it before verifying')
    } else {
      stage = await currentStageOf(found.instanceId)
    }
  }
  if (stage !== 'verified') {
    stage = await currentStageOf(found.instanceId)
    if (stage !== 'verified') throw new Error(`Could not reach verified (stuck at ${stage})`)
  }

  const stamped = new Date().toISOString()
  await authedClient()
    .patch(questId)
    .set({status: 'published', lastVerified: stamped})
    .commit()

  return {
    questId,
    fromStage,
    toStage: stage,
    lastVerified: stamped,
    note: `workflow ${fromStage} → verified; lastVerified stamped; status=published`,
  }
}

/**
 * Flag tap — fires the workflow transition back to `unverified` and leaves the
 * legacy status field alone (writing needsReverification would de-list the
 * quest from the web board, which filters status=="published"). The derived
 * freshness badge is what shows the red state.
 */
export async function flagQuest(questId: string): Promise<TapResult> {
  const engine = authedEngine()
  const instances = await listInstances()
  const found = instances.get(questId)
  if (!found) throw new Error(`No ${DEFINITION} instance found for quest ${questId}`)

  const fromStage = found.stage
  if (found.stage === 'verified') {
    const res = await engine.fireAction({
      instanceId: found.instanceId,
      activity: 'monitor',
      action: 'flag-for-reverification',
    })
    const stage = stageOf(res)
    return {
      questId,
      fromStage,
      toStage: stage,
      note: `workflow verified → ${stage}; legacy status field untouched`,
    }
  }
  return {
    questId,
    fromStage,
    toStage: found.stage,
    note: `already ${found.stage} — no workflow move available; legacy status field untouched`,
  }
}
