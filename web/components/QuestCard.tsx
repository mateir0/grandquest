'use client'

import {useState} from 'react'
import Link from 'next/link'
import {Backpack, GraduationCap, Hourglass, LockOpen, MapPin, ScrollText, Star} from 'lucide-react'
import type {QuestCardData} from '../lib/queries'
import type {QuestUnlock} from '../lib/matching'
import {deadlineLabel, deadlineTone, exactDeadline} from '../lib/deadline'
import {FreshnessBadge} from './FreshnessBadge'
import {QuietButton} from './QuietButton'

const LEVEL_LABEL: Record<string, string> = {
  undergrad: 'Undergrad',
  masters: "Master's",
  phd: 'PhD',
}

const EXCERPT_MAX = 140

/**
 * Short excerpt cut at a sentence boundary. Decimal points (e.g. 7,171.11)
 * never count as sentence ends. Returns the full text when it already fits
 * — the expander only appears when something was actually cut.
 */
function excerptOf(text: string, max: number = EXCERPT_MAX): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const parts = clean.split(/(?<=[.!?])\s+/)
  const sentences: string[] = []
  for (const part of parts) {
    const last = sentences[sentences.length - 1]
    if (last && /\d[.!?]$/.test(last) && /^\d/.test(part)) {
      sentences[sentences.length - 1] = `${last} ${part}`
    } else {
      sentences.push(part)
    }
  }
  let out = ''
  for (const s of sentences) {
    const next = out ? `${out} ${s}` : s
    if (next.length > max) break
    out = next
  }
  if (!out) return `${clean.slice(0, max).trimEnd()}…`
  return out
}

/**
 * One quest pinned to the board: title, sponsor, freshness, a short excerpt
 * with an inline expander, one merged row of keyword bubbles, and the
 * Enter-quest link. Plain article root (an expander button cannot live
 * inside a link), so the title and the Enter-quest CTA are the two links.
 */
export function QuestCard({quest, unlock}: {quest: QuestCardData; unlock?: QuestUnlock}) {
  const [expanded, setExpanded] = useState(false)
  const tone = deadlineTone(quest.deadline)
  const gates = quest.gateCount ?? 0
  const docs = quest.docCount ?? 0
  const countries = quest.countries ?? []
  const level = quest.level && quest.level !== 'any' ? LEVEL_LABEL[quest.level] ?? quest.level : null
  const href = `/quest/${quest.slug?.current ?? ''}`
  const amount = (quest.amount ?? '').replace(/\s+/g, ' ').trim()
  const excerpt = amount ? excerptOf(amount) : ''
  const truncated = excerpt !== amount

  return (
    <article
      className={`card${quest.featured ? ' featured' : ''}${unlock?.unlocked ? ' is-unlocked' : ''}`}
    >
      {quest.featured && (
        <span className="ribbon">
          <Star size={12} aria-hidden="true" /> Featured
        </span>
      )}

      <h2 className="card-title">
        <Link
          href={href}
          style={{color: 'inherit', textDecoration: 'none'}}
          aria-label={`${quest.title} — ${quest.provider}`}
        >
          {quest.title}
        </Link>
      </h2>
      <div className="card-provider">{quest.provider}</div>
      <div className="freshness-row">
        <FreshnessBadge freshness={quest.freshness} />
      </div>

      {amount && (
        <div className="card-amount">
          {expanded ? amount : excerpt}
          {truncated && (
            <>
              {' '}
              <QuietButton
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                aria-label={expanded ? 'Show less of the award details' : 'Read more of the award details'}
              >
                {expanded ? 'Show less' : 'Read more'}
              </QuietButton>
            </>
          )}
        </div>
      )}

      <div className="card-meta">
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

      <Link
        className="card-cta"
        href={href}
        style={{textDecoration: 'none'}}
        aria-label={`Enter quest: ${quest.title}`}
      >
        Enter quest <span aria-hidden="true">→</span>
      </Link>
    </article>
  )
}
