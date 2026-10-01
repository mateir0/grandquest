/**
 * Freshness mirror of shared/freshness.ts (Prompt 10) — duplicated here so the
 * board app stays self-contained (Vite root is board/).
 *
 * The badge answers "can I trust this data", not "is the deadline near" —
 * deadline urgency is the countdown chronometer's job. Stale when lastVerified
 * is missing/invalid or older than 30 days (data decay), or the deadline has
 * already passed (strictly before now). A missing/unset deadline is not passed.
 */
export type Freshness = 'stale' | 'fresh'

export const STALE_AFTER_DAYS = 30

const DAY_MS = 86_400_000

interface FreshnessDocument {
  lastVerified?: string | null
  deadline?: string | null
}

export function getFreshnessCutoffs(now: Date = new Date()): {
  staleCutoff: string
  nowCutoff: string
} {
  const nowMs = now.getTime()
  return {
    staleCutoff: new Date(nowMs - STALE_AFTER_DAYS * DAY_MS).toISOString(),
    nowCutoff: new Date(nowMs).toISOString(),
  }
}

export function getFreshness(
  doc: FreshnessDocument | null | undefined,
  cutoffs: {staleCutoff: string; nowCutoff: string},
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
