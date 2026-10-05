import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="empty not-found">
      <span className="eyebrow">Expedition log — entry missing</span>
      <h1>Your party wandered off the map</h1>
      <p>
        No quest is pinned here — this trail leads nowhere we charted. Regroup
        at the quest board and pick a real expedition.
      </p>
      <Link className="btn primary" href="/#board">
        Back to the quest board →
      </Link>
    </div>
  )
}
