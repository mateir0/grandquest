import type {Gate} from './queries'

/**
 * The eligibility engine. Evaluates a player profile against a quest's gates
 * WITHOUT guessing — every rule comes from the gate's typed fields:
 *  - nationality / degreeLevel / fieldOfStudy → pass if profile value ∈ allowedValues
 *  - minGPA / ageLimit → pass if profile number meets minValue
 *  - languageTest / other → manual (can't be auto-verified, shown with howToProve)
 */
export interface PlayerProfile {
  nationalities: string[]
  level: string // 'undergrad' | 'masters' | 'phd'
  fields: string[]
  gpa?: number
  age?: number
  languages: string[]
}

export type GateVerdict = 'pass' | 'fail' | 'manual'

export function evaluateGate(gate: Gate, profile: PlayerProfile): GateVerdict {
  switch (gate.gateType) {
    case 'nationality':
      if (!gate.allowedValues?.length) return 'manual'
      return profile.nationalities.some((n) =>
        gate.allowedValues!.some((a) => a.toLowerCase() === n.toLowerCase()),
      )
        ? 'pass'
        : 'fail'
    case 'degreeLevel':
      if (!gate.allowedValues?.length) return 'manual'
      return gate.allowedValues.some((a) => a.toLowerCase() === profile.level.toLowerCase())
        ? 'pass'
        : 'fail'
    case 'fieldOfStudy':
      if (!gate.allowedValues?.length) return 'pass' // open to all fields
      return profile.fields.some((f) =>
        gate.allowedValues!.some((a) => a.toLowerCase() === f.toLowerCase()),
      )
        ? 'pass'
        : 'fail'
    case 'minGPA':
      if (gate.minValue == null || profile.gpa == null) return 'manual'
      return profile.gpa >= gate.minValue ? 'pass' : 'fail'
    case 'ageLimit':
      if (gate.minValue == null || profile.age == null) return 'manual'
      return profile.age <= gate.minValue ? 'pass' : 'fail'
    case 'languageTest':
    case 'other':
    default:
      return 'manual'
  }
}

export interface QuestUnlock {
  unlocked: boolean // no FAIL gates (manual gates don't block)
  passed: number
  failed: number
  manual: number
  failedGateTitles: string[]
}

/** A quest unlocks when zero gates FAIL. Manual gates never block — they need proof. */
export function questUnlocked(gates: Gate[], profile: PlayerProfile): QuestUnlock {
  let passed = 0,
    failed = 0,
    manual = 0
  const failedGateTitles: string[] = []
  for (const gate of gates) {
    const v = evaluateGate(gate, profile)
    if (v === 'pass') passed++
    else if (v === 'fail') {
      failed++
      failedGateTitles.push(gate.title)
    } else manual++
  }
  return {unlocked: failed === 0, passed, failed, manual, failedGateTitles}
}

const PROFILE_KEY = 'grantquest.profile'

export function loadProfile(): PlayerProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? (JSON.parse(raw) as PlayerProfile) : null
  } catch {
    return null
  }
}

export function saveProfile(p: PlayerProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p))
}

/** Forget the saved profile entirely — the board drops back to its neutral state. */
export function clearProfile() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(PROFILE_KEY)
}
