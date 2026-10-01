import {useState} from 'react'
import type {CSSProperties} from 'react'
import {
  useDocumentOperation,
  type DocumentActionComponent,
  type DocumentBadgeComponent,
  type DocumentBadgeDescription,
} from 'sanity'
import {CheckmarkIcon, WarningOutlineIcon} from '@sanity/icons'
import {
  getFreshness,
  getFreshnessCutoffs,
} from '../shared/freshness'
export {verificationQueueItem} from './verificationQueue'

/**
 * Freshness-verification workflow for quest documents.
 *
 * Red badge rule ("NEEDS RE-VERIFICATION"): lastVerified is older than 30 days
 * (or missing/invalid), OR the deadline is within 60 days.
 * Everything else shows a green "FRESH" badge.
 *
 * Plain Structure Builder + badges + actions only — no new plugins.
 */

interface QuestLike {
  status?: string
  deadline?: string | null
  lastVerified?: string | null
}

/** True when the quest carries the red badge. */
export function needsReverification(doc?: QuestLike | null): boolean {
  if (!doc) return false
  return getFreshness(doc, getFreshnessCutoffs()) === 'stale'
}

/** Green FRESH badge, or red NEEDS RE-VERIFICATION badge, on quest documents. */
export const questFreshnessBadge: DocumentBadgeComponent = (props) => {
  const doc = (props.draft || props.published) as QuestLike | null | undefined
  if (!doc) return null
  if (getFreshness(doc, getFreshnessCutoffs()) === 'stale') {
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
