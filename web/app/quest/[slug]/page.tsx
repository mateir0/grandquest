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
  const canonical = `https://grantquest.tech/quest/${params.slug}`
  const quest = await getQuest(params.slug).catch(() => null)
  if (!quest) {
    return {
      title: 'Quest not found — GrantQuest',
      description: 'No scholarship quest lives at this address.',
      alternates: {canonical},
    }
  }
  const reward = quest.amount ? ` worth ${quest.amount}` : ''
  return {
    title: `${quest.title} — GrantQuest`,
    description: `Scholarship quest from ${quest.provider}${reward}. Clear the eligibility gates, gather the documents, and beat the deadline.`,
    alternates: {canonical},
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

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Quest board',
        item: 'https://grantquest.tech/#board',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: quest.title,
        item: `https://grantquest.tech/quest/${params.slug}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(breadcrumbLd)}}
      />
      <nav aria-label="Breadcrumb" className="muted-note" style={{marginBottom: '1rem'}}>
        <a href="/#board">Quest board</a>
        {' → '}
        <span aria-current="page">{quest.title}</span>
      </nav>
      <QuestDetailView
        quest={quest}
        serverEntry={serverEntry}
        isLoggedIn={!!serverLog}
      />
    </>
  )
}
