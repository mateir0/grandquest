import Link from 'next/link'
import {Backpack, GraduationCap, Hourglass, LockOpen, MapPin, ScrollText, Star} from 'lucide-react'
import type {QuestCardData} from '../lib/queries'
import type {QuestUnlock} from '../lib/matching'
import {deadlineLabel, deadlineTone, exactDeadline} from '../lib/deadline'

const LEVEL_LABEL: Record<string, string> = {
  undergrad: 'Undergrad',
  masters: "Master's",
  phd: 'PhD',
}

/** One quest pinned to the board. The whole card is the link to the quest. */
export function QuestCard({quest, unlock}: {quest: QuestCardData; unlock?: QuestUnlock}) {
  const tone = deadlineTone(quest.deadline)
  const gates = quest.gateCount ?? 0
  const docs = quest.docCount ?? 0
  const countries = quest.countries ?? []
  const level = quest.level && quest.level !== 'any' ? LEVEL_LABEL[quest.level] ?? quest.level : null

  return (
    <Link
      className={`card${quest.featured ? ' featured' : ''}${unlock?.unlocked ? ' is-unlocked' : ''}`}
      href={`/quest/${quest.slug?.current ?? ''}`}
      aria-label={`${quest.title} — ${quest.provider}`}
    >
      {quest.featured && (
        <span className="ribbon">
          <Star size={12} aria-hidden="true" /> Featured
        </span>
      )}

      {(level || countries.length > 0) && (
        <div className="card-header">
          {level && (
            <span className="tag tag-level">
              <GraduationCap size={14} aria-hidden="true" /> {level}
            </span>
          )}
          {countries.map((country) => (
            <span key={country} className="tag tag-country">
              <MapPin size={14} aria-hidden="true" /> {country}
            </span>
          ))}
        </div>
      )}

      <h2 className="card-title">{quest.title}</h2>
      <div className="card-provider">{quest.provider}</div>
      {quest.amount && <div className="card-amount">{quest.amount}</div>}

      <div className="card-meta">
        <span className={`countdown-pill ${tone}`} title={exactDeadline(quest.deadline)}>
          <Hourglass size={13} aria-hidden="true" /> {deadlineLabel(quest.deadline)}
        </span>
        <span className={`tag tag-gate${gates === 0 ? ' is-empty' : ''}`}>
          <ScrollText size={13} aria-hidden="true" /> {gates} gate{gates === 1 ? '' : 's'}
        </span>
        <span className={`tag tag-doc${docs === 0 ? ' is-empty' : ''}`}>
          <Backpack size={13} aria-hidden="true" /> {docs} doc{docs === 1 ? '' : 's'}
        </span>
      </div>

      {unlock && (
        <div className={`verdict ${unlock.unlocked ? 'unlocked' : 'locked'}`}>
          {unlock.unlocked ? (
            <>
              <LockOpen size={14} aria-hidden="true" /> UNLOCKED — all gates clear
            </>
          ) : (
            <>
              {unlock.passed}/{unlock.passed + unlock.failed + unlock.manual} gates clear
              {unlock.manual ? ` · ${unlock.manual} need proof` : ''}
            </>
          )}
        </div>
      )}

      <span className="card-cta">
        Enter quest <span aria-hidden="true">→</span>
      </span>
    </Link>
  )
}
