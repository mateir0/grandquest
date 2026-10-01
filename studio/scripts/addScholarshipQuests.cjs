/**
 * Add 11 verified scholarship quests to Sanity production (project aitdwcxh).
 *
 * DATA HONESTY: every field here was verified against the official scholarship
 * site on 2026-10-01. Unknown facts (deadlines, stipend figures, GPA floors,
 * document lists) are left unset — never invented. Where the official page
 * publishes no document list, `documents` is an honest empty array.
 *
 * Per quest: createOrReplace the quest + its eligibilityGate / requiredDocument
 * references (deterministic ids → idempotent), set lastVerified=now (UTC) and
 * legacy status=published, then create its quest-verification workflow instance
 * and drive it to `verified` through the real transitions
 * (unverified → underReview → verified). ERSU is an EXISTING delisted record:
 * its fields are replaced in place and its existing instance reused.
 *
 * Token: VITE_SANITY_WRITE_TOKEN from board/.env (fallback SANITY_AUTH_TOKEN).
 * Never logged.
 *
 * Run from repo root (or studio/):
 *   node studio/scripts/addScholarshipQuests.cjs            # dry run
 *   node studio/scripts/addScholarshipQuests.cjs --apply    # write
 */
const fs = require('fs')
const path = require('path')
const {createClient} = require('@sanity/client')
const {createEngine, refDataset, ENGINE_API_VERSION} = require('@sanity/workflow-engine')

const PROJECT_ID = 'aitdwcxh'
const DATASET = 'production'
const TAG = 'production'
const DEFINITION = 'quest-verification'
const APPLY = process.argv.includes('--apply')
const VERIFIED_AT = new Date().toISOString()

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function readToken() {
  const envPath = path.join(__dirname, '..', '..', 'board', '.env')
  try {
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*VITE_SANITY_WRITE_TOKEN\s*=\s*(.+?)\s*$/)
      if (m) return m[1].replace(/^["']|["']$/g, '')
    }
  } catch {
    /* fall through */
  }
  if (process.env.SANITY_AUTH_TOKEN) return process.env.SANITY_AUTH_TOKEN
  throw new Error('No write token: set VITE_SANITY_WRITE_TOKEN in board/.env or SANITY_AUTH_TOKEN.')
}

/** Compact gate/doc builders: g(title, gateType, {allowedValues,minValue,howToProve}). */
const g = (title, gateType, extra = {}) => ({title, gateType, ...extra})
const d = (title, description, tips) => ({
  title,
  ...(description ? {description} : {}),
  ...(tips ? {tips} : {}),
})

/** Portable-Text briefing from one or more paragraphs. */
function briefing(...paragraphs) {
  return paragraphs.map((text, i) => ({
    _type: 'block',
    _key: `b${i + 1}`,
    style: 'normal',
    markDefs: [],
    children: [{_type: 'span', _key: `s${i + 1}`, text, marks: []}],
  }))
}

function gateDoc(questId, i, gate) {
  return {
    _id: `gate-${questId}-${i + 1}`,
    _type: 'eligibilityGate',
    title: gate.title,
    gateType: gate.gateType,
    ...(gate.allowedValues ? {allowedValues: gate.allowedValues} : {}),
    ...(gate.minValue != null ? {minValue: gate.minValue} : {}),
    ...(gate.howToProve ? {howToProve: gate.howToProve} : {}),
  }
}

function documentDoc(questId, i, doc) {
  return {
    _id: `doc-${questId}-${i + 1}`,
    _type: 'requiredDocument',
    title: doc.title,
    ...(doc.description ? {description: doc.description} : {}),
    ...(doc.tips ? {tips: doc.tips} : {}),
  }
}

const QUESTS = [
  // 1. Fulbright Foreign Student Program — USA
  {
    _id: 'quest-fulbright-fsp',
    title: 'Fulbright Foreign Student Program (USA)',
    provider: 'U.S. Department of State (administered by IIE / AMIDEAST)',
    url: 'https://foreign.fulbrightonline.org',
    countries: ['United States'],
    amount:
      'J-1 visa sponsorship, funding support and a health benefit plan (stipend amount not published). ~4,000 grants per year for Master’s, Doctorate or research study at US campuses.',
    deadline: null,
    gates: [
      g('Resident in your country of nomination at the time of application.', 'other', {
        howToProve: 'Per-country Fulbright Commission / US Embassy process.',
      }),
      g("Hold a bachelor’s-equivalent degree by the program start, with a good academic record.", 'degreeLevel', {
        howToProve: 'Degree certificate and transcripts.',
      }),
      g('English fluency; TOEFL 550 PBT / 79–80 iBT or IELTS 6.5 is recommended.', 'languageTest', {
        howToProve: 'TOEFL or IELTS score report (recommended levels).',
      }),
      g('NOT a US citizen or permanent resident; dual US citizens are ineligible.', 'nationality'),
      g('Excludes clinical programs: dentistry, medicine, pharmacy and nursing.', 'other'),
    ],
    documents: [], // per-country; no single official list
    briefing: briefing(
      'Two placement models: IIE-Placement (IIE secures your admission) and Self-Placement (you apply to US programs directly).',
      'Deadlines are set per country by each Fulbright Commission or US Embassy, so no single global deadline is published.',
    ),
    verifyNote:
      'Verified against foreign.fulbrightonline.org on 2026-10-01. Deadline, stipend amount and document list left unset — set per country, not published centrally.',
  },

  // 2. DAAD EPOS — Germany
  {
    _id: 'quest-daad-epos',
    title: 'DAAD EPOS — Development-Related Postgraduate Courses (Germany)',
    provider: 'DAAD (German Academic Exchange Service)',
    url: 'https://www2.daad.de/deutschland/stipendium/datenbank/en/21148-scholarship-database/?status=&origin=&subjectGrps=&daad=&q=&page=1&detail=50076777',
    countries: ['Germany'],
    amount:
      '€992/month (graduates) or €1,300/month (doctoral, rising to €1,400 from Feb 2026); health, accident and liability insurance; travel allowance; possible rent and family subsidies. Duration 12–42 months.',
    deadline: null,
    gates: [
      g('Citizen of a country on the DAC list of ODA recipients.', 'nationality'),
      g("Bachelor’s degree completed no more than 6 years ago.", 'other', {
        howToProve: 'Degree certificate with completion date.',
      }),
      g("At least 2 years of professional experience after the bachelor’s degree.", 'other', {
        howToProve: 'Employment certificates covering ≥ 2 years.',
      }),
      g('Applying in the same or a related subject to your degree.', 'other'),
      g('Grades in the upper third of your class.', 'other', {
        howToProve: 'Academic transcript.',
      }),
      g('Not resident in Germany for more than 15 months at the time of application.', 'other'),
      g('IELTS/TOEFL for English-taught courses, or B1 German for German-taught courses.', 'languageTest', {
        howToProve: 'Language certificate matching the course language.',
      }),
    ],
    documents: [
      d('DAAD application form and checklist'),
      d('Signed Europass CV'),
      d('Motivation letter', 'Max 2 pages, signed.'),
      d(
        'Employer recommendation letter + employment certificates',
        'Recommendation signed, on letterhead, with stamp; certificates covering ≥ 2 years.',
      ),
      d('Degree certificates and academic transcripts'),
      d('APS certificate', 'China, India and Vietnam applicants only.'),
      d('Language proof', 'IELTS/TOEFL (English-taught) or B1 German (German-taught).'),
    ],
    briefing: briefing(
      'Apply directly to up to 3 EPOS-eligible courses, NOT to DAAD. Each course sets its own application deadline.',
    ),
    verifyNote:
      'Verified against the DAAD scholarship database on 2026-10-01. Deadline left unset — each course sets its own.',
  },

  // 3. Gates Cambridge Scholarship — UK
  {
    _id: 'quest-gates-cambridge',
    title: 'Gates Cambridge Scholarship (UK)',
    provider: 'Gates Cambridge Trust',
    url: 'https://www.gatescambridge.org',
    countries: ['United Kingdom'],
    amount:
      'Full University Composition Fee + £23,152 maintenance (2026–27, 12-month rate); economy airfare to and from the UK; inbound visa and Immigration Health Surcharge costs.',
    deadline: '2026-10-14T22:59:00.000Z',
    gates: [
      g('Citizen of any country outside the UK.', 'nationality'),
      g(
        'Applying for a full-time or part-time (pilot) PhD, a full-time MLitt, or an eligible one-year full-time postgraduate course.',
        'other',
      ),
      g(
        'Excludes MASt, MBA/EMBA/MFin/EMAcc/BusD, PGCE, clinical medicine degrees, MD, and part-time courses other than the PhD pilot.',
        'other',
      ),
    ],
    documents: [
      d(
        'University of Cambridge graduate application',
        'A single application — complete the Gates Cambridge section within it.',
      ),
    ],
    briefing: briefing(
      'The 14 Oct 2026 deadline shown is the US-citizen round for 2027/28 entry. The international-round deadline is 8 Dec 2026 or 6 Jan 2027, depending on the course.',
      'Selection is on intellectual ability, reasons for the course choice, commitment to improving the lives of others, and leadership potential.',
    ),
    verifyNote:
      'Verified against gatescambridge.org on 2026-10-01. Deadline set to the US-citizen round (14 Oct 2026, 23:59 UK). International round is 8 Dec 2026 / 6 Jan 2027.',
  },

  // 4. Clarendon Fund, University of Oxford — UK
  {
    _id: 'quest-clarendon-oxford',
    title: 'Clarendon Fund Scholarship, University of Oxford (UK)',
    provider: 'University of Oxford',
    url: 'https://www.ox.ac.uk/clarendon',
    countries: ['United Kingdom'],
    amount:
      'Course fees in full + a grant for living expenses for the full fee-liability period (grant amount not published). ~200+ new awards each year.',
    deadline: null,
    gates: [
      g('Open to all nationalities.', 'nationality'),
      g('Open to all subject areas.', 'fieldOfStudy'),
      g('Full-time and part-time DPhil and Master’s students.', 'other'),
      g('Awarded on merit.', 'other'),
    ],
    documents: [], // nothing beyond the Oxford course application
    briefing: briefing(
      'No separate scholarship form: you are automatically considered when you apply for your Oxford course by its December/January graduate deadline.',
    ),
    verifyNote:
      'Verified against ox.ac.uk/clarendon on 2026-10-01. No separate deadline — consideration is automatic with the Oxford course application. Living-grant amount not published.',
  },

  // 5. Canada Graduate Research Scholarship – Doctoral — Canada
  {
    _id: 'quest-canada-cgs-doctoral',
    title: 'Canada Graduate Research Scholarship – Doctoral (Canada)',
    provider: 'Government of Canada (NSERC / CIHR / SSHRC)',
    url: 'https://www.nserc-crsng.gc.ca/Students-Etudiants/PG-CS/CGRSD-BESRD_eng.asp',
    countries: ['Canada'],
    level: 'phd',
    amount: 'CAD $40,000 per year for 36 months.',
    deadline: '2026-10-17T23:59:59.000Z',
    gates: [
      g('No more than 36 months of full-time doctoral study by 31 December of the application year.', 'other'),
      g(
        'International applicants: capped at 15% of awards and must be registered at an eligible Canadian institution by the deadline.',
        'other',
      ),
      g('No prior CIHR, NSERC or SSHRC doctoral award.', 'other'),
    ],
    documents: [], // per the official application
    briefing: briefing(
      'Official successor to the discontinued Vanier CGS. Verify the current competition terms on the NSERC page each year.',
    ),
    verifyNote:
      'Verified against the NSERC CGS-D page on 2026-10-01. Deadline 17 Oct 2026 (no official time published — set to end of day UTC). Document list left unset. Successor to Vanier CGS.',
  },

  // 6. Commonwealth Shared Scholarships — UK
  {
    _id: 'quest-commonwealth-shared',
    title: 'Commonwealth Shared Scholarships (UK)',
    provider: 'Commonwealth Scholarship Commission (UK FCDO)',
    url: 'https://cscuk.fcdo.gov.uk/scholarships/commonwealth-shared-scholarships-applications/',
    countries: ['United Kingdom'],
    level: 'masters',
    amount:
      'Master’s only, normally 12 months. Tuition and fees covered; the university shares the living-cost component (amount not published).',
    deadline: null,
    gates: [
      g('Citizen or refugee AND resident of an eligible Commonwealth country.', 'nationality'),
      g('First degree of at least 2:1 (or a 2:2 plus a relevant postgraduate qualification).', 'other', {
        howToProve: 'Full transcripts of all higher-education qualifications.',
      }),
      g('No more than 1 academic year studied or worked in a high-income country.', 'other'),
      g('Unable to afford UK study without this scholarship.', 'other'),
    ],
    documents: [
      d('Proof of citizenship or refugee status', 'Passport or national ID.'),
      d('Full transcripts of all higher-education qualifications'),
      d('References from at least 2 individuals'),
      d('Development Impact statement', 'In four parts.'),
    ],
    briefing: briefing(
      'Participating UK universities do the initial candidate selection; the CSC confirms the awards.',
      'The 2026/27 cycle is closed and 2027/28 dates are not yet published, so the deadline is left unset.',
    ),
    verifyNote:
      'Verified against cscuk.fcdo.gov.uk on 2026-10-01. Deadline unset — 2026/27 closed, 2027/28 not yet published. Living-cost share amount not published.',
  },

  // 7. Erasmus Mundus Joint Masters — EU
  {
    _id: 'quest-erasmus-mundus-jmd',
    title: 'Erasmus Mundus Joint Masters (EU)',
    provider: 'European Union (Erasmus+ Programme)',
    url: 'https://erasmus-plus.ec.europa.eu/opportunities/individuals/students/erasmus-mundus-joint-masters',
    level: 'masters',
    amount:
      'Full scholarships for the best-ranked students: participation costs plus travel, visa and a living allowance (monthly amount varies by programme). 1–2 year joint/multiple degrees delivered by ≥ 3 institutions in ≥ 3 countries.',
    deadline: null,
    gates: [
      g(
        'A bachelor’s degree, OR final-year bachelor status (you must graduate before the Master’s starts).',
        'degreeLevel',
      ),
    ],
    documents: [], // per programme; apply directly to the institution
    briefing: briefing(
      'Find programmes in the official EACEA course catalogue and apply directly to the institution running the programme, NOT to the EU.',
      'Each programme sets its own deadline, usually between October and January.',
    ),
    verifyNote:
      'Verified against the Erasmus+ opportunities page on 2026-10-01. Deadline, monthly allowance, host countries and documents vary by programme — left unset.',
  },

  // 8. Swiss Government Excellence Scholarships — Switzerland
  {
    _id: 'quest-swiss-gov-excellence',
    title: 'Swiss Government Excellence Scholarships (Switzerland)',
    provider: 'Swiss Confederation (Federal Commission for Scholarships, SERI)',
    url: 'https://www.sbfi.admin.ch/en/swiss-government-excellence-scholarships',
    countries: ['Switzerland'],
    amount:
      'CHF 2,450/month. Three tracks: Research (PhD students, 183 countries, max 12 months), PhD (183 countries, max 36 months) and Art (26 countries only, initial artistic Master’s, max 21 months).',
    deadline: null,
    gates: [
      g('Master’s degree completed (Research/PhD track) or Bachelor’s degree (Art track).', 'other'),
      g('Research/PhD applications must be backed by an academic supervisor in Switzerland.', 'other'),
      g('Maximum age 35.', 'ageLimit', {minValue: 35, howToProve: 'Passport / birth date.'}),
    ],
    documents: [
      d(
        'Country-specific application package',
        'Submitted via the Swiss diplomatic representation in your country of origin.',
      ),
    ],
    briefing: briefing(
      'The FCS selects on candidate profile, project quality and cooperation potential; awards are announced by end of May.',
      'The 2027–28 call opened on 20 Aug 2026; deadlines are set per country of origin, so the deadline is left unset.',
    ),
    verifyNote:
      'Verified against sbfi.admin.ch on 2026-10-01. Deadline unset — set per country of origin (2027–28 call opened 20 Aug 2026).',
  },

  // 9. Knight-Hennessy Scholars, Stanford — USA
  {
    _id: 'quest-knight-hennessy',
    title: 'Knight-Hennessy Scholars, Stanford (USA)',
    provider: 'Stanford University',
    url: 'https://knight-hennessy.stanford.edu/',
    countries: ['United States'],
    amount:
      'Up to 3 years: fellowship covering tuition + fees; stipend for living and academic expenses (amount not published); annual economy travel stipend; one-time relocation stipend; academic enrichment funds in years 2–3.',
    deadline: '2026-10-06T20:00:00.000Z',
    gates: [
      g('No age, citizenship or field-of-study restrictions.', 'other'),
      g(
        'Must apply to AND enroll in a full-time Stanford graduate degree program (excludes HCP, MLA, JSD/MLS, coterminal programs, and PhD students adding a same-discipline MA/MS).',
        'other',
      ),
      g('First bachelor’s degree conferred January 2020 or later (active military: January 2018 or later).', 'other', {
        howToProve: 'Degree certificate with conferral date.',
      }),
    ],
    documents: [
      d('Online application'),
      d('Essays'),
      d('Letters of recommendation'),
      d('Transcripts'),
    ],
    briefing: briefing(
      'A SEPARATE Stanford degree-program application is also required (MBA = Round 1; other programs by their own deadline or 1 Dec 2026).',
    ),
    verifyNote:
      'Verified against knight-hennessy.stanford.edu on 2026-10-01. Deadline 6 Oct 2026, 1:00pm Pacific (2027 cohort). Stipend amount not published.',
  },

  // 10. Schwarzman Scholars, Tsinghua — China
  {
    _id: 'quest-schwarzman-scholars',
    title: 'Schwarzman Scholars, Tsinghua University (China)',
    provider: 'Schwarzman Scholars, Tsinghua University (Beijing)',
    url: 'https://www.schwarzmanscholars.org/admissions/',
    countries: ['China'],
    level: 'masters',
    amount:
      'One-year fully-funded Master’s: tuition & fees, room & board, in-country study tour, travel to and from Beijing, health insurance, and a personal-expenses stipend (amount not published).',
    deadline: null,
    gates: [
      g('Undergraduate degree conferred before 1 August of the enrollment year.', 'other', {
        howToProve: 'Degree certificate with conferral date.',
      }),
      g('Aged 18–28 as of 1 August of the enrollment year.', 'ageLimit', {
        minValue: 28,
        howToProve: 'Passport / birth date.',
      }),
      g(
        'English: TOEFL ≥ 100, IELTS ≥ 7, Cambridge C1/C2 ≥ 185, or Duolingo ≥ 130 (waived with ≥ 2 years of English-medium study).',
        'languageTest',
        {howToProve: 'Test score report, or proof of ≥ 2 years English-medium study for a waiver.'},
      ),
    ],
    documents: [
      d('CV', 'Max 2 pages.'),
      d('Leadership Essay', '750 words.'),
      d('Statement of Purpose', '500 words.'),
      d('Transcripts'),
      d('Recommendation letters'),
      d('Short video self-introduction', '≤ 1 minute.'),
    ],
    briefing: briefing(
      'All fields of study are welcome. The Class of 2027–28 window is closed; the next cycle runs April–September 2027 globally, so the deadline is left unset.',
    ),
    verifyNote:
      'Verified against schwarzmanscholars.org on 2026-10-01. Deadline unset — Class of 2027–28 closed, next cycle Apr–Sep 2027. Stipend amount not published.',
  },

  // 11. ERSU Messina — EXISTING delisted test record: replace guessed fields.
  {
    existing: true,
    existingMatch: /ersu/i,
    idHint: 'ersu-messina',
    title: 'ERSU Scholarship — University of Messina',
    provider: 'ERSU Messina (Ente Regionale per il Diritto allo Studio Universitario di Messina)',
    url: 'https://www.ersumessina.it/2026/07/01/bando-di-concorso-per-lattribuzione-di-borse-di-studio-altri-contributi-economici-e-servizi-per-il-diritto-allo-studio-universitario-per-la-a-2026-2027/',
    countries: ['Italy'],
    level: 'any',
    amount:
      '€7,171.11/yr (fuori sede), €4,190.71/yr (pendolare) or €2,890.16/yr (in sede); +15% if ISEE ≤ 50% of the maximum, +40% for disability, +20% for female STEM students. Free bed in ERSU residences for awardees; 360 free meals/yr (fuori sede) or 180/yr (others).',
    deadline: '2026-08-18T12:00:00.000Z',
    gates: [
      g(
        'Enrolled or intending to enroll in 2026/2027 at the University of Messina or Conservatorio "A. Corelli" di Messina (triennale, magistrale a ciclo unico, magistrale biennale, unpaid PhD or specializzazione).',
        'other',
      ),
      g('ISEE ≤ €22,500.', 'other', {howToProve: 'ISEE (or ISEE parificato for internationals).'}),
      g('ISPE ≤ €53,000.', 'other', {howToProve: 'ISPE declaration.'}),
      g(
        'Merit: minimum CFU credits by 10/08/2026 (later years); or ≥ 15 CFU by 10/08/2027 and ≥ 20 by 30/11/2027 (first-years).',
        'other',
      ),
      g(
        'Internationals admitted; extra-EU applicants need a permesso di soggiorno and ISEE parificato.',
        'nationality',
        {howToProve: 'Permesso di soggiorno + ISEE parificato (extra-EU).'},
      ),
    ],
    documents: [
      d('Online application at studenti.ersumessina.it', 'SPID or CIE login required.', 'Upload PDFs ≤ 2MB each.'),
      d('ID document'),
      d('Permesso di soggiorno', 'Extra-EU applicants only.'),
      d('ISEE parificato documents'),
      d('Disability certificate', 'If applicable.'),
    ],
    briefing: briefing(
      'Applications closed 18 Aug 2026 (14:00 CEST). Scholarship rankings are published 06/11/2026 (first-years) and 09/12/2026 (later years).',
      'Housing expression of interest is due by 16/10/2026 14:00. The scholarship is incompatible with any other 2026/2027 scholarship.',
    ),
    verifyNote:
      'Verified against the ERSU Messina 2026/2027 bando on 2026-10-01. Deadline 18 Aug 2026 (14:00 CEST) — window now closed, so derived freshness is correctly NEEDS RE-VERIFICATION.',
  },
]

function slugify(title) {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

const refArray = (ids) => ids.map((_ref, i) => ({_key: `r${i + 1}`, _type: 'reference', _ref}))

async function getStage(engine, instanceId) {
  return engine.query({groq: `*[_id == "${instanceId}" && tag == $tag][0].currentStage`})
}

async function fireWithRetry(engine, instanceId, activity, action, attempts = 6) {
  let lastErr
  for (let a = 1; a <= attempts; a += 1) {
    try {
      await engine.fireAction({instanceId, activity, action})
      return
    } catch (err) {
      lastErr = err
      await sleep(1000 * a)
    }
  }
  throw lastErr
}

/** Walk an instance to `verified` through the real transitions. */
async function advanceToVerified(engine, instanceId, label) {
  for (let step = 0; step < 12; step += 1) {
    const stage = await getStage(engine, instanceId)
    if (stage === 'verified') return
    if (stage === 'unverified') await fireWithRetry(engine, instanceId, 'triage', 'start-review')
    else if (stage === 'underReview') await fireWithRetry(engine, instanceId, 'review', 'mark-verified')
    else throw new Error(`unexpected stage "${stage}" for ${label} (${instanceId})`)
  }
  throw new Error(`could not reach verified for ${label} (${instanceId})`)
}
async function main() {
  const token = readToken()
  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: ENGINE_API_VERSION,
    token,
    useCdn: false,
    perspective: 'raw',
  })
  const engine = createEngine({
    client,
    workflowResource: {type: 'dataset', id: `${PROJECT_ID}.${DATASET}`},
    tag: TAG,
  })

  // Resolve the existing ERSU record (delisted test quest) — never duplicate it.
  const ersuMatches = await client.fetch(
    `*[_type == "quest" && !(_id in path("drafts.**")) && title match "*ERSU*"]{_id, title}`,
  )
  if (ersuMatches.length !== 1) {
    throw new Error(
      `expected exactly 1 ERSU quest, found ${ersuMatches.length}: ${ersuMatches.map((q) => q._id).join(', ') || '(none)'}`,
    )
  }
  const ersuId = ersuMatches[0]._id

  // Freeze each quest's final _id (ERSU keeps its existing document id) + slug.
  const planned = QUESTS.map((q) => ({...q, _id: q.existing ? ersuId : q._id, slug: slugify(q.title)}))

  if (!APPLY) {
    console.log(`DRY RUN — ${planned.length} quests (ERSU resolved to ${ersuId}):`)
    for (const q of planned) {
      console.log(
        `- ${q.existing ? '[replace]' : '[create] '} ${q.title} | deadline=${q.deadline || 'UNSET'} | gates=${q.gates.length} docs=${q.documents.length}`,
      )
    }
    console.log('\n(dry run — pass --apply to write)')
    return
  }
  // Existing workflow instances, keyed by subject doc id (reuse, don't duplicate).
  const instances = await engine.query({
    groq: `*[_type == "sanity.workflow.instance" && tag == $tag && definition == "${DEFINITION}"]{_id, fields}`,
  })
  const instByDoc = new Map()
  for (const inst of instances) {
    const subject = (inst.fields || []).find((f) => f.name === 'subject')
    const gdr = subject && subject.value && subject.value.id
    if (gdr) instByDoc.set(gdr.split(':').pop(), inst)
  }

  for (const q of planned) {
    const gates = q.gates.map((gate, i) => gateDoc(q._id, i, gate))
    const docs = q.documents.map((doc, i) => documentDoc(q._id, i, doc))
    const tx = client.transaction()
    for (const gate of gates) tx.createOrReplace(gate)
    for (const doc of docs) tx.createOrReplace(doc)

    const fields = {
      title: q.title,
      slug: {_type: 'slug', current: q.slug},
      provider: q.provider,
      providerUrl: q.url,
      applyUrl: q.url,
      ...(q.level ? {level: q.level} : {}),
      ...(q.countries ? {countries: q.countries} : {}),
      amount: q.amount,
      gates: refArray(gates.map((x) => x._id)),
      documents: refArray(docs.map((x) => x._id)),
      description: q.briefing,
      status: 'published',
      lastVerified: VERIFIED_AT,
      verificationNotes: q.verifyNote,
    }

    if (q.existing) {
      // Replace guessed fields in place; drop any stale guessed fieldsOfStudy (open to all).
      tx.patch(q._id, (p) => p.set({...fields, deadline: q.deadline}).unset(['fieldsOfStudy']))
    } else {
      const base = {_id: q._id, _type: 'quest', ...fields}
      if (q.deadline) base.deadline = q.deadline
      tx.createOrReplace(base)
    }
    await tx.commit()

    // Drive the quest-verification instance to `verified` (reuse existing by subject).
    let inst = instByDoc.get(q._id)
    if (!inst) {
      const {instance} = await engine.startInstance({
        definition: DEFINITION,
        initialFields: [
          {
            type: 'subject',
            name: 'subject',
            value: refDataset({projectId: PROJECT_ID, dataset: DATASET, documentId: q._id, type: 'quest'}),
          },
        ],
      })
      inst = {_id: instance._id}
    }
    await advanceToVerified(engine, inst._id, q.title)
    console.log(`${q.existing ? 'replaced' : 'created '} + verified: ${q.title}`)
  }
  // Derived-freshness report (new rule: stale when lastVerified >30d old OR deadline passed).
  const now = Date.now()
  const fresh = []
  const stale = []
  for (const q of planned) {
    const deadlinePassed = q.deadline && Date.parse(q.deadline) < now
    ;(deadlinePassed ? stale : fresh).push(q)
  }
  console.log(`\nFRESH (just stamped, deadline not passed): ${fresh.length}`)
  for (const q of fresh) console.log(`  + ${q.title} | deadline=${q.deadline || 'UNSET'}`)
  console.log(`NEEDS RE-VERIFICATION (deadline passed, expected): ${stale.length}`)
  for (const q of stale) console.log(`  - ${q.title} | deadline=${q.deadline || 'UNSET'}`)
  console.log(`\nDone — ${planned.length} quests verified; lastVerified=${VERIFIED_AT}`)
}

main().catch((err) => {
  console.error(err && err.message ? err.message : err)
  process.exit(1)
})


