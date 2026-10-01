import {createClient} from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'replace-me',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-01-01',
  // Freshness is derived from request-time cutoff parameters, so query reads must
  // not linger behind Sanity's CDN cache.
  useCdn: false,
})
