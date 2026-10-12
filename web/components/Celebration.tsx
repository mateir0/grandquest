'use client'

import {useEffect, useState} from 'react'
import dynamic from 'next/dynamic'
import {useReducedMotion} from '../lib/motion'

const ConfettiButtonLazy = dynamic(
  () => import('./lightswind/confetti-button').then((m) => m.ConfettiButton),
  {ssr: false},
)

// Small, tasteful burst — brass, gold, maroon on parchment. Stable identity so
// the auto-burst fires exactly once per mount (i.e. once per event).
const BURST_OPTIONS = {
  particleCount: 45,
  spread: 60,
  ticks: 120,
  scalar: 0.9,
  zIndex: 70,
  disableForReducedMotion: true,
  colors: ['#b5a642', '#6e631f', '#5c0000', '#f5deb3', '#8a521f'],
}

/**
 * One celebratory burst per event (quest awarded / level-up). Fires
 * automatically the first time an event id is seen in this browser, then
 * stays as a replayable button. Renders nothing for reduced motion.
 */
export function Celebration({eventId, label}: {eventId: string; label: string}) {
  const reduced = useReducedMotion()
  const [fire, setFire] = useState(false)
  useEffect(() => {
    if (reduced) return
    const key = `gq-celebrated:${eventId}`
    try {
      if (window.sessionStorage.getItem(key)) return
      window.sessionStorage.setItem(key, '1')
    } catch {
      /* storage unavailable — still celebrate once per mount */
    }
    setFire(true)
  }, [eventId, reduced])
  if (!fire) return null
  return (
    <ConfettiButtonLazy
      className="gq-celebrate"
      autoConfetti
      confettiOptions={BURST_OPTIONS}
      aria-label={`Celebrate: ${label}`}
    >
      <span aria-hidden="true">🎉</span> {label}
    </ConfettiButtonLazy>
  )
}
