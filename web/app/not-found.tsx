import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="empty not-found">
      <span className="eyebrow">Page not found</span>
      <h1>This page doesn't exist</h1>
      <p>
        No quest is pinned here — this trail leads nowhere we charted. Return
        to the quest board and pick a real scholarship.
      </p>
      <Link className="btn primary" href="/#board">
        Back to the quest board →
      </Link>
    </div>
  )
}
