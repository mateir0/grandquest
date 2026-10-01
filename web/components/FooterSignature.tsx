'use client'

import {useEffect, useRef, useState} from 'react'

/**
 * FooterSignature — the maker's sign-off, right-aligned under the footer.
 *
 * Pure typography + CSS/SVG, no image files. "A Hashir original." is set in the
 * site's IM Fell English italic and gilded in brass. When the footer first
 * scrolls into view (once per page load) the quill writes the phrase out, a
 * hand-drawn flourish curls beneath it, and a soft brass glint sweeps across —
 * then the mark rests. Every step is compositor-only (mask-position,
 * stroke-dashoffset, background-position, opacity) so there is no layout thrash.
 *
 * Reduced motion is handled in CSS: the animated states live inside a
 * `prefers-reduced-motion: no-preference` block, so a reduced-motion visitor
 * sees the finished static signature immediately regardless of `in-view`.
 */
export function FooterSignature() {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node || inView) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      {threshold: 0.6},
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [inView])

  return (
    <div ref={ref} className={`footer-signature${inView ? ' in-view' : ''}`}>
      <span className="sig-text" data-text="A Hashir original.">
        A Hashir original.
      </span>
      <svg
        className="sig-flourish"
        viewBox="0 0 180 18"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path pathLength={1} d="M6 10 C 40 3, 96 3, 150 8 S 172 14, 176 5" />
      </svg>
    </div>
  )
}
