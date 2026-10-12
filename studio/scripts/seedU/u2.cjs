/** Batch U2: USA universities (verified 2026-10-12). */
const {g, d, briefing} = require('./helpers.cjs')

const U2 = [
  {
    _id: 'quest-duke-karsh',
    title: 'Karsh International Scholarship, Duke University (USA)',
    provider: 'Duke University',
    url: 'https://ousf.duke.edu/merit-scholarships/karsh-international-scholars-program/',
    countries: ['United States'],
    level: 'undergrad',
    amount:
      'Full undergraduate funding for four years. Covers tuition, room, board, and mandatory fees. Also covers any demonstrated need beyond those costs. Funds three summers of research, unpaid internships, and other academic opportunities.',
    deadline: '2027-01-04T23:59:59.000Z',
    gates: [
      g('You are an international applicant. You must show financial need.', 'nationality'),
      g('There is no separate application. Apply to Duke University and request financial aid.', 'other'),
      g('You must not already hold a bachelor’s degree.', 'degreeLevel'),
    ],
    documents: [
      d('Duke admission application', 'The scholarship has no separate application.'),
      d('Financial aid forms (CSS Profile)', 'Due November 15, 2026 for Early Decision or February 1, 2027 for Regular Decision.'),
    ],
    briefing: briefing(
      '2027 cycle: open. Apply through Duke admission: Early Decision by November 2, 2026, or Regular Decision by January 4, 2027 (data labeled 2026-2027 admission cycle, Duke official). Status: open.',
    ),
    verifyNote:
      'Verified against ousf.duke.edu on 2026-10-12. Deadline set to Regular Decision (4 Jan 2027; no official time published — set to end of day UTC). Early Decision 2 Nov 2026; CSS Profile Nov 15 2026 (ED) / Feb 1 2027 (RD).',
  },
  {
    _id: 'quest-vanderbilt-ingram',
    title: 'Ingram Scholars Program, Vanderbilt University (USA)',
    provider: 'Vanderbilt University',
    url: 'https://www.vanderbilt.edu/scholarships/ingram/',
    countries: ['United States'],
    level: 'undergrad',
    amount:
      'Full tuition, all required fees, and the value of on-campus housing each year. Plus a stipend for a special summer service project. Renewable each year through senior year with a 3.0 GPA and service requirements. Extra need-based aid available if need exceeds full tuition.',
    deadline: '2026-12-01T23:59:59.000Z',
    gates: [
      g(
        'You are chosen for your commitment to community service, your entrepreneurial spirit, your personal character, and your leadership potential.',
        'other',
      ),
      g('First, apply to Vanderbilt University. Then apply electronically to the Ingram Scholars Program through your MyAppVU account.', 'other'),
      g('Finalists must do an interview with the selection committee.', 'other'),
      g('No citizenship restriction is stated on the official page.', 'nationality'),
    ],
    documents: [
      d(
        'Ingram Scholars Program application (via MyAppVU)',
        'Submitted with the admission application. A full document list is not published by the official source. Finalists complete an interview.',
      ),
    ],
    briefing: briefing(
      '2027 cycle: December 1, 2026, for prospective first-year students. Status: open.',
    ),
    verifyNote:
      'Verified against vanderbilt.edu/scholarships on 2026-10-12. Deadline 1 Dec 2026 (no official time published — set to end of day UTC).',
  },
  {
    _id: 'quest-emory-woodruff',
    title: 'Robert W. Woodruff Scholarship, Emory University (USA)',
    provider: 'Emory University',
    url: 'https://apply.emory.edu/financial-aid/scholar-program',
    countries: ['United States'],
    level: 'undergrad',
    amount:
      'Emory’s top merit scholarship. Covers full tuition, required fees, and on-campus room and meals. Renewable for up to eight semesters of undergraduate study, plus special programming, advising, and summer funding opportunities.',
    deadline: '2026-11-15T23:59:59.000Z',
    gates: [
      g('Open to first-year, homeschooled, and international applicants, regardless of citizenship.', 'nationality'),
      g('Choose Early Decision I, Early Decision II, or Regular Decision.', 'other'),
      g('Answer "Yes" to the Scholars question on the Emory application. You will not be considered otherwise.', 'other'),
      g('About 10,000 students apply each year; 175 to 200 become finalists.', 'other'),
    ],
    documents: [], // honest empty: admission application is the scholarship application
    briefing: briefing(
      '2027 cycle: open. November 1 (Early Decision I Scholar Program deadline) or November 15 (Early Decision II and Regular Decision Scholar Program deadline). Status: open.',
      'No separate documents — the Emory admission application is the scholarship application.',
    ),
    verifyNote:
      'Verified against apply.emory.edu on 2026-10-12. Deadline set to 15 Nov 2026 (EDII/RD round; no official time published — set to end of day UTC). Document list honestly empty.',
  },
  {
    _id: 'quest-uva-jefferson',
    title: 'Jefferson Scholarship, University of Virginia (USA)',
    provider: 'Jefferson Scholars Foundation / University of Virginia',
    url: 'https://www.jeffersonscholars.org/scholarships',
    countries: ['United States'],
    level: 'undergrad',
    amount:
      'Covers the entire cost of attendance for four years at the University of Virginia, plus extra enrichment experiences. Students from outside Virginia receive over $83,000 per year — over $405,000 in total.',
    deadline: '2026-12-01T23:59:59.000Z',
    gates: [
      g('You cannot apply directly. Your school must nominate you. Eligible schools each nominate one senior.', 'other'),
      g('Nominees show excellence in leadership, scholarship, and citizenship.', 'other'),
      g('Your citizenship status is not considered. International students can be nominated.', 'nationality'),
      g('Financial need is not a factor in selection.', 'other'),
    ],
    documents: [
      d('Scholastic report, extracurricular activities list, and two essays'),
      d('Transcript, school profile, and one letter of recommendation', 'Submitted by school officials.'),
      d('UVA undergraduate admission application', 'A separate admission application to UVA is required.'),
    ],
    briefing: briefing(
      '2027 cycle: open. December 1, 2026, for both counselor and nominee materials. Status: open.',
    ),
    verifyNote:
      'Verified against jeffersonscholars.org on 2026-10-12. Deadline 1 Dec 2026 (no official time published — set to end of day UTC).',
  },
  {
    _id: 'quest-unc-morehead-cain',
    title: 'Morehead-Cain Scholarship, University of North Carolina at Chapel Hill (USA)',
    provider: 'Morehead-Cain Foundation / University of North Carolina at Chapel Hill',
    url: 'https://www.moreheadcain.org/',
    countries: ['United States'],
    level: 'undergrad',
    amount:
      'A four-year undergraduate merit scholarship. Covers tuition, books, and room and board. Also funds four summers of travel and experiential learning, plus Discovery Fund grants for extra educational experiences.',
    deadline: '2026-10-01T23:59:59.000Z',
    gates: [
      g('You must be on track to graduate from high school in the spring.', 'degreeLevel'),
      g('Be nominated by your high school or an affiliate program, or apply independently.', 'other'),
      g('Be a competitive applicant for admission to UNC-Chapel Hill. Admission is a separate process.', 'other'),
      g('Selection is based only on merit: leadership, moral force of character, academic achievement, and physical vigor.', 'other'),
    ],
    documents: [
      d('Morehead-Cain application'),
      d('School report form and recommendation form', 'Submitted by the counselor; all counselor materials due by the same October 1 deadline.'),
    ],
    briefing: briefing(
      '2027 cycle (data labeled 2026-2027 cycle, official): October 1, 2026, for the Morehead-Cain application — closed. UNC admission is separate: October 15, 2026 (Early Action) or January 1, 2027 (Regular Decision). Status: closed for the 2027 cycle.',
    ),
    verifyNote:
      'Verified against moreheadcain.org on 2026-10-12. Deadline 1 Oct 2026 (no official time published — set to end of day UTC; closed for the 2027 cycle).',
  },
  {
    _id: 'quest-utd-mcdermott',
    title: 'Eugene McDermott Scholars Program, University of Texas at Dallas (USA)',
    provider: 'University of Texas at Dallas',
    url: 'https://provost.utdallas.edu/mcdermott-programs/eugene-mcdermott-scholars/',
    countries: ['United States'],
    level: 'undergrad',
    amount:
      'A four-year, full-ride undergraduate merit scholarship. Covers tuition, housing, living costs, and educational stipends. Also funds study abroad. No financial need is required.',
    deadline: null,
    gates: [
      g('You are a first-time first-year student. You start college in the fall right after high school. No gap years. No transfer students.', 'degreeLevel'),
      g('Open to both domestic and international students.', 'nationality'),
      g('Apply to UT Dallas first to get your NetID, then apply to the McDermott program by the deadline.', 'other'),
      g('Be in the top academic tenth of the UT Dallas entering class of 2027 and be offered an Academic Excellence Scholarship award.', 'other'),
      g('About 16 to 20 scholars are chosen each year.', 'other'),
    ],
    documents: [
      d('Complete McDermott application'),
      d('Two McDermott Recommendation Forms', 'One from each of two recommenders.'),
      d('UT Dallas admission application with supplemental documentation'),
    ],
    briefing: briefing(
      'December 1: UT Dallas application with supplemental documentation due, and McDermott application with two recommendation forms due (data labeled 2026 session; the 2027 cycle dates are not yet published on the official source). Status: upcoming.',
    ),
    verifyNote:
      'Verified against provost.utdallas.edu on 2026-10-12. Deadline left unset — December 1 belongs to the labeled 2026 session and 2027 dates are not published; not reused as a deadline.',
  },
  {
    _id: 'quest-bu-presidential',
    title: 'Boston University Presidential Scholarship (USA)',
    provider: 'Boston University',
    url: 'https://www.bu.edu/admissions/tuition-aid/scholarships-financial-aid/first-year-merit/',
    countries: ['United States'],
    level: 'undergrad',
    amount:
      'Covers half of tuition each year. Awarded to first-year students from around the world with exceptional academic achievement. Effective for students entering from Fall 2026 onward.',
    deadline: '2026-12-01T23:59:59.000Z',
    gates: [
      g('Open to US citizens, permanent residents, and international students.', 'nationality'),
      g('For first-year undergraduate applicants only.', 'degreeLevel'),
      g('No separate scholarship application. Complete the admission application by December 1.', 'other'),
    ],
    documents: [], // honest empty: nothing beyond the admission application
    briefing: briefing(
      '2027 cycle: December 1 — complete the application for admission by December 1 to be considered. Status: open.',
      'Note: the BU Trustee Scholarship is paused and removed from the official site, so it is not listed; the Presidential Scholarship is BU’s current flagship first-year merit award.',
    ),
    verifyNote:
      'Verified against bu.edu/admissions on 2026-10-12. Deadline 1 Dec 2026 (no official time published — set to end of day UTC). Document list honestly empty (admission application only).',
  },
  {
    _id: 'quest-harvard-need-aid',
    title: 'Harvard University Need-Based Financial Aid for International Students (USA)',
    provider: 'Harvard University',
    url: 'http://college.harvard.edu/financial-aid/how-aid-works',
    countries: ['United States'],
    level: 'undergrad',
    amount:
      'Need-based aid only. Harvard meets 100% of demonstrated financial need. International students receive exactly the same aid as American students. Aid is given as grants and student jobs, not required loans.',
    deadline: '2027-02-01T23:59:59.000Z',
    gates: [
      g('Get admitted to Harvard College. Harvard admission is need-blind — financial need never affects the admission chance.', 'other'),
      g('Apply for financial aid. All students follow the same process, regardless of citizenship.', 'nationality'),
      g('Aid is based only on need, not on grades or merit.', 'other'),
    ],
    documents: [
      d('CSS Profile'),
      d('IDOC packet with family financial documents', 'US citizens and permanent residents also submit the FAFSA.'),
    ],
    briefing: briefing(
      '2027-2028 school year: Restrictive Early Action November 1 (financial aid materials); Regular Decision February 1 (financial aid materials). Status: open.',
    ),
    verifyNote:
      'Verified against college.harvard.edu on 2026-10-12. Deadline set to Regular Decision aid materials (1 Feb 2027; no official time published — set to end of day UTC).',
  },
  {
    _id: 'quest-yale-need-aid',
    title: 'Yale University Need-Based Financial Aid for International Students (USA)',
    provider: 'Yale University',
    url: 'https://finaid.yale.edu/apply/prospective',
    countries: ['United States'],
    level: 'undergrad',
    amount:
      'Need-based aid only. Yale meets 100% of demonstrated financial need with grants that are never paid back. No loans are required. International students receive the same need-based aid as domestic students. Awards can include housing, meals, and travel to and from campus.',
    deadline: '2027-02-15T23:59:59.000Z',
    gates: [
      g('Get admitted to Yale College. Yale is need-blind for all students including internationals — applying for aid never hurts admission chances.', 'other'),
      g('On the admissions application, request consideration for need-based financial aid. The financial aid office will then contact you with next steps.', 'other'),
      g('International students who enroll do not need to reapply for aid every year.', 'other'),
    ],
    documents: [
      d('CSS Profile'),
      d('Supporting financial documents (requested directly by Yale)', 'Yale does not accept the ISFAA form. A full document list is not published on the official page.'),
    ],
    briefing: briefing(
      '2027-2028 priority deadlines (official): Early Action (international citizens) December 1, 2026; Regular Decision February 15, 2027. Status: open.',
    ),
    verifyNote:
      'Verified against finaid.yale.edu on 2026-10-12. Deadline set to Regular Decision (15 Feb 2027; no official time published — set to end of day UTC).',
  },
  {
    _id: 'quest-princeton-need-aid',
    title: 'Princeton University Need-Based Financial Aid for International Students (USA)',
    provider: 'Princeton University',
    url: 'http://admission.princeton.edu/apply/international-students',
    countries: ['United States'],
    level: 'undergrad',
    amount:
      'Need-based aid only. Princeton meets the full need of every admitted international student, just like for US students. Aid comes as grants, not loans. Princeton does not offer merit or athletic scholarships.',
    deadline: '2027-01-01T23:59:59.000Z',
    gates: [
      g('Get admitted to Princeton. Princeton admission is need-blind — no disadvantage for students who apply for aid, including international students.', 'other'),
      g('All applications are reviewed the same way, regardless of citizenship or country of residence.', 'nationality'),
      g('Apply for financial aid through Princeton’s online financial aid application.', 'other'),
    ],
    documents: [], // honest empty: collected in the online aid application; list not published
    briefing: briefing(
      '2027 cycle: apply for admission by November 1 (Single-Choice Early Action) or January 1 (Regular Decision). Apply for financial aid along with the application. A separate financial aid deadline is not published on the official source. Status: open.',
    ),
    verifyNote:
      'Verified against admission.princeton.edu on 2026-10-12. Deadline set to Regular Decision admission (1 Jan 2027; no official time published — set to end of day UTC). Document list honestly empty.',
  },
]

module.exports = {U2}
