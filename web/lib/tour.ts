/**
 * Guided no-login tour ("Take the 30-second tour").
 *
 * Framework-free core so it can be unit-tested in plain Node: step definitions,
 * localStorage snapshot/rollback (the sandbox), and the dismissal flag.
 * The React renderer lives in components/TourGuide.tsx and is a thin shell
 * over this module.
 */

export type TourRoute = '/' | 'quest' | '/log'

export interface TourStep {
  /** Short label for progress dots / screen readers. */
  id: string
  /** Which route this step lives on. 'quest' matches /quest/[slug]. */
  route: TourRoute
  /** CSS selector of the spotlight target (first match wins). */
  selector: string
  /** Fallback selector when the primary target is absent. */
  fallback: string
  /** One short sentence — the whole tour must read in under 30 seconds. */
  copy: string
  /** Button label for advancing from this step. */
  nextLabel: string
}

/** Exactly five steps, one sentence each. */
export const TOUR_STEPS: TourStep[] = [
  {
    id: 'stats',
    route: '/',
    selector: '.hero-panel',
    fallback: '.hero',
    copy: 'Live figures from real quest records: open quests, regions charted, nearest deadline.',
    nextLabel: 'See the board',
  },
  {
    id: 'board',
    route: '/',
    selector: '.board .grid',
    fallback: '#board',
    copy: 'Every card is a real scholarship: countdown, gate and document counts, freshness seal.',
    nextLabel: 'Open a quest',
  },
  {
    id: 'gates',
    route: 'quest',
    selector: '.objective',
    fallback: '.section',
    copy: 'Eligibility is structured data, not prose: tick a gate and XP lands in your log.',
    nextLabel: 'See documents',
  },
  {
    id: 'inventory',
    route: 'quest',
    selector: '.inventory-item',
    fallback: '.inventory-grid',
    copy: 'Documents are an inventory manifest: gather each one the same way.',
    nextLabel: 'See my log',
  },
  {
    id: 'log',
    route: '/log',
    selector: '.freshness-badge',
    fallback: '.logcard',
    copy: 'States, XP and levels live in this browser, no login; each quest carries a freshness seal.',
    nextLabel: 'Finish tour',
  },
]

/** localStorage keys the tour is allowed to touch (sandboxed + rolled back). */
export const TOUR_TOUCHED_KEYS = ['grantquest.log'] as const

/** Dismissal flag — separate from the sandbox, never rolled back. */
export const TOUR_DISMISSED_KEY = 'grantquest.tour.dismissed'

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export type TourSnapshot = Record<string, string | null>

export function snapshotStorage(storage: StorageLike): TourSnapshot {
  const snap: TourSnapshot = {}
  for (const key of TOUR_TOUCHED_KEYS) snap[key] = storage.getItem(key)
  return snap
}

/** Restore byte-identical state; keys absent at snapshot time are removed. */
export function restoreStorage(storage: StorageLike, snap: TourSnapshot): void {
  for (const key of TOUR_TOUCHED_KEYS) {
    const value = snap[key]
    if (value == null) storage.removeItem(key)
    else storage.setItem(key, value)
  }
}

export function isDismissed(storage: StorageLike): boolean {
  return storage.getItem(TOUR_DISMISSED_KEY) === '1'
}

export function markDismissed(storage: StorageLike): void {
  storage.setItem(TOUR_DISMISSED_KEY, '1')
}

/** Rough read-time check: 200wpm → 30s budget is 100 words. */
export function tourWordCount(): number {
  return TOUR_STEPS.flatMap((step) => step.copy.split(/\s+/)).filter(Boolean).length
}

export function stepMatchesRoute(step: TourStep, pathname: string): boolean {
  if (step.route === '/') return pathname === '/'
  if (step.route === '/log') return pathname === '/log'
  return pathname.startsWith('/quest/')
}
