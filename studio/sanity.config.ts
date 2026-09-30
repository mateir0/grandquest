import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'
import {
  FlagForReverificationAction,
  MarkVerifiedAction,
  questFreshnessBadge,
  verificationQueueItem,
} from './verification'

export default defineConfig({
  name: 'grantquest',
  title: 'GrantQuest Studio',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'replace-me',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([verificationQueueItem(S), S.divider(), ...S.documentTypeListItems()]),
    }),
  ],
  document: {
    badges: (prev, {schemaType}) =>
      schemaType === 'quest' ? [...prev, questFreshnessBadge] : prev,
    actions: (prev, {schemaType}) =>
      schemaType === 'quest'
        ? [...prev, FlagForReverificationAction, MarkVerifiedAction]
        : prev,
  },
  schema: {
    types: schemaTypes,
  },
})
