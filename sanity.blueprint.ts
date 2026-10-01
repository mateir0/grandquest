import {defineBlueprint, defineRobotToken, defineScheduledFunction} from '@sanity/blueprints'

// On an organization-scoped stack, project-scoped resources name their project
// explicitly. Scheduled (cron) functions themselves are organization-scoped.
const PROJECT_ID = 'aitdwcxh'

export default defineBlueprint({
  resources: [
    // Editor-scoped robot token: the function drives the workflow engine and
    // appends sweepLog documents.
    defineRobotToken({
      name: 'deadline-sweeper-robot',
      label: 'Deadline sweeper',
      memberships: [
        {resourceType: 'project', resourceId: PROJECT_ID, roleNames: ['editor']},
      ],
    }),
    // Daily at 03:00 UTC. Reopens verification for quests that have gone stale.
    defineScheduledFunction({
      name: 'deadline-sweeper',
      src: './functions/deadline-sweeper',
      event: {expression: '0 3 * * *'},
      robotToken: '$.resources.deadline-sweeper-robot.token',
      timeout: 300,
    }),
  ],
})
