import puppeteer from 'puppeteer'
import fs from 'node:fs'
import path from 'node:path'

const OUT = path.resolve('C:/Users/Dell/grandquest/brag-output/work')
const URL = 'https://grantquest.tech'

const log = (...a) => console.log(...a)

const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox']})
const page = await browser.newPage()
await page.setViewport({width: 1920, height: 1080, deviceScaleFactor: 1})

async function grab(url, name) {
  log('GOTO', url)
  await page.goto(url, {waitUntil: 'networkidle2', timeout: 60000})
  await new Promise((r) => setTimeout(r, 1500))
  // full page screenshot
  await page.screenshot({path: path.join(OUT, name + '-full.png'), fullPage: true})
  // viewport screenshot (hero)
  await page.screenshot({path: path.join(OUT, name + '-hero.png')})
  return page
}

// HOME
await grab(URL, 'home')

// extract identity + copy
const info = await page.evaluate(() => {
  const cs = getComputedStyle(document.body)
  const grab = (sel) => Array.from(document.querySelectorAll(sel)).map((e) => e.textContent.trim()).filter(Boolean)
  const fontOf = (sel) => {
    const el = document.querySelector(sel)
    return el ? getComputedStyle(el).fontFamily : null
  }
  return {
    title: document.title,
    bodyFont: cs.fontFamily,
    bodyBg: cs.backgroundColor,
    bodyColor: cs.color,
    h1Font: fontOf('h1'),
    h1: grab('h1'),
    h2: grab('h2'),
    navLinks: grab('nav a'),
    cta: grab('.btn, a.btn, button'),
    cardTitles: grab('.card-title'),
    tags: grab('.tag').slice(0, 20),
    countdowns: grab('.countdown-pill, .countdown-value').slice(0, 12),
    metaDesc: document.querySelector('meta[name=description]')?.content || '',
  }
})
fs.writeFileSync(path.join(OUT, 'home-info.json'), JSON.stringify(info, null, 2))
log('HOME INFO', JSON.stringify(info, null, 2))

// grab a quest card href for the detail page
const questHref = await page.evaluate(() => {
  const a = document.querySelector('a.card')
  return a ? a.getAttribute('href') : null
})
log('QUEST HREF', questHref)

// capture scrolling section stills on home (board)
const scrollShots = async (prefix) => {
  const h = await page.evaluate(() => document.body.scrollHeight)
  const steps = Math.min(6, Math.ceil(h / 1080))
  for (let i = 0; i < steps; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * 900)
    await new Promise((r) => setTimeout(r, 400))
    await page.screenshot({path: path.join(OUT, `${prefix}-scroll-${i}.png`)})
  }
  await page.evaluate(() => window.scrollTo(0, 0))
}
await scrollShots('home')

// DETAIL
if (questHref) {
  const durl = questHref.startsWith('http') ? questHref : URL + questHref
  await grab(durl, 'detail')
  const dinfo = await page.evaluate(() => {
    const grab = (sel) => Array.from(document.querySelectorAll(sel)).map((e) => e.textContent.trim()).filter(Boolean)
    return {
      h1: grab('h1'),
      provider: grab('.provider'),
      amount: grab('.amount'),
      countdown: grab('.countdown-value'),
      objectives: grab('.objective-title').slice(0, 8),
      gtype: grab('.gtype').slice(0, 8),
      inventory: grab('.inventory-title').slice(0, 8),
      briefing: grab('.briefing-content p').slice(0, 3),
    }
  })
  fs.writeFileSync(path.join(OUT, 'detail-info.json'), JSON.stringify(dinfo, null, 2))
  log('DETAIL INFO', JSON.stringify(dinfo, null, 2))
  await scrollShots('detail')
}

// LOG
await grab(URL + '/log', 'log')

await browser.close()
log('DONE')
