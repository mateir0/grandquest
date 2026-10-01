import {
  defineAction,
  defineActivity,
  defineField,
  defineStage,
  defineTransition,
  defineWorkflow,
} from '@sanity/workflow-engine/define'

/**
 * GrantQuest verification workflow.
 *
 * Stages: unverified -> underReview -> verified, with disputed reachable from
 * every stage. A `verified` quest can be flagged straight back to `unverified`.
 *
 * Authored against the official Sanity Workflows API
 * (https://www.sanity.io/docs/workflows). The definition is deployed with
 * `@sanity/workflow-cli`; the engine drives instances. No Studio version is
 * required for this definition to exist or run.
 */

/** Dispute is reachable from every stage, so every stage carries this pair. */
const disputeAction = () =>
  defineAction({
    name: 'dispute',
    title: 'Dispute',
    status: 'done',
    params: [{type: 'string', name: 'reason', title: 'Reason', required: true}],
    ops: [
      {
        type: 'field.set',
        target: {field: 'disputeReason'},
        value: {type: 'param', param: 'reason'},
      },
    ],
  })

export const questVerification = defineWorkflow({
  name: 'quest-verification',
  title: 'Quest verification',
  description:
    'Tracks a scholarship quest through unverified, underReview and verified, with disputed reachable from any stage.',
  initialStage: 'unverified',
  fields: [
    defineField({
      type: 'subject',
      name: 'subject',
      title: 'Quest',
      types: ['quest'],
      required: true,
      description: 'The quest document this verification run moves through the stages.',
      initialValue: {type: 'input'},
    }),
    defineField({type: 'string', name: 'disputeReason', title: 'Dispute reason'}),
  ],
  stages: [
    defineStage({
      name: 'unverified',
      title: 'Unverified',
      description: 'The quest needs verification (or re-verification).',
      activities: [
        defineActivity({
          name: 'triage',
          title: 'Triage the quest',
          actions: [
            defineAction({name: 'start-review', title: 'Start review', status: 'done'}),
            disputeAction(),
          ],
        }),
      ],
      transitions: [
        defineTransition({
          name: 'to-under-review',
          title: 'Begin review',
          to: 'underReview',
          when: '$allActivitiesDone && !defined($fields.disputeReason)',
        }),
        defineTransition({
          name: 'to-disputed',
          title: 'Dispute',
          to: 'disputed',
          when: 'defined($fields.disputeReason)',
        }),
      ],
    }),
    defineStage({
      name: 'underReview',
      title: 'Under review',
      description: 'Someone is checking the quest still matches the provider.',
      activities: [
        defineActivity({
          name: 'review',
          title: 'Verify the quest',
          actions: [
            defineAction({name: 'mark-verified', title: 'Mark verified', status: 'done'}),
            disputeAction(),
          ],
        }),
      ],
      transitions: [
        defineTransition({
          name: 'to-verified',
          title: 'Verify',
          to: 'verified',
          when: '$allActivitiesDone && !defined($fields.disputeReason)',
        }),
        defineTransition({
          name: 'to-disputed',
          title: 'Dispute',
          to: 'disputed',
          when: 'defined($fields.disputeReason)',
        }),
      ],
    }),
    defineStage({
      name: 'verified',
      title: 'Verified',
      description: 'The quest is verified. Flag it to send it back to the queue.',
      activities: [
        defineActivity({
          name: 'monitor',
          title: 'Monitor freshness',
          actions: [
            defineAction({
              name: 'flag-for-reverification',
              title: 'Flag for re-verification',
              status: 'done',
            }),
            disputeAction(),
          ],
        }),
      ],
      transitions: [
        defineTransition({
          name: 'to-unverified',
          title: 'Re-open verification',
          to: 'unverified',
          when: '$allActivitiesDone && !defined($fields.disputeReason)',
        }),
        defineTransition({
          name: 'to-disputed',
          title: 'Dispute',
          to: 'disputed',
          when: 'defined($fields.disputeReason)',
        }),
      ],
    }),
    defineStage({
      name: 'disputed',
      title: 'Disputed',
      description: 'The quest is disputed. Terminal until resolved outside the workflow.',
    }),
  ],
})
