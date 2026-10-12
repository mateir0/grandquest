'use client'

import dynamic from 'next/dynamic'
import {useReducedMotion} from '../lib/motion'

// framer-motion + ScrollTimeline stays off the critical path
const ScrollTimeline = dynamic(
  () => import('./lightswind/scroll-timeline').then((m) => m.ScrollTimeline),
  {ssr: false},
)

/**
 * Quest lifecycle timeline — plain-English steps matching the app's flow.
 * Re-themed to brass/parchment; blue/purple demo colors replaced.
 */
export function QuestTimeline() {
  const reduced = useReducedMotion()

  if (reduced) {
    // Static fallback for reduced motion
    return (
      <section className="how timeline-static" id="how" aria-labelledby="how-title">
        <h2 id="how-title">How it works</h2>
        <ol className="timeline-steps">
          {QUEST_LIFECYCLE.map((step, i) => (
            <li key={step.title} className="timeline-step">
              <span className="timeline-dot" aria-hidden="true" />
              <div className="timeline-content">
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    )
  }

  return (
    <ScrollTimeline
      events={QUEST_LIFECYCLE.map((step, i) => ({
        id: `step-${i}`,
        year: step.title,
        title: step.title,
        subtitle: '',
        description: step.body,
        color: '#b5a642',
      }))}
      title=""
      subtitle=""
      animationOrder="sequential"
      cardAlignment="alternating"
      lineColor="bg-[var(--brass)]/30"
      activeColor="bg-[var(--brass)]"
      progressIndicator={true}
      cardVariant="outlined"
      cardEffect="none"
      parallaxIntensity={0}
      progressLineWidth={3}
      progressLineCap="round"
      dateFormat="text"
      revealAnimation="fade"
      connectorStyle="line"
      perspective={false}
      smoothScroll={true}
      className="timeline-scroll"
    />
  )
}

const QUEST_LIFECYCLE = [
  {
    title: 'Discovered',
    body: 'You find a scholarship on the quest board. Every quest shows its gates, documents, and deadline upfront — no surprises.',
  },
  {
    title: 'Clearing gates',
    body: 'Tick off eligibility requirements one by one. Each cleared gate earns XP and unlocks the quest when all are met.',
  },
  {
    title: 'Gathering docs',
    body: 'Work the checklist: transcripts, references, motivation letters, language tests. Mark each document as you collect it.',
  },
  {
    title: 'Submitted',
    body: 'You apply on the provider site. The quest moves to submitted and the countdown keeps ticking.',
  },
  {
    title: 'Awarded',
    body: 'Congratulations — the scholarship is yours. XP rolls in, you level up, and the quest is complete.',
  },
] as const