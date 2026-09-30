'use client'

import {useEffect, useState} from 'react'
import {
  getLog,
  advanceQuest,
  rejectQuest,
  STATE_LABEL,
  NEXT_STATE,
  getXp,
  levelFor,
} from '../../lib/questLog'

export default function LogPage() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const on = () => setTick((t) => t + 1)
    window.addEventListener('grantquest:xp', on)
    window.addEventListener('storage', on)
    return () => {
      window.removeEventListener('grantquest:xp', on)
      window.removeEventListener('storage', on)
    }
  }, [])

  // Re-read on every render (bumped by `tick`) — localStorage is client-only.
  const log = getLog()
  const xp = getXp()
  const level = levelFor(xp)
  const inPlay = log.quests.filter((q) =>
    ['discovered', 'clearing', 'gathering'].includes(q.state),
  ).length
  const submitted = log.quests.filter((q) => q.state === 'submitted').length

  if (log.quests.length === 0) {
    return (
      <div className="empty">
        <h2>No quests yet, adventurer. The board awaits →</h2>
        <p>
          Tick a gate or gather a document on any quest and it will be entered
          here automatically — or start one deliberately and watch the XP roll in.
        </p>
        <a className="btn primary" href="/#board">
          Back to the board →
        </a>
      </div>
    )
  }

  return (
    <>
      <div className="board-head">
        <div>
          <span className="eyebrow">Adventurer&apos;s record</span>
          <h1>Quest Log</h1>
          <p>
            {inPlay} quest{inPlay === 1 ? '' : 's'} in play · {submitted} submitted · Level{' '}
            {level} ({xp} XP)
          </p>
        </div>
      </div>

      <div className="section">
        {log.quests.map((q) => {
          const next = NEXT_STATE[q.state]
          const terminal = q.state === 'awarded' || q.state === 'rejected'
          return (
            <div key={q.questId} className="logcard">
              <div className="row">
                <div>
                  <strong>{q.questTitle}</strong>
                  <div className="state">STATE: {STATE_LABEL[q.state]}</div>
                  <div className="meta" style={{marginTop: '0.5rem'}}>
                    <span className="tag">Objectives: {q.clearedGates.length}</span>
                    <span className="tag">Equipment: {q.gatheredDocs.length}</span>
                  </div>
                </div>
                <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
                  <a className="btn ghost" href={`/quest/${q.slug}`}>
                    Review quest
                  </a>
                  {next && (
                    <button
                      className="btn primary"
                      onClick={() => {
                        advanceQuest(q.questId)
                        setTick((t) => t + 1)
                      }}
                    >
                      Advance to {STATE_LABEL[next]}
                    </button>
                  )}
                  {!terminal && (
                    <button
                      className="btn ghost"
                      onClick={() => {
                        rejectQuest(q.questId)
                        setTick((t) => t + 1)
                      }}
                    >
                      Mark rejected
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
