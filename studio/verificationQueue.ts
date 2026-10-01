import {debounceTime, map, merge, switchMap, timer} from 'rxjs'
import type {StructureBuilder} from 'sanity/structure'
import {WarningOutlineIcon} from '@sanity/icons'
import {
  FRESHNESS_PROJECTION,
  getFreshnessCutoffs,
  STALE_FRESHNESS_FILTER,
} from '../shared/freshness'

// Manual flags remain in the queue independently of freshness. No workflow writes.
export const VERIFICATION_QUEUE_QUERY = `*[
  _type == "quest" && (status == "needsReverification" || ${STALE_FRESHNESS_FILTER})
] {_id, title, deadline, ${FRESHNESS_PROJECTION}}
  | order(freshness desc, dateTime(deadline) asc, _id asc)`

/** A live, derived-order list; native document-list ordering requires stored fields. */
export function verificationQueueItem(S: StructureBuilder) {
  const client = S.context.getClient({apiVersion: '2026-01-01'}).withConfig({
    useCdn: false,
    perspective: 'drafts',
  })
  return S.listItem()
    .title('Verification queue')
    .icon(WarningOutlineIcon)
    .child(() =>
      // Refresh cutoffs while open as well as when opening the queue.
      merge(
        timer(0, 60_000),
        client.withConfig({perspective: 'raw'}).listen('*[_type == "quest"]', {}, {
          includeResult: false,
          visibility: 'query',
        }),
      ).pipe(
        debounceTime(100),
        switchMap(() =>
          client.observable.fetch(
            VERIFICATION_QUEUE_QUERY,
            {...getFreshnessCutoffs()},
          ),
        ),
        map((quests: {_id: string; title?: string}[]) =>
          S.list()
            .id('verification-queue')
            .title('Verification queue')
            .items(
              quests.map((quest) =>
                S.documentListItem()
                  .id(quest._id)
                  .schemaType('quest')
                  .title(quest.title || 'Untitled quest'),
              ),
            ),
        ),
      ),
    )
}
