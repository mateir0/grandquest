import {useState} from 'react'
import type {CSSProperties} from 'react'
import {
  useDocumentOperation,
  type DocumentActionComponent,
  type DocumentBadgeComponent,
  type DocumentBadgeDescription,
} from 'sanity'
import type {StructureBuilder} from 'sanity/structure'
import {CheckmarkIcon, WarningOutlineIcon} from '@sanity/icons'

/**
 * Freshness-verification workflow for quest documents.
 *
 * Red badge rule ("NEEDS RE-VERIFICATION"): lastVerified is older than 30 days
 * (or was never set), OR the deadline is within 60 days while status is published.
 * Everything else shows a green "FRESH" badge.
 *
 * Plain Structure Builder + badges + actions only — no new plugins.
 */

/** A quest is stale once its verification is older than this. */
export const STALE_AFTER_DAYS = 30
/** A published quest with a deadline nearer than this needs re-verification. */
export const NEAR_DEADLINE_DAYS = 60

const DAY_MS = 86_400_000

interface QuestLike {
  status?: string
  deadline?: string
  lastVerified?: string
}

/** True when the quest carries the red badge. Shared by badge, queue and actions. */
export function needsReverification(doc?: QuestLike | null): boolean {
  if (!doc) return false
  if (!doc.lastVerified) return true
  const verifiedAt = new Date(doc.lastVerified).getTime()
  if (!Number.isNaN(verifiedAt) && Date.now() - verifiedAt > STALE_AFTER_DAYS * DAY_MS) return true
  if (doc.status === 'published' && doc.deadline) {
    const deadlineAt = new Date(doc.deadline).getTime()
    if (!Number.isNaN(deadlineAt) && deadlineAt - Date.now() < NEAR_DEADLINE_DAYS * DAY_MS)
      return true
  }
  return false
}

/** Green FRESH badge, or red NEEDS RE-VERIFICATION badge, on quest documents. */
export const questFreshnessBadge: DocumentBadgeComponent = (props) => {
  const doc = (props.draft || props.published) as QuestLike | null | undefined
  if (!doc) return null
  if (needsReverification(doc)) {
    const red: DocumentBadgeDescription = {
      label: 'NEEDS RE-VERIFICATION',
      title: 'Stale verification or deadline is near — re-verify this quest',
      color: 'danger',
      icon: WarningOutlineIcon,
    }
    return red
  }
  const green: DocumentBadgeDescription = {
    label: 'FRESH',
    title: 'Verified within the last 30 days and the deadline is not near',
    color: 'success',
    icon: CheckmarkIcon,
  }
  return green
}

/** Sets status=needsReverification. Hidden once the quest is already flagged. */
export const FlagForReverificationAction: DocumentActionComponent = (props) => {
  const {id, type, draft, published, onComplete} = props
  const {patch} = useDocumentOperation(id, type)
  const doc = (draft || published) as QuestLike | null | undefined
  if (doc?.status === 'needsReverification') return null
  return {
    label: 'Flag for re-verification',
    title: 'Move this quest into the verification queue',
    icon: WarningOutlineIcon,
    tone: 'caution',
    disabled: Boolean(patch.disabled),
    onHandle: () => {
      if (patch.disabled) return
      patch.execute([{set: {status: 'needsReverification'}}])
      onComplete()
    },
  }
}

const dialogText: CSSProperties = {margin: '0 0 12px', fontSize: 14, lineHeight: 1.5}
const dialogNotes: CSSProperties = {
  width: '100%',
  minHeight: 88,
  padding: '8px 10px',
  fontSize: 14,
  fontFamily: 'inherit',
  border: '1px solid #c9c2b8',
  borderRadius: 4,
  resize: 'vertical',
  boxSizing: 'border-box',
}
const dialogButtons: CSSProperties = {
  display: 'flex',
  gap: 8,
  justifyContent: 'flex-end',
  marginTop: 12,
}
const dialogButton: CSSProperties = {
  padding: '8px 14px',
  fontSize: 14,
  borderRadius: 4,
  cursor: 'pointer',
}
const dialogConfirm: CSSProperties = {
  ...dialogButton,
  background: '#227124',
  border: '1px solid #227124',
  color: '#fff',
}
const dialogCancel: CSSProperties = {
  ...dialogButton,
  background: 'transparent',
  border: '1px solid #c9c2b8',
  color: 'inherit',
}

/**
 * Sets status=published with lastVerified=now. A dialog collects optional
 * verificationNotes so the verify step records what was checked.
 */
export const MarkVerifiedAction: DocumentActionComponent = (props) => {
  const {id, type, onComplete} = props
  const {patch} = useDocumentOperation(id, type)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [notes, setNotes] = useState('')
  return {
    label: 'Mark verified',
    title: 'Verify this quest: status back to published, stamped just now',
    icon: CheckmarkIcon,
    tone: 'positive',
    disabled: Boolean(patch.disabled),
    onHandle: () => setDialogOpen(true),
    dialog: dialogOpen
      ? {
          type: 'dialog',
          header: 'Mark quest verified',
          onClose: () => setDialogOpen(false),
          content: (
            <div style={{padding: '4px 0'}}>
              <p style={dialogText}>
                This sets status to published and stamps lastVerified to now. Add a note
                about what you checked — it is saved to verificationNotes.
              </p>
              <textarea
                style={dialogNotes}
                value={notes}
                onChange={(e) => setNotes(e.currentTarget.value)}
                placeholder="e.g. Checked provider page: amount, deadline and gates still current."
              />
              <div style={dialogButtons}>
                <button style={dialogCancel} onClick={() => setDialogOpen(false)}>
                  Cancel
                </button>
                <button
                  style={dialogConfirm}
                  disabled={Boolean(patch.disabled)}
                  onClick={() => {
                    if (patch.disabled) return
                    const set: Record<string, unknown> = {
                      status: 'published',
                      lastVerified: new Date().toISOString(),
                    }
                    if (notes.trim()) set.verificationNotes = notes.trim()
                    patch.execute([{set}])
                    setDialogOpen(false)
                    onComplete()
                  }}
                >
                  Mark verified
                </button>
              </div>
            </div>
          ),
        }
      : null,
  }
}

/**
 * "Verification queue" — every quest with status=needsReverification, never
 * verified, stale (>30 days), or published with a deadline inside 60 days.
 * Cutoffs are computed once at Studio load and passed as GROQ params so the
 * date math stays exact. Sorted by deadline ascending; one click opens the quest.
 */
export function verificationQueueItem(S: StructureBuilder) {
  const thirtyDaysAgo = new Date(Date.now() - STALE_AFTER_DAYS * DAY_MS).toISOString()
  const sixtyDaysOut = new Date(Date.now() + NEAR_DEADLINE_DAYS * DAY_MS).toISOString()
  return S.listItem()
    .title('Verification queue')
    .icon(WarningOutlineIcon)
    .child(
      S.documentList()
        .title('Verification queue')
        .filter(
          '_type == "quest" && (status == "needsReverification" || !defined(lastVerified) || lastVerified < $thirtyDaysAgo || (status == "published" && defined(deadline) && deadline < $sixtyDaysOut))',
        )
        .params({thirtyDaysAgo, sixtyDaysOut})
        .defaultOrdering([{field: 'deadline', direction: 'asc'}]),
    )
}
