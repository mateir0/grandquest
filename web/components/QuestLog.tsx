'use client'

import {useEffect, useState} from 'react'
import type {LogQuest} from '../lib/queries'
import {
  getLog,
  abandonQuest,
  advanceQuest,
  rejectQuest,
  STATE_LABEL,
  NEXT_STATE,
  getXp,
  levelFor,
  type QuestState,
} from '../lib/questLog'
import {
  abandonQuestServer,
  advanceQuestServer,
  getServerLog,
  rejectQuestServer,
  type ServerLogData,
} from '../lib/serverQuestLog'
import {FreshnessBadge} from './FreshnessBadge'

interface Row {
  key: string
  slug: string
  title: string
  state: QuestState
  cleared: number
  gathered: number
  questId: string | null
}

export function QuestLog({
  quests,
  serverLog,
}: {
  quests: LogQuest[]
  /** Present (even when empty) when logged in — server log is the only source. */
  serverLog?: ServerLogData | null
}) {
  const loggedIn = !!serverLog
  const [tick, setTick] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [remote, setRemote] = useState<ServerLogData | null>(serverLog ?? null)
  const [confirming, setConfirming] = useState<string | null>(null)
  const [pending, setPending] = useState<string | null>(null)
  const [wipeConfirm, setWipeConfirm] = useState(false)
  useEffect(() => {
    if (!confirming && !wipeConfirm) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setConfirming(null)
        setWipeConfirm(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirming, wipeConfirm])
  useEffect(() => {
    setRemote(serverLog ?? null)
  }, [serverLog])

  useEffect(() => {
    const on = async () => {
      // Server mutations fire no storage events — re-read the server log.
      if (loggedIn) {
        const fresh = await getServerLog()
        if (fresh) setRemote(fresh)
      }
      setTick((t) => t + 1)
    }
    setMounted(true)
    window.addEventListener('grantquest:xp', on)
    window.addEventListener('storage', on)
    return () => {
      window.removeEventListener('grantquest:xp', on)
      window.removeEventListener('storage', on)
    }
  }, [loggedIn])

  // Re-read on every render (bumped by `tick`) — localStorage is client-only.
  // The fallback also keeps the server and first client render identical.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void tick
  let rows: Row[]
  let xp: number
  if (loggedIn) {
    const list = remote?.quests ?? []
    rows = list.map((q) => ({
      key: q.questSlug,
      slug: q.questSlug,
      title: q.questTitle,
      state: q.state,
      cleared: q.clearedGates.length,
      gathered: q.gatheredDocs.length,
      questId: null,
    }))
    xp = remote?.xp ?? 0
  } else {
    const log = mounted ? getLog() : {quests: [], xp: 0}
    rows = log.quests.map((q) => ({
      key: q.questId,
      slug: q.slug,
      title: q.questTitle,
      state: q.state,
      cleared: q.clearedGates.length,
      gathered: q.gatheredDocs.length,
      questId: q.questId,
    }))
    xp = mounted ? getXp() : 0
  }
  const level = levelFor(xp)
  const freshnessById = new Map(quests.map((quest) => [quest._id, quest.freshness]))
  const freshnessBySlug = new Map(
    quests
      .filter((quest) => quest.slug?.current)
      .map((quest) => [quest.slug!.current, quest.freshness]),
  )
  const inPlay = rows.filter((q) =>
    ['discovered', 'clearing', 'gathering'].includes(q.state),
  ).length
  const submitted = rows.filter((q) => q.state === 'submitted').length

  const abandon = async (row: Row) => {
    if (loggedIn) {
      setPending(row.key)
      try {
        await abandonQuestServer(row.slug)
        const fresh = await getServerLog()
        if (fresh) setRemote(fresh)
        window.dispatchEvent(new Event('grantquest:xp'))
      } finally {
        setPending(null)
      }
    } else {
      if (row.questId) abandonQuest(row.questId)
      setTick((t) => t + 1)
    }
    setConfirming(null)
  }

  /** Runs a server mutation with pending treatment — no double-submits. */
  const runServer = async (key: string, fn: () => Promise<void>) => {
    setPending(key)
    try {
      await fn()
      const fresh = await getServerLog()
      if (fresh) setRemote(fresh)
      window.dispatchEvent(new Event('grantquest:xp'))
    } finally {
      setPending(null)
    }
  }

  if (!mounted && !loggedIn) {
    // Local log isn't readable before mount — skeleton, never an empty flash.
    return (
      <>
        <div className="board-head" aria-busy="true" aria-label="Loading quest log">
          <div>
            <span className="eyebrow">Adventurer&apos;s record</span>
            <h1>Quest Log</h1>
            <div className="sk sk-sub" style={{width: '18rem'}} />
          </div>
        </div>
        <div className="section" aria-hidden="true">
          {Array.from({length: 2}).map((_, i) => (
            <div className="logcard" key={i}>
              <div className="sk sk-title" style={{width: '60%'}} />
              <div className="sk sk-sub" style={{width: '30%'}} />
              <div className="sk sk-meta" style={{width: '80%'}} />
            </div>
          ))}
        </div>
      </>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="empty">
        <h1>No quests yet, adventurer. The board awaits →</h1>
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
        {rows.map((q) => {
          const next = NEXT_STATE[q.state]
          const terminal = q.state === 'awarded' || q.state === 'rejected'
          const freshness =
            freshnessBySlug.get(q.slug) ??
            (q.questId ? freshnessById.get(q.questId) : undefined)
          return (
            <div key={q.key} className="logcard">
              <div className="row">
                <div>
                  <strong>{q.title}</strong>
                  <div className="state">STATE: {STATE_LABEL[q.state]}</div>
                  <div className="meta" style={{marginTop: '0.5rem'}}>
                    {freshness && <FreshnessBadge freshness={freshness} />}
                    <span className="tag">Objectives: {q.cleared}</span>
                    <span className="tag">Equipment: {q.gathered}</span>
                  </div>
                </div>
                <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
                  <a className="btn ghost" href={`/quest/${q.slug}`}>
                    Review quest
                  </a>
                  {next && (
                    <button
                      className="btn primary"
                      disabled={loggedIn && pending === q.key}
                      onClick={() => {
                        if (loggedIn) {
                          void runServer(q.key, () => advanceQuestServer(q.slug))
                        } else {
                          if (q.questId) advanceQuest(q.questId)
                          setTick((t) => t + 1)
                        }
                      }}
                    >
                      {loggedIn && pending === q.key
                        ? 'Advancing…'
                        : `Advance to ${STATE_LABEL[next]}`}
                    </button>
                  )}
                  {!terminal && (
                    <button
                      className="btn ghost"
                      disabled={loggedIn && pending === q.key}
                      onClick={() => {
                        if (loggedIn) {
                          void runServer(q.key, () => rejectQuestServer(q.slug))
                        } else {
                          if (q.questId) rejectQuest(q.questId)
                          setTick((t) => t + 1)
                        }
                      }}
                    >
                      {loggedIn && pending === q.key ? 'Rejecting…' : 'Mark rejected'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setConfirming(q.key)}
                    style={{
                      background: 'none',
                      border: 0,
                      padding: 0,
                      minHeight: 0,
                      cursor: 'pointer',
                      alignSelf: 'center',
                      color: 'var(--muted)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.85rem',
                      textDecoration: 'underline',
                    }}
                  >
                    Abandon quest
                  </button>
                </div>
                {confirming === q.key && (
                  <div style={{marginTop: '0.75rem'}}>
                    <p className="muted-note" style={{marginBottom: '0.5rem'}}>
                      Abandon this quest? Your progress on it will be lost.
                    </p>
                    <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
                      <button
                        className="btn ghost"
                        disabled={loggedIn && pending === q.key}
                        onClick={() => abandon(q)}
                      >
                        {loggedIn && pending === q.key ? 'Abandoning…' : 'Abandon'}
                      </button>
                      <button className="btn primary" onClick={() => setConfirming(null)} autoFocus>
                        Keep quest
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      {!loggedIn && rows.length > 0 && (
        <div style={{marginTop: '0.75rem'}}>
          {!wipeConfirm ? (
            <button
              type="button"
              onClick={() => setWipeConfirm(true)}
              style={{
                background: 'none',
                border: 0,
                padding: 0,
                minHeight: 0,
                cursor: 'pointer',
                color: 'var(--muted)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                textDecoration: 'underline',
              }}
            >
              Delete my data
            </button>
          ) : (
            <div>
              <p className="muted-note" style={{marginBottom: '0.5rem'}}>
                Delete your local quest log? This cannot be undone.
              </p>
              <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
                <button
                  className="btn ghost"
                  onClick={() => {
                    try {
                      localStorage.removeItem('grantquest.log')
                    } catch {
                      /* ignore */
                    }
                    setWipeConfirm(false)
                    window.dispatchEvent(new Event('grantquest:xp'))
                    setTick((t) => t + 1)
                  }}
                >
                  Delete everything
                </button>
                <button
                  className="btn primary"
                  onClick={() => setWipeConfirm(false)}
                  autoFocus
                >
                  Keep my data
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}
