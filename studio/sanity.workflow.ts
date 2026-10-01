import type {WorkflowDeploymentInput} from '@sanity/workflow-engine'
import {defineWorkflowConfig} from '@sanity/workflow-engine/define'
import {questVerification} from './workflows/quest-verification'

// Resource coordinates stay literal: the config is imported inside deployed
// functions, where the shell and .env do not exist.
export const production = {
  name: 'production',
  tag: 'production',
  // A required subject (content reference) needs reader model 10.
  expectedMinReaderModel: 10,
  workflowResource: {type: 'dataset', id: 'aitdwcxh.production'},
  definitions: [questVerification],
} satisfies WorkflowDeploymentInput

export default defineWorkflowConfig({deployments: [production]})
