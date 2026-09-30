import {defineField, defineType} from 'sanity'

/** One inventory item: a document the applicant must gather for a quest. */
export const requiredDocumentType = defineType({
  name: 'requiredDocument',
  title: 'Required Document',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Document', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'description', title: 'What it is', type: 'text'}),
    defineField({name: 'tips', title: 'How to get it', type: 'text'}),
  ],
})
