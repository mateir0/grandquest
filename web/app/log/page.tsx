import {QuestLog} from '../../components/QuestLog'
import {getLogQuests} from '../../lib/queries'

export const dynamic = 'force-dynamic'

/** Server shell supplies derived freshness; progress remains browser-owned. */
export default async function LogPage() {
  // The local quest log remains usable if Sanity is temporarily unavailable.
  const quests = await getLogQuests().catch(() => [])

  return <QuestLog quests={quests} />
}
