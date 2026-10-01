import {describe, it} from 'node:test'
import assert from 'node:assert/strict'
import {
  TOUR_STEPS,
  TOUR_TOUCHED_KEYS,
  TOUR_DISMISSED_KEY,
  snapshotStorage,
  restoreStorage,
  isDismissed,
  markDismissed,
  tourWordCount,
  stepMatchesRoute,
} from '../lib/tour.ts'

function memoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial))
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => void map.set(k, String(v)),
    removeItem: (k) => void map.delete(k),
    raw: () => Object.fromEntries(map),
  }
}

describe('tour definition', () => {
  it('has at most 5 steps covering board, gates, docs, log, freshness', () => {
    assert.ok(TOUR_STEPS.length <= 5)
    const ids = TOUR_STEPS.map((s) => s.id)
    for (const id of ['stats', 'board', 'gates', 'inventory', 'log']) {
      assert.ok(ids.includes(id), `missing step ${id}`)
    }
  })

  it('each step is one short sentence', () => {
    for (const step of TOUR_STEPS) {
      assert.ok(step.copy.trim().endsWith('.'), `${step.id} must end with a period`)
      assert.equal((step.copy.match(/\./g) || []).length, 1, `${step.id} must be one sentence`)
      assert.ok(step.copy.split(/\s+/).length <= 25, `${step.id} must be short`)
    }
  })

  it('total read time is under 30 seconds', () => {
    assert.ok(tourWordCount() <= 100, `${tourWordCount()} words exceeds 30s budget`)
  })

  it('routes are real app routes only', () => {
    const routes = new Set(TOUR_STEPS.map((s) => s.route))
    assert.deepEqual([...routes].sort(), ['/', '/log', 'quest'])
    assert.ok(stepMatchesRoute(TOUR_STEPS[0], '/'))
    assert.ok(stepMatchesRoute(TOUR_STEPS[2], '/quest/chevening-scholarship'))
    assert.ok(stepMatchesRoute(TOUR_STEPS[4], '/log'))
    assert.ok(!stepMatchesRoute(TOUR_STEPS[4], '/'))
  })
})

describe('tour sandbox', () => {
  it('rollback restores pre-tour progress byte-identical', () => {
    const before = {
      'grantquest.log': '{"quests":[{"questId":"q1"}],"xp":120}',
      'grantquest.profile': '{"level":"masters"}',
      'unrelated': 'keep-me',
    }
    const storage = memoryStorage(before)
    const snap = snapshotStorage(storage)
    // Tour demo-writes…
    storage.setItem('grantquest.log', '{"quests":[{"questId":"demo"}],"xp":25}')
    restoreStorage(storage, snap)
    assert.deepEqual(storage.raw(), before)
  })

  it('rollback removes keys the tour created', () => {
    const storage = memoryStorage({})
    const snap = snapshotStorage(storage)
    storage.setItem('grantquest.log', '{"quests":[],"xp":10}')
    restoreStorage(storage, snap)
    assert.deepEqual(storage.raw(), {})
  })

  it('touches only the quest log, never the profile', () => {
    assert.deepEqual([...TOUR_TOUCHED_KEYS], ['grantquest.log'])
  })

  it('dismissal persists and survives rollback', () => {
    const storage = memoryStorage({})
    assert.equal(isDismissed(storage), false)
    markDismissed(storage)
    assert.equal(isDismissed(storage), true)
    const snap = snapshotStorage(storage)
    restoreStorage(storage, snap)
    assert.equal(storage.getItem(TOUR_DISMISSED_KEY), '1')
  })
})
