'use client'

import {useEffect, useState} from 'react'
import dynamic from 'next/dynamic'
import {useReducedMotion} from '../lib/motion'

const ShinyTextLazy = dynamic(
  () => import('./lightswind/shiny-text').then((m) => m.ShinyText),
  {ssr: false},
)

const TEXT = 'A Hashir original.'

/**
 * Warm gold shine sweep over the footer signature — twice, then it rests.
 * Static gilt text until mount / when reduced motion.
 */
export function SigShine({active}: {active: boolean}) {
  const reduced = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  if (!mounted || reduced || !active) {
    return (
      <span className="sig-text" data-text={TEXT}>
        {TEXT}
      </span>
    )
  }
  return (
    <ShinyTextLazy
      className="sig-text"
      size="base"
      weight="normal"
      baseColor="#6e631f"
      shineColor="rgba(255, 249, 224, 0.95)"
      speed={2.4}
      repeat={2}
      intensity={1}
    >
      {TEXT}
    </ShinyTextLazy>
  )
}
