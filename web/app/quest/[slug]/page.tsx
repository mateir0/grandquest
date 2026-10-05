import {notFound} from 'next/navigation'
import type {Metadata} from 'next'
import {getQuest} from '../../../lib/queries'
import {getServerLog} from '../../../lib/serverQuestLog'
import {QuestDetailView} from '../../../components/QuestDetailView'

export const dynamic = 'force-dynamic'

/** Title + description from the real quest — never invented copy. */
export async function generateMetadata({
  params,
}: {
  params: {slug: string}
}): Promise<Metadata> {
  const quest = await getQuest(params.slug).catch(() => null)
  if (!quest) {
    return {
      title: 'Quest not found — GrantQuest',
      description: 'No scholarship quest lives at this address.',
    }
  }
  const reward = quest.amount ? ` worth ${quest.amount}` : ''
  return {
    title: `${quest.title} — GrantQuest`,
    description: `Scholarship quest from ${quest.provider}${reward}. Clear the eligibility gates, gather the documents, and beat the deadline.`,
  }
}

/** Quest detail — fetched on the server, interactive checklists live in the client view. */
export default async function QuestPage({params}: {params: {slug: string}}) {
  const quest = await getQuest(params.slug)
  if (!quest) notFound()

  // Logged-out visitors get no server entry — the client keeps localStorage.
  // Logged-in users read/write ONLY the server log.
  const serverLog = await getServerLog().catch(() => null)
  const serverEntry =
    serverLog?.quests.find((q) => q.questSlug === params.slug) ?? null

  return (
    <QuestDetailView
      quest={quest}
      serverEntry={serverEntry}
      isLoggedIn={!!serverLog}
    />
  )
}
