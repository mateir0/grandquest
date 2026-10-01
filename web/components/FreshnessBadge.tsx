import type {Freshness} from '../lib/queries'

/** Presentational only: freshness is derived by the server-side GROQ projection. */
export function FreshnessBadge({freshness}: {freshness: Freshness}) {
  return (
    <span className={`freshness-badge ${freshness}`}>
      {freshness === 'stale' ? 'NEEDS RE-VERIFICATION' : 'FRESH'}
    </span>
  )
}
