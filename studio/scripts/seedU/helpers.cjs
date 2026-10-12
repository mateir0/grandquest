/**
 * Shared helpers for seedBatches.cjs — same method as addScholarshipQuests.cjs.
 * Token: VITE_SANITY_WRITE_TOKEN from board/.env (fallback SANITY_AUTH_TOKEN). Never logged.
 */
const fs = require('fs')
const path = require('path')

const PROJECT_ID = 'aitdwcxh'
const DATASET = 'production'
const TAG = 'production'
const DEFINITION = 'quest-verification'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function readToken() {
  const envPath = path.join(__dirname, '..', '..', '..', 'board', '.env')
  try {
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*VITE_SANITY_WRITE_TOKEN\s*=\s*(.+?)\s*$/)
      if (m) return m[1].replace(/^["']|["']$/g, '')
    }
  } catch {
    /* fall through */
  }
  if (process.env.SANITY_AUTH_TOKEN) return process.env.SANITY_AUTH_TOKEN
  throw new Error('No write token: set VITE_SANITY_WRITE_TOKEN in board/.env or SANITY_AUTH_TOKEN.')
}

/** Compact gate/doc builders: g(title, gateType, {allowedValues,minValue,howToProve}). */
const g = (title, gateType, extra = {}) => ({title, gateType, ...extra})
const d = (title, description, tips) => ({
  title,
  ...(description ? {description} : {}),
  ...(tips ? {tips} : {}),
})

/** Portable-Text briefing from one or more paragraphs. */
function briefing(...paragraphs) {
  return paragraphs.map((text, i) => ({
    _type: 'block',
    _key: `b${i + 1}`,
    style: 'normal',
    markDefs: [],
    children: [{_type: 'span', _key: `s${i + 1}`, text, marks: []}],
  }))
}

function gateDoc(questId, i, gate) {
  return {
    _id: `gate-${questId}-${i + 1}`,
    _type: 'eligibilityGate',
    title: gate.title,
    gateType: gate.gateType,
    ...(gate.allowedValues ? {allowedValues: gate.allowedValues} : {}),
    ...(gate.minValue != null ? {minValue: gate.minValue} : {}),
    ...(gate.howToProve ? {howToProve: gate.howToProve} : {}),
  }
}

function documentDoc(questId, i, doc) {
  return {
    _id: `doc-${questId}-${i + 1}`,
    _type: 'requiredDocument',
    title: doc.title,
    ...(doc.description ? {description: doc.description} : {}),
    ...(doc.tips ? {tips: doc.tips} : {}),
  }
}

function slugify(title) {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

const refArray = (ids) => ids.map((_ref, i) => ({_key: `r${i + 1}`, _type: 'reference', _ref}))

async function getStage(engine, instanceId) {
  return engine.query({groq: `*[_id == "${instanceId}" && tag == $tag][0].currentStage`})
}

async function fireWithRetry(engine, instanceId, activity, action, attempts = 6) {
  let lastErr
  for (let a = 1; a <= attempts; a += 1) {
    try {
      await engine.fireAction({instanceId, activity, action})
      return
    } catch (err) {
      lastErr = err
      await sleep(1000 * a)
    }
  }
  throw lastErr
}

/** Walk an instance to `verified` through the real transitions. */
async function advanceToVerified(engine, instanceId, label) {
  for (let step = 0; step < 12; step += 1) {
    const stage = await getStage(engine, instanceId)
    if (stage === 'verified') return
    if (stage === 'unverified') await fireWithRetry(engine, instanceId, 'triage', 'start-review')
    else if (stage === 'underReview') await fireWithRetry(engine, instanceId, 'review', 'mark-verified')
    else throw new Error(`unexpected stage "${stage}" for ${label} (${instanceId})`)
  }
  throw new Error(`could not reach verified for ${label} (${instanceId})`)
}

module.exports = {
  PROJECT_ID,
  DATASET,
  TAG,
  DEFINITION,
  sleep,
  readToken,
  g,
  d,
  briefing,
  gateDoc,
  documentDoc,
  slugify,
  refArray,
  advanceToVerified,
}
