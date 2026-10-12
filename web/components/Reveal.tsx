'use client'

import {useEffect, useState} from 'react'
import dynamic from 'next/dynamic'
import {useReducedMotion} from '../lib/motion'

const ScrollRevealLazy = dynamic(
  () => import('./lightswind/scroll-reveal').then((m) => m.ScrollReveal),
  {ssr: false},
)

/**
 * Subtle fade+rise for quest cards: once each, transform/opacity only.
 * Static content until mount / when reduced motion — never hidden without JS.
 */
export function Reveal({children}: {children: React.ReactNode}) {
  const reduced = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  if (!mounted || reduced) return <div className="gq-reveal">{children}</div>
  return (
    <ScrollRevealLazy enableBlur={false} threshold={0.15} containerClassName="gq-reveal">
      {children}
    </ScrollRevealLazy>
  )
}
