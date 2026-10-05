'use client'

/**
 * Navbar account control: one avatar icon button linking to /account when
 * logged in, the existing "Sign in" link when logged out. Nothing else.
 */

import {useEffect, useState} from 'react'
import {createClient} from '../lib/supabase/client'

export function AuthStatus() {
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

  const initial = (email.trim()[0] ?? '?').toUpperCase()
  return (
    <a href="/account" className="avatar" aria-label="Your account" title={email}>
      {initial}
    </a>
  )
}
