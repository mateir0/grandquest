'use server'

/**
 * Server-side quest log: the same state machine and XP values as the
 * localStorage log (`questLog.ts`), but persisted in Supabase Postgres
 * (`quest_progress` + `profiles.xp`) for logged-in users.
 *
 * Every mutation runs in a server action and revalidates `/log`.
 * Anonymous visitors never touch this module — they keep the
 * localStorage behavior in `questLog.ts` untouched.
 */

import {revalidatePath} from 'next/cache'
import {createClient} from './supabase/server'
import {NEXT_STATE, XP, type QuestState} from './questLog'

export type {QuestState}

export interface ServerQuestEntry {
  questSlug: string
  questTitle: string
  state: QuestState
  clearedGates: string[]
  gatheredDocs: string[]
  startedAt: string
}

export interface ServerLogData {
  quests: ServerQuestEntry[]
  xp: number
}

interface QuestProgressRow {
  quest_slug: string
  quest_title: string
  state: QuestState
  cleared_gates: string[] | null
  gathered_docs: string[] | null
  started_at: string
}

async function getUserId(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: {user},
  } = await supabase.auth.getUser()
  return user?.id ?? null
}

export async function getSessionUser(): Promise<{id: string; email: string} | null> {
  const supabase = createClient()
  const {
    data: {user},
  } = await supabase.auth.getUser()
  if (!user) return null
  return {id: user.id, email: user.email ?? ''}
}

function toEntry(row: QuestProgressRow): ServerQuestEntry {
  return {
    questSlug: row.quest_slug,
    questTitle: row.quest_title,
    state: row.state,
    clearedGates: row.cleared_gates ?? [],
    gatheredDocs: row.gathered_docs ?? [],
    startedAt: row.started_at,
  }
}

/** Logged-in users read ONLY the server log. Returns null when logged out. */
export async function getServerLog(): Promise<ServerLogData | null> {
  const supabase = createClient()
  const {
    data: {user},
  } = await supabase.auth.getUser()
  if (!user) return null

  const [{data: rows}, {data: profile}] = await Promise.all([
    supabase
      .from('quest_progress')
      .select('quest_slug, quest_title, state, cleared_gates, gathered_docs, started_at')
      .eq('user_id', user.id)
      .order('started_at', {ascending: true}),
    supabase.from('profiles').select('xp').eq('id', user.id).single(),
  ])

  return {
    quests: ((rows ?? []) as QuestProgressRow[]).map(toEntry),
    xp: (profile as {xp: number} | null)?.xp ?? 0,
  }
}

async function addXp(userId: string, delta: number) {
  if (delta <= 0) return
  const supabase = createClient()
  const {data: profile} = await supabase
    .from('profiles')
    .select('xp')
    .eq('id', userId)
    .single()
  const current = (profile as {xp: number} | null)?.xp ?? 0
  await supabase.from('profiles').update({xp: current + delta}).eq('id', userId)
}

export async function startQuestServer(questSlug: string, questTitle: string) {
  const userId = await getUserId()
  if (!userId || !questSlug) return
  const supabase = createClient()
  // Insert only — an existing row (any state) is left untouched.
  await supabase.from('quest_progress').upsert(
    {
      user_id: userId,
      quest_slug: questSlug,
      quest_title: questTitle,
      state: 'discovered',
      cleared_gates: [],
      gathered_docs: [],
    },
    {onConflict: 'user_id,quest_slug', ignoreDuplicates: true},
  )
  revalidatePath('/log')
}

export async function advanceQuestServer(questSlug: string) {
  const userId = await getUserId()
  if (!userId || !questSlug) return
  const supabase = createClient()
  const {data} = await supabase
    .from('quest_progress')
    .select('state')
    .eq('user_id', userId)
    .eq('quest_slug', questSlug)
    .single()
  const current = (data as {state: QuestState} | null)?.state
  if (!current) return
  const next = NEXT_STATE[current]
  if (!next) return
  await supabase
    .from('quest_progress')
    .update({state: next, updated_at: new Date().toISOString()})
    .eq('user_id', userId)
    .eq('quest_slug', questSlug)
  if (next === 'submitted') await addXp(userId, XP.submitted)
  if (next === 'awarded') await addXp(userId, XP.awarded)
  revalidatePath('/log')
}

export async function rejectQuestServer(questSlug: string) {
  const userId = await getUserId()
  if (!userId || !questSlug) return
  const supabase = createClient()
  const {data} = await supabase
    .from('quest_progress')
    .select('state')
    .eq('user_id', userId)
    .eq('quest_slug', questSlug)
    .single()
  const current = (data as {state: QuestState} | null)?.state
  if (!current || current === 'awarded' || current === 'rejected') return
  await supabase
    .from('quest_progress')
    .update({state: 'rejected', updated_at: new Date().toISOString()})
    .eq('user_id', userId)
    .eq('quest_slug', questSlug)
  revalidatePath('/log')
}

export async function toggleGateServer(
  questSlug: string,
  questTitle: string,
  gateId: string,
) {
  const userId = await getUserId()
  if (!userId || !questSlug || !gateId) return
  const supabase = createClient()
  const {data} = await supabase
    .from('quest_progress')
    .select('cleared_gates')
    .eq('user_id', userId)
    .eq('quest_slug', questSlug)
    .single()
  const row = data as {cleared_gates: string[] | null} | null
  if (!row) {
    // Mirrors local toggleGate: ticking before starting auto-creates the entry.
    await supabase.from('quest_progress').insert({
      user_id: userId,
      quest_slug: questSlug,
      quest_title: questTitle,
      state: 'discovered',
      cleared_gates: [gateId],
      gathered_docs: [],
    })
    await addXp(userId, XP.gateCleared)
  } else {
    const cleared = row.cleared_gates ?? []
    const exists = cleared.includes(gateId)
    const next = exists ? cleared.filter((g) => g !== gateId) : [...cleared, gateId]
    await supabase
      .from('quest_progress')
      .update({cleared_gates: next, updated_at: new Date().toISOString()})
      .eq('user_id', userId)
      .eq('quest_slug', questSlug)
    // Mirrors local: XP only on newly cleared gates, never refunded on untick.
    if (!exists) await addXp(userId, XP.gateCleared)
  }
  revalidatePath('/log')
}

export async function toggleDocServer(
  questSlug: string,
  questTitle: string,
  docId: string,
) {
  const userId = await getUserId()
  if (!userId || !questSlug || !docId) return
  const supabase = createClient()
  const {data} = await supabase
    .from('quest_progress')
    .select('gathered_docs')
    .eq('user_id', userId)
    .eq('quest_slug', questSlug)
    .single()
  const row = data as {gathered_docs: string[] | null} | null
  if (!row) {
    // Mirrors local toggleDoc: gathering before starting auto-creates the entry.
    await supabase.from('quest_progress').insert({
      user_id: userId,
      quest_slug: questSlug,
      quest_title: questTitle,
      state: 'discovered',
      cleared_gates: [],
      gathered_docs: [docId],
    })
    await addXp(userId, XP.documentGathered)
  } else {
    const gathered = row.gathered_docs ?? []
    const exists = gathered.includes(docId)
    const next = exists ? gathered.filter((d) => d !== docId) : [...gathered, docId]
    await supabase
      .from('quest_progress')
      .update({gathered_docs: next, updated_at: new Date().toISOString()})
      .eq('user_id', userId)
      .eq('quest_slug', questSlug)
    // Mirrors local: XP only on newly gathered docs, never refunded on untick.
    if (!exists) await addXp(userId, XP.documentGathered)
  }
  revalidatePath('/log')
}

export interface LocalLogImportEntry {
  slug: string
  questTitle: string
  state: QuestState
  clearedGates: string[]
  gatheredDocs: string[]
  startedAt: string
}

/**
 * One-shot first-login migration. Inserts each local entry ONLY where the
 * server has no row for that slug (server wins conflicts). Idempotent:
 * re-running inserts nothing. XP for newly imported rows is re-derived with
 * the same XP constants (gates × gateCleared + docs × documentGathered +
 * submitted/awarded bonuses).
 */
export async function migrateLocalLog(entries: LocalLogImportEntry[]) {
  const userId = await getUserId()
  if (!userId || entries.length === 0) return {imported: 0}
  const supabase = createClient()
  const {data: existing} = await supabase
    .from('quest_progress')
    .select('quest_slug')
    .eq('user_id', userId)
  const existingSlugs = new Set(
    ((existing ?? []) as {quest_slug: string}[]).map((r) => r.quest_slug),
  )
  const fresh = entries.filter((e) => e.slug && !existingSlugs.has(e.slug))
  if (fresh.length === 0) return {imported: 0}

  // ignoreDuplicates: concurrent runs insert nothing twice and error nothing —
  // server rows always win conflicts.
  const {data: inserted} = await supabase
    .from('quest_progress')
    .upsert(
      fresh.map((e) => ({
        user_id: userId,
        quest_slug: e.slug,
        quest_title: e.questTitle,
        state: e.state,
        cleared_gates: e.clearedGates,
        gathered_docs: e.gatheredDocs,
        started_at: e.startedAt || new Date().toISOString(),
      })),
      {onConflict: 'user_id,quest_slug', ignoreDuplicates: true},
    )
    .select('quest_slug')

  const insertedSlugs = new Set(
    ((inserted ?? []) as {quest_slug: string}[]).map((r) => r.quest_slug),
  )
  // Fall back to the pre-check list only when the driver returns no
  // representation (single-run path already guarantees idempotency).
  const counted =
    insertedSlugs.size > 0
      ? fresh.filter((e) => insertedSlugs.has(e.slug))
      : fresh

  let xpDelta = 0
  for (const e of counted) {
    xpDelta += e.clearedGates.length * XP.gateCleared
    xpDelta += e.gatheredDocs.length * XP.documentGathered
    if (e.state === 'submitted') xpDelta += XP.submitted
    if (e.state === 'awarded') xpDelta += XP.submitted + XP.awarded
  }
  await addXp(userId, xpDelta)
  revalidatePath('/log')
  return {imported: counted.length}
}
