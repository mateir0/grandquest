import {notFound} from 'next/navigation'
import type {Metadata} from 'next'
import {getQuest, getQuests, type QuestDetail, type QuestCardData} from '../../../lib/queries'
import {exactDeadline} from '../../../lib/deadline'
import {getServerLog} from '../../../lib/serverQuestLog'
import {QuestDetailView} from '../../../components/QuestDetailView'

export const dynamic = 'force-dynamic'

/** Truncate to maxLen chars at a word boundary (never mid-word). */
function truncateWords(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  const truncated = text.slice(0, maxLen)
  const lastSpace = truncated.lastIndexOf(' ')
  return lastSpace > 0 ? truncated.slice(0, lastSpace) + '…' : truncated.slice(0, maxLen - 1) + '…'
}

/** Build the SEO title: "{Scholarship name} — {Country}" + strongest hook, ≤60 chars, no "GrantQuest" suffix. */
function buildSeoTitle(quest: QuestDetail): string {
  const primaryCountry = quest.countries?.[0] ?? ''
  const base = primaryCountry ? `${quest.title} — ${primaryCountry}` : quest.title
  if (base.length >= 60) return truncateWords(base, 60)

  // Remaining space for strongest hook
  const remaining = 60 - base.length - 3 // " — " separator
  const hooks: string[] = []

  // Year from deadline
  const deadlineYear = quest.deadline ? new Date(quest.deadline).getUTCFullYear() : null
  if (deadlineYear && deadlineYear >= new Date().getUTCFullYear()) {
    hooks.push(String(deadlineYear))
  }

  // "Fully funded" if amount suggests it
  if (quest.amount && /fully funded|full tuition|full ride/i.test(quest.amount)) {
    hooks.push('Fully funded')
  }

  // Deadline month
  if (quest.deadline) {
    const month = new Date(quest.deadline).toLocaleString('en-US', {month: 'short', timeZone: 'UTC'})
    hooks.push(`Closes ${month}`)
  }

  for (const hook of hooks) {
    if (hook.length <= remaining) {
      return `${base} — ${hook}`
    }
  }

  return base
}

/** Build the SEO description: lead with award amount, then sponsor, then deadline. Include country. 50–155 chars. */
function buildSeoDescription(quest: QuestDetail): string {
  const parts: string[] = []

  // Lead with award amount
  if (quest.amount) {
    parts.push(quest.amount)
  }

  // Sponsor
  parts.push(`from ${quest.provider}`)

  // Country/region (MUST appear so variants differ)
  const country = quest.countries?.[0]
  if (country) {
    parts.push(`for ${country}`)
  } else if (quest.countries?.length) {
    parts.push(`for ${quest.countries.join(', ')}`)
  }

  // Deadline
  if (quest.deadline) {
    const exact = exactDeadline(quest.deadline)
    if (exact) parts.push(exact.replace('Closes ', 'Deadline: '))
  }

  const full = parts.join('. ') + '.'
  return truncateWords(full, 155)
}

/** Find 3–4 related quests sharing region (countries) or level. */
async function getRelatedQuests(currentSlug: string, currentQuest: QuestDetail): Promise<QuestCardData[]> {
  const allQuests = await getQuests()
  const currentCountries = new Set(currentQuest.countries ?? [])
  const currentLevel = currentQuest.level

  // Score quests by shared countries (region) then level
  const scored = allQuests
    .filter((q) => q.slug.current !== currentSlug)
    .map((q) => {
      let score = 0
      const qCountries = q.countries ?? []
      for (const c of qCountries) {
        if (currentCountries.has(c)) score += 3
      }
      if (currentLevel && q.level === currentLevel) score += 2
      return {quest: q, score}
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((s) => s.quest)

  return scored
}

/** Title + description from the real quest, truncated to SEO limits. */
export async function generateMetadata({
  params,
}: {
  params: {slug: string}
}): Promise<Metadata> {
  const canonical = `https://grantquest.tech/quest/${params.slug}`
  const quest = await getQuest(params.slug).catch(() => null)
  if (!quest) {
    return {
      title: 'Quest not found',
      description: 'No scholarship quest lives at this address.',
      alternates: {canonical},
      openGraph: {url: canonical},
    }
  }

  const title = buildSeoTitle(quest)
  const description = buildSeoDescription(quest)

  return {
    title,
    description,
    alternates: {canonical},
    openGraph: {
      url: canonical,
      title,
      description,
      type: 'article',
      publishedTime: quest.deadline ? new Date(quest.deadline).toISOString() : undefined,
    },
  }
}

/** Server-rendered Related Quests section for internal linking. */
async function RelatedQuestsSection({quest, slug}: {quest: QuestDetail; slug: string}) {
  const related = await getRelatedQuests(slug, quest).catch(() => [])
  if (related.length === 0) return null

  return (
    <section className="related-quests" aria-labelledby="related-quests-heading" style={{marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)'}}>
      <h2 id="related-quests-heading" style={{fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--fg)'}}>
        More scholarships like this
      </h2>
      <ul style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none', padding: 0}}>
        {related.map((r) => (
          <li key={r._id}>
            <a
              href={`/quest/${r.slug.current}`}
              style={{
                color: 'var(--link)',
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
                fontSize: '0.95rem',
              }}
            >
              {r.title} {r.countries?.[0] && `— ${r.countries[0]}`}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

const LEVEL_LABEL: Record<string, string> = {
  undergrad: 'undergraduate',
  masters: "master's",
  phd: 'PhD',
}

/**
 * Plain-language quotable summary built ONLY from real Sanity fields.
 * Server-rendered so answer engines can quote it verbatim without JS.
 * Missing data is skipped, never invented.
 */
function QuestSummary({quest}: {quest: QuestDetail}) {
  const gates = quest.gates ?? []
  const documents = quest.documents ?? []
  const level = quest.level && LEVEL_LABEL[quest.level]
  const closes = exactDeadline(quest.deadline)

  const amount = quest.amount ? quest.amount.replace(/[.]+$/, '') : ''
  const what = `${quest.title} is a scholarship from ${quest.provider}` +
    (level ? ` for ${level} students` : '') +
    (amount ? ` worth ${amount}` : '') +
    '.'
  const scope =
    `It lists ${gates.length} eligibilit${gates.length === 1 ? 'y gate' : 'y gates'} to clear` +
    ` and requires ${documents.length} document${documents.length === 1 ? '' : 's'}.` +
    (quest.countries?.length ? ` Listed for ${quest.countries.join(', ')}.` : '')
  return (
    <section className="briefing" aria-label="Quest summary">
      <strong>Quick summary</strong>
      <div className="briefing-content">
        <p>{what}</p>
        <p>
          {scope}
          {closes ? ` ${closes} for applications.` : ''}
          {quest.freshness === 'stale'
            ? ' This listing may be outdated — confirm details with the official source before applying.'
            : ''}
        </p>
      </div>
    </section>
  )
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
      <QuestSummary quest={quest} />
      <QuestDetailView
        quest={quest}
        serverEntry={serverEntry}
        isLoggedIn={!!serverLog}
      />
      <RelatedQuestsSection quest={quest} slug={params.slug} />
    </>
  )
}
