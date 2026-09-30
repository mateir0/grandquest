'use client'

import {useCallback, useEffect, useMemo, useState} from 'react'
import {LockOpen, Sparkles} from 'lucide-react'
import type {QuestCardData} from '../lib/queries'
import {
  clearProfile,
  loadProfile,
  questUnlocked,
  saveProfile,
  type PlayerProfile,
  type QuestUnlock,
} from '../lib/matching'
import {QuestCard} from './QuestCard'
import {AdventurerProfile, profileIsEmpty} from './AdventurerProfile'

const LEVELS = [
  {value: 'undergrad', label: 'Undergrad'},
  {value: 'masters', label: "Master's"},
  {value: 'phd', label: 'PhD'},
]

function deadlineValue(deadline?: string): number {
  const t = deadline ? new Date(deadline).getTime() : NaN
  return Number.isNaN(t) ? Number.MAX_SAFE_INTEGER : t
}

/**
 * The board itself: instant client-side filtering over quests fetched on the server.
 * Filters never hit the network, so results update as you type. The adventurer's
 * profile (localStorage) is scored against each quest's gates by the matching engine,
 * so a card's verdict flips the moment the profile changes.
 */
export function QuestBoard({quests}: {quests: QuestCardData[]}) {
  const [level, setLevel] = useState('')
  const [country, setCountry] = useState('')
  const [query, setQuery] = useState('')
  const [unlockedOnly, setUnlockedOnly] = useState(false)
  const [profile, setProfile] = useState<PlayerProfile | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Read the stored profile after mount — localStorage is client-only.
  useEffect(() => {
    const stored = loadProfile()
    if (stored && !profileIsEmpty(stored)) setProfile(stored)
    setHydrated(true)
  }, [])

  const handleProfile = useCallback((next: PlayerProfile) => {
    if (profileIsEmpty(next)) {
      clearProfile()
      setProfile(null)
      setUnlockedOnly(false)
      return
    }
    saveProfile(next)
    setProfile(next)
  }, [])

  // One verdict per quest, recomputed whenever the profile changes.
  const unlocks = useMemo(() => {
    const map = new Map<string, QuestUnlock>()
    if (!profile) return map
    for (const quest of quests) map.set(quest._id, questUnlocked(quest.gates ?? [], profile))
    return map
  }, [quests, profile])

  const unlockedCount = useMemo(
    () => [...unlocks.values()].filter((u) => u.unlocked).length,
    [unlocks],
  )

  const countries = useMemo(() => {
    const set = new Set<string>()
    for (const quest of quests) for (const c of quest.countries ?? []) set.add(c)
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [quests])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const matches = quests.filter((quest) => {
      // A quest with no level (or level "any") is open to every level.
      const questLevel = quest.level ?? ''
      if (level && questLevel && questLevel !== 'any' && questLevel !== level) return false
      if (country && !(quest.countries ?? []).includes(country)) return false
      if (needle) {
        const haystack = [quest.title, quest.provider, quest.amount, ...(quest.countries ?? [])]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(needle)) return false
      }
      if (unlockedOnly) {
        if (!unlocks.get(quest._id)?.unlocked) return false
      }
      return true
    })

    // Featured quests are pinned to the top; everything else follows by deadline.
    return matches.sort((a, b) => {
      const pinned = Number(Boolean(b.featured)) - Number(Boolean(a.featured))
      if (pinned !== 0) return pinned
      return deadlineValue(a.deadline) - deadlineValue(b.deadline)
    })
  }, [quests, level, country, query, unlockedOnly, unlocks])

  const filtersActive = Boolean(level || country || query.trim() || unlockedOnly)
  const clear = () => {
    setLevel('')
    setCountry('')
    setQuery('')
    setUnlockedOnly(false)
  }

  return (
    <section className="board" aria-label="Quest board">
      <AdventurerProfile initial={profile} hydrated={hydrated} onChange={handleProfile} />

      {profile && (
        <div className="unlocked-banner" role="status">
          <Sparkles size={17} aria-hidden="true" />
          <span>
            <strong>{unlockedCount}</strong> of {quests.length} quest
            {quests.length === 1 ? '' : 's'} unlock for your profile
          </span>
          <span className="unlocked-banner-hint">
            Verdicts are stamped on every card below.
          </span>
        </div>
      )}

      <div className="filters">
        <div className="field grow">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for quests..."
            aria-label="Search quests"
          />
        </div>

        <div className="field">
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            aria-label="Filter by study level"
          >
            <option value="">All study paths</option>
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            aria-label="Filter by region"
          >
            <option value="">All regions</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className={`unlocked-toggle${unlockedOnly ? ' active' : ''}`}
          onClick={() => setUnlockedOnly((v) => !v)}
          disabled={!profile}
          aria-pressed={unlockedOnly}
          title={
            profile
              ? 'Show only quests whose gates your profile already clears'
              : 'Set your adventurer profile to filter by unlock'
          }
        >
          <LockOpen size={15} aria-hidden="true" /> Unlocked only
        </button>

        {filtersActive && (
          <button type="button" className="reset" onClick={clear}>
            Clear
          </button>
        )}

        <span className="result-count" aria-live="polite">
          <strong>{visible.length}</strong> of {quests.length} quest{quests.length === 1 ? '' : 's'}
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="board-empty">
          <h2>No quests answer that call</h2>
          <p>
            {profile
              ? 'Nothing on the board matches this combination of unlock, study path, region and search. Widen your profile — or clear the filters and browse the full board.'
              : 'Nothing on the board matches this combination of study path, region and search. Loosen a filter — or clear them all and browse the full board.'}
          </p>
          <button type="button" className="btn primary" onClick={clear} style={{marginTop: '1.5rem'}}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid">
          {visible.map((quest) => (
            <QuestCard key={quest._id} quest={quest} unlock={unlocks.get(quest._id)} />
          ))}
        </div>
      )}
    </section>
  )
}
