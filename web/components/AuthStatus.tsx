'use client'

/**
 * Minimal logged-in indicator + logout for the site header.
 * Anonymous visitors see a subtle "Sign in" link; nothing else changes.
 */

import {useEffect, useState} from 'react'
import {useRouter} from 'next/navigation'
import {createClient} from '../lib/supabase/client'

export function AuthStatus() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)

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
    return (
      <a href="/login" className="nav-link">
        Sign in
      </a>
    )
  }

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setEmail(null)
    window.dispatchEvent(new Event('grantquest:xp'))
    router.refresh()
  }

  return (
    <span
      className="player-indicator"
      style={{display: 'inline-flex', alignItems: 'center', gap: '0.6rem'}}
      title={email}
    >
      <span className="player-label">{email}</span>
      <button
        type="button"
        onClick={signOut}
        className="nav-link"
        style={{background: 'none', border: 0, cursor: 'pointer', minHeight: 0}}
      >
        Sign out
      </button>
    </span>
  )
}
