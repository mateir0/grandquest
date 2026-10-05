import {redirect} from 'next/navigation'
import type {Metadata} from 'next'
import {getServerLog, getSessionUser} from '../../lib/serverQuestLog'
import {createClient} from '../../lib/supabase/server'
import {levelFor, STATE_LABEL} from '../../lib/questLog'
import {AccountActions} from '../../components/AccountActions'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Your Account — GrantQuest',
  description:
    'Your adventurer record: identity, level and XP, quest tips, your current log, sign out, and account deletion.',
  alternates: {
    canonical: 'https://grantquest.tech/account',
  },
  openGraph: {
    url: 'https://grantquest.tech/account',
  },
}

const TIPS = [
  'Clearing an eligibility gate earns 10 XP, and gathering a document earns 15 XP.',
  'Submitting a quest earns 50 XP, and an awarded quest earns 200 more.',
  'Abandon quests you no longer pursue — the quest leaves your log and exactly the XP it earned is deducted.',
  'A quest flagged as needing re-verification means confirm the deadline and eligibility with the official source before applying.',
]

/** Adventurer dashboard — logged-in users only. */
export default async function AccountPage() {
  const user = await getSessionUser().catch(() => null)
  if (!user) redirect('/login')

  const supabase = createClient()
  const [{data: profile}, serverLog] = await Promise.all([
    supabase.from('profiles').select('display_name, xp').eq('id', user.id).single(),
    getServerLog().catch(() => null),
  ])
  const typed = profile as {display_name: string | null; xp: number} | null
  const username = typed?.display_name?.trim() || user.email.split('@')[0]
  const xp = typed?.xp ?? serverLog?.xp ?? 0
  const quests = serverLog?.quests ?? []

  return (
    <div style={{maxWidth: '40rem', margin: '0 auto'}}>
      <div className="board-head">
        <div>
          <span className="eyebrow">Adventurer&apos;s record</span>
          <h1>Adventurer&apos;s Record</h1>
        </div>
      </div>

      <section className="logcard" aria-label="Identity">
        <div>
          <strong style={{fontSize: '1.2rem'}}>{username}</strong>
          <div className="muted-note">{user.email}</div>
          <div className="meta" style={{marginTop: '0.5rem'}}>
            <span className="tag">
              Level {levelFor(xp)} · {xp} XP
            </span>
          </div>
        </div>
      </section>

      <section className="section" aria-label="Tips">
        <h2>Field tips</h2>
        <ul style={{margin: 0, paddingLeft: '1.25rem', color: 'var(--muted)'}}>
          {TIPS.map((tip) => (
            <li key={tip} style={{marginBottom: '0.5rem'}}>
              {tip}
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-label="Current log">
        <h2>Current log</h2>
        {quests.length === 0 ? (
          <div className="empty">
            <h2>No quests in play yet — the board awaits →</h2>
            <p>
              Tick a gate or gather a document on any quest and it will be
              entered here automatically.
            </p>
            <a className="btn primary" href="/#board">
              Back to the board →
            </a>
          </div>
        ) : (
          quests.map((q) => (
            <div key={q.questSlug} className="logcard">
              <div className="row">
                <div>
                  <strong>{q.questTitle}</strong>
                  <div className="state">STATE: {STATE_LABEL[q.state]}</div>
                </div>
                <a className="btn ghost" href={`/quest/${q.questSlug}`}>
                  Review quest
                </a>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="section" aria-label="Account actions">
        <h2>Account</h2>
        <AccountActions />
      </section>
    </div>
  )
}
