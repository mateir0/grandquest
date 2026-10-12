import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'aitdwcxh',
  dataset: 'production',
  apiVersion: '2026-01-01',
  useCdn: false,
})

const quests = await client.fetch('*[_type == "quest"]{title, slug, provider, _id}')
console.log('Existing quests:', quests.length)
quests.forEach(x => console.log(' -', x.title, '|', x.slug?.current, '|', x.provider, '|', x._id))