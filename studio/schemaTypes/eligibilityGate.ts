import {defineField, defineType} from 'sanity'

/**
 * One clearable eligibility requirement. Typed so the web app's matching engine
 * can evaluate a player profile against it WITHOUT guessing:
 *  - nationality / degreeLevel / fieldOfStudy → pass if profile value ∈ allowedValues
 *  - minGPA / ageLimit → pass if profile number meets minValue
 *  - languageTest / other → always manual (shown with howToProve)
 */
export const eligibilityGateType = defineType({
  name: 'eligibilityGate',
  title: 'Eligibility Gate',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Gate',
      type: 'string',
      validation: (r) => r.required(),
      description: 'e.g. "Must be a Pakistani national"',
    }),
    defineField({
      name: 'gateType',
      title: 'Gate type',
      type: 'string',
      options: {
        list: [
          {title: 'Nationality', value: 'nationality'},
          {title: 'Study level', value: 'degreeLevel'},
          {title: 'Field of study', value: 'fieldOfStudy'},
          {title: 'Minimum GPA', value: 'minGPA'},
          {title: 'Language test', value: 'languageTest'},
          {title: 'Age limit', value: 'ageLimit'},
          {title: 'Other requirement', value: 'other'},
        ],
        layout: 'dropdown',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'allowedValues',
      title: 'Allowed values',
      type: 'array',
      of: [{type: 'string'}],
      description: 'Values that PASS this gate. e.g. ["Pakistan", "India", "Bangladesh"]',
    }),
    defineField({
      name: 'minValue',
      title: 'Minimum value',
      type: 'number',
      description: 'Threshold for GPA / age gates',
    }),
    defineField({
      name: 'howToProve',
      title: 'How to prove it',
      type: 'text',
      description: 'What document or step proves this gate — shown to the player',
    }),
  ],
  preview: {
    select: {title: 'title', gateType: 'gateType'},
    prepare: ({title, gateType}) => ({title, subtitle: gateType}),
  },
})
