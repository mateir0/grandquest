import './globals.css'
import type {Metadata, Viewport} from 'next'
import {Suspense} from 'react'
import {IM_Fell_English, JetBrains_Mono} from 'next/font/google'
import {XpBar} from '../components/XpBar'
import {AuthStatus} from '../components/AuthStatus'
import {MigrationRunner} from '../components/MigrationRunner'
import {TourGuide} from '../components/TourGuide'
import {FooterSignature} from '../components/FooterSignature'
import {Analytics} from '@vercel/analytics/next'

const imFellEnglish = IM_Fell_English({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-im-fell',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jet-brains',
})

const siteUrl = 'https://grantquest.tech'
const siteDescription =
  'GrantQuest turns scholarship hunting into an RPG quest log: browse real scholarships, clear the eligibility gates, gather your documents, and beat every deadline.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'GrantQuest — Turn Scholarship Hunting into an RPG',
  description: siteDescription,
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'GrantQuest',
    title: 'GrantQuest — Turn Scholarship Hunting into an RPG',
    description: siteDescription,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'GrantQuest wordmark and brass compass emblem on parchment',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GrantQuest — Turn Scholarship Hunting into an RPG',
    description: siteDescription,
    images: ['/og-image.png'],
  },
}

export const viewport: Viewport = {
  themeColor: '#5c0000',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${imFellEnglish.variable} ${jetBrainsMono.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <header className="topbar">
          <div className="brand-wrapper">
            <a href="/" className="brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/grantquest-logo.webp" alt="" width={36} height={36} />
              GrantQuest
            </a>
            <span className="player-indicator">
              <span className="player-label">Player 1</span>
            </span>
          </div>
          <nav>
            <a href="/#board" className="nav-link">
              Quest board
            </a>
            <a href="/log" className="nav-link">
              Quest log
            </a>
            <a href="/#how" className="nav-link">
              How it works
            </a>
          </nav>
          <XpBar />
          <AuthStatus />
          <a className="btn primary topbar-cta" href="/#board">
            Begin expedition
          </a>
        </header>

        <main className="container" id="main" tabIndex={-1}>
          {children}
        </main>
        <Analytics />
        {/* Cloudflare Web Analytics */}
        <script
          type="module"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "8c83994e631b47608f56fac1d6bb5caf"}'
        ></script>
        {/* End Cloudflare Web Analytics */}

        <Suspense fallback={null}>
          <TourGuide />
        </Suspense>
        <MigrationRunner />

        <footer className="site-footer">
          <div className="divider">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/grantquest-divider.webp" alt="" width={420} height={72} />
          </div>
          <div className="footer-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/grantquest-logo.webp" alt="" width={36} height={36} />
            GrantQuest
          </div>
          <p className="footer-note">
            Scholarships are quests. Clear the gates, gather the documents, beat the deadline.
          </p>
          <p className="footer-note">
            <a href="/privacy">Privacy</a>
            {' · '}
            <a href="/terms">Terms</a>
            {' · '}
            A Hashir original.
          </p>
          <FooterSignature />
        </footer>
      </body>
    </html>
  )
}
