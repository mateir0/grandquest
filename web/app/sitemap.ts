import type {MetadataRoute} from 'next'
import {getQuestSlugs} from '../lib/queries'
import {errorMessage, logError} from '../lib/logger'

const siteUrl = 'https://grantquest.tech'

/** Static routes plus real published quest slugs from Sanity. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const staticRoutes: MetadataRoute.Sitemap = [
    {url: siteUrl, lastModified: now},
    {url: `${siteUrl}/log`, lastModified: now},
    {url: `${siteUrl}/login`, lastModified: now},
    {url: `${siteUrl}/privacy`, lastModified: now},
    {url: `${siteUrl}/terms`, lastModified: now},
  ]

  // The sitemap stays valid (static routes only) if Sanity is unreachable.
  const slugs = await getQuestSlugs().catch((err: unknown) => {
    logError('sanity_fetch_error', {query_name: 'getQuestSlugs', message: errorMessage(err)})
    return [] as string[]
  })

  return [
    ...staticRoutes,
    ...slugs.map((slug) => ({
      url: `${siteUrl}/quest/${slug}`,
      lastModified: now,
    })),
  ]
}
