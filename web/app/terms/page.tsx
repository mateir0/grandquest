import Link from 'next/link'
import type {Metadata} from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — GrantQuest',
  description:
    'The plain-language rules for using GrantQuest: accounts, content honesty, acceptable use, and how to contact us.',
  alternates: {
    canonical: 'https://grantquest.tech/terms',
  },
  openGraph: {
    url: 'https://grantquest.tech/terms',
  },
}

/** Plain-language terms: only what the app actually is and requires. */
export default function TermsPage() {
  return (
    <div style={{maxWidth: '40rem', margin: '0 auto'}}>
      <Link className="detail-back" href="/">
        <span aria-hidden="true">←</span> Back to quest board
      </Link>

      <div className="board-head">
        <div>
          <span className="eyebrow">The rules of the expedition</span>
          <h1>Terms of Service</h1>
        </div>
      </div>

      <section className="section">
        <h2>What GrantQuest is</h2>
        <p>
          GrantQuest is a scholarship quest tracker: scholarships are presented
          as quests, with eligibility gates to clear, documents to gather, and
          deadlines to beat.
        </p>
      </section>

      <section className="section">
        <h2>Accounts</h2>
        <p>
          Syncing your quest log across devices requires an account, which
          requires a valid email address you can access. You are responsible
          for keeping access to that email — it is how you sign in.
        </p>
      </section>

      <section className="section">
        <h2>Check the official source before applying</h2>
        <p>
          Quest data is verified to our best effort and flagged when it needs
          re-verification — but providers change deadlines and eligibility
          without notice. ALWAYS confirm deadlines and eligibility with the
          official source before applying. We are not liable if a deadline or
          requirement changes.
        </p>
      </section>

      <section className="section">
        <h2>Acceptable use</h2>
        <p>
          Use GrantQuest for hunting scholarships. No abuse of other users, no
          scraping the board at machine scale, no attempting to break the thing.
        </p>
      </section>

      <section className="section">
        <h2>As-is, no warranties</h2>
        <p>
          The service is provided as-is, without warranties of any kind. Our
          liability is limited to the maximum extent permitted by law.
        </p>
      </section>

      <section className="section">
        <h2>Changes to these terms</h2>
        <p>
          We may update these terms as GrantQuest evolves. Continued use of the
          site after an update means you accept the updated terms.
        </p>
      </section>

      <section className="section">
        <h2>Contact</h2>
        <p>
          Questions about these terms? Write to{' '}
          <a href="mailto:hello@grantquest.tech">hello@grantquest.tech</a>.
        </p>
      </section>
    </div>
  )
}
