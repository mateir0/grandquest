'use client'

/**
 * Account page actions: sign out plus delete-my-account with the existing
 * inline confirm flow ("Delete everything / Keep my account").
 */

import {useEffect, useState} from 'react'
import {useRouter} from 'next/navigation'
import {createClient} from '../lib/supabase/client'
import {deleteAccountServer} from '../lib/account'
import {QuietButton} from './QuietButton'

export function AccountActions() {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!confirming) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) setConfirming(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirming, busy])

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setConfirming(false)
    window.dispatchEvent(new Event('grantquest:xp'))
    router.push('/')
    router.refresh()
  }

  const deleteEverything = async () => {
    setError('')
    setBusy(true)
    try {
      const result = await deleteAccountServer()
      if (result?.error) {
        setError(result.error)
        setBusy(false)
      }
      // On success the action redirects to `/` — no further handling.
    } catch {
      // Redirects throw by design; anything else lands here.
      setBusy(false)
    }
  }

  return (
    <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center'}}>
      <button type="button" className="btn ghost" onClick={signOut}>
        Sign out
      </button>
      {!confirming ? (
        <QuietButton onClick={() => setConfirming(true)}>Delete my account</QuietButton>
      ) : (
        <span style={{display: 'inline-flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap'}}>
          <span className="muted-note" style={{fontSize: '0.85rem'}}>
            Delete your account? Your quest log, XP, and account will be
            permanently deleted. This cannot be undone.
          </span>
          <QuietButton onClick={deleteEverything} disabled={busy}>
            {busy ? 'Deleting…' : 'Delete everything'}
          </QuietButton>
          <QuietButton onClick={() => !busy && setConfirming(false)} autoFocus>
            Keep my account
          </QuietButton>
          {error && (
            <span className="muted-note" role="alert" style={{fontSize: '0.85rem'}}>
              {error}
            </span>
          )}
        </span>
      )}
    </div>
  )
}
