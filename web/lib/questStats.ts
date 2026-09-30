import {cache} from 'react'
import {getQuests, type QuestCardData} from './queries'
import {deadlineLabel, deadlineTone, exactDeadline, type DeadlineTone} from './deadline'

export interface QuestLoad {
  quests: QuestCardData[]
  failed: boolean
}

/**
 * One Sanity fetch per request, shared by the hero stats panel and the board.
 * React's cache() dedupes the call across server components in the same render,
 * so the hero never triggers a second network round-trip.
 */
export const loadQuests = cache(async (): Promise<QuestLoad> => {
  try {
    return {quests: await getQuests(), failed: false}
  } catch {
    return {quests: [], failed: true}
  }
})

export interface HeroStats {
  questCount: number
  countryCount: number
  nearest?: {
    label: string
    tone: DeadlineTone
    exact?: string
  }
}

/**
 * Summarises the quests that were actually fetched. Every number traces back to
 * real document data — nothing here is hardcoded or invented.
 */
export function summariseQuests(quests: QuestCardData[]): HeroStats {
  const countries = new Set<string>()
  for (const quest of quests) {
    for (const country of quest.countries ?? []) countries.add(country)
  }

  const dated = quests
    .map((quest) => ({
      quest,
      time: quest.deadline ? new Date(quest.deadline).getTime() : Number.NaN,
    }))
    .filter((entry) => !Number.isNaN(entry.time))
    .sort((a, b) => a.time - b.time)

  const now = Date.now()
  const nearest = dated.find((entry) => entry.time >= now)?.quest ?? dated[dated.length - 1]?.quest

  return {
    questCount: quests.length,
    countryCount: countries.size,
    nearest: nearest
      ? {
          label: deadlineLabel(nearest.deadline),
          tone: deadlineTone(nearest.deadline),
          exact: exactDeadline(nearest.deadline),
        }
      : undefined,
  }
}
