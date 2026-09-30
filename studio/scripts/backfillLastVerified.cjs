const {getCliClient} = require('@sanity/cli')

/**
 * One-off backfill: stamp every quest's lastVerified to now so the
 * verification queue starts clean on first deploy.
 *
 * Run with the logged-in user's token (write access):
 *   npx sanity exec scripts/backfillLastVerified.cjs --with-user-token
 */
async function main() {
  const client = getCliClient().withConfig({apiVersion: '2024-01-01'})
  const quests = await client.fetch(`*[_type == "quest"]{_id}`)
  const now = new Date().toISOString()
  let updated = 0
  for (const quest of quests) {
    await client.patch(quest._id).set({lastVerified: now}).commit()
    updated += 1
  }
  console.log(`Backfilled lastVerified=${now} on ${updated} quest(s)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
