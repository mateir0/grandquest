/**
 * Freshness mirror of shared/freshness.ts (Prompt 10) — duplicated here so the
 * board app stays self-contained (Vite root is board/).
 *
 * Rule: stale when lastVerified is missing/invalid, older than 30 days, or the
 * deadline is at or before the 60-day cutoff (which covers passed deadlines).
 */
export type Freshness = 'stale' | 'fresh'

export const STALE_AFTER_DAYS = 30
export const NEAR_DEADLINE_DAYS = 60

const DAY_MS = 86_400_000

interface FreshnessDocument {
  lastVerified?: string | null
  deadline?: string | null
}

export function getFreshnessCutoffs(now: Date = new Date()): {
  staleCutoff: string
  soonCutoff: string
} {
  const nowMs = now.getTime()
  return {
    staleCutoff: new Date(nowMs - STALE_AFTER_DAYS * DAY_MS).toISOString(),
    soonCutoff: new Date(nowMs + NEAR_DEADLINE_DAYS * DAY_MS).toISOString(),
  }
}

export function getFreshness(
  doc: FreshnessDocument | null | undefined,
  cutoffs: {staleCutoff: string; soonCutoff: string},
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
