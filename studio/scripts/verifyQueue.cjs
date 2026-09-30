const {getCliClient} = require('@sanity/cli')

/** Read-only check: backfill stamps + what the Verification queue filter returns. */
async function main() {
  const client = getCliClient().withConfig({apiVersion: '2024-01-01'})
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()
  const sixtyDaysOut = new Date(Date.now() + 60 * 86400000).toISOString()
  const all = await client.fetch(
    `*[_type == "quest"] | order(deadline asc) {_id, title, status, deadline, lastVerified}`,
  )
  console.log(`quests: ${all.length}`)
  for (const q of all) {
    console.log(`- ${q.title} | status=${q.status} | deadline=${q.deadline} | lastVerified=${q.lastVerified}`)
  }
  const queue = await client.fetch(
    `*[_type == "quest" && (status == "needsReverification" || !defined(lastVerified) || lastVerified < $thirtyDaysAgo || (status == "published" && defined(deadline) && deadline < $sixtyDaysOut))] | order(deadline asc) {title, status, deadline}`,
    {thirtyDaysAgo, sixtyDaysOut},
  )
  console.log(`queue: ${queue.length}`)
  for (const q of queue) {
    console.log(`- QUEUED: ${q.title} | status=${q.status} | deadline=${q.deadline}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
