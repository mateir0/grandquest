'use client'

import {useEffect, useState} from 'react'
import dynamic from 'next/dynamic'
import {useReducedMotion} from '../lib/motion'

// framer-motion stays out of the initial bundle — the figure is server-rendered
// as a static number first, then enhanced on scroll into view.
const CountUpLazy = dynamic(
  () => import('./lightswind/count-up').then((m) => m.CountUp),
  {ssr: false},
)

/** Animated EXPEDITION LEDGER figure. Static number until mount / when reduced motion. */
export function LedgerCount({value}: {value: number}) {
  const reduced = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  if (!mounted || reduced) return <>{value}</>
  return (
    <CountUpLazy
      value={value}
      duration={1.6}
      triggerOnView
      className="gq-count"
      aria-label={String(value)}
    />
  )
}
