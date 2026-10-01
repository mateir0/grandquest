import {Suspense, useCallback, useEffect, useMemo, useState} from 'react'
import {
  useDocumentProjection,
  useDocuments,
  type DocumentHandle,
} from '@sanity/sdk-react'
import {
  Cog,
  Flag,
  Hourglass,
  ScrollText,
  ShieldCheck,
  Stamp,
} from 'lucide-react'
import {getFreshness, getFreshnessCutoffs, type Freshness} from './freshness'
import {readClient, writeToken} from './sanity'
import {flagQuest, listInstances, verifyQuest, type TapResult} from './workflow'

interface QuestFields {
  _id: string
  title?: string
  provider?: string
  level?: string
  countries?: string[]
  amount?: string
  deadline?: string | null
  status?: string
  lastVerified?: string | null
  featured?: boolean
  slug?: string
}

interface SweepRow {
  _id: string
  ranAt: string
  reason: string
  questTitle?: string
}

/** Mirrors studio/verificationQueue.ts: manual flags + derived stale rows. */
const QUEUE_QUERY = `*[
  _type == "quest" && (status == "needsReverification" || (!defined(lastVerified) || dateTime(lastVerified) == null || dateTime(lastVerified) < dateTime($staleCutoff) || (defined(deadline) && dateTime(deadline) != null && dateTime(deadline) < dateTime($nowCutoff))))
] {_id, title, deadline, status, lastVerified}
  | order(dateTime(deadline) asc, _id asc)`

const QUEST_PROJECTION = `{_id, title, provider, level, countries, amount, deadline, status, lastVerified, featured, "slug": slug.current}`

function daysLeft(deadline?: string | null): string {
  if (!deadline) return 'no date set'
  const ms = Date.parse(deadline) - Date.now()
  const days = Math.ceil(ms / 86_400_000)
  if (days < 0) return `${Math.abs(days)} days past`
  if (days === 0) return 'due today'
  return `${days} days left`
}

function StageChip({stage}: {stage: string | undefined}) {
  if (stage === undefined)
    return <span className="chip chip-dim">workflow: hidden (no token)</span>
  return <span className={`chip stage-${stage}`}>workflow: {stage}</span>
}

function FreshnessBadge({value}: {value: Freshness}) {
  return value === 'fresh' ? (
    <span className="chip badge-fresh">FRESH</span>
  ) : (
    <span className="chip badge-stale">NEEDS RE-VERIFICATION</span>
  )
}

function QuestCard({
  handle,
  stage,
  busy,
  onVerify,
  onFlag,
}: {
  handle: DocumentHandle
  stage: string | undefined
  busy: boolean
  onVerify: (questId: string) => void
  onFlag: (questId: string) => void
}) {
  const {data} = useDocumentProjection({...handle, projection: QUEST_PROJECTION})
  const quest = (data ?? {}) as QuestFields
  const cutoffs = useMemo(() => getFreshnessCutoffs(), [])
  const freshness = getFreshness(quest, cutoffs)
  const urgent =
    quest.deadline != null && Date.parse(quest.deadline) - Date.now() < 30 * 86_400_000

  return (
    <article className={`quest-card${quest.featured ? ' featured' : ''}`}>
      <div className="quest-head">
        <h3>{quest.title ?? 'Untitled quest'}</h3>
        {quest.featured ? <span className="chip plate-featured">Featured</span> : null}
      </div>
      <p className="quest-provider">{quest.provider ?? 'Unknown provider'}</p>
      <p className="quest-meta mono">
        {quest.amount ?? '—'} · {daysLeft(quest.deadline)}
        {quest.countries?.length ? ` · ${quest.countries.join(', ')}` : ''}
        {quest.level ? ` · ${quest.level}` : ''}
      </p>
      <div className="chip-row">
        <StageChip stage={stage} />
        <span className="chip chip-dim">record: {quest.status ?? '—'}</span>
        <FreshnessBadge value={freshness} />
        <span className={`chip chronometer${urgent ? ' urgent' : ''}`}>
          {daysLeft(quest.deadline)}
        </span>
      </div>
      <p className="quest-id mono">{quest._id}</p>
      <div className="quest-actions">
        <button
          type="button"
          className="btn btn-brass"
          disabled={busy || !writeToken()}
          onClick={() => quest._id && onVerify(quest._id)}
          title={
            writeToken()
              ? 'Verify: workflow → verified, stamp lastVerified, status=published'
              : 'Add VITE_SANITY_WRITE_TOKEN to board/.env first'
          }
        >
          <Stamp size={14} /> Verify
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={busy || !writeToken()}
          onClick={() => quest._id && onFlag(quest._id)}
          title={
            writeToken()
              ? 'Flag: workflow → unverified, legacy status untouched'
              : 'Add VITE_SANITY_WRITE_TOKEN to board/.env first'
          }
        >
          <Flag size={14} /> Flag
        </button>
      </div>
    </article>
  )
}

export function Board() {
  const {data, hasMore, isPending, loadMore} = useDocuments({
    documentType: 'quest',
    batchSize: 25,
    orderings: [{field: 'deadline', direction: 'asc'}],
  })
  const handles = useMemo(() => data ?? [], [data])

  const [stages, setStages] = useState<Map<
    string,
    {instanceId: string; stage: string}
  > | null>(null)
  const [stagesError, setStagesError] = useState<string | null>(null)
  const [queue, setQueue] = useState<QuestFields[]>([])
  const [sweeps, setSweeps] = useState<SweepRow[]>([])
  const [busyId, setBusyId] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const hasToken = Boolean(writeToken())

  const refreshStages = useCallback(() => {
    if (!writeToken()) return
    listInstances()
      .then((map) => {
        setStages(map)
        setStagesError(null)
      })
      .catch((cause: unknown) => {
        setStagesError(cause instanceof Error ? cause.message : String(cause))
      })
  }, [])

  const refreshQueue = useCallback(() => {
    readClient
      .fetch<QuestFields[]>(QUEUE_QUERY, getFreshnessCutoffs())
      .then(setQueue)
      .catch(() => setQueue([]))
  }, [])

  useEffect(() => {
    refreshStages()
  }, [refreshStages])

  useEffect(() => {
    refreshQueue()
  }, [refreshQueue])

  useEffect(() => {
    readClient
      .fetch<SweepRow[]>(
        `*[_type == "sweepLog"] | order(ranAt desc)[0..7]{_id, ranAt, reason, "questTitle": quest->title}`,
      )
      .then(setSweeps)
      .catch(() => setSweeps([]))
  }, [])

  const tap = useCallback(
    async (questId: string, kind: 'verify' | 'flag') => {
      setBusyId(questId)
      setNotice(null)
      try {
        const result: TapResult =
          kind === 'verify' ? await verifyQuest(questId) : await flagQuest(questId)
        setNotice(
          `${kind === 'verify' ? 'Expedition complete' : 'Flagged'} — ${result.questId.slice(0, 8)}…: ${result.note}`,
        )
        refreshStages()
        refreshQueue()
      } catch (cause: unknown) {
        setNotice(`Tap failed: ${cause instanceof Error ? cause.message : String(cause)}`)
      } finally {
        setBusyId(null)
      }
    },
    [refreshStages, refreshQueue],
  )

  const onVerify = useCallback((questId: string) => void tap(questId, 'verify'), [tap])
  const onFlag = useCallback((questId: string) => void tap(questId, 'flag'), [tap])

  const orderedQueue = useMemo(() => {
    const rank = (row: QuestFields): number => {
      const stage = stages?.get(row._id)?.stage
      return stage === 'unverified' || stage === 'disputed' ? 0 : 1
    }
    return [...queue].sort((a, b) => rank(a) - rank(b))
  }, [queue, stages])

  return (
    <div className="board">
      <header className="masthead">
        <div className="masthead-plate">
          <Cog className="gear" size={28} />
          <div>
            <p className="kicker">GrantQuest · Sanity App SDK</p>
            <h1>Quest Master&apos;s Board</h1>
            <p className="lede">
              Every expedition charter on the map-room wall — workflow state, freshness seal,
              and the verification queue. Stamp a quest verified or flag it for re-charting.
            </p>
          </div>
        </div>
        <div className="tally mono">
          <span>{handles.length} charters</span>
          <span>{stages ? `${stages.size} workflow instances` : 'workflows hidden'}</span>
          <span>{orderedQueue.length} in queue</span>
          <span>{sweeps.length} sweep entries</span>
        </div>
      </header>

      {!hasToken ? (
        <p className="notice" role="status">
          Reading the public board. For workflow-state chips and the Verify / Flag stamps, add a
          minimal read+write token as VITE_SANITY_WRITE_TOKEN in board/.env (never commit it).
        </p>
      ) : null}
      {stagesError ? (
        <p className="notice notice-bad" role="alert">
          Could not read workflow instances: {stagesError}
        </p>
      ) : null}
      {notice ? (
        <p className="notice" role="status">
          {notice}
        </p>
      ) : null}

      <div className="desk">
        <section className="map-room" aria-label="All quests">
          <h2>
            <ScrollText size={18} /> The map room — all charters
          </h2>
          {isPending && handles.length === 0 ? <p>Unrolling the charts…</p> : null}
          <div className="quest-list">
            {handles.map((handle) => (
              <Suspense key={handle.documentId} fallback={<p>Unrolling a charter…</p>}>
                <QuestCard
                  handle={handle}
                  stage={stages?.get(handle.documentId)?.stage}
                  busy={busyId === handle.documentId}
                  onVerify={onVerify}
                  onFlag={onFlag}
                />
              </Suspense>
            ))}
          </div>
          {hasMore ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => loadMore()}
              disabled={isPending}
            >
              {isPending ? 'Unrolling…' : 'Unroll more charters'}
            </button>
          ) : null}
        </section>

        <aside className="side-rail">
          <section aria-label="Verification queue">
            <h2>
              <Hourglass size={18} /> Verification queue
            </h2>
            <p className="small">Unverified + disputed first, then soonest deadline.</p>
            {orderedQueue.length === 0 ? (
              <p className="small">Queue is clear — every charter holds a fresh seal.</p>
            ) : (
              <ul className="queue-list">
                {orderedQueue.map((row) => (
                  <li key={row._id}>
                    <span className="queue-title">{row.title ?? row._id}</span>
                    <span className="mono small">
                      {stages?.get(row._id)?.stage ?? row.status ?? '—'} ·{' '}
                      {daysLeft(row.deadline)}
                    </span>
                    <span className="queue-taps">
                      <button
                        type="button"
                        className="btn btn-mini"
                        disabled={busyId === row._id || !writeToken()}
                        onClick={() => onVerify(row._id)}
                      >
                        Verify
                      </button>
                      <button
                        type="button"
                        className="btn btn-mini"
                        disabled={busyId === row._id || !writeToken()}
                        onClick={() => onFlag(row._id)}
                      >
                        Flag
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-label="Recent sweeps">
            <h2>
              <ShieldCheck size={18} /> Recent sweeps
            </h2>
            {sweeps.length === 0 ? (
              <p className="small">No sweep entries yet — the daily sweeper writes here.</p>
            ) : (
              <ul className="sweep-list">
                {sweeps.map((row) => (
                  <li key={row._id}>
                    <span className="mono small">{new Date(row.ranAt).toLocaleString()}</span>
                    <span>{row.questTitle ?? 'Quest'}</span>
                    <span className="mono small">{row.reason}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}
