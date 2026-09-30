/**
 * GrantQuest data seeding — gates + documents from ../DATA-PACK.md (verified 2026-09-30).
 *
 * What it does, per quest (matched by exact title):
 *   1. createOrReplace each eligibilityGate as `gate-<questId>-<n>`
 *   2. createOrReplace each requiredDocument as `doc-<questId>-<n>`
 *   3. patch the quest's `gates` / `documents` reference arrays to those ids, in order
 *
 * Deterministic ids make this idempotent — re-running overwrites, never duplicates.
 * Quests with a verifiable-empty document list (SISGP, Pearson) are seeded with
 * `documents: []` so the honest empty state stays. Nothing here is invented: every
 * gate/document comes from DATA-PACK.md.
 *
 * Usage (from web/):  node scripts/seed-quests.mjs
 * Token: $SANITY_API_TOKEN, or the Sanity CLI auth token in ~/.config/sanity/config.json.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {createClient} from '@sanity/client'

const projectId = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'aitdwcxh'
const dataset = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

function readToken() {
  if (process.env.SANITY_API_TOKEN) return process.env.SANITY_API_TOKEN
  const cfgPath = path.join(os.homedir(), '.config', 'sanity', 'config.json')
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'))
  if (!cfg.authToken) throw new Error(`No SANITY_API_TOKEN and no authToken in ${cfgPath}`)
  return cfg.authToken
}

const client = createClient({projectId, dataset, apiVersion: '2026-01-01', token: readToken(), useCdn: false})

// ---------------------------------------------------------------------------
// Data pack (verbatim, mapped to the existing schema model)
// ---------------------------------------------------------------------------

/** GKS-U gate set is identical across embassy-track countries. */
function gksGates(extra = []) {
  return [
    {
      title:
        'Citizen of an NIIED-invited country; parents/guardians must not hold Korean citizenship (dual Korean citizenship disqualifies; renunciation needs Korean-government proof).',
      gateType: 'nationality',
      howToProve: 'Proof of citizenship for applicant + parents, and family relationship proof.',
    },
    {
      title: 'Under 25 — born on or after 1 March 2002.',
      gateType: 'ageLimit',
      minValue: 24,
      howToProve: 'Birth certificate or passport showing the birth date.',
    },
    {
      title:
        'Graduated (or graduating by 31 Dec 2026) from high school or an associate programme; bachelor’s holders cannot apply.',
      gateType: 'degreeLevel',
      allowedValues: ['undergrad'],
      howToProve: 'Graduation certificate or transcript (apostilled / consular-confirmed).',
    },
    {
      title:
        'Grades: 80+/100, or top 20% of class, or CGPA ≥ 2.64/4.0 (2.80/4.3, 2.91/4.5, 3.23/5.0).',
      gateType: 'minGPA',
      minValue: 2.64,
      howToProve: 'High school transcript showing the grade average / rank / CGPA.',
    },
    {
      title: 'Good mental and physical health for the full programme in Korea.',
      gateType: 'other',
      howToProve: 'Medical assessment (Form 6).',
    },
    {
      title: 'One application only — embassy track, one programme; duplicates are disregarded.',
      gateType: 'other',
      howToProve: 'Submit a single embassy-track application.',
    },
    ...extra,
  ]
}

/** GKS-U document inventory is identical across embassy-track countries. */
function gksDocuments() {
  return [
    {title: 'Application Form (Form 1)', description: 'Completed online, printed and signed.'},
    {title: 'Personal Statement (Form 2)'},
    {title: 'Study Plan (Form 3)'},
    {title: 'One Recommendation Letter (Form 4)'},
    {
      title: 'Proof of citizenship (applicant + parents) and family relationship proof',
    },
    {title: 'Agreement (Form 5)', description: 'Required in addition to Forms 1–4.'},
    {title: 'Medical Assessment (Form 6)', description: 'Required in addition to Forms 1–4.'},
    {title: 'Privacy Consent (Form 7)', description: 'Required in addition to Forms 1–4.'},
    {
      title: 'Graduation certificate + academic transcript',
      description: 'Apostilled or consular-confirmed.',
    },
  ]
}

const QUESTS = [
  // 1. Chevening (UK)
  {
    title: 'Chevening Scholarship (UK)',
    gates: [
      {
        title: 'Citizen of a Chevening-eligible country or territory.',
        gateType: 'nationality',
        howToProve: 'Passport / citizenship proof.',
      },
      {
        title: 'Commit to returning to your home country for at least two years after the scholarship ends.',
        gateType: 'other',
        howToProve: 'Signed undertaking in the application.',
      },
      {
        title: "At least two years' work experience after your undergraduate degree (equivalent to 2,800 hours).",
        gateType: 'other',
        howToProve: 'Employment records evidencing 2,800 hours / 2 years.',
      },
      {
        title:
          "Undergraduate degree qualifying you for a UK master's; finished undergrad at least two years before the application deadline, certificate in hand by interview.",
        gateType: 'degreeLevel',
        allowedValues: ['masters'],
        howToProve: 'Degree certificate and academic transcripts.',
      },
      {
        title:
          'Apply to three different eligible UK university courses; hold an unconditional offer from at least one by the timeline deadline.',
        gateType: 'other',
        howToProve: 'University offer letters / unconditional offer by the timeline deadline.',
      },
      {
        title:
          'Not a British/dual British citizen (Bermuda/BN(O) exceptions apply); not resident in the UK at application.',
        gateType: 'nationality',
      },
    ],
    documents: [
      {
        title: 'Four written essays',
        description: 'Leadership & influence, networking, study in the UK, career plan.',
      },
      {
        title: 'Two reference letters',
        description: 'Names at application; letters uploaded if shortlisted.',
      },
      {title: 'Degree certificate and academic transcripts'},
    ],
  },

  // 2. Eiffel (France) — data labeled 2026 session; official file structure only
  {
    title: 'Eiffel Excellence Scholarship Programme (France)',
    gates: [
      {
        title: 'Foreign nationality only; dual nationals holding French nationality are not eligible.',
        gateType: 'nationality',
      },
      {
        title: "Master's: no more than 29 at selection (born after March 1996 for the 2026 session).",
        gateType: 'ageLimit',
        minValue: 29,
        howToProve: 'Birth date evidence in the institution’s file.',
      },
      {
        title: 'PhD: no more than 35 at selection (born after March 1990 for the 2026 session).',
        gateType: 'ageLimit',
        minValue: 35,
        howToProve: 'Birth date evidence in the institution’s file.',
      },
      {
        title: 'Applications accepted ONLY from French higher education institutions — students cannot apply directly.',
        gateType: 'other',
        howToProve: 'Nomination submitted by the French higher education institution.',
      },
      {
        title: "Enrolling in a master's or PhD programme at a French higher education institution.",
        gateType: 'degreeLevel',
        allowedValues: ['masters', 'phd'],
      },
    ],
    documents: [
      {
        title: 'Part 1 — Candidate information',
        description: 'Mandatory fields + attachments.',
        tips: 'Official Eiffel file structure — the nominating institution assembles the file.',
      },
      {
        title: 'Part 2 — Presentation of the candidacy',
        description: 'Mandatory fields + attachments.',
        tips: 'Official Eiffel file structure — the nominating institution assembles the file.',
      },
      {
        title: 'Part 3 — Institution information',
        description: 'Mandatory fields + attachments.',
        tips: 'Official Eiffel file structure — the nominating institution assembles the file.',
      },
    ],
  },

  // 3. SISGP — no verifiable public document list, keep empty
  {
    title: 'Swedish Institute Scholarships for Global Professionals (SISGP)',
    gates: [
      {
        title: 'Citizen of one of the 34 eligible countries (residence there not required at application).',
        gateType: 'nationality',
        howToProve: 'Passport / citizenship proof.',
      },
      {
        title: 'Applied for a master’s programme eligible for the SI scholarship.',
        gateType: 'degreeLevel',
        allowedValues: ['masters'],
      },
      {
        title: 'Liable to pay tuition fees to Swedish universities.',
        gateType: 'other',
      },
      {
        title:
          'At least 3,000 hours of demonstrated work experience (max three employers); Armenia, Azerbaijan, Belarus, Georgia, Moldova, Ukraine exempt from the hour minimum but must still prove experience.',
        gateType: 'other',
        howToProve: 'Employer references (max three employers; 3,000 hours).',
      },
      {
        title: 'Demonstrated leadership experience from an employer or civil society engagement.',
        gateType: 'other',
        howToProve: 'Employer or civil-society evidence of leadership.',
      },
      {
        title:
          "Admitted (or conditionally admitted) to an eligible master's programme at admissions announcement; reserve-list placements don't count.",
        gateType: 'other',
      },
    ],
    documents: [], // honest empty state
  },

  // 4. ETH Zurich ESOP
  {
    title: 'ETH Zurich Excellence Scholarship & Opportunity Programme (ESOP)',
    gates: [
      {
        title: "Very good Bachelor's result — top 10% (grade A) by self-assessment.",
        gateType: 'other',
        howToProve: "Bachelor's transcript / grade evidence.",
      },
      {
        title: "Not already enrolled in an ETH Zurich Master's, and not already holding a Master's degree.",
        gateType: 'other',
        howToProve: 'Enrolment history.',
      },
      {
        title: 'Apply within the first window: 1–30 November (next: 1–30 Nov 2026 for HS27 start).',
        gateType: 'other',
        howToProve: 'Submitted within the 1–30 November window.',
      },
      {
        title: "Apply for an ETH Zurich Master's programme via eApply.",
        gateType: 'degreeLevel',
        allowedValues: ['masters'],
      },
    ],
    documents: [
      {
        title: "Pre-proposal for the Master's thesis",
        description: 'Self-developed, with proper scientific citation — plagiarism means exclusion.',
      },
      {
        title: 'Two reference letters from professors',
        description: "Uploaded via the system, if the programme doesn't ask for its own.",
      },
      {
        title: 'Standard Master admission dossier',
        description: 'Required in addition to the pre-proposal.',
      },
      {title: 'CV'},
    ],
  },

  // 5. Pearson — no verifiable public document list, keep empty
  {
    title: 'Lester B. Pearson International Scholarship (University of Toronto)',
    gates: [
      {
        title: 'International student — a non-Canadian requiring a study permit.',
        gateType: 'nationality',
      },
      {
        title:
          'In the final year of senior secondary school in 2026/2027, or graduated no earlier than June 2026.',
        gateType: 'other',
      },
      {title: 'Beginning studies at U of T in September 2027.', gateType: 'other'},
      {
        title: 'Not already in post-secondary studies, and not starting any in January 2027.',
        gateType: 'other',
      },
      {
        title: 'Nominated by your high school — one nominee per school per year.',
        gateType: 'other',
      },
      {title: 'Applied to at least one U of T undergraduate programme.', gateType: 'other'},
    ],
    documents: [], // honest empty state
  },

  // 6. Rhodes — Hong Kong SAR
  {
    title: 'Rhodes Scholarship — Hong Kong SAR (Oxford)',
    gates: [
      {
        title:
          'Hong Kong permanent resident, OR a Chinese citizen studying at / holding an Honours degree from a Hong Kong university, OR 7+ years living in Hong Kong with a strong personal connection.',
        gateType: 'nationality',
      },
      {
        title:
          'Aged 18–23 on 1 Oct 2026; or under 27 with the first undergraduate degree completed on/after 1 Oct 2025.',
        gateType: 'ageLimit',
        minValue: 23,
        howToProve: 'Birth certificate (age proof).',
      },
      {
        title: 'Undergraduate degree completed (or completing by July 2027).',
        gateType: 'other',
      },
      {
        title:
          "Academic standing meeting the chosen Oxford course's entry requirements (First Class Honours / GPA ≥ 3.70 improves chances).",
        gateType: 'minGPA',
        minValue: 3.7,
        howToProve: 'Official university transcript.',
      },
      {
        title: "Meet Oxford's higher-level English requirements, or qualify for a test waiver.",
        gateType: 'languageTest',
        howToProve: 'Oxford-recognised English test results (e.g. IELTS), or a waiver request.',
      },
    ],
    documents: [
      {title: 'Birth certificate', description: 'Age proof.'},
      {
        title: 'Hong Kong Identity Card / passport copy',
        description: 'Translation if needed.',
      },
      {title: 'Official university transcript'},
      {
        title: 'Oxford-recognised English test results (e.g. IELTS), or a waiver request with evidence',
      },
      {title: 'Head-and-shoulders colour photograph', description: 'jpg.'},
      {
        title: 'CV',
        description: 'Completed inside the application form — no separate upload.',
      },
      {title: 'Academic and personal statements'},
      {title: '4–5 referees', description: 'Referee details provided in the application.'},
    ],
  },

  // 7. Rhodes — Israel
  {
    title: 'Rhodes Scholarship — Israel (Oxford)',
    gates: [
      {title: 'Hold an Israeli passport.', gateType: 'nationality'},
      {title: 'Resided in Israel for at least five of the last ten years.', gateType: 'other'},
      {
        title:
          'Aged 18–23 on 1 Oct 2026; or under 27 with the first degree completed on/after 1 Oct 2025; or under 27 if military/national service completed.',
        gateType: 'ageLimit',
        minValue: 23,
        howToProve: 'Birth certificate (age proof).',
      },
      {
        title: 'Undergraduate degree completed (or completing by July 2027).',
        gateType: 'other',
      },
      {
        title:
          "Academic standing meeting the chosen Oxford course's entry requirements (First Class Honours / GPA ≥ 3.70 improves chances).",
        gateType: 'minGPA',
        minValue: 3.7,
        howToProve: 'Official university transcript.',
      },
      {
        title: "Meet Oxford's higher-level English requirements, or qualify for a test waiver.",
        gateType: 'languageTest',
        howToProve: 'Oxford-recognised English test results with marking scheme, or a waiver request.',
      },
    ],
    documents: [
      {title: 'Birth certificate', description: 'Age proof.'},
      {title: 'Valid passport copy', description: 'Translation if needed.'},
      {
        title: 'Official university transcript',
        description: 'Include official English translation if not in English.',
      },
      {
        title: 'Proof of residency in Israel',
        description: 'e.g. high school transcript / certificate.',
      },
      {
        title: 'Oxford-recognised English test results with marking scheme, or a waiver request',
      },
      {title: 'Full CV', description: 'Max 2 A4 pages, no photo.'},
      {title: 'Academic and personal statements'},
      {title: '4–6 referees'},
    ],
  },

  // 8. Rhodes — Bermuda
  {
    title: 'Rhodes Scholarship — Bermuda (Oxford)',
    gates: [
      {
        title: 'Bermudian, Permanent Residency Certificate holder, or child of a holder.',
        gateType: 'nationality',
      },
      {title: 'Educated in Bermuda for at least five years.', gateType: 'other'},
      {
        title:
          'Aged 18–23 on 1 Oct 2026; or under 27 with the first undergraduate degree completed on/after 1 Oct 2025.',
        gateType: 'ageLimit',
        minValue: 23,
        howToProve: 'Birth certificate or affidavit of birth (age proof).',
      },
      {
        title: 'Undergraduate degree completed (or completing by July 2027).',
        gateType: 'other',
      },
      {
        title:
          "Academic standing meeting the chosen Oxford course's entry requirements (First Class Honours / GPA ≥ 3.70 improves chances).",
        gateType: 'minGPA',
        minValue: 3.7,
        howToProve: 'Official university transcript.',
      },
    ],
    documents: [
      {title: 'Birth certificate or affidavit of birth', description: 'Age proof.'},
      {
        title: 'Valid passport',
        description: 'If not born in Bermuda, also Bermudian Status / PR certificates.',
      },
      {title: 'Official university transcript'},
      {
        title: 'Evidence of five years of education in Bermuda',
        description: 'e.g. certified high school marks.',
      },
      {title: 'Head-and-shoulders colour photograph', description: 'jpg.'},
      {title: 'CV', description: 'Completed inside the application form.'},
      {title: 'Academic and personal statements'},
      {title: 'Exactly five referees', description: '3 academic, 2 character.'},
    ],
  },

  // 9. Rhodes — United States
  {
    title: 'Rhodes Scholarship — United States (Oxford)',
    gates: [
      {
        title: 'US citizen, lawful permanent resident (status maintained), or active DACA holder.',
        gateType: 'nationality',
      },
      {
        title:
          "Apply as a representative of one state/territory (two years of college + bachelor's there, or legal residence there on 15 April of the application year); one district only.",
        gateType: 'other',
      },
      {
        title:
          'Aged 18–23 on 1 Oct 2026; or under 27 with the first undergraduate degree completed on/after 1 Oct 2025.',
        gateType: 'ageLimit',
        minValue: 23,
        howToProve: 'Birth certificate (age proof).',
      },
      {
        title:
          'Undergraduate degree completed by July 2027; GPA ≥ 3.70/4.0 with no rounding (below 3.70 needs a written exception request from the university president).',
        gateType: 'minGPA',
        minValue: 3.7,
        howToProve: 'Official university transcript; written exception request if below 3.70.',
      },
      {
        title:
          'English evidence NOT required in the Rhodes application itself (still required at the Oxford university-application stage).',
        gateType: 'languageTest',
      },
    ],
    documents: [
      {
        title: 'Passport, birth certificate, or government ID',
        description:
          'Age + nationality. LPRs add unexpired Form I-551; DACA holders add Form I-797 + Employment Authorization Card.',
      },
      {title: 'Official university transcript'},
      {
        title: 'Endorsement from your college/university',
        description: 'Separate from references.',
      },
      {
        title: 'Full CV',
        description: 'Max 2 letter-size pages, min 10pt, no photo; ORCID optional.',
      },
      {title: 'Head-and-shoulders colour photograph', description: 'jpg.'},
      {title: 'Academic Statement', description: 'Max 450 words.'},
      {title: 'Personal Statement', description: 'Max 1000 words, unedited by others.'},
      {title: '5–8 referees'},
    ],
  },

  // 10. GKS-U — Pakistan
  {
    title: 'Global Korea Scholarship (GKS-U) — Pakistan',
    gates: gksGates(),
    documents: gksDocuments(),
  },
  // 11. GKS-U — India
  {
    title: 'Global Korea Scholarship (GKS-U) — India',
    gates: gksGates(),
    documents: gksDocuments(),
  },
  // 12. GKS-U — Nigeria
  {
    title: 'Global Korea Scholarship (GKS-U) — Nigeria',
    gates: gksGates(),
    documents: gksDocuments(),
  },
  // 13. GKS-U — Brazil (+1 Overseas Koreans & Adoptees seat)
  {
    title: 'Global Korea Scholarship (GKS-U) — Brazil',
    gates: gksGates([
      {
        title:
          'Brazil holds 1 Overseas Koreans & Adoptees seat (proof of status required where applicable).',
        gateType: 'other',
        howToProve: 'Proof of Overseas Korean / Adoptee status where applicable.',
      },
    ]),
    documents: gksDocuments(),
  },

  // 14. Australia Awards — Nauru
  {
    title: 'Australia Awards Scholarship — Nauru (Naoero)',
    gates: [
      {
        title: 'Citizen of Nauru.',
        gateType: 'nationality',
        allowedValues: ['Nauru'],
        howToProve: 'Certified birth certificate or passport (photo ID if no passport).',
      },
      {
        title:
          "Meet the Policy Handbook's general requirements: 18+ on 1 Feb of the commencement year; not an Australian citizen/PR/visa applicant; not partnered with an Australian/NZ citizen or PR; not serving military; no criminal convictions.",
        gateType: 'other',
      },
      {
        title:
          "Bachelor's: QCE / Australian Year 12 / Fiji Year 13 with aggregate ≥ 200/400 (English + best three subjects); must not hold an equivalent-or-higher qualification.",
        gateType: 'other',
        howToProve: 'Certified academic transcripts.',
      },
      {
        title:
          "Master's: first degree in a related field + 2 years' relevant work experience; must not hold a Master's already.",
        gateType: 'other',
        howToProve: 'Employment referee report.',
      },
      {
        title: "At least 12 months' residence in Nauru before accepting.",
        gateType: 'other',
      },
      {
        title:
          'Not under any bond at applications close; previous recipients must have completed return periods.',
        gateType: 'other',
      },
    ],
    documents: [
      {
        title: 'Proof of citizenship',
        description: 'Certified birth certificate or passport; photo ID if no passport.',
      },
      {
        title: 'Certified academic transcripts',
        description: 'English translation if not in English.',
      },
      {title: 'CV / resume'},
      {
        title: 'Employment referee report',
        description: 'Signed, dated, officially stamped, on the Australia Awards template.',
      },
      {
        title: 'English test result',
        description:
          'IELTS 6.5 with no band below 6.0, or TOEFL/PTE equivalent; shortlisted applicants without one must sit the test.',
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------
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

async function main() {
  console.log(`Seeding ${projectId}/${dataset} …\n`)

  const existing = await client.fetch('*[_type == "quest"]{_id, title}')
  const byTitle = new Map(existing.map((q) => [q.title.trim(), q._id]))

  let seeded = 0
  let missing = 0

  for (const entry of QUESTS) {
    const questId = byTitle.get(entry.title.trim())
    if (!questId) {
      console.warn(`  ⚠ no quest titled "${entry.title}" — skipped`)
      missing++
      continue
    }

    const gates = entry.gates.map((g, i) => gateDoc(questId, i, g))
    const documents = entry.documents.map((d, i) => documentDoc(questId, i, d))

    const tx = client.transaction()
    for (const g of gates) tx.createOrReplace(g)
    for (const d of documents) tx.createOrReplace(d)
    tx.patch(questId, (p) =>
      p.set({
        gates: gates.map((g, i) => ({_key: `gate${i + 1}`, _type: 'reference', _ref: g._id})),
        documents: documents.map((d, i) => ({
          _key: `doc${i + 1}`,
          _type: 'reference',
          _ref: d._id,
        })),
      }),
    )
    await tx.commit({visibility: 'async'})

    console.log(`  ✓ ${entry.title} — ${gates.length} gates, ${documents.length} documents`)
    seeded++
  }

  console.log(`\nDone. ${seeded} quests seeded, ${missing} not found.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
