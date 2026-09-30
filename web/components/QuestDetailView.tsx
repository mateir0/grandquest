'use client'

import {useEffect, useState} from 'react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
import {Backpack, ScrollText, Star} from 'lucide-react'
import type {QuestDetail} from '../lib/queries'
import {deadlineLabel, deadlineTone, exactDeadline} from '../lib/deadline'
import {getLog, startQuest, toggleDoc, toggleGate} from '../lib/questLog'

/** Flattens Sanity portable-text blocks into paragraphs. */
function briefingParagraphs(description?: unknown[]): string[] {
  if (!Array.isArray(description)) return []
  return description
    .map((block) => {
      const b = block as {_type?: string; children?: {text?: string}[]}
      if (b?._type !== 'block') return ''
      return (b.children ?? []).map((child) => child.text ?? '').join('')
    })
    .filter((text) => text.trim().length > 0)
}

export function QuestDetailView({quest}: {quest: QuestDetail}) {
  const router = useRouter()
  const gates = quest.gates ?? []
  const documents = quest.documents ?? []
  const paragraphs = briefingParagraphs(quest.description)
  const tone = deadlineTone(quest.deadline)

  const [started, setStarted] = useState(false)
  const [cleared, setCleared] = useState<string[]>([])
  const [gathered, setGathered] = useState<string[]>([])

  // Read the quest log after mount — localStorage is not available during SSR.
  useEffect(() => {
    const entry = getLog().quests.find((e) => e.questId === quest._id)
    if (!entry) return
    setStarted(true)
    setCleared(entry.clearedGates)
    setGathered(entry.gatheredDocs)
  }, [quest._id])

  const onStart = () => {
    startQuest(quest._id, quest.title, quest.slug?.current ?? '')
    setStarted(true)
    router.push('/log')
  }

  const flipGate = (id: string) => {
    toggleGate(quest._id, id, {questTitle: quest.title, slug: quest.slug?.current ?? ''})
    setStarted(true)
    setCleared((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  const flipDoc = (id: string) => {
    toggleDoc(quest._id, id, {questTitle: quest.title, slug: quest.slug?.current ?? ''})
    setStarted(true)
    setGathered((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  return (
    <>
      <Link className="detail-back" href="/">
        <span aria-hidden="true">←</span> Back to quest board
      </Link>

      <header className="detail-head">
        {quest.featured && (
          <span className="ribbon">
            <Star size={12} aria-hidden="true" /> Featured
          </span>
        )}
        <h1>{quest.title}</h1>
        <div className="provider">{quest.provider}</div>

        <div className="hero-meta">
          {quest.amount && <span className="amount">{quest.amount}</span>}
          <div className={`countdown-hero ${tone}`}>
            <span className="countdown-label">Deadline</span>
            <span className="countdown-value" title={exactDeadline(quest.deadline)}>
              {deadlineLabel(quest.deadline)}
            </span>
          </div>
        </div>
      </header>

      {paragraphs.length > 0 && (
        <section className="briefing">
          <strong>Mission brief</strong>
          <div className="briefing-content">
            {paragraphs.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <h2>
          <ScrollText size={20} aria-hidden="true" /> Objectives — {cleared.length}/
          {gates.length} cleared
        </h2>
        {gates.length === 0 ? (
          <p className="muted-note">No gates recorded for this quest yet — check back soon.</p>
        ) : (
          gates.map((gate) => (
            <label
              key={gate._id}
              className={`objective${cleared.includes(gate._id) ? ' completed' : ''}`}
            >
              <input
                type="checkbox"
                checked={cleared.includes(gate._id)}
                onChange={() => flipGate(gate._id)}
              />
              <div className="objective-content">
                <div className="objective-header">
                  <span className="gtype">{gate.gateType}</span>
                  <span className="objective-title">{gate.title}</span>
                </div>
                {gate.howToProve && (
                  <p className="objective-how">How to prove it: {gate.howToProve}</p>
                )}
              </div>
            </label>
          ))
        )}
      </section>

      <section className="section">
        <h2>
          <Backpack size={20} aria-hidden="true" /> Inventory — {gathered.length}/
          {documents.length} gathered
        </h2>
        {documents.length === 0 ? (
          <p className="muted-note">No documents recorded for this quest yet — check back soon.</p>
        ) : (
          <div className="inventory-grid">
            {documents.map((doc) => (
              <label
                key={doc._id}
                className={`inventory-item${gathered.includes(doc._id) ? ' acquired' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={gathered.includes(doc._id)}
                  onChange={() => flipDoc(doc._id)}
                />
                <div className="inventory-content">
                  <div className="inventory-title">{doc.title}</div>
                  {doc.tips && <p className="inventory-tips">Tip: {doc.tips}</p>}
                </div>
              </label>
            ))}
          </div>
        )}
      </section>

      <div className="applybar">
        {!started ? (
          <button className="btn primary" onClick={onStart}>
            Start this quest
          </button>
        ) : (
          <button className="btn ghost" onClick={() => router.push('/log')}>
            View in quest log →
          </button>
        )}
        {quest.applyUrl && (
          <a className="btn ghost" href={quest.applyUrl} target="_blank" rel="noreferrer">
            Apply on provider site ↗
          </a>
        )}
      </div>
    </>
  )
}
