'use client'

/**
 * Minimal logged-in indicator + logout for the site header, plus a quiet
 * delete-account/delete-data control with an inline confirm.
 * Anonymous visitors see a subtle "Sign in" link; nothing else changes.
 */

import {useEffect, useState} from 'react'
import {useRouter} from 'next/navigation'
import {createClient} from '../lib/supabase/client'
import {deleteAccountServer} from '../lib/account'

const LOG_KEY = 'grantquest.log'

function QuietButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'none',
        border: 0,
        padding: 0,
        minHeight: 0,
        cursor: 'pointer',
        color: 'var(--muted)',
        fontFamily: 'var(--font-body)',
        fontSize: '0.85rem',
        textDecoration: 'underline',
      }}
    >
      {children}
    </button>
  )
}

export function AuthStatus() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({data: {session}}) => {
      setEmail(session?.user?.email ?? null)
      setChecked(true)
    })
    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (!checked) return null

  if (!email) {
    if (!confirming) {
      return (
        <span style={{display: 'inline-flex', alignItems: 'center', gap: '0.6rem'}}>
          <a href="/login" className="nav-link">
            Sign in
          </a>
          <QuietButton onClick={() => setConfirming(true)}>Delete my data</QuietButton>
        </span>
      )
    }
    return (
      <span style={{display: 'inline-flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap'}}>
        <span className="muted-note" style={{fontSize: '0.85rem'}}>
          Delete your local quest log? This cannot be undone.
        </span>
        <QuietButton
          onClick={() => {
            try {
              localStorage.removeItem(LOG_KEY)
            } catch {
              /* ignore */
            }
            setConfirming(false)
            window.dispatchEvent(new Event('grantquest:xp'))
            router.refresh()
          }}
        >
          Delete everything
        </QuietButton>
        <QuietButton onClick={() => setConfirming(false)}>Keep my data</QuietButton>
      </span>
    )
  }

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setEmail(null)
    setConfirming(false)
    window.dispatchEvent(new Event('grantquest:xp'))
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

  if (confirming) {
    return (
      <span
        className="player-indicator"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.6rem',
          flexWrap: 'wrap',
        }}
      >
        <span className="muted-note" style={{fontSize: '0.85rem'}}>
          Delete your account? Your quest log, XP, and account will be
          permanently deleted. This cannot be undone.
        </span>
        <QuietButton onClick={deleteEverything}>
          {busy ? 'Deleting…' : 'Delete everything'}
        </QuietButton>
        <QuietButton onClick={() => !busy && setConfirming(false)}>
          Keep my account
        </QuietButton>
        {error && (
          <span className="muted-note" role="alert" style={{fontSize: '0.85rem'}}>
            {error}
          </span>
        )}
      </span>
    )
  }

  return (
    <span
      className="player-indicator"
      style={{display: 'inline-flex', alignItems: 'center', gap: '0.6rem'}}
      title={email}
    >
      <span className="player-label" style={{textTransform: 'none'}}>
        {email.split('@')[0].toLowerCase()}
      </span>
      <button
        type="button"
        onClick={signOut}
        className="nav-link"
        style={{background: 'none', border: 0, cursor: 'pointer', minHeight: 0}}
      >
        Sign out
      </button>
      <QuietButton onClick={() => setConfirming(true)}>Delete my account</QuietButton>
    </span>
  )
}
