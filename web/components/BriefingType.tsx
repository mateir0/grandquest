'use client'

import {useEffect, useState} from 'react'
import dynamic from 'next/dynamic'
import {useReducedMotion} from '../lib/motion'

const TypingTextLazy = dynamic(
  () => import('./lightswind/typing-text').then((m) => m.TypingText),
  {ssr: false},
)

/**
 * Typewriter enhancement for the hero briefing label. The full text is always
 * in the SSR HTML (LCP-safe); the per-character animation only runs on the
 * client when motion is allowed.
 */
export function BriefingType({text}: {text: string}) {
  const reduced = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  if (!mounted || reduced) return <>{text}</>
  return (
    <TypingTextLazy
      as="span"
      className="gq-typing"
      fontSize=""
      fontWeight=""
      color=""
      letterSpacing=""
      duration={1.8}
    >
      {text}
    </TypingTextLazy>
  )
}
