import type {Metadata} from 'next'
import {QuestLog} from '../../components/QuestLog'
import {getLogQuests} from '../../lib/queries'
import {getServerLog} from '../../lib/serverQuestLog'
import {errorMessage, logError} from '../../lib/logger'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Quest Log — GrantQuest',
  description:
    'Your adventurer’s record: every scholarship quest you started, its state, and your XP. Syncs across devices when you sign in.',
  alternates: {
    canonical: 'https://grantquest.tech/log',
  },
  openGraph: {
    url: 'https://grantquest.tech/log',
  },
}

/**
 * Server shell supplies derived freshness; progress is browser-owned for
 * anonymous visitors and server-owned (Supabase) for logged-in users.
 */
export default async function LogPage() {
  // The local quest log remains usable if Sanity is temporarily unavailable.
  const quests = await getLogQuests().catch((err: unknown) => {
    logError('sanity_fetch_error', {query_name: 'getLogQuests', message: errorMessage(err)})
    return []
  })

  // Logged-out visitors get no server log — the client keeps localStorage.
  const serverLog = await getServerLog().catch(() => null)

  return <QuestLog quests={quests} serverLog={serverLog} />
}
