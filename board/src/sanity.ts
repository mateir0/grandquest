import {createClient, type SanityClient} from '@sanity/client'
import {
  createEngine,
  ENGINE_API_VERSION,
  type WorkflowClient,
} from '@sanity/workflow-engine'

export const PROJECT_ID = 'aitdwcxh'
export const DATASET = 'production'
/** Tag + workflow resource the quest-verification v1 definitions are deployed under. */
export const WORKFLOW_TAG = 'production'
export const DEFINITION = 'quest-verification'

/** The write token lives ONLY in board/.env (uncommitted). Never logged. */
export function writeToken(): string | undefined {
  const token = import.meta.env.VITE_SANITY_WRITE_TOKEN
  return token && token.length > 0 ? token : undefined
}

/** Public reads: quest list fallback, sweepLog panel. No token needed. */
export const readClient: SanityClient = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: ENGINE_API_VERSION,
  useCdn: false,
})

function authedClient(): SanityClient {
  const token = writeToken()
  if (!token) throw new Error('Missing VITE_SANITY_WRITE_TOKEN — add it to board/.env')
  return createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: ENGINE_API_VERSION,
    token,
    useCdn: false,
    perspective: 'raw',
  })
}

export function engineFor(token: string) {
  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: ENGINE_API_VERSION,
    token,
    useCdn: false,
    perspective: 'raw',
  })
  return createEngine({
    client: client as unknown as WorkflowClient,
    workflowResource: {type: 'dataset', id: `${PROJECT_ID}.${DATASET}`},
    tag: WORKFLOW_TAG,
  })
}

export type Engine = ReturnType<typeof engineFor>

export function authedEngine(): Engine {
  const token = writeToken()
  if (!token) throw new Error('Missing VITE_SANITY_WRITE_TOKEN — add it to board/.env')
  return engineFor(token)
}

export {authedClient}
