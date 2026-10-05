import {notFound} from 'next/navigation'
import {getQuest} from '../../../lib/queries'
import {getServerLog} from '../../../lib/serverQuestLog'
import {QuestDetailView} from '../../../components/QuestDetailView'

export const dynamic = 'force-dynamic'

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
