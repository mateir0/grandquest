import {defineField, defineType} from 'sanity'

/**
 * Append-only audit trail written by the `deadline-sweeper` Sanity Function.
 * One document per quest reopened. Never updated — the fields are read-only.
 */
export const sweepLogType = defineType({
  name: 'sweepLog',
  title: 'Sweep log entry',
  type: 'document',
  readOnly: true,
  fields: [
    defineField({
      name: 'quest',
      title: 'Quest',
      type: 'reference',
      to: [{type: 'quest'}],
      readOnly: true,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'ranAt',
      title: 'Ran at',
      type: 'datetime',
      readOnly: true,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'reason',
      title: 'Reason',
      type: 'string',
      readOnly: true,
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: {title: 'quest.title', reason: 'reason', ranAt: 'ranAt'},
    prepare({title, reason, ranAt}) {
      const when = ranAt ? new Date(ranAt).toLocaleString() : 'unknown time'
      return {title: title || 'Quest', subtitle: `${reason} · ${when}`}
    },
  },
})
