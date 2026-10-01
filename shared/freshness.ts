export type Freshness = 'stale' | 'fresh'

export interface FreshnessCutoffs {
  /** lastVerified before this instant (now - 30 days) is stale data decay. */
  staleCutoff: string
  /** deadline strictly before this instant (now) has passed. */
  nowCutoff: string
}

export const STALE_AFTER_DAYS = 30

const DAY_MS = 86_400_000

type FreshnessDocument = {
  lastVerified?: string | null
  deadline?: string | null
}

export function getFreshnessCutoffs(now: Date = new Date()): FreshnessCutoffs {
  const nowMs = now.getTime()
  return {
    staleCutoff: new Date(nowMs - STALE_AFTER_DAYS * DAY_MS).toISOString(),
    nowCutoff: new Date(nowMs).toISOString(),
  }
}

/**
 * The badge answers "can I trust this data", not "is the deadline near" —
 * deadline urgency is the countdown chronometer's job.
 *
 * NEEDS RE-VERIFICATION when the data has decayed (lastVerified missing/invalid
 * or older than 30 days) or the deadline has already passed (next cycle's
 * details are unconfirmed). A missing/unset deadline counts as not passed.
 */
export function getFreshness(
  doc: FreshnessDocument | null | undefined,
  cutoffs: FreshnessCutoffs,
): Freshness {
  if (!doc?.lastVerified) return 'stale'

  const lastVerified = Date.parse(doc.lastVerified)
  if (Number.isNaN(lastVerified)) return 'stale'
  if (lastVerified < Date.parse(cutoffs.staleCutoff)) return 'stale'

  if (doc.deadline) {
    const deadline = Date.parse(doc.deadline)
    if (!Number.isNaN(deadline) && deadline < Date.parse(cutoffs.nowCutoff)) return 'stale'
  }

  return 'fresh'
}

export const STALE_FRESHNESS_FILTER =
  '(!defined(lastVerified) || dateTime(lastVerified) == null || dateTime(lastVerified) < dateTime($staleCutoff) || (defined(deadline) && dateTime(deadline) != null && dateTime(deadline) < dateTime($nowCutoff)))'

export const FRESHNESS_PROJECTION =
  `"freshness": select(${STALE_FRESHNESS_FILTER} => "stale", "fresh")`
