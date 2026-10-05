import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="empty not-found">
      <h1>Mission not found</h1>
      <p>That quest is not pinned to any board we know of.</p>
      <Link className="btn primary" href="/">
        Return to quest board
      </Link>
    </div>
  )
}
