import './globals.css'
import type {Metadata, Viewport} from 'next'
import {Suspense} from 'react'
import {IM_Fell_English, JetBrains_Mono} from 'next/font/google'
import {XpBar} from '../components/XpBar'
import {TourGuide} from '../components/TourGuide'
import {FooterSignature} from '../components/FooterSignature'

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

export const metadata: Metadata = {
  title: 'GrantQuest — the scholarship hunt as a quest board',
  description:
    'Scholarships are quests. Clear the gates, gather the documents, beat the deadline.',
}

export const viewport: Viewport = {
  themeColor: '#F5DEB3',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${imFellEnglish.variable} ${jetBrainsMono.variable}`}>
      <body>
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
          <a className="btn primary topbar-cta" href="/#board">
            Begin expedition
          </a>
        </header>

        <main className="container">{children}</main>

        <Suspense fallback={null}>
          <TourGuide />
        </Suspense>

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
          <FooterSignature />
        </footer>
      </body>
    </html>
  )
}
