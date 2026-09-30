/**
 * The player's quest log: which quests they've started, each quest's state,
 * and XP. Persisted in localStorage (no login needed for the demo).
 *
 * State machine: discovered → clearing → gathering → submitted → awarded | rejected
 */
export type QuestState =
  | 'discovered'
  | 'clearing'
  | 'gathering'
  | 'submitted'
  | 'awarded'
  | 'rejected'

export const NEXT_STATE: Record<QuestState, QuestState | null> = {
  discovered: 'clearing',
  clearing: 'gathering',
  gathering: 'submitted',
  submitted: 'awarded',
  awarded: null,
  rejected: null,
}

export const STATE_LABEL: Record<QuestState, string> = {
  discovered: 'Discovered',
  clearing: 'Clearing gates',
  gathering: 'Gathering docs',
  submitted: 'Submitted',
  awarded: 'Awarded',
  rejected: 'Rejected',
}

export const XP = {
  gateCleared: 10,
  documentGathered: 15,
  submitted: 50,
  awarded: 200,
} as const

export interface QuestLogEntry {
  questId: string
  questTitle: string
  slug: string
  state: QuestState
  clearedGates: string[] // gate _ids
  gatheredDocs: string[] // document _ids
  startedAt: string
}

export interface LogData {
  quests: QuestLogEntry[]
  xp: number
}

const KEY = 'grantquest.log'

function read(): LogData {
  if (typeof window === 'undefined') return {quests: [], xp: 0}
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as LogData) : {quests: [], xp: 0}
  } catch {
    return {quests: [], xp: 0}
  }
}

function write(data: LogData) {
  localStorage.setItem(KEY, JSON.stringify(data))
  window.dispatchEvent(new Event('grantquest:xp')) // XpBar listens
}

export function getLog(): LogData {
  return read()
}

export function getXp(): number {
  return read().xp
}

export function levelFor(xp: number): number {
  return Math.floor(xp / 100) + 1
}

function addXp(data: LogData, n: number) {
  data.xp += n
}

export function startQuest(questId: string, questTitle: string, slug: string) {
  const data = read()
  if (data.quests.some((q) => q.questId === questId)) return
  data.quests.push({
    questId,
    questTitle,
    slug,
    state: 'discovered',
    clearedGates: [],
    gatheredDocs: [],
    startedAt: new Date().toISOString(),
  })
  write(data)
}

/**
 * Ensure the quest is in the log (state: discovered) without awarding XP.
 * Used when a gate/document checkbox is ticked before the quest was started.
 */
export function ensureQuest(questId: string, questTitle: string, slug: string) {
  const data = read()
  let q = data.quests.find((x) => x.questId === questId)
  if (!q) {
    q = {
      questId,
      questTitle,
      slug,
      state: 'discovered',
      clearedGates: [],
      gatheredDocs: [],
      startedAt: new Date().toISOString(),
    }
    data.quests.push(q)
    write(data)
  }
  return read()
}

export function advanceQuest(questId: string) {
  const data = read()
  const q = data.quests.find((x) => x.questId === questId)
  if (!q) return
  const next = NEXT_STATE[q.state]
  if (!next) return
  q.state = next
  if (next === 'submitted') addXp(data, XP.submitted)
  if (next === 'awarded') addXp(data, XP.awarded)
  write(data)
}

export function rejectQuest(questId: string) {
  const data = read()
  const q = data.quests.find((x) => x.questId === questId)
  if (!q) return
  if (q.state === 'awarded' || q.state === 'rejected') return
  q.state = 'rejected'
  write(data)
}

export function toggleGate(
  questId: string,
  gateId: string,
  meta?: {questTitle: string; slug: string},
) {
  let data = read()
  let q = data.quests.find((x) => x.questId === questId)
  if (!q) {
    if (!meta) return
    q = {
      questId,
      questTitle: meta.questTitle,
      slug: meta.slug,
      state: 'discovered',
      clearedGates: [],
      gatheredDocs: [],
      startedAt: new Date().toISOString(),
    }
    data.quests.push(q)
  }
  const i = q.clearedGates.indexOf(gateId)
  if (i >= 0) q.clearedGates.splice(i, 1)
  else {
    q.clearedGates.push(gateId)
    addXp(data, XP.gateCleared)
  }
  write(data)
}

export function toggleDoc(
  questId: string,
  docId: string,
  meta?: {questTitle: string; slug: string},
) {
  let data = read()
  let q = data.quests.find((x) => x.questId === questId)
  if (!q) {
    if (!meta) return
    q = {
      questId,
      questTitle: meta.questTitle,
      slug: meta.slug,
      state: 'discovered',
      clearedGates: [],
      gatheredDocs: [],
      startedAt: new Date().toISOString(),
    }
    data.quests.push(q)
  }
  const i = q.gatheredDocs.indexOf(docId)
  if (i >= 0) q.gatheredDocs.splice(i, 1)
  else {
    q.gatheredDocs.push(docId)
    addXp(data, XP.documentGathered)
  }
  write(data)
}
