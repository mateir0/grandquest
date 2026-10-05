'use client'

/** Small underlined text-button for quiet destructive actions. */
export function QuietButton({
  onClick,
  children,
  autoFocus,
  disabled,
}: {
  onClick: () => void
  children: React.ReactNode
  autoFocus?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      autoFocus={autoFocus}
      disabled={disabled}
      style={{
        background: 'none',
        border: 0,
        padding: 0,
        minHeight: 0,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.6 : 1,
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
