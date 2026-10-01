const assert = require('node:assert/strict')
const {test} = require('node:test')
const {readFileSync, existsSync} = require('node:fs')
const {resolve, dirname} = require('node:path')
const {createRequire} = require('node:module')
const ts = require('../web/node_modules/typescript')
const {parse, evaluate} = require('../studio/node_modules/groq-js')

// Exercise the real TS exports without adding another test runner dependency.
function load(relativePath, mocks = {}) {
  const file = resolve(__dirname, '..', relativePath)
  const source = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: {module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX},
  }).outputText
  const nativeRequire = createRequire(file)
  const module = {exports: {}}
  const localRequire = (id) => {
    if (Object.hasOwn(mocks, id)) return mocks[id]
    if (id.startsWith('.')) {
      const base = resolve(dirname(file), id)
      const target = ['.ts', '.tsx'].map((ext) => base + ext).find(existsSync)
      if (target) return load(target, mocks)
    }
    return nativeRequire(id)
  }
  new Function('require', 'exports', 'module', source)(localRequire, module.exports, module)
  return module.exports
}

const rule = load('shared/freshness.ts')
const now = new Date('2026-10-01T12:00:00.000Z')
const cutoffs = rule.getFreshnessCutoffs(now)
const farDeadline = '2027-02-01T12:00:00.000Z'
const nearDeadline = '2026-10-06T12:00:00.000Z' // 5 days out — still fresh under the new rule
const recent = now.toISOString()
const old = '2026-08-02T12:00:00.000Z'
const passed = '2026-09-15T12:00:00.000Z' // deadline before `now`
const fixtures = [
  // The badge measures verification recency + whether the deadline has passed,
  // NOT deadline proximity. Deadline urgency is the countdown's job.
  ['verified today, deadline in 5 days', {lastVerified: recent, deadline: nearDeadline}, 'fresh'],
  ['verified today, deadline passed', {lastVerified: recent, deadline: passed}, 'stale'],
  ['verified 40 days ago, deadline far out', {lastVerified: old, deadline: farDeadline}, 'stale'],
  ['unset deadline, verified today', {lastVerified: recent}, 'fresh'],
  ['exact 30-day boundary', {lastVerified: cutoffs.staleCutoff}, 'fresh'],
  ['1ms older than 30 days', {lastVerified: '2026-09-01T11:59:59.999Z'}, 'stale'],
  ['deadline exactly now', {lastVerified: recent, deadline: cutoffs.nowCutoff}, 'fresh'],
  ['deadline 1ms ago', {lastVerified: recent, deadline: '2026-10-01T11:59:59.999Z'}, 'stale'],
  ['missing verification', {deadline: farDeadline}, 'stale'],
  ['null verification', {lastVerified: null}, 'stale'],
  ['invalid verification', {lastVerified: 'not-a-date'}, 'stale'],
  ['null deadline', {lastVerified: recent, deadline: null}, 'fresh'],
  ['invalid deadline', {lastVerified: recent, deadline: 'not-a-date'}, 'fresh'],
  ['timezone-equivalent boundary', {lastVerified: '2026-09-01T16:00:00+04:00'}, 'fresh'],
]

async function groq(query, dataset, params = cutoffs) {
  return (await evaluate(parse(query), {dataset, params})).get()
}

test('cutoffs use one clock instant and an exact 30-day decay window', () => {
  assert.deepEqual(cutoffs, {
    staleCutoff: '2026-09-01T12:00:00.000Z',
    nowCutoff: '2026-10-01T12:00:00.000Z',
  })
})

for (const [name, doc, expected] of fixtures) {
  test(`TS/GROQ parity: ${name}, independent of every review status`, async () => {
    for (const status of ['draft', 'inReview', 'verified', 'published', 'needsReverification', 'archived']) {
      const quest = {...doc, status}
      assert.equal(rule.getFreshness(quest, cutoffs), expected)
      const [result] = await groq(`*[]{${rule.FRESHNESS_PROJECTION}}`, [quest])
      assert.equal(result.freshness, expected)
    }
  })
}

test('board, detail and log queries all derive freshness and preserve visibility', async () => {
  const queries = load('web/lib/queries.ts', {'./sanity.client': {client: {}}})
  const dataset = [
    {_id: 'stale', _type: 'quest', status: 'published', slug: {current: 'stale'}, lastVerified: old, deadline: farDeadline},
    {_id: 'fresh', _type: 'quest', status: 'published', slug: {current: 'fresh'}, lastVerified: recent, deadline: farDeadline},
    {_id: 'review', _type: 'quest', status: 'inReview', lastVerified: old},
  ]
  const board = await groq(queries.QUESTS_QUERY, dataset)
  assert.deepEqual(board.map((q) => [q._id, q.freshness]), [['stale', 'stale'], ['fresh', 'fresh']])
  const detail = await groq(queries.QUEST_DETAIL_QUERY, dataset, {...cutoffs, slug: 'stale'})
  assert.equal(detail.freshness, 'stale')
  assert.equal(await groq(queries.QUEST_DETAIL_QUERY, dataset, {...cutoffs, slug: 'missing'}), null)
  const log = await groq(queries.LOG_QUESTS_QUERY, dataset)
  assert.deepEqual(log.map((q) => q.freshness), ['stale', 'fresh', 'stale'])
})

test('all fetch helpers supply fresh cutoff parameters and bypass the cache', async () => {
  const calls = []
  const queries = load('web/lib/queries.ts', {
    './sanity.client': {client: {fetch: async (...args) => { calls.push(args); return [] }}},
  })
  await queries.getQuests()
  await queries.getQuest('example')
  await queries.getLogQuests()
  assert.equal(calls.length, 3)
  for (const [, params, options] of calls) {
    assert.ok(Number.isFinite(Date.parse(params.staleCutoff)))
    assert.equal(Date.parse(params.nowCutoff) - Date.parse(params.staleCutoff), 30 * 86_400_000)
    assert.equal(options.cache, 'no-store')
  }
  assert.equal(calls[1][1].slug, 'example')
})

const studioMocks = {
  sanity: {useDocumentOperation: () => { throw new Error('Must not write workflow state') }},
  '@sanity/icons': {CheckmarkIcon: () => null, WarningOutlineIcon: () => null},
}

test('Studio badge turns red on a 60-days-old draft without changing published status', () => {
  const {questFreshnessBadge} = load('studio/verification.tsx', studioMocks)
  const published = {status: 'published', lastVerified: new Date().toISOString(), deadline: '2099-01-01T00:00:00Z'}
  assert.equal(questFreshnessBadge({published}).label, 'FRESH')
  const draft = {...published, lastVerified: new Date(Date.now() - 60 * 86_400_000).toISOString()}
  const badge = questFreshnessBadge({published, draft})
  assert.equal(badge.label, 'NEEDS RE-VERIFICATION')
  assert.equal(badge.color, 'danger')
  assert.equal(draft.status, published.status)
  assert.equal(questFreshnessBadge({published: null, draft: null}), null)
})

test('queue derives membership, preserves manual flags, and sorts stale first', async () => {
  const {VERIFICATION_QUEUE_QUERY} = load('studio/verificationQueue.ts', studioMocks)
  const dataset = [
    {_id: 'manual-fresh', _type: 'quest', status: 'needsReverification', lastVerified: recent, deadline: farDeadline},
    {_id: 'stale-late', _type: 'quest', status: 'published', lastVerified: old, deadline: '2027-03-01T00:00:00Z'},
    {_id: 'passed-deadline', _type: 'quest', status: 'inReview', lastVerified: recent, deadline: passed},
    {_id: 'fresh', _type: 'quest', status: 'published', lastVerified: recent, deadline: farDeadline},
    {_id: 'other', _type: 'eligibilityGate'},
  ]
  const queue = await groq(VERIFICATION_QUEUE_QUERY, dataset)
  assert.deepEqual(queue.map((q) => q._id), ['passed-deadline', 'stale-late', 'manual-fresh'])
})

test('web badge renders the projected value with no date evaluation', () => {
  const {FreshnessBadge} = load('web/components/FreshnessBadge.tsx')
  assert.equal(FreshnessBadge({freshness: 'stale'}).props.children, 'NEEDS RE-VERIFICATION')
  assert.equal(FreshnessBadge({freshness: 'fresh'}).props.children, 'FRESH')
})
