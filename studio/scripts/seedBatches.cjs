/**
 * Seed batches U1–U5 (48 new quests; Clarendon + Schwarzman deduped) into Sanity
 * production (project aitdwcxh) — same method as addScholarshipQuests.cjs.
 *
 * DATA HONESTY: every field was verified on an official source on 2026-10-12
 * (see data-research/batch-u*.md). Unknown facts are left unset — never
 * invented. Where the official page publishes no document list, `documents`
 * is an honest empty array. Deadlines are exact datetimes only where the
 * official source publishes them; otherwise the field is omitted and the
 * cycle status (open / closed / upcoming / not-yet-published, with session
 * label) lives in the briefing + verificationNotes.
 *
 * Per quest: createOrReplace the quest + its eligibilityGate /
 * requiredDocument references (deterministic ids → idempotent),
 * set lastVerified=now (UTC) and status=published, then create its
 * quest-verification workflow instance and drive it to `verified` through
 * the real transitions (unverified → underReview → verified).
 *
 * Run from repo root (or studio/):
 *   node studio/scripts/seedBatches.cjs            # dry run (includes live dedupe check)
 *   node studio/scripts/seedBatches.cjs --apply   # write
 */
const {createClient} = require('@sanity/client')
const {createEngine, refDataset, ENGINE_API_VERSION} = require('@sanity/workflow-engine')
const {
  PROJECT_ID,
  DATASET,
  TAG,
  DEFINITION,
  readToken,
  gateDoc,
  documentDoc,
  slugify,
  refArray,
  advanceToVerified,
} = require('./seedU/helpers.cjs')
const {U1} = require('./seedU/u1.cjs')
const {U2} = require('./seedU/u2.cjs')
const {U3} = require('./seedU/u3.cjs')
const {U4} = require('./seedU/u4.cjs')
const {U5} = require('./seedU/u5.cjs')

const APPLY = process.argv.includes('--apply')
const VERIFIED_AT = new Date().toISOString()

// Already on the board — must not duplicate (match by name/slug).
const SKIP = new Map([
  ['Clarendon Fund (Oxford)', 'quest-clarendon-oxford'],
  ['Schwarzman Scholars (China)', 'quest-schwarzman-scholars'],
])

const QUESTS = [...U1, ...U2, ...U3, ...U4, ...U5]

async function main() {
  const token = readToken()
  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: ENGINE_API_VERSION,
    token,
    useCdn: false,
    perspective: 'raw',
  })
  const engine = createEngine({
    client,
    workflowResource: {type: 'dataset', id: `${PROJECT_ID}.${DATASET}`},
    tag: TAG,
  })

  // Live dedupe: match by title/slug against what's already on the board.
  const existing = await client.fetch(
    '*[_type == "quest" && !(_id in path("drafts.**"))]{_id, title, slug}',
  )
  const existingTitles = new Set(existing.map((q) => (q.title || '').toLowerCase()))
  const existingSlugs = new Set(existing.map((q) => (q.slug && q.slug.current || '').toLowerCase()))
  console.log(`Board now holds ${existing.length} quests.`)

  const planned = []
  const skipped = []
  for (const q of QUESTS) {
    const slug = slugify(q.title)
    const dupe =
      existingTitles.has(q.title.toLowerCase()) ||
      existingSlugs.has(slug) ||
      existingSlugs.has(q._id.replace(/^quest-/, ''))
    if (dupe) {
      skipped.push(q)
      continue
    }
    planned.push({...q, slug})
  }
  for (const [label, id] of SKIP) {
    if (!skipped.some((q) => q.title.includes(label.split(' ')[0]))) {
      console.log(`NOTE: expected skip "${label}" (${id}) not found in batches — will check live board`)
    }
  }
  console.log(`Batches hold ${QUESTS.length} quests; ${skipped.length} already on board; ${planned.length} to seed.`)
  for (const q of skipped) console.log(`- SKIP (already on board): ${q.title}`)

  if (!APPLY) {
    console.log(`\nDRY RUN — ${planned.length} quests to seed:`)
    for (const q of planned) {
      console.log(
        `- [create] ${q.title} | deadline=${q.deadline || 'UNSET'} | level=${q.level || 'UNSET'} | countries=${(q.countries || []).join('+') || 'UNSET'} | gates=${q.gates.length} docs=${q.documents.length}`,
      )
    }
    console.log('\n(dry run — pass --apply to write)')
    return
  }

  const instances = await engine.query({
    groq: `*[_type == "sanity.workflow.instance" && tag == $tag && definition == "${DEFINITION}"]{_id, fields}`,
  })
  const instByDoc = new Map()
  for (const inst of instances) {
    const subject = (inst.fields || []).find((f) => f.name === 'subject')
    const gdr = subject && subject.value && subject.value.id
    if (gdr) instByDoc.set(gdr.split(':').pop(), inst)
  }

  for (const q of planned) {
    const gates = q.gates.map((gate, i) => gateDoc(q._id, i, gate))
    const docs = q.documents.map((doc, i) => documentDoc(q._id, i, doc))
    const tx = client.transaction()
    for (const gate of gates) tx.createOrReplace(gate)
    for (const doc of docs) tx.createOrReplace(doc)

    const base = {
      _id: q._id,
      _type: 'quest',
      title: q.title,
      slug: {_type: 'slug', current: q.slug},
      provider: q.provider,
      providerUrl: q.url,
      applyUrl: q.url,
      ...(q.level ? {level: q.level} : {}),
      ...(q.countries ? {countries: q.countries} : {}),
      amount: q.amount,
      ...(q.deadline ? {deadline: q.deadline} : {}),
      gates: refArray(gates.map((x) => x._id)),
      documents: refArray(docs.map((x) => x._id)),
      description: q.briefing,
      status: 'published',
      lastVerified: VERIFIED_AT,
      verificationNotes: q.verifyNote,
    }
    tx.createOrReplace(base)
    await tx.commit()

    let inst = instByDoc.get(q._id)
    if (!inst) {
      const {instance} = await engine.startInstance({
        definition: DEFINITION,
        initialFields: [
          {
            type: 'subject',
            name: 'subject',
            value: refDataset({projectId: PROJECT_ID, dataset: DATASET, documentId: q._id, type: 'quest'}),
          },
        ],
      })
      inst = {_id: instance._id}
    }
    await advanceToVerified(engine, inst._id, q.title)
    console.log(`created + verified: ${q.title}`)
  }

  const now = Date.now()
  const fresh = []
  const stale = []
  for (const q of planned) {
    const deadlinePassed = q.deadline && Date.parse(q.deadline) < now
    ;(deadlinePassed ? stale : fresh).push(q)
  }
  console.log(`\nFRESH (just stamped, deadline not passed): ${fresh.length}`)
  for (const q of fresh) console.log(`  + ${q.title} | deadline=${q.deadline || 'UNSET'}`)
  console.log(`NEEDS RE-VERIFICATION (deadline passed, expected): ${stale.length}`)
  for (const q of stale) console.log(`  - ${q.title} | deadline=${q.deadline || 'UNSET'}`)
  console.log(`\nDone — ${planned.length} quests seeded + verified; skipped ${skipped.length}; lastVerified=${VERIFIED_AT}`)
}

main().catch((err) => {
  console.error(err && err.message ? err.message : err)
  process.exit(1)
})
