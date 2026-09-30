'use client'

import {useEffect, useRef, useState} from 'react'
import {Compass, IdCard, RotateCcw} from 'lucide-react'
import type {PlayerProfile} from '../lib/matching'

const LEVELS = [
  {value: 'undergrad', label: 'Undergrad'},
  {value: 'masters', label: "Master's"},
  {value: 'phd', label: 'PhD'},
]

/** "Pakistan, India" → ['Pakistan', 'India']. */
function splitList(raw: string): string[] {
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

/** A number field, or undefined when blank / not a number. */
function parseNumber(raw: string): number | undefined {
  const trimmed = raw.trim()
  if (!trimmed) return undefined
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : undefined
}

/** True when a profile carries no information — treat it as "no profile". */
export function profileIsEmpty(p: PlayerProfile): boolean {
  return (
    !p.level &&
    p.nationalities.length === 0 &&
    p.fields.length === 0 &&
    p.languages.length === 0 &&
    p.gpa == null &&
    p.age == null
  )
}

interface Props {
  /** A previously saved profile to seed the form with (read after mount). */
  initial: PlayerProfile | null
  /** True once the stored profile has been read — the one moment we seed the form. */
  hydrated: boolean
  /** Fires on every edit with the freshly parsed profile. */
  onChange: (profile: PlayerProfile) => void
}

/**
 * The adventurer's character sheet. Edits are persisted to localStorage by the
 * board; typing emits the parsed profile immediately so every quest card's verdict
 * flips live — no submit button, no network.
 */
export function AdventurerProfile({initial, hydrated, onChange}: Props) {
  const [nationalities, setNationalities] = useState('')
  const [level, setLevel] = useState('')
  const [fields, setFields] = useState('')
  const [gpa, setGpa] = useState('')
  const [age, setAge] = useState('')
  const [languages, setLanguages] = useState('')

  // Seed from a stored profile exactly once, when storage finishes loading.
  // User edits set `initial` too, so seeding on `initial` alone would reformat
  // the field mid-typing — the `hydrated` gate keeps it to the load moment.
  const seeded = useRef(false)
  useEffect(() => {
    if (!hydrated || seeded.current) return
    seeded.current = true
    if (!initial) return
    setNationalities(initial.nationalities.join(', '))
    setLevel(initial.level)
    setFields(initial.fields.join(', '))
    setGpa(initial.gpa != null ? String(initial.gpa) : '')
    setAge(initial.age != null ? String(initial.age) : '')
    setLanguages(initial.languages.join(', '))
  }, [hydrated, initial])

  // Emit the parsed profile on every change. Skips the mount render so simply
  // opening the board never overwrites a stored profile.
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    onChange({
      nationalities: splitList(nationalities),
      level,
      fields: splitList(fields),
      gpa: parseNumber(gpa),
      age: parseNumber(age),
      languages: splitList(languages),
    })
  }, [nationalities, level, fields, gpa, age, languages, onChange])

  const hasAny = Boolean(
    nationalities || level || fields || gpa || age || languages,
  )

  const reset = () => {
    seeded.current = true // don't let the reset re-seed from `initial`
    setNationalities('')
    setLevel('')
    setFields('')
    setGpa('')
    setAge('')
    setLanguages('')
  }

  return (
    <section className="adventurer" aria-labelledby="adventurer-title">
      <header className="adventurer-head">
        <span className="adventurer-icon" aria-hidden="true">
          <IdCard size={22} />
        </span>
        <div className="adventurer-intro">
          <h2 id="adventurer-title">Create adventurer profile</h2>
          <p>
            Say who you are and the board lights up every quest whose gates you already
            clear. Kept in this browser — nothing is sent anywhere.
          </p>
        </div>
        {hasAny && (
          <button type="button" className="reset adventurer-reset" onClick={reset}>
            <RotateCcw size={14} aria-hidden="true" /> Clear
          </button>
        )}
      </header>

      <div className="adventurer-fields">
        <label className="field">
          <span>Nationalities</span>
          <input
            type="text"
            value={nationalities}
            onChange={(e) => setNationalities(e.target.value)}
            placeholder="e.g. Pakistan, India"
            autoComplete="off"
          />
        </label>

        <label className="field">
          <span>Study level</span>
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="">Select…</option>
            {LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Fields of study</span>
          <input
            type="text"
            value={fields}
            onChange={(e) => setFields(e.target.value)}
            placeholder="e.g. Computer Science"
            autoComplete="off"
          />
        </label>

        <label className="field">
          <span>GPA</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={gpa}
            onChange={(e) => setGpa(e.target.value)}
            placeholder="e.g. 3.4"
          />
        </label>

        <label className="field">
          <span>Age</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="e.g. 21"
          />
        </label>

        <label className="field">
          <span>Languages</span>
          <input
            type="text"
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
            placeholder="e.g. English, Urdu"
            autoComplete="off"
          />
        </label>
      </div>

      <p className="adventurer-note">
        <Compass size={13} aria-hidden="true" /> Gates the engine can&apos;t verify — like
        a citizenship list or a language test — stay open on the card and only ask you to
        prove them.
      </p>
    </section>
  )
}
