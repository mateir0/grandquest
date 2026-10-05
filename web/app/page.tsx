import {Suspense} from 'react'
import type {Metadata} from 'next'
import {Backpack, Compass, Hourglass, ScrollText} from 'lucide-react'
import {QuestBoard} from '../components/QuestBoard'
import {HomeHero} from '../components/HomeHero'
import {loadQuests} from '../lib/questStats'

export const metadata: Metadata = {
  title: 'GrantQuest — Turn Scholarship Hunting into an RPG',
  description:
    'Browse real scholarships as quest-board missions with eligibility gates, document checklists, and live deadline countdowns. Free — no account needed to explore.',
  alternates: {
    canonical: 'https://grantquest.tech',
  },
}

/**
 * Rendered on the server at request time.
 * Fetching here (instead of in the browser) keeps the Sanity origin allowlist out of
 * the picture — the browser never has to talk to api.sanity.io, so there is no CORS
 * failure and no flash of an empty board.
 */
export const dynamic = 'force-dynamic'

function BoardHead({children}: {children?: React.ReactNode}) {
  return (
    <header className="board-head">
      <div>
        <span className="eyebrow">Welcome to GrantQuest</span>
        <h1>GrantQuest</h1>
        <p className="tagline">You have one quest. We make it count.</p>
      </div>
      {children}
    </header>
  )
}

/** The board while the quests are still being fetched. */
function BoardSkeleton() {
  return (
    <>
      <BoardHead />
      <section className="board" aria-busy="true">
        <div className="filters">
          <div className="field grow">
            <input
              type="search"
              placeholder="Search for quests..."
              aria-label="Search quests"
            />
          </div>
          <div className="field">
            <select aria-label="Filter by study level">
              <option value="">All study levels</option>
              <option value="undergrad">Undergrad</option>
              <option value="masters">Master's</option>
              <option value="phd">PhD</option>
            </select>
          </div>
          <div className="field">
            <select aria-label="Filter by country">
              <option value="">All countries</option>
              {/* Options will be populated dynamically */}
            </select>
          </div>
        </div>
        <div className="grid">
          {Array.from({length: 6}).map((_, i) => (
            <div className="skeleton-card" key={i}>
              <div className="sk sk-title" />
              <div className="sk sk-sub" />
              <div className="sk sk-amount" />
              <div className="sk sk-meta" />
              <div className="sk sk-tags" />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

/** The four beats of a real GrantQuest run — mirrors the app's own flow. */
const HOW_STEPS = [
  {
    icon: Compass,
    title: 'Chart the quest',
    body: 'Browse the board for scholarships that fit your study path and region.',
  },
  {
    icon: ScrollText,
    title: 'Clear the gates',
    body: 'Each quest lists its eligibility gates. Tick them off as you prove you qualify.',
  },
  {
    icon: Backpack,
    title: 'Gather the documents',
    body: 'Work the inventory: transcripts, passports, references, motivation letters.',
  },
  {
    icon: Hourglass,
    title: 'Beat the deadline',
    body: 'Every quest runs its own countdown. Submit with time still on the clock.',
  },
]

function HowItWorks() {
  return (
    <section className="how" id="how" aria-labelledby="how-title">
      <h2 id="how-title">How an expedition runs</h2>
      <ol className="how-steps">
        {HOW_STEPS.map(({icon: Icon, title, body}) => (
          <li className="how-step" key={title}>
            <span className="how-icon" aria-hidden="true">
              <Icon size={20} />
            </span>
            <h3>{title}</h3>
            <p>{body}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

async function PostedQuests() {
  const {quests, failed} = await loadQuests()

  if (failed) {
    return (
      <>
        <BoardHead />
        <section className="board">
          <div className="board-empty">
            <h2>Connection lost</h2>
            <p>
              We couldn't reach the quest board. Check your connection and try again.
            </p>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <BoardHead>
        {quests.length > 0 && (
          <div className="board-stamp">
            <span className="board-stamp-num">{quests.length}</span>
            <span className="board-stamp-label">Active quests</span>
          </div>
        )}
      </BoardHead>
      {quests.length === 0 ? (
        <section className="board">
          <div className="board-empty">
            <h2>No active quests</h2>
            <p>
              The quest board is waiting for new missions. Check back soon for
              opportunities to make your mark.
            </p>
          </div>
        </section>
      ) : (
        <QuestBoard quests={quests} />
      )}
    </>
  )
}

export default function BoardPage() {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is GrantQuest?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'GrantQuest is a scholarship hunt presented as an RPG quest log. Each scholarship is a quest with eligibility gates to clear, documents to gather, and a deadline countdown to beat.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is GrantQuest free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Exploring the quest board and tracking quests is free, with no account needed. An account is only needed to sync your quest log across devices.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need an account to use GrantQuest?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. Without an account your quest log stays in your browser. Signing in with a one-time email code or Google syncs your quest log and XP across devices.',
        },
      },
      {
        '@type': 'Question',
        name: 'How reliable is the quest data?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Quest data is verified to our best effort and flagged when it needs re-verification. Always confirm deadlines and eligibility with the official source before applying.',
        },
      },
      {
        '@type': 'Question',
        name: 'What happens to my data if I delete my account?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Deleting your account permanently removes your quest log, XP, and account. You can also delete your data by emailing hello@grantquest.tech.',
        },
      },
    ],
  }
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(faqLd)}}
      />
      <HomeHero />
      <HowItWorks />
      <section id="board" className="board-section">
        <Suspense fallback={<BoardSkeleton />}>
          <PostedQuests />
        </Suspense>
      </section>
    </>
  )
}
