'use client'

import {useCallback, useEffect, useRef, useState} from 'react'
import {usePathname, useRouter, useSearchParams} from 'next/navigation'
import {Compass, X} from 'lucide-react'
import {
  TOUR_STEPS,
  isDismissed,
  markDismissed,
  restoreStorage,
  snapshotStorage,
  stepMatchesRoute,
  type TourSnapshot,
} from '../lib/tour'

const WAIT_MS = 3000

function waitForTarget(step: (typeof TOUR_STEPS)[number]): Promise<HTMLElement | null> {
  const primary = (): HTMLElement | null => {
    for (const selector of [step.selector, step.fallback]) {
      const el = document.querySelector(selector)
      if (el instanceof HTMLElement) return el
    }
    return null
  }
  const lastResort = (): HTMLElement | null => {
    for (const selector of ['.empty', 'main']) {
      const el = document.querySelector(selector)
      if (el instanceof HTMLElement) return el
    }
    return null
  }
  return new Promise((resolve) => {
    const immediate = primary()
    if (immediate) return resolve(immediate)
    // Idle observer instead of a hot poll: wakes only when the DOM changes.
    let done = false
    const finish = (el: HTMLElement | null) => {
      if (done) return
      done = true
      obs.disconnect()
      clearTimeout(timer)
      resolve(el ?? lastResort())
    }
    const obs = new MutationObserver(() => {
      const el = primary()
      if (el) finish(el)
    })
    obs.observe(document.documentElement, {childList: true, subtree: true})
    const timer = setTimeout(() => finish(primary()), WAIT_MS)
  })
}

/** Generic wait used before walking through a real quest card. */
function waitForSelector(selector: string, timeout = WAIT_MS): Promise<Element | null> {
  return new Promise((resolve) => {
    const immediate = document.querySelector(selector)
    if (immediate) return resolve(immediate)
    let done = false
    const finish = (el: Element | null) => {
      if (done) return
      done = true
      obs.disconnect()
      clearTimeout(timer)
      resolve(el)
    }
    const obs = new MutationObserver(() => {
      const el = document.querySelector(selector)
      if (el) finish(el)
    })
    obs.observe(document.documentElement, {childList: true, subtree: true})
    const timer = setTimeout(() => finish(document.querySelector(selector)), timeout)
  })
}

/** Tick one real checkbox so the demo writes an honest log entry (rolled back on exit). */
function tickFirstUnchecked(rootSelector: string): boolean {
  const box = document.querySelector(
    `${rootSelector} input[type="checkbox"]:not(:checked)`,
  )
  if (box instanceof HTMLInputElement) {
    box.click()
    return true
  }
  return false
}

function refreshXpBar() {
  window.dispatchEvent(new Event('grantquest:xp'))
}

/**
 * Spotlight tour shell. Mounted once in the root layout so it can walk the
 * real routes (/, /quest/[slug], /log). It never fabricates progress: the only
 * writes are real checkbox ticks on a fresh visitor's empty log, snapshotted
 * at start and restored byte-identical on every exit path.
 */
export function TourGuide() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [index, setIndex] = useState<number | null>(null)
  const [tip, setTip] = useState<{x: number; y: number; sheet: boolean} | null>(null)
  const snapRef = useRef<TourSnapshot | null>(null)
  const demoRef = useRef(false)
  const ownNavRef = useRef(false)
  const startedRef = useRef(false)
  const indexRef = useRef<number | null>(null)
  indexRef.current = index

  const end = useCallback(
    (dismiss: boolean) => {
      if (snapRef.current) {
        restoreStorage(localStorage, snapRef.current)
        snapRef.current = null
        refreshXpBar()
      }
      if (dismiss) markDismissed(localStorage)
      setIndex(null)
      setTip(null)
      startedRef.current = false
    },
    [],
  )

  const start = useCallback(() => {
    if (startedRef.current || typeof window === 'undefined') return
    startedRef.current = true
    snapRef.current = snapshotStorage(localStorage)
    demoRef.current = snapRef.current['grantquest.log'] == null
    ownNavRef.current = true
    if (window.location.pathname !== '/') router.push('/')
    setIndex(0)
  }, [router])

  // Explicit entry points only: ?tour=1 share links. Never auto-start otherwise.
  // The param is cleared with history.replaceState (not router.replace) so the
  // URL is cleaned without triggering a server re-render mid-tour.
  useEffect(() => {
    if (searchParams.get('tour') === '1' && !startedRef.current) {
      window.history.replaceState(null, '', pathname)
      start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // A manual route change away from the script ends the tour (as a dismissal).
  const prevPathRef = useRef(pathname)
  useEffect(() => {
    if (index === null) {
      prevPathRef.current = pathname
      return
    }
    if (prevPathRef.current === pathname) return // same-route step change
    prevPathRef.current = pathname
    if (ownNavRef.current) {
      ownNavRef.current = false
      return
    }
    const current = indexRef.current ?? 0
    if (!stepMatchesRoute(TOUR_STEPS[current], pathname)) end(true)
  }, [pathname, index, end])

  // Spotlight + tooltip positioning for the current step.
  // The ring is a tour-owned fixed box drawn over the target's rect — never a
  // class injected into app DOM (React re-renders would strip it). Geometry is
  // written straight to the ring node inside rAF (no React re-renders at all);
  // the tip re-renders only when its position actually moved.
  const lastPosRef = useRef<{x: number; y: number; sheet: boolean} | null>(null)
  const ringRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (index === null) return
    const step = TOUR_STEPS[index]
    let cancelled = false
    let target: HTMLElement | null = null
    let raf = 0
    let scheduled = false

    const resolveLive = (): HTMLElement | null => {
      for (const selector of [step.selector, step.fallback]) {
        const el = document.querySelector(selector)
        if (el instanceof HTMLElement) return el
      }
      return null
    }

    const paintRing = (rect: DOMRect | null) => {
      const ring = ringRef.current
      if (!ring) return
      if (!rect) {
        ring.style.display = 'none'
        return
      }
      ring.style.display = 'block'
      ring.style.transform = `translate3d(${rect.left - 7}px, ${rect.top - 7}px, 0)`
      ring.style.width = `${rect.width + 14}px`
      ring.style.height = `${rect.height + 14}px`
    }

    const commit = () => {
      scheduled = false
      if (cancelled) return
      // Adopt the live node if React swapped it mid-step.
      if (!target || !target.isConnected) {
        const fresh = resolveLive()
        if (!fresh) {
          paintRing(null)
          return
        }
        target = fresh
      }
      const rect = target.getBoundingClientRect()
      const real = target.tagName !== 'MAIN'
      paintRing(real ? rect : null)
      const sheet = window.innerWidth <= 560
      let x = 0
      let y = 0
      if (!sheet) {
        const below = rect.bottom + 16 + 190 < window.innerHeight
        y = below ? rect.bottom + 16 : Math.max(12, rect.top - 206)
        x = Math.max(12, Math.min(rect.left, window.innerWidth - 380))
      }
      const prev = lastPosRef.current
      if (
        !prev ||
        prev.sheet !== sheet ||
        Math.abs(prev.x - x) > 2 ||
        Math.abs(prev.y - y) > 2
      ) {
        lastPosRef.current = {x, y, sheet}
        setTip({x, y, sheet})
      }
    }

    const schedule = () => {
      if (scheduled || cancelled) return
      scheduled = true
      raf = requestAnimationFrame(commit)
    }

    void waitForTarget(step).then((el) => {
      if (cancelled || !el) return
      target = el
      // One centering scroll on entry — never inside the scroll loop.
      el.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
        block: 'center',
      })
      lastPosRef.current = null
      commit()
    })

    window.addEventListener('resize', schedule)
    window.addEventListener('scroll', schedule, true)
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('scroll', schedule, true)
    }
  }, [index, pathname])

  // Escape dismisses from anywhere.
  useEffect(() => {
    if (index === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') end(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, end])

  const advance = useCallback(() => {
    const current = indexRef.current
    if (current === null) return
    if (current === 1) {
      // Walk through a real quest: click the first board card once it exists
      // (the grid streams in after the server fetch — never strand the judge).
      ownNavRef.current = true
      setIndex(2)
      void waitForSelector('.board .grid .card').then((card) => {
        if (card instanceof HTMLAnchorElement) card.click()
        else end(true)
      })
      return
    }
    if (current === 3) {
      // Fresh visitors tick one real gate + doc so /log has an honest entry.
      if (demoRef.current) {
        tickFirstUnchecked('.section')
        tickFirstUnchecked('.inventory-grid')
      }
      ownNavRef.current = true
      setIndex(4)
      router.push('/log')
      return
    }
    if (current === TOUR_STEPS.length - 1) {
      end(true)
      return
    }
    setIndex(current + 1)
  }, [end, router])

  const back = useCallback(() => {
    const current = indexRef.current
    if (current === null || current === 0) return
    // Step back reheals route the same way forward did.
    if (current === 2) {
      ownNavRef.current = true
      setIndex(1)
      router.push('/')
      return
    }
    if (current === 4) {
      ownNavRef.current = true
      setIndex(3)
      router.back()
      return
    }
    setIndex(current - 1)
  }, [router])

  if (index === null) return null
  const step = TOUR_STEPS[index]

  return (
    <div className="tour-root" role="dialog" aria-modal="true" aria-label={`Tour step ${index + 1} of ${TOUR_STEPS.length}`}>
      <div className="tour-overlay" onClick={() => end(true)} aria-hidden="true" />
      <div className="tour-ring" ref={ringRef} aria-hidden="true" />
      {tip && (
        <div
          key={index}
          className={`tour-tip${tip.sheet ? ' tour-sheet' : ''}`}
          style={
            tip.sheet ? undefined : {transform: `translate3d(${tip.x}px, ${tip.y}px, 0)`}
          }
        >
          <div className="tour-tip-head">
            <span className="tour-kicker">
              <Compass size={14} aria-hidden="true" /> 30-second tour · {index + 1}/
              {TOUR_STEPS.length}
            </span>
            <button type="button" className="tour-x" onClick={() => end(true)} aria-label="End tour">
              <X size={16} />
            </button>
          </div>
          <p className="tour-copy">{step.copy}</p>
          <div className="tour-dots" aria-hidden="true">
            {TOUR_STEPS.map((s, i) => (
              <span key={s.id} className={i === index ? 'on' : ''} />
            ))}
          </div>
          <div className="tour-actions">
            {index > 0 && (
              <button type="button" className="btn ghost" onClick={back}>
                Back
              </button>
            )}
            <button type="button" className="btn ghost" onClick={() => end(true)}>
              Skip
            </button>
            <button
              type="button"
              className="btn primary"
              onClick={advance}
              data-testid={index === TOUR_STEPS.length - 1 ? 'tour-finish' : 'tour-next'}
            >
              {step.nextLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/** Hero entry point helper (used by tests / future callers). */
export function tourWasDismissed(): boolean {
  if (typeof window === 'undefined') return false
  return isDismissed(localStorage)
}
