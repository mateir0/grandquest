/** Batch U1: UK universities (verified 2026-10-12). Clarendon skipped here — already on the board. */
const {g, d, briefing} = require('./helpers.cjs')

const U1 = [
  {
    _id: 'quest-ucl-global-ug',
    title: 'UCL Global Undergraduate Scholarship (UK)',
    provider: 'University College London (UCL)',
    url: 'https://www.ucl.ac.uk/scholarships/ucl-global-undergraduate-scholarship',
    countries: ['United Kingdom'],
    level: 'undergrad',
    amount:
      '10 awards cover full tuition fees plus a maintenance allowance (plus extra money for visa and health surcharge costs); 23 awards cover full tuition fees only. Renewable for the full length of the degree.',
    deadline: '2026-04-27T16:00:00.000Z',
    gates: [
      g('You pay the overseas tuition fee rate.', 'other'),
      g('You come from a low-income background.', 'other'),
      g('You have applied for a full-time undergraduate degree at UCL for 2026/27.', 'degreeLevel'),
    ],
    documents: [
      d('Financial evidence (if shortlisted)', 'Usually requested around mid-May.'),
      d('Online scholarship application via Portico', 'Submitted through the UCL Portico system.'),
    ],
    briefing: briefing(
      '2026 session: applications closed 5pm BST, Monday 27 April 2026 (closed). The 2027/28 cycle is not yet published — status: closed.',
      'Award lasts the full length of the degree. Data labeled 2026 session.',
    ),
    verifyNote:
      'Verified against ucl.ac.uk/scholarships on 2026-10-12. Deadline 27 Apr 2026 5pm BST (closed, 2026 session); 2027/28 not yet published.',
  },
  {
    _id: 'quest-imperial-presidents-ug',
    title: "President's Scholarship, Imperial College London (UK)",
    provider: 'Imperial College London',
    url: 'https://www.imperial.ac.uk/giving/scholars/',
    countries: ['United Kingdom'],
    level: 'undergrad',
    amount: '£1,000 per year of study, for up to four years.',
    deadline: null,
    gates: [
      g('You are a new undergraduate student at Imperial.', 'degreeLevel'),
      g('Your department picks you as one of the brightest and best students in your year.', 'other'),
    ],
    documents: [], // honest empty: no formal application process
    briefing: briefing(
      'No separate deadline — there is no application. Departments nominate students during the admissions process. Status: open (nomination-based).',
    ),
    verifyNote:
      'Verified against imperial.ac.uk/giving/scholars on 2026-10-12. Deadline left unset — no application exists; departments nominate. Document list honestly empty.',
  },
  {
    _id: 'quest-edinburgh-global-maths',
    title: 'Edinburgh Global Undergraduate Mathematics Scholarship (UK)',
    provider: 'University of Edinburgh',
    url: 'https://registryservices.ed.ac.uk/student-funding/undergraduate/international/mathematics',
    countries: ['United Kingdom'],
    level: 'undergrad',
    amount:
      '£5,000 per year, paid in instalments as help with living costs, for the full length of the degree (satisfactory academic progress required).',
    deadline: null,
    gates: [
      g('You have International or EU fee status.', 'other'),
      g('You are accepted for full-time admission to an undergraduate degree in the School of Mathematics.', 'degreeLevel'),
      g('You are not already studying at Edinburgh.', 'other'),
      g('You show outstanding academic performance. This is a merit-based award.', 'other'),
    ],
    documents: [], // honest empty: document list not published by the official source
    briefing: briefing(
      '2027/28 funding is not yet confirmed — not yet published. Data labeled 2026 session. Status: not yet published.',
      'You must have applied through UCAS, but you do not need an offer before starting the scholarship application.',
    ),
    verifyNote:
      'Verified against registryservices.ed.ac.uk on 2026-10-12. Deadline left unset — 2027/28 not yet confirmed (labeled 2026 session). Document list honestly empty.',
  },
  {
    _id: 'quest-lse-uggla',
    title: 'Uggla Family Scholars Programme, LSE (UK)',
    provider: 'London School of Economics and Political Science (LSE)',
    url: 'https://www.lse.ac.uk/study-at-lse/Undergraduate/fees-and-funding/uggla-family-scholarships/Uggla-Family-Scholarship-details',
    countries: ['United Kingdom'],
    level: 'undergrad',
    amount:
      'Partial tuition fee award plus a full maintenance stipend — worth over £23,000 per year — for the full length of the degree. Includes guaranteed accommodation, coaching and careers support. Three awards for overseas students each year.',
    deadline: '2026-04-30T23:59:59.000Z',
    gates: [
      g('You pay the overseas tuition fee rate.', 'other'),
      g('You hold a conditional or unconditional offer for an LSE undergraduate programme.', 'other'),
      g('You are from a less advantaged background. Selection is based on financial need.', 'other'),
    ],
    documents: [
      d(
        'LSE Undergraduate Scholarships application form',
        'Full document list not published by the official source.',
      ),
    ],
    briefing: briefing(
      '2026 session: applications closed 30 April 2026 for overseas offer holders (closed). The 2027 cycle is not yet published — status: closed.',
    ),
    verifyNote:
      'Verified against lse.ac.uk on 2026-10-12. Deadline 30 Apr 2026 (no official time published — set to end of day UTC; closed, 2026 session); 2027 not yet published.',
  },
  {
    _id: 'quest-manchester-global-futures',
    title: 'Global Futures Scholarship, University of Manchester (UK)',
    provider: 'University of Manchester',
    url: 'https://www.manchester.ac.uk/study/international/finance-and-scholarships/funding/global-futures-scholarship/',
    countries: ['United Kingdom'],
    level: 'undergrad',
    amount:
      'Tuition fee discounts for 2027 entry. Undergraduate merit awards of up to £36,000 (£12,000 per year over three years). Over 350 awards in total, worth more than £6 million.',
    deadline: null,
    gates: [
      g('You live in one of the listed countries (check your country page on the Manchester site).', 'nationality'),
      g('You hold an offer for a full-time, on-campus course in Manchester starting September 2027.', 'other'),
      g('You pay international fees and you fund your own studies (no sponsor, no full scholarship from elsewhere).', 'other'),
    ],
    documents: [
      d(
        'Online application form (emailed to offer-holders)',
        'Full document list not published by the official source. The form is emailed to all eligible offer-holders.',
      ),
    ],
    briefing: briefing(
      '2027 cycle: open. Exact dates differ by country and region. You must hold an offer first; the application form is emailed to all eligible offer-holders. Status: open.',
    ),
    verifyNote:
      'Verified against manchester.ac.uk on 2026-10-12. Deadline left unset — dates differ by country/region (2027 cycle open).',
  },
  {
    _id: 'quest-warwick-chancellors-intl',
    title: "Chancellor's International Scholarship, University of Warwick (UK)",
    provider: 'University of Warwick',
    url: 'https://warwick.ac.uk/services/dc/schols_fund/new/cistc/',
    countries: ['United Kingdom'],
    level: 'phd',
    amount:
      'Full payment of academic fees (overseas rate), a maintenance stipend at the UK research council rate, and a £5,000 research training grant. Lasts up to 3.5 years of full-time doctoral study.',
    deadline: null,
    gates: [
      g('You are applying for a postgraduate research course (PhD, MPhil/PhD or EngD) starting in October.', 'degreeLevel'),
      g('You are assessed as overseas for fees.', 'other'),
      g('You are not already a research student at Warwick.', 'other'),
    ],
    documents: [
      d(
        'Separate scholarship application (after the course application)',
        'Full document list not published by the official source. Apply for the course first, then submit the scholarship application.',
      ),
    ],
    briefing: briefing(
      'The 2027 cycle is not yet published by the official source — status: not yet published. Data labeled 2026 session: Warwick’s own announcement for 2025/26 entry gave a deadline of 12 December.',
    ),
    verifyNote:
      'Verified against warwick.ac.uk on 2026-10-12. Deadline left unset — 2027 not published (labeled 2026 session; the 12 December date belongs to the 2025/26 announcement, not reused as a deadline).',
  },
  {
    _id: 'quest-bristol-think-big-ug',
    title: 'Think Big Undergraduate Scholarship, University of Bristol (UK)',
    provider: 'University of Bristol',
    url: 'https://www.bristol.ac.uk/international/fees-finance/scholarships/',
    countries: ['United Kingdom'],
    level: 'undergrad',
    amount:
      '£6,500 or £13,000 off tuition fees, renewed each year for up to four years (satisfactory progress required). Data labeled 2026 session.',
    deadline: '2026-04-10T09:00:00.000Z',
    gates: [
      g('You pay the overseas tuition fee rate.', 'other'),
      g(
        'You have applied for an eligible full-time, in-person undergraduate course (Medicine, Dentistry and Veterinary courses are not eligible).',
        'degreeLevel',
      ),
      g('You receive an offer and confirm Bristol as your firm UCAS choice.', 'other'),
      g('You meet or exceed your offer conditions.', 'other'),
    ],
    documents: [
      d(
        'One online international scholarships form',
        'Full document list not published by the official source.',
      ),
    ],
    briefing: briefing(
      '2026 session: applications closed 10 April 2026 at 10am UK time (closed). The 2027 cycle is not yet published — status: closed.',
    ),
    verifyNote:
      'Verified against bristol.ac.uk on 2026-10-12. Deadline 10 Apr 2026 10am UK (closed, 2026 session); 2027 not yet published.',
  },
  {
    _id: 'quest-glasgow-global-leadership',
    title: 'Global Leadership Scholarship, University of Glasgow (UK)',
    provider: 'University of Glasgow',
    url: 'https://www.gla.ac.uk/scholarships/globalleadershipscholarship/',
    countries: ['United Kingdom'],
    level: 'masters',
    amount: '£10,000 off tuition fees, for one year only. 350 scholarships available.',
    deadline: null,
    gates: [
      g('You have International or EU fee status.', 'other'),
      g('You hold an offer for a full-time, 1-year Masters starting September 2027.', 'degreeLevel'),
      g('You show academic excellence — grades equal to a UK 1st Class Honours degree.', 'other'),
    ],
    documents: [], // honest empty: not published by the official source
    briefing: briefing(
      '2027/28 session: upcoming. The scholarship will open shortly. Assessed on a rolling basis; the closing date is not yet confirmed (usually late August). Status: upcoming.',
    ),
    verifyNote:
      'Verified against gla.ac.uk on 2026-10-12. Deadline left unset — 2027/28 upcoming, closing date not confirmed. Document list honestly empty.',
  },
  {
    _id: 'quest-birmingham-high-fliers',
    title: 'Postgraduate High Fliers Scholarship, University of Birmingham (UK)',
    provider: 'University of Birmingham',
    url: 'https://www.birmingham.ac.uk/study/scholarships-funding/postgraduate-high-fliers-scholarship',
    countries: ['United Kingdom'],
    level: 'masters',
    amount: '£5,000 off Masters tuition fees.',
    deadline: '2026-07-31T23:59:59.000Z',
    gates: [
      g('You have an offer for a full-time taught Masters at Birmingham’s UK campus starting September 2026.', 'degreeLevel'),
      g('You live in one of the listed countries and you pay overseas fees.', 'nationality'),
      g('You are not sponsored by an outside organisation (a third party paying your tuition fees).', 'other'),
    ],
    documents: [], // honest empty: no separate application — automatic discount
    briefing: briefing(
      '2026/27 cycle: closing date 31 July 2026 (closed). The 2027/28 cycle is not yet published — status: closed.',
      'No separate application: if you are eligible the discount is applied automatically. Accept your offer and pay your deposit by the deadline in your offer letter.',
    ),
    verifyNote:
      'Verified against birmingham.ac.uk on 2026-10-12. Deadline 31 Jul 2026 (no official time published — set to end of day UTC; closed); 2027/28 not yet published. Document list honestly empty (automatic).',
  },
]

module.exports = {U1}
