/**
 * Deadline math for the board + quest pages.
 *
 * Everything here is deliberately UTC-based: the board renders on the server first
 * and hydrates on the client, so locale- or timezone-dependent output would cause a
 * hydration mismatch (and a console error).
 */
const DAY = 86_400_000
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Countdown turns red below this many days. */
export const URGENT_DAYS = 30
/** Countdown turns amber below this many days. */
export const SOON_DAYS = 90

export type DeadlineTone = 'calm' | 'soon' | 'urgent' | 'passed'

function time(deadline?: string): number {
  if (!deadline) return NaN
  return new Date(deadline).getTime()
}

/** Whole days from now until the deadline (negative once it has passed). */
export function daysLeft(deadline?: string): number {
  return Math.ceil((time(deadline) - Date.now()) / DAY)
}

export function deadlineTone(deadline?: string): DeadlineTone {
  const d = daysLeft(deadline)
  if (Number.isNaN(d)) return 'calm'
  if (d < 0) return 'passed'
  if (d < URGENT_DAYS) return 'urgent'
  if (d < SOON_DAYS) return 'soon'
  return 'calm'
}

/** "74 days left" / "Closes today" / "Deadline passed". */
export function deadlineLabel(deadline?: string): string {
  const d = daysLeft(deadline)
  if (Number.isNaN(d)) return 'No deadline'
  if (deadlineTone(deadline) === 'passed') return 'Deadline passed'
  if (d === 0) return 'Closes today'
  return `${d} day${d === 1 ? '' : 's'} left`
}

/** "Closes 8 Jan 2027" — deterministic on both server and client. */
export function exactDeadline(deadline?: string): string | undefined {
  const t = time(deadline)
  if (Number.isNaN(t)) return undefined
  const d = new Date(t)
  return `Closes ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}
