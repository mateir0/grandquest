import {notFound} from 'next/navigation'
import {getQuest} from '../../../lib/queries'
import {QuestDetailView} from '../../../components/QuestDetailView'

export const dynamic = 'force-dynamic'

/** Quest detail — fetched on the server, interactive checklists live in the client view. */
export default async function QuestPage({params}: {params: {slug: string}}) {
  const quest = await getQuest(params.slug)
  if (!quest) notFound()
  return <QuestDetailView quest={quest} />
}
