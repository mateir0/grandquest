import {Suspense} from 'react'
import {ArrowRight, Cog, Hourglass} from 'lucide-react'
import {loadQuests, summariseQuests} from '../lib/questStats'

/** Large, faint gear silhouettes behind the hero — decoration only. */
function HeroGears() {
  return (
    <div className="hero-gears" aria-hidden="true">
      <Cog className="gear gear-a" strokeWidth={0.75} />
      <Cog className="gear gear-b" strokeWidth={1} />
      <Cog className="gear gear-c" strokeWidth={1.25} />
    </div>
  )
}

/** Shown while the stats load, and whenever the data can't be summarised. */
function CompassPanel() {
  return (
    <div className="hero-panel hero-panel-compass">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/grantquest-logo.webp" alt="The GrantQuest compass" width={260} height={260} fetchPriority="high" />
      <p className="hero-panel-note">Every expedition begins with a bearing.</p>
    </div>
  )
}

async function StatsPanel() {
  const {quests, failed} = await loadQuests()
  const stats = summariseQuests(quests)

  if (failed || stats.questCount === 0) return <CompassPanel />

  return (
    <div className="hero-panel">
      <span className="hero-panel-eyebrow">Expedition ledger</span>

      <dl className="hero-stats">
        <div className="hero-stat">
          <dt>Open quests</dt>
          <dd>{stats.questCount}</dd>
        </div>
        <div className="hero-stat">
          <dt>Regions charted</dt>
          <dd>{stats.countryCount}</dd>
        </div>
      </dl>

      {stats.nearest && (
        <div className={`hero-nearest ${stats.nearest.tone}`}>
          <span className="hero-nearest-label">
            <Hourglass size={13} aria-hidden="true" /> Nearest deadline
          </span>
          <span className="hero-nearest-value" title={stats.nearest.exact}>
            {stats.nearest.label}
          </span>
        </div>
      )}

      <a className="btn primary hero-panel-cta" href="#board">
        View the board <ArrowRight size={16} aria-hidden="true" />
      </a>
    </div>
  )
}

/**
 * Landing hero above the board. Asymmetric: copy on the left, a tilted brass
 * frame on the right holding live figures from the real quest data. The board
 * itself is untouched and follows below at #board.
 */
export function HomeHero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <HeroGears />

      <div className="hero-copy">
        <span className="hero-pill">Expedition briefing…</span>

        <h1 id="hero-title" className="hero-title">
          <span className="hero-title-a">The Great</span>
          <span className="hero-title-b">Scholarship Expedition</span>
        </h1>

        <p className="hero-subtitle">
          Every scholarship worth winning is an expedition: eligibility gates to clear, a
          manifest of documents to gather, and a deadline that will not wait. GrantQuest
          sets the whole hunt out as a quest board you can actually work.
        </p>

        <div className="hero-actions">
          <a className="btn mahogany" href="#board">
            Begin expedition
          </a>
          <a className="btn tour-launch" href="/?tour=1">
            Take the 30-second tour
          </a>
          <a className="btn ghost" href="#how">
            How it works
          </a>
        </div>
      </div>

      <div className="hero-visual">
        <Suspense fallback={<CompassPanel />}>
          <StatsPanel />
        </Suspense>
      </div>
    </section>
  )
}
