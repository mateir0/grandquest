import {client} from './sanity.client'
import {
  FRESHNESS_PROJECTION,
  getFreshnessCutoffs,
  type Freshness,
} from './freshness'

export type {Freshness}

export interface Gate {
  _id: string
  title: string
  gateType: 'nationality' | 'degreeLevel' | 'fieldOfStudy' | 'minGPA' | 'languageTest' | 'ageLimit' | 'other'
  allowedValues?: string[]
  minValue?: number
  howToProve?: string
}

export interface QuestDoc {
  _id: string
  title: string
  slug: {current: string}
  provider: string
  level?: string
  countries?: string[]
  amount?: string
  deadline: string
  featured?: boolean
  freshness: Freshness
}

export interface QuestDetail extends QuestDoc {
  description?: unknown[]
  applyUrl: string
  gates: Gate[]
  documents: {_id: string; title: string; description?: string; tips?: string}[]
}

/**
 * A card on the board: the quest's headline fields, its gate/document counts, and
 * the resolved gates themselves so the client-side eligibility engine can score the
 * card against the player's profile without a second round-trip.
 */
export type QuestCardData = QuestDoc & {
  gateCount: number
  docCount: number
  gates?: Gate[]
}

export type LogQuest = Pick<QuestDoc, '_id' | 'freshness'>

/**
 * Board: published quests, soonest deadline first, with counts for the cards.
 * `coalesce` matters — a quest with no gates/documents has no such field at all,
 * and a bare `count()` on it projects null instead of 0.
 */
export const QUESTS_QUERY = `*[_type == "quest" && status == "published"] | order(deadline asc) {
  _id, title, slug, provider, level, countries, amount, deadline, featured,
  ${FRESHNESS_PROJECTION},
  "gateCount": coalesce(count(gates), 0),
  "docCount": coalesce(count(documents), 0),
  gates[]-> { _id, title, gateType, allowedValues, minValue, howToProve }
}`

/** Detail: one quest with gates + documents resolved (references -> full docs). */
export const QUEST_DETAIL_QUERY = `*[_type == "quest" && slug.current == $slug][0] {
  _id, title, slug, provider, level, countries, amount, deadline, featured,
  ${FRESHNESS_PROJECTION},
  description, applyUrl,
  gates[]-> { _id, title, gateType, allowedValues, minValue, howToProve },
  documents[]-> { _id, title, description, tips }
}`

/** Minimal quest data used to decorate browser-owned quest-log entries. */
export const LOG_QUESTS_QUERY = `*[_type == "quest"] {
  _id,
  ${FRESHNESS_PROJECTION}
}`

const NO_STORE = {cache: 'no-store' as const}

export async function getQuests(): Promise<QuestCardData[]> {
  return client.fetch(QUESTS_QUERY, getFreshnessCutoffs(), NO_STORE)
}

export async function getQuest(slug: string): Promise<QuestDetail | null> {
  return client.fetch(QUEST_DETAIL_QUERY, {...getFreshnessCutoffs(), slug}, NO_STORE)
}

export async function getLogQuests(): Promise<LogQuest[]> {
  return client.fetch(LOG_QUESTS_QUERY, getFreshnessCutoffs(), NO_STORE)
}
