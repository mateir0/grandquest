'use client'

/**
 * Login via Supabase email OTP (6-digit code, no passwords).
 * Anonymous visitors are never forced here — the quest log works
 * without an account; signing in only enables cross-device sync.
 */

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import Link from 'next/link'
import {createClient} from '../../lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const supabase = createClient()
      const {error} = await supabase.auth.signInWithOtp({email: email.trim()})
      if (error) throw error
      setStep('code')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not send the code.')
    } finally {
      setBusy(false)
    }
  }

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const supabase = createClient()
      const {error} = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: 'email',
      })
      if (error) throw error
      router.push('/log')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'That code did not work.')
    } finally {
      setBusy(false)
    }
  }

  const continueWithGoogle = async () => {
    setError('')
    setBusy(true)
    try {
      const supabase = createClient()
      const {error} = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {redirectTo: `${window.location.origin}/auth/callback`},
      })
      if (error) throw error
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not start Google sign-in.')
      setBusy(false)
    }
  }

  return (
    <div style={{maxWidth: '26rem', margin: '0 auto'}}>
      <div className="board-head">
        <div>
          <span className="eyebrow">Adventurer&apos;s gate</span>
          <h1>Sign in</h1>
          <p className="tagline">
            No password — we send a 6-digit code to your email. Signing in syncs
            your quest log across devices.
          </p>
        </div>
      </div>

      <div className="logcard">
        <button
          className="btn primary"
          type="button"
          onClick={continueWithGoogle}
          disabled={busy}
          style={{width: '100%'}}
        >
          Continue with Google →
        </button>
        <p className="muted-note" style={{textAlign: 'center', margin: '0.75rem 0 0'}}>
          — or —
        </p>
      </div>

      <div className="logcard">
        {step === 'email' ? (
          <form onSubmit={sendCode}>
            <div className="field">
              <span
                style={{
                  marginBottom: '0.3rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                }}
              >
                Email
              </span>
              <input
                type="text"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="muted-note" role="alert" style={{marginTop: '0.75rem'}}>
                {error}
              </p>
            )}
            <button
              className="btn primary"
              type="submit"
              disabled={busy || !email.trim()}
              style={{width: '100%', marginTop: '1rem'}}
            >
              {busy ? 'Sending…' : 'Send code →'}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode}>
            <p className="muted-note">
              Code sent to <strong>{email.trim()}</strong>.{' '}
              <button
                type="button"
                className="reset"
                style={{border: 0, padding: 0, minHeight: 0}}
                onClick={() => {
                  setStep('email')
                  setCode('')
                  setError('')
                }}
              >
                Use a different email
              </button>
            </p>
            <div className="field">
              <span
                style={{
                  marginBottom: '0.3rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                }}
              >
                6-digit code
              </span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
              />
            </div>
            {error && (
              <p className="muted-note" role="alert" style={{marginTop: '0.75rem'}}>
                {error}
              </p>
            )}
            <button
              className="btn primary"
              type="submit"
              disabled={busy || code.trim().length !== 6}
              style={{width: '100%', marginTop: '1rem'}}
            >
              {busy ? 'Verifying…' : 'Verify & enter →'}
            </button>
          </form>
        )}
      </div>

      <p className="muted-note" style={{textAlign: 'center'}}>
        No account? Just keep exploring —{' '}
        <Link href="/#board">the board works without one</Link>.
      </p>
    </div>
  )
}
