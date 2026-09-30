import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="empty not-found">
      <h2>Mission not found</h2>
      <p>That quest is not pinned to any board we know of.</p>
      <Link className="btn primary" href="/">
        Return to quest board
      </Link>
    </div>
  )
}
