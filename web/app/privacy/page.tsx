import Link from 'next/link'
import type {Metadata} from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — GrantQuest',
  description: 'What GrantQuest collects, why, and your rights over your data.',
  alternates: {
    canonical: 'https://grantquest.tech/privacy',
  },
  openGraph: {
    url: 'https://grantquest.tech/privacy',
  },
}

/** Plain-language privacy policy: only what the app actually does. */
export default function PrivacyPage() {
  return (
    <div style={{maxWidth: '40rem', margin: '0 auto'}}>
      <Link className="detail-back" href="/">
        <span aria-hidden="true">←</span> Back to quest board
      </Link>

      <div className="board-head">
        <div>
          <span className="eyebrow">The fine print, in plain words</span>
          <h1>Privacy Policy</h1>
        </div>
      </div>

      <section className="briefing">
        <strong>The short version</strong>
        <div className="briefing-content">
          <p>
            GrantQuest collects the minimum needed to keep your quest log synced
            across devices: your email address and your quest progress. No ads,
            no cross-site trackers, and your data is never sold.
          </p>
        </div>
      </section>

      <section className="section">
        <h2>What we collect</h2>
        <p>
          Your <strong>email address</strong>, provided when you sign in with a
          one-time email code or with Google. Your <strong>quest log
          progress</strong>: quest states, cleared gates, gathered documents,
          and XP. Nothing else — no name, no location, no device fingerprinting.
        </p>
      </section>

      <section className="section">
        <h2>Why we collect it</h2>
        <p>
          Accounts exist for one reason: so your quest log follows you across
          devices. Without an account, your progress stays only in your
          browser&apos;s local storage and never reaches our servers.
        </p>
      </section>

      <section className="section">
        <h2>Who handles your data</h2>
        <p>
          <strong>Supabase</strong> stores your account and quest progress and
          handles sign-in. <strong>Google</strong> is involved only if you
          choose Google sign-in. <strong>Vercel</strong> hosts the site and
          provides basic traffic measurement (Vercel Analytics), alongside a
          lightweight Cloudflare beacon — neither sets advertising cookies or
          tracks you across sites. <strong>Sanity</strong> serves public quest
          content only; no user data touches Sanity.
        </p>
      </section>

      <section className="section">
        <h2>Cookies</h2>
        <p>
          Strictly-necessary auth session cookies only — they keep you signed
          in. Nothing for advertising or cross-site tracking.
        </p>
      </section>

      <section className="section">
        <h2>Your rights</h2>
        <p>
          You can see, correct, or delete your data at any time. The fastest
          way to delete everything is built in: sign in and choose
          &ldquo;Delete my account&rdquo; in the header — your quest log, XP,
          and account are permanently removed. Prefer email? Write to{' '}
          <a href="mailto:hello@grantquest.tech">hello@grantquest.tech</a> and
          it gets done.
        </p>
      </section>

      <section className="section">
        <h2>Contact</h2>
        <p>
          Questions about privacy? Write to{' '}
          <a href="mailto:hello@grantquest.tech">hello@grantquest.tech</a>.
        </p>
      </section>
    </div>
  )
}
