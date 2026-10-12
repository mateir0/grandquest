'use client'

import {useReducedMotion} from '../lib/motion'

/**
 * Fine pinstripes behind the LEDGER STATS STRIP only (the stat numbers row).
 * Ledger-lines feel — static, faint sepia. Not the whole ledger card, not the map block.
 * Pure CSS — no vendor component needed for static pinstripes.
 */
export function LedgerStripes({children}: {children: React.ReactNode}) {
  const reduced = useReducedMotion()

  if (reduced) return <>{children}</>

  return (
    <div className="relative ledger-stripes-wrapper">
      <div className="ledger-stripes" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}