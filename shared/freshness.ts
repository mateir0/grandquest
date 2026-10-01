export type Freshness = 'stale' | 'fresh'

export interface FreshnessCutoffs {
  staleCutoff: string
  soonCutoff: string
}

export const STALE_AFTER_DAYS = 30
export const NEAR_DEADLINE_DAYS = 60

const DAY_MS = 86_400_000

type FreshnessDocument = {
  lastVerified?: string | null
  deadline?: string | null
}

export function getFreshnessCutoffs(now: Date = new Date()): FreshnessCutoffs {
  const nowMs = now.getTime()
  return {
    staleCutoff: new Date(nowMs - STALE_AFTER_DAYS * DAY_MS).toISOString(),
    soonCutoff: new Date(nowMs + NEAR_DEADLINE_DAYS * DAY_MS).toISOString(),
  }
}

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
    if (!Number.isNaN(deadline) && deadline <= Date.parse(cutoffs.soonCutoff)) return 'stale'
  }

  return 'fresh'
}

export const STALE_FRESHNESS_FILTER =
  '(!defined(lastVerified) || dateTime(lastVerified) == null || dateTime(lastVerified) < dateTime($staleCutoff) || (defined(deadline) && dateTime(deadline) != null && dateTime(deadline) <= dateTime($soonCutoff)))'

export const FRESHNESS_PROJECTION =
  `"freshness": select(${STALE_FRESHNESS_FILTER} => "stale", "fresh")`
