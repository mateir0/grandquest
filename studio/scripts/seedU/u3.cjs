/** Batch U3: Canada + Australia universities (verified 2026-10-12). */
const {g, d, briefing} = require('./helpers.cjs')

const U3 = [
  {
    _id: 'quest-mcgill-major-entrance',
    title: 'McGill Major Entrance Scholarships for International Students (Canada)',
    provider: 'McGill University',
    url: 'https://www.mcgill.ca/studentaid/node/111/node/97',
    countries: ['Canada'],
    level: 'undergrad',
    amount:
      'Merit scholarship of $3,000, $5,000 or $10,000 per year for international students, renewable for up to 3–4 years (up to $40,000 total). The $12,000-per-year level is only for Canadian citizens and permanent residents.',
    deadline: '2027-01-21T23:59:59.000Z',
    gates: [
      g('First-time university student entering a full-time undergraduate degree at McGill.', 'degreeLevel'),
      g('Top academic grades.', 'other'),
      g('Strong leadership in school or community activities (more than just taking part).', 'other'),
    ],
    documents: [
      d('List of school activities and community/volunteer work for the last three years'),
      d('One general essay (about a person who inspired you, or an event that changed your outlook)'),
      d('One-page letter of reference written about yourself, in the third person'),
      d('Two letters of reference (one academic, one about activities)', 'Sent directly by the referees.'),
      d('Signed statement from the school', 'Only if the school provides one.'),
    ],
    briefing: briefing(
      '2027 intake: applications open October 1, 2026; scholarship application deadline January 21, 2027 for applicants from schools outside Canada (admission deadline January 15, 2027). Status: upcoming.',
    ),
    verifyNote:
      'Verified against mcgill.ca/studentaid on 2026-10-12. Deadline 21 Jan 2027 (no official time published — set to end of day UTC).',
  },
  {
    _id: 'quest-ubc-intl-scholars',
    title: 'UBC International Scholars Program (Canada)',
    provider: 'University of British Columbia (UBC)',
    url: 'https://undergraduatescholarships.ubc.ca/prog/2027_international_scholars_program_application/',
    countries: ['Canada'],
    level: 'undergrad',
    amount:
      'Need-and-merit-based award for international undergraduates. UBC does not publish fixed amounts — value is set from demonstrated family financial need. Four awards: Karen McKellin International Leader of Tomorrow Award, Donald A. Wehrung International Student Award, International Impact Award, Vantage One Excellence Award.',
    deadline: '2026-11-16T07:59:00.000Z',
    gates: [
      g('International student entering the first undergraduate degree at UBC.', 'nationality'),
      g('Strong academic results.', 'other'),
      g('Shown leadership qualities and real contributions to the community.', 'other'),
      g('Need real financial help to be able to study at UBC.', 'other'),
      g('Nominated by the school or institution.', 'other'),
    ],
    documents: [
      d('Completed award application form'),
      d('Nomination form completed by the school or institution'),
      d('Teacher referee form', 'Invite the nominator and referee through the portal.'),
      d('Required information collected in the application', 'The official page does not publish a full document list.'),
    ],
    briefing: briefing(
      '2027 intake: applications opened October 5, 2026; close November 15, 2026 at 11:59 PM Pacific Time. Status: open.',
    ),
    verifyNote:
      'Verified against undergraduatescholarships.ubc.ca on 2026-10-12. Deadline 15 Nov 2026 11:59pm PT (open).',
  },
  {
    _id: 'quest-waterloo-intl-entrance',
    title: 'University of Waterloo International Student Entrance Scholarship (Canada)',
    provider: 'University of Waterloo',
    url: 'https://uwaterloo.ca/health/recognition-reception-awards',
    countries: ['Canada'],
    level: 'undergrad',
    amount:
      'Twenty scholarships of $10,000 each for outstanding international students admitted to Year One of an undergraduate degree. Latest published on an official uwaterloo.ca listing; the current main scholarships page no longer lists this award — 2027 intake details are not yet published.',
    deadline: null,
    gates: [
      g('International student admitted to Year One of an undergraduate degree program.', 'nationality'),
      g('Admission average of 90% or above.', 'minGPA', {minValue: 90, howToProve: 'Admission average.'}),
      g('No separate application is required — considered automatically.', 'other'),
    ],
    documents: [], // honest empty: no application required
    briefing: briefing(
      'No published deadline — status: not yet published for the 2027 intake. No application is required; consideration is automatic.',
    ),
    verifyNote:
      'Verified against uwaterloo.ca on 2026-10-12. Deadline left unset — 2027 not yet published (award still on an official uwaterloo.ca page; main scholarships page no longer lists it). Document list honestly empty (automatic).',
  },
  {
    _id: 'quest-alberta-intl-admission',
    title: 'University of Alberta International Admission Scholarship (Canada)',
    provider: 'University of Alberta',
    url: 'https://www.ualberta.ca/en/admissions/tuition-and-scholarships/international-entrance-scholarships/index.html',
    countries: ['Canada'],
    level: 'undergrad',
    amount:
      'Up to CAN $10,000 based on admission average. Admission-based — assessed automatically on application; no separate scholarship application. Note: UAlberta states it does not offer full scholarships for international students. Bigger application-based options (e.g. President’s International Distinction Scholarship, up to CAN $120,000 over 4 years) need a separate application.',
    deadline: null,
    gates: [
      g('Entering the first year of an undergraduate degree directly from high school.', 'degreeLevel'),
      g('Strong admission average (top students receive this award).', 'other'),
    ],
    documents: [], // honest empty: automatic on admission
    briefing: briefing(
      '2027 intake: no separate scholarship deadline — assessed automatically with the admission application. Status: open (admission-based). For application-based international scholarships the deadline is January 10, 2027 (application opened October 1, 2026) — status: open.',
    ),
    verifyNote:
      'Verified against ualberta.ca on 2026-10-12. Deadline left unset — admission-based (no separate deadline); app-based international scholarships close 10 Jan 2027. Document list honestly empty (automatic).',
  },
  {
    _id: 'quest-calgary-intl-entrance',
    title: 'University of Calgary International Entrance Scholarship (Canada)',
    provider: 'University of Calgary',
    url: 'https://ucalgary.ca/registrar/awards/university-calgary-international-entrance-scholarship',
    countries: ['Canada'],
    level: 'undergrad',
    amount:
      '$20,000 per year, renewable in the second, third and fourth year. Renewal needs a GPA of 2.60 or higher over at least 24 units in the previous fall and winter terms, and continued international tuition fee status. Two awards each year.',
    deadline: null,
    gates: [
      g('International student who pays international tuition fees (not a Canadian citizen or permanent resident).', 'nationality'),
      g('Entering the first year of any undergraduate degree in the fall term.', 'degreeLevel'),
      g('Met the university’s English Language Proficiency requirement.', 'languageTest'),
      g('Strong academic merit.', 'other'),
    ],
    documents: [], // honest empty: not published by the official source
    briefing: briefing(
      'No published deadline — status: not yet published for the 2027 intake.',
    ),
    verifyNote:
      'Verified against ucalgary.ca on 2026-10-12. Deadline left unset — not published (not yet published for 2027). Document list honestly empty.',
  },
  {
    _id: 'quest-melbourne-intl-ug',
    title: 'Melbourne International Undergraduate Scholarship (Australia)',
    provider: 'University of Melbourne',
    url: 'https://scholarships.unimelb.edu.au/awards/melbourne-international-undergraduate-scholarship',
    countries: ['Australia'],
    level: 'undergrad',
    amount:
      'From 2027, a 20% tuition fee sponsorship for the full length of the course. The number of scholarships rises to 225 from 2027.',
    deadline: null,
    gates: [
      g('Citizen of a country with a GDP per capita of US$10,000 or less (World Bank data) — check the eligible-countries list on the official page.', 'nationality'),
      g('Received an offer for an Overseas Fee (international) place in a bachelor’s degree starting in the year the scholarship is offered.', 'other'),
      g('Have not done any university-level study before (year-12 extension studies don’t count).', 'degreeLevel'),
      g('Scholarships go to the highest-ranked students based on final secondary school or foundation results.', 'other'),
    ],
    documents: [], // honest empty: automatic consideration
    briefing: briefing(
      'No separate deadline — automatically considered on course application. Status: open for automatic consideration.',
    ),
    verifyNote:
      'Verified against scholarships.unimelb.edu.au on 2026-10-12. Deadline left unset — automatic consideration. Document list honestly empty.',
  },
  {
    _id: 'quest-anu-chancellors-intl',
    title: 'ANU Chancellor’s International Scholarship (Australia)',
    provider: 'Australian National University (ANU)',
    url: 'https://study.anu.edu.au/scholarships/find-scholarship/anu-chancellors-international-scholarship',
    countries: ['Australia'],
    level: 'any',
    amount:
      'A 25% or 50% tuition fee waiver for the full length of the degree. ANU assesses applicants across 9 categories based on citizenship and always considers them for the highest-value award they qualify for.',
    deadline: null,
    gates: [
      g('International (overseas) student starting an undergraduate or postgraduate coursework degree at ANU.', 'nationality'),
      g('Not entering the Doctor of Medicine and Surgery or the Master of Military and Defence Studies (excluded).', 'other'),
    ],
    documents: [], // honest empty: no separate scholarship application
    briefing: briefing(
      'No published deadline — no separate application; ANU assesses applicants automatically on admission. Status: not applicable (no separate scholarship deadline published).',
    ),
    verifyNote:
      'Verified against study.anu.edu.au on 2026-10-12. Deadline left unset — no separate application. Document list honestly empty.',
  },
  {
    _id: 'quest-sydney-vc-intl',
    title: 'University of Sydney Vice-Chancellor’s International Scholarship (Australia)',
    provider: 'University of Sydney',
    url: 'https://www.sydney.edu.au/scholarships/e/vice-chancellor-international-scholarships-scheme.html',
    countries: ['Australia'],
    level: 'any',
    amount:
      'One-off tuition payments in the first year, in five tiers by ranking: $60,000 or $40,000 paid over one year (two instalments), or $20,000, $10,000 or $5,000 paid for one semester. Not renewable after the first year.',
    deadline: null,
    gates: [
      g('International student.', 'nationality'),
      g('Have applied for, but not yet started, a bachelor’s degree or coursework master’s degree at the University of Sydney.', 'degreeLevel'),
      g('Not receiving an Australian Government scholarship.', 'other'),
      g('Awarded on academic merit from the admission application.', 'other'),
    ],
    documents: [], // honest empty: no separate application; committee assesses the admission application
    briefing: briefing(
      'The official terms do not publish exact offer-round dates — the unconditional offer must be accepted by the relevant scholarship offer-round deadline. Status: not yet published.',
    ),
    verifyNote:
      'Verified against sydney.edu.au on 2026-10-12. Deadline left unset — offer-round dates not published (not yet published). Document list honestly empty (no separate application).',
  },
  {
    _id: 'quest-unsw-scientia',
    title: 'UNSW International Scientia Coursework Scholarship (Australia)',
    provider: 'UNSW Sydney',
    url: 'https://www.scholarships.unsw.edu.au/scholarships/id/1988',
    countries: ['Australia'],
    level: 'any',
    amount:
      'Two offers. Offer 1: full tuition fees for the minimum length of the program. Offer 2: $20,000 per year paid directly toward tuition fees for the minimum length of the program.',
    deadline: '2026-10-30T13:59:00.000Z',
    gates: [
      g('International student starting full-time study in a UNSW undergraduate or postgraduate coursework degree in Term 1, 2027 (UNSW Online and UNSW Canberra are excluded).', 'nationality'),
      g('Received an offer of admission by 30 October 2026.', 'other'),
      g('Selected on academic merit, leadership, extracurriculars, and reasons for studying at UNSW.', 'other'),
    ],
    documents: [
      d(
        'Online scholarship application with evidence for each selection point',
        'Academic merit; leadership skills (school, workplace or community); extracurricular activities (sports, culture, volunteering or work); reasons for studying at UNSW. Claims without supporting documents are not assessed.',
      ),
    ],
    briefing: briefing(
      '2027 Term 1 intake: application opened 06 July 2026, closes 30 October 2026 at 11:59 PM AEST. An offer of admission must be held by 30 October 2026. Status: open.',
    ),
    verifyNote:
      'Verified against scholarships.unsw.edu.au on 2026-10-12. Deadline 30 Oct 2026 11:59pm AEST (open).',
  },
  {
    _id: 'quest-monash-intl-merit',
    title: 'Monash International Merit Scholarship (Australia)',
    provider: 'Monash University',
    url: 'https://www.monash.edu/study/fees-scholarships/scholarships/find-a-scholarship/international-merit-5770',
    countries: ['Australia'],
    level: 'undergrad',
    amount:
      '$15,000 per year toward tuition for the length of the degree — up to $75,000 total. Twenty scholarships each year. Recipients are also invited to apply for Monash Minds, a first-year leadership program.',
    deadline: null,
    gates: [
      g('International student.', 'nationality'),
      g('Received a full Monash course offer with no conditions.', 'other'),
      g('Plan to enrol full-time in an undergraduate degree at a Monash campus in Australia.', 'degreeLevel'),
      g('Selected on academic achievement.', 'other'),
      g('Not eligible if: a current Monash student; studying Australian Year 12; starting the Bachelor of Medical Science and Doctor of Medicine; in a Monash pathway program; or transferring from another Monash campus or another Australian university.', 'other'),
      g('To keep the scholarship, maintain a 70% (distinction) average each semester.', 'other'),
    ],
    documents: [], // honest empty: automatic consideration
    briefing: briefing(
      'No separate deadline — students with a Monash undergraduate course offer are automatically considered. Status: open for automatic consideration.',
    ),
    verifyNote:
      'Verified against monash.edu on 2026-10-12. Deadline left unset — automatic consideration. Document list honestly empty.',
  },
]

module.exports = {U3}
