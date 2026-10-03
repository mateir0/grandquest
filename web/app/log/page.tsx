import {QuestLog} from '../../components/QuestLog'
import {getLogQuests} from '../../lib/queries'
import {errorMessage, logError} from '../../lib/logger'

export const dynamic = 'force-dynamic'

/** Server shell supplies derived freshness; progress remains browser-owned. */
export default async function LogPage() {
  // The local quest log remains usable if Sanity is temporarily unavailable.
  const quests = await getLogQuests().catch((err: unknown) => {
    logError('sanity_fetch_error', {query_name: 'getLogQuests', message: errorMessage(err)})
    return []
  })

  return <QuestLog quests={quests} />
}
