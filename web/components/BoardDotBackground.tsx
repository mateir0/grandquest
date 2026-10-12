'use client'

import dynamic from 'next/dynamic'
import {useReducedMotion} from '../lib/motion'

// GridDotBackgrounds (contains DotBackground) stays off the critical path
const DotBackground = dynamic(
  () =>
    import('./lightswind/grid-dot-backgrounds').then((m) => m.DotBackground),
  {ssr: false},
)

/**
 * Faint sepia dot grid behind the Quest Board section only.
 * Map-cartography feel — barely visible. If you can clearly see dots, it's too strong.
 * Only renders when motion is allowed.
 */
export function BoardDotBackground({children}: {children: React.ReactNode}) {
  const reduced = useReducedMotion()

  if (reduced) return <>{children}</>

  return (
    <DotBackground
      dotSize={1}
      dotColor="#b5a642"
      darkDotColor="#b5a642"
      spacing={28}
      showFade={false}
      className="board-dot-bg"
      style={{opacity: 0.18}}
    >
      {children}
    </DotBackground>
  )
}