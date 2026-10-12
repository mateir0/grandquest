'use client'

import {useCallback, useEffect, useState} from 'react'
import dynamic from 'next/dynamic'
import {useReducedMotion} from '../lib/motion'

const SlideToConfirmLazy = dynamic(
  () => import('./lightswind/slide-to-confirm').then((m) => m.SlideToConfirm),
  {ssr: false},
)

/**
 * Destructive-action confirm: slide for pointer users, a real button for
 * keyboard users, Escape cancels. Reduced motion (or pre-hydration) gets the
 * button path only — the action is never pointer-only.
 */
export function SlideConfirm({
  slideLabel,
  successLabel,
  buttonLabel,
  cancelLabel,
  busy,
  onConfirm,
  onCancel,
}: {
  slideLabel: string
  successLabel: string
  buttonLabel: string
  cancelLabel: string
  busy?: boolean
  onConfirm: () => Promise<void> | void
  onCancel: () => void
}) {
  const reduced = useReducedMotion()
  const [mounted, setMounted] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  useEffect(() => {
    setMounted(true)
  }, [])

  const cancel = useCallback(() => {
    setResetKey((k) => k + 1)
    onCancel()
  }, [onCancel])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) cancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [busy, cancel])

  return (
    <div>
      {mounted && !reduced && (
        <SlideToConfirmLazy
          key={resetKey}
          text={slideLabel}
          successText={successLabel}
          onConfirm={onConfirm}
          width={300}
          height={56}
        />
      )}
      <div className="gq-slide-alt">
        <button
          type="button"
          className="btn ghost"
          disabled={busy}
          onClick={() => void onConfirm()}
        >
          {buttonLabel}
        </button>
        <button type="button" className="btn primary" disabled={busy} onClick={cancel}>
          {cancelLabel}
        </button>
      </div>
    </div>
  )
}
