'use client'

/**
 * First-login migration: silently imports the anonymous localStorage log
 * (`grantquest.log`) into the server log, once. Server rows win conflicts,
 * the local key is cleared afterwards, and the component never blocks UI.
 */

import {useEffect, useRef} from 'react'
import {useRouter} from 'next/navigation'
import {createClient} from '../lib/supabase/client'
import {migrateLocalLog, type LocalLogImportEntry} from '../lib/serverQuestLog'
import type {QuestState} from '../lib/questLog'

const KEY = 'grantquest.log'
const STATES: QuestState[] = [
  'discovered',
  'clearing',
  'gathering',
  'submitted',
  'awarded',
  'rejected',
]

export function MigrationRunner() {
  const router = useRouter()
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    let cancelled = false
    ;(async () => {
      try {
        const supabase = createClient()
        const {
          data: {session},
        } = await supabase.auth.getSession()
        if (!session || cancelled) return

        let raw: string | null = null
        try {
          raw = localStorage.getItem(KEY)
        } catch {
          return
        }
        if (!raw || cancelled) return

        let parsed: unknown = null
        try {
          parsed = JSON.parse(raw)
        } catch {
          return
        }
        const quests = (parsed as {quests?: unknown[]})?.quests
        if (!Array.isArray(quests) || quests.length === 0) {
          try {
            localStorage.removeItem(KEY)
          } catch {
            /* ignore */
          }
          return
        }

        const entries: LocalLogImportEntry[] = []
        for (const q of quests) {
          const e = q as {
            slug?: unknown
            questTitle?: unknown
            state?: unknown
            clearedGates?: unknown
            gatheredDocs?: unknown
            startedAt?: unknown
          }
          if (typeof e.slug !== 'string' || !e.slug) continue
          if (typeof e.questTitle !== 'string') continue
          if (!STATES.includes(e.state as QuestState)) continue
          entries.push({
            slug: e.slug,
            questTitle: e.questTitle,
            state: e.state as QuestState,
            clearedGates: Array.isArray(e.clearedGates)
              ? e.clearedGates.filter((g): g is string => typeof g === 'string')
              : [],
            gatheredDocs: Array.isArray(e.gatheredDocs)
              ? e.gatheredDocs.filter((d): d is string => typeof d === 'string')
              : [],
            startedAt:
              typeof e.startedAt === 'string' ? e.startedAt : new Date().toISOString(),
          })
        }

        if (entries.length > 0 && !cancelled) {
          await migrateLocalLog(entries)
        }
        if (cancelled) return
        try {
          localStorage.removeItem(KEY)
        } catch {
          /* ignore */
        }
        window.dispatchEvent(new Event('grantquest:xp'))
        router.refresh()
      } catch {
        // Silent: a failed migration must never break the page.
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
