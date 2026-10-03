/**
 * Vendored copy of ../../web/lib/logger.ts.
 *
 * Sanity Functions deploy functions/deadline-sweeper/ alone, so the web logger
 * module is not present at build time — this copy keeps the function
 * self-contained and emits byte-identical log lines.
 * If the format ever changes, update BOTH files identically.
 *
 * Server-side only (cron runtime) — never import into client components.
 *
 * Emits one JSON object per console line:
 *   { "ts": "<ISO timestamp>", "level": "info|warn|error", "event": "<event_name>", "data": { ... } }
 *
 * Privacy rules (defense in depth — call sites already pass counts/IDs only):
 *  - Never log API keys, tokens, key prefixes, or request bodies.
 *  - Sanity document IDs and counts are fine (not PII).
 *  - Never log full user content (titles, descriptions, bodies, profiles).
 *
 * The logger itself must never throw.
 */

export type LogLevel = 'info' | 'warn' | 'error'

export interface LogLine {
  ts: string
  level: LogLevel
  event: string
  data: Record<string, unknown>
}

const REDACTED = '[redacted]'

/** Longest string value ever emitted — anything longer is truncated, never dumped whole. */
const MAX_STRING_LENGTH = 300

/** Maximum nesting depth the scrubber will walk before redacting. */
const MAX_DEPTH = 5

/**
 * Lowercase substrings matched against the normalised (non-alphanumeric
 * stripped) key name. Deliberately broad on secrets/bodies/content, and
 * verified to never match the logger's own safe keys (run_id, query_name,
 * message, stage, quests_checked, stale_found, instances_updated, duration_ms).
 */
const SENSITIVE_KEY_PARTS = [
  'key',
  'token',
  'secret',
  'password',
  'passwd',
  'auth',
  'cookie',
  'session',
  'credential',
  'request',
  'response',
  'body',
  'content',
  'description',
  'title',
  'text',
  'html',
  'email',
  'phone',
  'address',
]

function isSensitiveKey(key: string): boolean {
  const normalised = key.toLowerCase().replace(/[^a-z0-9]/g, '')
  return SENSITIVE_KEY_PARTS.some((part) => normalised.includes(part))
}

function scrubValue(value: unknown, depth: number): unknown {
  if (value == null) return value
  if (depth > MAX_DEPTH) return REDACTED
  if (typeof value === 'string') {
    const singleLine = value.replace(/[\r\n]+/g, ' ')
    return singleLine.length > MAX_STRING_LENGTH
      ? `${singleLine.slice(0, MAX_STRING_LENGTH)}…`
      : singleLine
  }
  if (typeof value === 'number' || typeof value === 'boolean') return value
  if (value instanceof Date) return value.toISOString()
  if (value instanceof Error) return scrubValue(value.message, depth + 1)
  if (Array.isArray(value)) {
    return value.slice(0, 50).map((entry) => scrubValue(entry, depth + 1))
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      try {
        out[key] = isSensitiveKey(key) ? REDACTED : scrubValue(entry, depth + 1)
      } catch {
        out[key] = REDACTED
      }
    }
    return out
  }
  return REDACTED
}

/** Scrub a data payload so it is safe to serialise into a log line. Never throws. */
export function scrubData(data: Record<string, unknown>): Record<string, unknown> {
  try {
    return scrubValue(data, 0) as Record<string, unknown>
  } catch {
    return {}
  }
}

/**
 * Short, single-line error summary for log lines. Uses the message only —
 * never stacks, never request bodies. Never throws.
 */
export function errorMessage(err: unknown): string {
  try {
    const raw =
      err instanceof Error ? err.message : typeof err === 'string' ? err : JSON.stringify(err)
    const singleLine = String(raw).replace(/[\r\n]+/g, ' ').trim()
    if (!singleLine) return 'unknown error'
    return singleLine.length > MAX_STRING_LENGTH
      ? `${singleLine.slice(0, MAX_STRING_LENGTH)}…`
      : singleLine
  } catch {
    return 'unknown error'
  }
}

function emit(level: LogLevel, event: string, data?: Record<string, unknown>): void {
  try {
    const line: LogLine = {
      ts: new Date().toISOString(),
      level,
      event: String(event),
      data: scrubData(data ?? {}),
    }
    const serialised = JSON.stringify(line)
    if (level === 'error') console.error(serialised)
    else if (level === 'warn') console.warn(serialised)
    else console.log(serialised)
  } catch {
    // The logger must never throw — a logging failure is silently swallowed.
  }
}

/** Emit one JSON log line at info level. Never throws. */
export function logInfo(event: string, data?: Record<string, unknown>): void {
  emit('info', event, data)
}

/** Emit one JSON log line at warn level. Never throws. */
export function logWarn(event: string, data?: Record<string, unknown>): void {
  emit('warn', event, data)
}

/** Emit one JSON log line at error level. Never throws. */
export function logError(event: string, data?: Record<string, unknown>): void {
  emit('error', event, data)
}
