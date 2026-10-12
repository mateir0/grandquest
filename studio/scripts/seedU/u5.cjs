/** Batch U5: Asia + Middle East universities (verified 2026-10-12). Schwarzman skipped — already on the board. */
const {g, d, briefing} = require('./helpers.cjs')

const U5 = [
  {
    _id: 'quest-kaist-scholarship',
    title: 'KAIST Scholarship (South Korea)',
    provider: 'Korea Advanced Institute of Science and Technology (KAIST)',
    url: 'https://admission.kaist.ac.kr/intl-graduate/FinancialSupport/Scholarship/KAISTScholarship',
    countries: ['South Korea'],
    level: 'any',
    amount:
      'Full tuition for admitted international graduate students, plus national health insurance and a monthly stipend. Top applicants are considered for the KAIST Global Presidential Scholarship (full tuition + 1,000,000 KRW/month for 4 semesters) or the KAIST Prestige Scholarship for PhD students (full tuition + 300,000 KRW/month for 8 semesters).',
    deadline: null,
    gates: [
      g('International applicant to a KAIST graduate program.', 'nationality'),
      g('Select the KAIST scholarship option as the financial resource in the admission application.', 'other'),
      g('Awardees are picked based on past performance and future promise in the application. No separate application needed.', 'other'),
    ],
    documents: [], // honest empty: considered with the admission application
    briefing: briefing(
      '2027 cycle — no exact dates published on the official page. The scholarship follows the KAIST admission cycles (Spring / Fall Early / Fall Regular). Status: not yet published.',
    ),
    verifyNote:
      'Verified against admission.kaist.ac.kr on 2026-10-12. Deadline left unset — no exact dates published (not yet published). Document list honestly empty (admission application only). Covers international graduate students; no verified undergraduate variant included.',
  },
  {
    _id: 'quest-snu-global',
    title: 'SNU Global Scholarship (South Korea)',
    provider: 'Seoul National University (SNU)',
    url: 'https://en.snu.ac.kr/admission/graduate/scholarships/after_admission',
    countries: ['South Korea'],
    level: 'any',
    amount:
      'Covers tuition fees, living expenses, airfare, and housing costs for about 160 international graduate students. The exact amount depends on each student’s situation.',
    deadline: null,
    gates: [
      g('International student in an SNU graduate program.', 'nationality'),
    ],
    documents: [], // honest empty: not published by the official source
    briefing: briefing(
      '2027 cycle — apply after receiving admission from SNU. No exact dates published on the official page. Status: not yet published.',
    ),
    verifyNote:
      'Verified against en.snu.ac.kr on 2026-10-12. Deadline left unset — no exact dates published (not yet published). Document list honestly empty.',
  },
  {
    _id: 'quest-yonsei-gld-freshman',
    title: 'Yonsei GLD Freshman Scholarship — Outstanding Freshman Scholarship (South Korea)',
    provider: 'Yonsei University, Global Leaders College',
    url: 'https://glc.yonsei.ac.kr/en/scholarship/',
    countries: ['South Korea'],
    level: 'undergrad',
    amount:
      'Scholarship for outstanding international freshmen at Yonsei’s Global Leaders College. The official page does not publish the exact amount. The student keeps it by meeting the academic conditions.',
    deadline: null,
    gates: [
      g('Outstanding international student, picked based on high school academic performance.', 'other'),
      g('Keep meeting the grade conditions to keep the scholarship.', 'other'),
    ],
    documents: [], // honest empty: no application process
    briefing: briefing(
      '2027 cycle — no application process. Automatically considered on admission application. Status: not yet published.',
    ),
    verifyNote:
      'Verified against glc.yonsei.ac.kr on 2026-10-12. Deadline left unset — automatic consideration (not yet published). Amount not published by the official source, left as descriptive text. Document list honestly empty.',
  },
  {
    _id: 'quest-yenching-pku',
    title: 'Yenching Scholars, Peking University (China)',
    provider: 'Yenching Academy, Peking University',
    url: 'https://yenchingacademy.pku.edu.cn/',
    countries: ['China'],
    level: 'masters',
    amount:
      'The Yenching Fellowship. Covers tuition fees, on-campus accommodation, a monthly stipend, medical insurance, one round-trip travel stipend, and costs for designated research trips. (Fellowship details per the official PKU 2023-entry notice.)',
    deadline: '2026-11-30T23:59:59.000Z',
    gates: [
      g('Hold a bachelor’s degree in any field, or be in the final year (degree awarded no later than August 31 of the enrollment year).', 'degreeLevel'),
      g('Outstanding academic record.', 'other'),
      g('Strong interest in the interdisciplinary study of China.', 'other'),
      g('Leadership, extracurricular achievement, and community engagement.', 'other'),
      g('Meet the English requirement: IELTS 7.0, TOEFL iBT 100, Cambridge 185, CET-6 600, or TEM-4 pass. Waived for native English speakers or graduates of English-taught degree programs.', 'languageTest', {howToProve: 'English proficiency test report, if required.'}),
    ],
    documents: [
      d('Online application form'),
      d('Personal statement, 750 words or less'),
      d('Statement of research interest, up to 1,500 words'),
      d('CV'),
      d('Official university transcripts'),
      d('Diploma or certificate of enrollment'),
      d('Two academic letters of recommendation', 'Written by full or associate professors.'),
      d('English proficiency test report, if required'),
    ],
    briefing: briefing(
      'September 2027 intake — applications are open now. Deadline: November 30, 2026. Status: open.',
    ),
    verifyNote:
      'Verified against yenchingacademy.pku.edu.cn on 2026-10-12. Deadline 30 Nov 2026 (no official time published — set to end of day UTC; open).',
  },
  {
    _id: 'quest-nus-intl-ug',
    title: 'NUS International Undergraduate Scholarship (Singapore)',
    provider: 'National University of Singapore (NUS)',
    url: 'https://www.nus.edu.sg/oam/scholarships/scholarships-for-freshmen-international-students/nus-international-undergraduate-scholarship',
    countries: ['Singapore'],
    level: 'undergrad',
    amount:
      '100% of subsidised undergraduate tuition fees (after the MOE Tuition Grant, which must be taken up), S$5,800 annual living allowance, S$1,750 one-time computer allowance, S$5,000 annual accommodation allowance. Note: the MOE Tuition Grant binds international students to work for a Singapore-registered company for 3 years after graduation.',
    deadline: null,
    gates: [
      g('Citizen of any country except Singapore.', 'nationality'),
      g('Strong leadership qualities and potential.', 'other'),
      g('Outstanding co-curricular activities record.', 'other'),
      g('Outstanding high school results.', 'other'),
      g('Apply for a full-time undergraduate degree program at NUS.', 'degreeLevel'),
      g('Transfer applicants are not eligible.', 'other'),
    ],
    documents: [], // honest empty: considered through the admission application
    briefing: briefing(
      '2027 cycle — no separate deadline. All eligible applicants are considered automatically through the NUS admission application. Interviews run January to July, with outcomes by mid-July. Status: upcoming.',
    ),
    verifyNote:
      'Verified against nus.edu.sg on 2026-10-12. Deadline left unset — automatic consideration (upcoming). Document list honestly empty. Note: the NUS Global Merit Scholarship is Singapore-Citizens-only and is not listed.',
  },
  {
    _id: 'quest-ntu-nanyang-global',
    title: 'NTU Nanyang Global Scholarship (Singapore)',
    provider: 'Nanyang Technological University (NTU)',
    url: 'https://www.ntu.edu.sg/admissions/undergraduate/scholarships/scholarship-opportunities/detail/nanyang-scholarship',
    countries: ['Singapore'],
    level: 'undergrad',
    amount:
      'Full coverage of subsidised tuition fees (after Tuition Grant), S$6,500 living allowance per academic year, up to S$2,000 accommodation allowance per year, up to S$8,000 travel grant for an overseas program, S$2,000 one-off computer allowance, and enrolment in the NTU Honours College. No bond except the MOE Tuition Grant terms for international students.',
    deadline: null,
    gates: [
      g('Open to all nationalities.', 'nationality'),
      g('Apply for a full-time undergraduate degree at NTU.', 'degreeLevel'),
      g('Outstanding academic results (A Level, IB, polytechnic diploma, NUS High School diploma, or Year 12 equivalent).', 'other'),
      g('Excellent co-curricular records.', 'other'),
      g('Strong leadership qualities and potential.', 'other'),
    ],
    documents: [
      d('Online scholarship form, after the NTU admission application'),
      d('Personal essay of not more than 250 words'),
      d('Recent passport-size photo'),
      d('Referee appraisal submitted online by the school teacher'),
    ],
    briefing: briefing(
      '2027 cycle — the scholarship application period is the same as the admission application period. Exact 2027 dates not published on the official page. Status: not yet published.',
    ),
    verifyNote:
      'Verified against ntu.edu.sg on 2026-10-12. Deadline left unset — exact 2027 dates not published (not yet published).',
  },
  {
    _id: 'quest-hku-entrance-intl',
    title: 'HKU Entrance Scholarships for International Students (Hong Kong)',
    provider: 'University of Hong Kong (HKU)',
    url: 'http://admissions.hku.hk/explore/news/university-of-hong-kong-offers-entrance-scholarships-international-students-realise',
    countries: ['Hong Kong'],
    level: 'undergrad',
    amount:
      'HKU entrance scholarships for international students may cover full tuition fees, accommodation, and a general living allowance. (Per the HKU Admissions Office.)',
    deadline: null,
    gates: [
      g('International student applying for an undergraduate program at HKU through the International / Non-JUPAS admissions route.', 'nationality'),
      g('Outstanding academic results, with non-academic achievements also considered.', 'other'),
    ],
    documents: [], // honest empty: automatic; not published by the official source
    briefing: briefing(
      '2027 cycle — not published by the official source. Awards are announced along with admission offers. Status: not yet published.',
    ),
    verifyNote:
      'Verified against admissions.hku.hk on 2026-10-12. Deadline left unset — 2027 not published. Document list honestly empty (automatic consideration).',
  },
  {
    _id: 'quest-kaust-fellowship',
    title: 'KAUST Fellowship (Saudi Arabia)',
    provider: 'King Abdullah University of Science and Technology (KAUST)',
    url: 'https://admissions.kaust.edu.sa/phd-fellowship.html',
    countries: ['Saudi Arabia'],
    level: 'any',
    amount:
      'Every admitted MS and PhD student receives the KAUST Fellowship automatically. It covers full tuition, a monthly living allowance of US$20,000–30,000 per year, on-campus housing, medical and dental coverage, and relocation support.',
    deadline: '2027-01-03T23:59:59.000Z',
    gates: [
      g('Hold a relevant bachelor’s degree (for MS) or master’s degree (for PhD).', 'degreeLevel'),
      g('Strong academic record.', 'other'),
      g('Meet the English requirement: TOEFL iBT 79 or IELTS 6.0, unless the degree is from an accredited university in the US, Canada, UK, Ireland, Australia, or New Zealand.', 'languageTest', {howToProve: 'Official English language test score, if available.'}),
      g('Some students with external sponsorship may not be eligible for the fellowship.', 'other'),
    ],
    documents: [
      d('Official university transcripts'),
      d('CV'),
      d('Statement of purpose'),
      d('Contact details of 3 referees'),
      d('Official English language test score, if available'),
      d('Clear copy of the passport photo page'),
    ],
    briefing: briefing(
      '2027 cycle — Fall 2027 entry (MS, MS/PhD, PhD): applications open September 28, 2026, close January 3, 2027. Spring 2027 entry (PhD only): closed September 27, 2026. (Deadlines per admissions.kaust.edu.sa admission timelines.) Status: open for Fall 2027.',
    ),
    verifyNote:
      'Verified against admissions.kaust.edu.sa on 2026-10-12. Deadline 3 Jan 2027 (no official time published — set to end of day UTC; open for Fall 2027).',
  },
  {
    _id: 'quest-mbzuai-funding',
    title: 'MBZUAI Graduate Funding, UAE (master’s and PhD)',
    provider: 'Mohamed bin Zayed University of Artificial Intelligence (MBZUAI)',
    url: 'https://mbzuai.ac.ae/admissions/graduate-phd-admissions',
    countries: ['United Arab Emirates'],
    level: 'any',
    amount:
      'Funded students receive free tuition, a monthly stipend (AED 15,500/month for international MSc students, AED 17,500/month for international PhD students), one return airfare home each year, health insurance, and a UAE residence visa with Emirates ID. Note: PhD students are funded centrally in year 1, then by a faculty advisor. MSc students are fee-paying by default — merit-based funding is considered during the admissions review but is not guaranteed for every admitted student.',
    deadline: '2026-12-15T13:00:00.000Z',
    gates: [
      g('Hold a STEM degree from a university recognized by the UAE Ministry of Education.', 'degreeLevel'),
      g('Minimum CGPA of 3.0 or 3.5 out of 4.0, depending on the program.', 'minGPA', {minValue: 3.0, howToProve: 'Degree certificates and official transcripts in English (attested).'}),
      g('Show English proficiency (TOEFL iBT / IELTS / EmSAT). Waivers for citizens of the UK, USA, Australia, and New Zealand who studied there.', 'languageTest', {howToProve: 'English proficiency test certificate.'}),
      g('Pass the online entry exam and a technical interview.', 'other'),
      g('For PhD: confirm a faculty advisor match by the end of year 1 to keep funding.', 'other'),
    ],
    documents: [
      d('Online application form'),
      d('CV'),
      d('Statement of purpose, 500 to 1,000 words'),
      d('Degree certificates and official transcripts in English (attested)'),
      d('English proficiency test certificate'),
      d('GRE score (optional, counts as a plus)'),
      d('Referee recommendations (minimum 2 for MSc)'),
      d('Online entry exam and technical interview'),
    ],
    briefing: briefing(
      'Fall 2027 intake — portal opened September 7, 2026. Final deadline: December 15, 2026 (5 p.m. GST) for most programs. Decisions by March 31, 2027. Status: open.',
    ),
    verifyNote:
      'Verified against mbzuai.ac.ae on 2026-10-12. Deadline 15 Dec 2026 5pm GST (open).',
  },
]

module.exports = {U5}
