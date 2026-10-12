/** Batch U4: Europe universities (verified 2026-10-12). */
const {g, d, briefing} = require('./helpers.cjs')

const U4 = [
  {
    _id: 'quest-tudelft-van-effen',
    title: 'Justus & Louise van Effen Excellence Scholarship, TU Delft (Netherlands)',
    provider: 'Delft University of Technology (TU Delft)',
    url: 'https://www.tudelft.nl/en/delft-university-fund/we-support/support-innovative-education',
    countries: ['Netherlands'],
    level: 'masters',
    amount:
      'Two-year scholarship of approx. €60,000 for non-EU students and approx. €28,000 for EU students — full tuition fees plus a contribution to living expenses. 16 awards per year (2 per faculty).',
    deadline: '2026-12-01T22:59:00.000Z',
    gates: [
      g('International applicant admitted to a 2-year regular TU Delft MSc programme (not a joint programme).', 'degreeLevel'),
      g('Excellent grades, roughly among the top 10% of previous studies.', 'other'),
      g('New to TU Delft with no bachelor’s from a Dutch university.', 'other'),
    ],
    documents: [
      d('Complete TU Delft MSc application'),
      d('TU Delft Scholarship Application Form'),
      d('Reference letter(s)'),
      d('English language certificate (non-EU/EFTA applicants)'),
    ],
    briefing: briefing(
      '1 December 2026 (23:59 CET) — 2027 intake, upcoming. Official TU Delft pages confirm the annual December 1 deadline; the official 2027 detail page could not be loaded. Status: upcoming.',
    ),
    verifyNote:
      'Verified against tudelft.nl on 2026-10-12. Deadline 1 Dec 2026 23:59 CET (2027 intake, upcoming).',
  },
  {
    _id: 'quest-uva-amsterdam-merit',
    title: 'Amsterdam Merit Scholarship, University of Amsterdam (Netherlands)',
    provider: 'University of Amsterdam (UvA)',
    url: 'https://www.uva.nl/en/about-the-uva/organisation/faculties/faculty-of-social-and-behavioural-sciences/education/social-sciences/scholarships.html',
    countries: ['Netherlands'],
    level: 'masters',
    amount:
      'Equal to the tuition fee, paid in monthly instalments (tuition is still paid first). At Economics and Business the award is tuition fee plus a €5,000 allowance. Amounts and deadlines differ per faculty.',
    deadline: '2027-02-15T22:59:00.000Z',
    gates: [
      g('Hold a non-EU/EEA passport.', 'nationality'),
      g('Admitted to a UvA Master’s programme.', 'degreeLevel'),
      g('Excellent academic results.', 'other'),
      g('Not eligible for Dutch student finance, and hold no other full scholarship for the same period.', 'other'),
    ],
    documents: [
      d('Curriculum vitae (CV)', 'One single PDF (Social Sciences).'),
      d('Scholarship motivation letter', 'One single PDF (Social Sciences).'),
      d('Letter of recommendation from a professor', 'One single PDF (Social Sciences).'),
      d('Financial plan', 'One single PDF (Social Sciences).'),
    ],
    briefing: briefing(
      '15 February 2027 (23:59 CET) — 2027 intake, open (Graduate School of Social Sciences; Economics and Business closes 15 January). Status: open.',
    ),
    verifyNote:
      'Verified against uva.nl on 2026-10-12. Deadline set to 15 Feb 2027 23:59 CET (Social Sciences); Economics and Business closes 15 Jan. Documents as listed for the single-PDF Social Sciences file.',
  },
  {
    _id: 'quest-radboud-scholarship',
    title: 'Radboud Scholarship Programme, Radboud University (Netherlands)',
    provider: 'Radboud University',
    url: 'https://www.ru.nl/en/education/scholarships/radboud-scholarship-programme',
    countries: ['Netherlands'],
    level: 'masters',
    amount:
      'Tuition reduced to €2,771 per year (instead of about €19,000). Also covers visa, residence permit, health and liability insurance. Living costs are NOT covered. Maximum 26 awards for 2027/2028.',
    deadline: '2027-01-31T22:59:00.000Z',
    gates: [
      g('Hold a non-EU/EEA passport.', 'nationality'),
      g('Bachelor’s degree from outside the Netherlands; never studied in the Netherlands.', 'degreeLevel'),
      g('Meet the English requirement of the chosen Master’s programme.', 'languageTest'),
      g('Fully admitted to an English-taught Master’s starting 1 September 2027.', 'other'),
    ],
    documents: [
      d('Two reference letters', 'Uploaded in the OSIRIS admission system when ticking the scholarship box.'),
      d('Curriculum vitae (CV)', 'Uploaded in the OSIRIS admission system when ticking the scholarship box.'),
    ],
    briefing: briefing(
      'Submit in OSIRIS by 31 January 2027 (23:59 CET); the application must be complete by 14 February 2027 — 2027 intake, open. Status: open.',
    ),
    verifyNote:
      'Verified against ru.nl on 2026-10-12. Deadline 31 Jan 2027 23:59 CET (complete by 14 Feb 2027; open).',
  },
  {
    _id: 'quest-leiden-lexs',
    title: 'Leiden University Excellence Scholarship (LExS) (Netherlands)',
    provider: 'Leiden University',
    url: 'https://www.universiteitleiden.nl/en/scholarships/sea/leiden-university-excellence-scholarship-lexs',
    countries: ['Netherlands'],
    level: 'masters',
    amount:
      'Partial tuition reduction — €10,000, €15,000, €17,500, €18,500 or €19,000 off the tuition fee, for the full programme. Not a full scholarship — part is self-paid. About 25 awards per year.',
    deadline: '2026-12-01T23:59:59.000Z',
    gates: [
      g('Hold a non-EEA/non-EFTA passport (exceptions: all nationalities for Advanced LLMs and MSc International Relations and Diplomacy).', 'nationality'),
      g('Apply for a full-time Master’s starting in September (not a Law School non-advanced LLM or MSc).', 'degreeLevel'),
      g('Excellent grades, roughly top 10% of previous studies.', 'other'),
    ],
    documents: [
      d('Leiden admission application', 'Apply for the scholarship inside the admission application.'),
      d('LExS motivation letter, PDF, max 500 words'),
    ],
    briefing: briefing(
      '1 December 2026 — 2027 intake, upcoming. Status: upcoming.',
    ),
    verifyNote:
      'Verified against universiteitleiden.nl on 2026-10-12. Deadline 1 Dec 2026 (no official time published — set to end of day UTC).',
  },
  {
    _id: 'quest-maastricht-nl-high',
    title: 'Maastricht University NL-High Potential Scholarship (Netherlands)',
    provider: 'Maastricht University',
    url: 'https://www.maastrichtuniversity.nl/studeren/toelating-inschrijving/financing-your-studies/scholarships/maastricht-university-nl-high',
    countries: ['Netherlands'],
    level: 'masters',
    amount:
      'Fully funded: full tuition, living expenses (€20,150 for a 13-month programme or €38,750 for a 25-month programme), health and liability insurance, visa costs, and an allocated room. Flights are NOT included. Only about 2% of applicants receive it.',
    deadline: '2027-02-01T22:59:00.000Z',
    gates: [
      g('Not an EU/EEA, Swiss or Surinam national, with no dual EU/EEA/Swiss nationality.', 'nationality'),
      g('Admitted to a participating full-time UM master’s programme for 2027-2028.', 'degreeLevel'),
      g('Never did degree studies in the Netherlands before.', 'other'),
      g('Not older than 35 on 1 September 2027.', 'ageLimit', {minValue: 35, howToProve: 'Passport / birth date.'}),
      g('GPA of at least 7.5 out of 10 (or 75% / 3 out of 4).', 'minGPA', {minValue: 7.5, howToProve: 'Transcript and proof of GPA, plus a document explaining the grading system.'}),
    ],
    documents: [
      d('CV (max 2 A4 pages)'),
      d('Motivation letter (use the official UM template)'),
      d('Transcript and proof of GPA, plus a document explaining the grading system'),
      d('Personal statement of financial need'),
      d('One reference letter (dated after February 2026) and referee contact details'),
    ],
    briefing: briefing(
      'Scholarship application open 1 October 2026 – 1 February 2027 (23:59 CET) — 2027 intake, open. The full Master’s admission file must be submitted by 10 December 2026. Status: open.',
    ),
    verifyNote:
      'Verified against maastrichtuniversity.nl on 2026-10-12. Deadline 1 Feb 2027 23:59 CET (admission file by 10 Dec 2026; open).',
  },
  {
    _id: 'quest-lund-global',
    title: 'Lund University Global Scholarship (Sweden)',
    provider: 'Lund University',
    url: 'https://www.lunduniversity.lu.se/study/admission-degree-studies/scholarships-and-awards',
    countries: ['Sweden'],
    level: 'masters',
    amount: 'Tuition fee waiver of 25%, 50%, 75% or 100%. Living costs are NOT covered.',
    deadline: null,
    gates: [
      g('Citizen of a country outside the EU/EEA and Switzerland.', 'nationality'),
      g('Must pay tuition fees (a fee-paying student).', 'other'),
      g('Made a complete application for a Master’s programme at Lund (a few Bachelor’s programmes also qualify).', 'degreeLevel'),
    ],
    documents: [], // honest empty: not published by the official source
    briefing: briefing(
      '2027 intake — not yet published by the official source (status: upcoming). Applicants are invited to apply for the scholarship after the admissions round closes.',
    ),
    verifyNote:
      'Verified against lunduniversity.lu.se on 2026-10-12. Deadline left unset — 2027 not yet published (upcoming). Document list honestly empty.',
  },
  {
    _id: 'quest-uppsala-global',
    title: 'Uppsala University Global Scholarship (Sweden)',
    provider: 'Uppsala University',
    url: 'https://www.uu.se/en/study/masters-studies/scholarships/uppsala-university-scholarships',
    countries: ['Sweden'],
    level: 'masters',
    amount:
      'Full tuition fee for an international Master’s programme. Living expenses are NOT covered. Only about 2% of applicants receive a scholarship.',
    deadline: null,
    gates: [
      g('Citizen of a country outside the EU/EEA and Switzerland.', 'nationality'),
      g('Chosen Uppsala Master’s programme ranked first on universityadmissions.se.', 'other'),
      g('Applied before the University Admissions deadline and meet the entry requirements.', 'other'),
    ],
    documents: [], // honest empty: not published (online scholarship form after programme application)
    briefing: briefing(
      '2027 intake — the next round opens in early 2027; exact dates not yet published by the official source (status: upcoming). Apply via an online scholarship form after the programme application.',
    ),
    verifyNote:
      'Verified against uu.se on 2026-10-12. Deadline left unset — 2027 round opens early 2027 (upcoming). Document list honestly empty.',
  },
  {
    _id: 'quest-kth-scholarship',
    title: 'KTH Scholarship, KTH Royal Institute of Technology (Sweden)',
    provider: 'KTH Royal Institute of Technology',
    url: 'https://www.kth.se/en/studies/master/admissions/scholarships/kth-scholarship-1.72827',
    countries: ['Sweden'],
    level: 'masters',
    amount:
      'Full tuition fee for a one- or two-year master’s programme (year 2 needs satisfactory results). Living costs are NOT covered.',
    deadline: '2027-01-15T23:59:59.000Z',
    gates: [
      g('A fee-paying student.', 'other'),
      g('Applied for a KTH master’s programme as FIRST priority.', 'other'),
      g('Paid the application fee.', 'other'),
      g('Meet the admission requirements of the programme.', 'other'),
    ],
    documents: [], // honest empty: no extra documents — programme application documents are used
    briefing: briefing(
      'Opens 1 December 2026, closes 15 January 2027 — 2027 intake, upcoming (opens soon). Results announced 1 April 2027. Status: upcoming.',
      'No extra documents: KTH uses the programme application documents (supporting documents deadline: 2 February).',
    ),
    verifyNote:
      'Verified against kth.se on 2026-10-12. Deadline 15 Jan 2027 (no official time published — set to end of day UTC). Document list honestly empty (no extra documents).',
  },
  {
    _id: 'quest-sciencespo-boutmy',
    title: 'Emile Boutmy Scholarship, Sciences Po (France)',
    provider: 'Sciences Po',
    url: 'http://www.sciencespo.fr/students/en/fees-funding/bursaries-financial-aid/emile-boutmy-scholarship/',
    countries: ['France'],
    level: 'any',
    amount:
      'Master’s: €18,500 tuition exemption per year, for each of the two years of the Master’s programme. (Undergraduate: full or €9,500 exemption.)',
    deadline: '2026-11-29T23:59:59.000Z',
    gates: [
      g('A first-time applicant to Sciences Po.', 'other'),
      g('From a non-EU state, with the household not filing taxes in the EU.', 'nationality'),
      g(
        'Admitted to an Undergraduate or Master’s programme. (Excluded: Swiss/Norwegian citizens, EU dual citizens, Quebec master’s candidates, journalism, 1-year master’s, most dual degrees, exchange students, PhD.)',
        'degreeLevel',
      ),
    ],
    documents: [
      d('Mark the Emile Boutmy option in the “Financial information” section of the Sciences Po application'),
      d('Language test (if required)', 'Attached before the deadline.'),
      d('Complete file only', 'Late or incomplete files are not accepted.'),
    ],
    briefing: briefing(
      '2027 intake — Master’s: 18 October (1st committee) or 29 November (2nd committee). Status: open. (The official page does not print the year; undergraduate deadlines on the same page are dated 2027.)',
    ),
    verifyNote:
      'Verified against sciencespo.fr on 2026-10-12. Deadline set to 29 Nov 2026 (2nd Master’s committee; the page prints day/month without year, so the year is inferred from the 2027-intake context — no official time published, set to end of day UTC).',
  },
  {
    _id: 'quest-paris-saclay-intl-masters',
    title: 'International Master’s Scholarship, Université Paris-Saclay (France)',
    provider: 'Université Paris-Saclay',
    url: 'https://www.universite-paris-saclay.fr/en/admission/bourses-et-aides-financieres/international-masters-scholarships-program-idex',
    countries: ['France'],
    level: 'masters',
    amount:
      '€10,000 per year, paid monthly from September to June, plus up to €900 for travel and visa costs. Renewed for a second year for M1 laureates with good results. Paid only after arrival in France.',
    deadline: null,
    gates: [
      g('Foreign national admitted to a Paris-Saclay Master’s (M1 or M2, not a vocational programme).', 'nationality'),
      g('First enrolment at a French higher-education institution.', 'other'),
      g('Under 30 years old during the application year.', 'ageLimit', {minValue: 30, howToProve: 'Passport / birth date.'}),
      g('No other funding above €600 per month.', 'other'),
    ],
    documents: [
      d('Email invitation to the scholarship form after coordinator selection', 'There is no direct application — course coordinators select candidates first.'),
      d('Two referee recommendations (if asked)', 'Referees may be asked to submit recommendations online.'),
    ],
    briefing: briefing(
      '2027 cycle — not yet published by the official source (status: upcoming). Latest published cycle data labeled 2026 session: coordinator selection 25 March 2026, scholarship application deadline 31 March 2026, results mid-May 2026. Status: upcoming.',
    ),
    verifyNote:
      'Verified against universite-paris-saclay.fr on 2026-10-12. Deadline left unset — 2027 not published (labeled 2026 session: 31 Mar 2026; not reused as a deadline).',
  },
]

module.exports = {U4}
