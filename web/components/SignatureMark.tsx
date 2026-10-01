/**
 * SignatureMark — a painter's signature in the lower-right of the canvas.
 *
 * Pure typography + CSS/SVG, no image files. The name is set in the site's
 * IM Fell English italic and gilded in brass; on first paint it is laid down
 * left-to-right by an invisible quill (a soft mask sweep), then a brass
 * flourish strokes itself beneath it, and the mark rests static forever.
 *
 * The fixed wrapper never intercepts clicks (pointer-events: none); only the
 * signature glyphs themselves are interactive.
 */
export function SignatureMark() {
  return (
    <div className="signature-mark">
      <span className="signature-name">Hashir</span>
      <svg
        className="signature-flourish"
        viewBox="0 0 150 20"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          pathLength={1}
          d="M4 12 C 28 6, 66 6, 104 10 S 138 15, 146 7"
        />
      </svg>
    </div>
  )
}
