import {defineField, defineType} from 'sanity'

/**
 * A Quest = one scholarship. The heart of GrantQuest.
 * Eligibility gates + required documents are references (reused across quests),
 * and the verification workflow (status + lastVerified) is the freshness engine.
 */
export const questType = defineType({
  name: 'quest',
  title: 'Quest (Scholarship)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Quest title',
      type: 'string',
      validation: (r) => r.required(),
      description: 'e.g. "ERSU Scholarship — University of Messina"',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'provider',
      title: 'Provider',
      type: 'string',
      validation: (r) => r.required(),
      description: 'Who grants it — university, government, foundation',
    }),
    defineField({name: 'providerUrl', title: 'Provider URL', type: 'url'}),
    defineField({
      name: 'level',
      title: 'Study level',
      type: 'string',
      options: {list: ['undergrad', 'masters', 'phd', 'any'], layout: 'radio'},
    }),
    defineField({
      name: 'fieldsOfStudy',
      title: 'Fields of study',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Leave empty if open to all fields',
    }),
    defineField({
      name: 'countries',
      title: 'Host countries',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'amount',
      title: 'Award amount',
      type: 'string',
      description: 'Free text — awards vary too much for a number. e.g. "Full tuition + €7,000/yr stipend"',
    }),
    defineField({
      name: 'deadline',
      title: 'Application deadline',
      type: 'datetime',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'gates',
      title: 'Eligibility gates',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'eligibilityGate'}]}],
      description: 'Clear ALL gates to unlock this quest',
    }),
    defineField({
      name: 'documents',
      title: 'Required documents (inventory)',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'requiredDocument'}]}],
    }),
    defineField({name: 'description', title: 'Briefing', type: 'array', of: [{type: 'block'}]}),
    defineField({
      name: 'applyUrl',
      title: 'Apply URL',
      type: 'url',
      validation: (r) => r.required(),
    }),
    // ---- verification workflow: the freshness engine ----
    defineField({
      name: 'status',
      title: 'Verification status',
      type: 'string',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'In review', value: 'inReview'},
          {title: 'Verified', value: 'verified'},
          {title: 'Published', value: 'published'},
          {title: 'Needs re-verification', value: 'needsReverification'},
          {title: 'Archived', value: 'archived'},
        ],
        layout: 'dropdown',
      },
      initialValue: 'draft',
      validation: (r) => r.required(),
    }),
    defineField({name: 'lastVerified', title: 'Last verified', type: 'datetime'}),
    defineField({
      name: 'verificationNotes',
      title: 'Verification notes',
      type: 'text',
      description: 'What was checked, and what to re-check next time',
    }),
    defineField({name: 'featured', title: 'Featured quest', type: 'boolean', initialValue: false}),
  ],
  preview: {
    select: {title: 'title', provider: 'provider', deadline: 'deadline', status: 'status'},
    prepare({title, provider, deadline, status}) {
      const d = deadline ? new Date(deadline).toLocaleDateString() : 'no deadline'
      return {title, subtitle: `${provider} · ⏳ ${d} · ${status}`}
    },
  },
})
