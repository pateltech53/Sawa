// SAMPLE DATA ONLY: every teacher, student, school, job and programme below is fictional.
// Each record says where it would come from in the pilot (KHDA, MOE, school MIS, LMS).
import type {
  Educator, JobPosting, PdProgramme, Resource, RosterStudent, TAssignment, TeacherClass, TeacherCommunity, TimetableSlot,
} from "./types";
import { at } from "./seed";

const Y = new Date().getFullYear();

/** Students in Ms Aisha's classes. The first three also have Sawa accounts (see PROFILES). */
export const ROSTER: RosterStudent[] = [
  { id: "stu-sara", name: "Sara K.", nameAr: "سارة", birthYear: Y - 14, interests: ["robotics", "coding", "science"], support: "extension" },
  { id: "stu-omar", name: "Omar H.", nameAr: "عمر", birthYear: Y - 13, interests: ["sports"] },
  { id: "stu-mariam", name: "Mariam A.", nameAr: "مريم", birthYear: Y - 14, interests: ["arts", "photography"] },
  { id: "r-04", name: "Hamdan S.", nameAr: "حمدان", birthYear: Y - 14, interests: ["math", "investing"] },
  { id: "r-05", name: "Noura M.", nameAr: "نورة", birthYear: Y - 13, interests: ["debate", "reading"], support: "learning_support" },
  { id: "r-06", name: "Yousef A.", nameAr: "يوسف", birthYear: Y - 14, interests: ["gaming", "coding"] },
  { id: "r-07", name: "Fatima R.", nameAr: "فاطمة", birthYear: Y - 13, interests: ["environment", "science"] },
  { id: "r-08", name: "Rashid K.", nameAr: "راشد", birthYear: Y - 14, interests: ["robotics", "sports"] },
  { id: "r-09", name: "Latifa N.", nameAr: "لطيفة", birthYear: Y - 14, interests: ["music", "arts"] },
  { id: "r-10", name: "Ahmed B.", nameAr: "أحمد", birthYear: Y - 13, interests: ["math"] },
  { id: "r-19", name: "Salama H.", nameAr: "سلامة", birthYear: Y - 14, interests: ["science", "environment"] },
  { id: "r-20", name: "Obaid M.", nameAr: "عبيد", birthYear: Y - 13, interests: ["robotics", "gaming"] },
  { id: "r-21", name: "Meera S.", nameAr: "ميرة", birthYear: Y - 14, interests: ["reading", "debate"] },
  { id: "r-22", name: "Sultan A.", nameAr: "سلطان", birthYear: Y - 14, interests: ["sports", "math"] },
  { id: "r-11", name: "Shamma T.", nameAr: "شمّة", birthYear: Y - 15, interests: ["science", "debate"] },
  { id: "r-12", name: "Khalifa J.", nameAr: "خليفة", birthYear: Y - 15, interests: ["coding", "business"] },
  { id: "r-13", name: "Aisha F.", nameAr: "عائشة", birthYear: Y - 15, interests: ["environment"] },
  { id: "r-14", name: "Saeed L.", nameAr: "سعيد", birthYear: Y - 15, interests: ["robotics", "math"], support: "extension" },
  { id: "r-15", name: "Maitha O.", nameAr: "ميثاء", birthYear: Y - 16, interests: ["photography", "travel"] },
  { id: "r-16", name: "Zayed Q.", nameAr: "زايد", birthYear: Y - 15, interests: ["sports", "science"] },
  { id: "r-17", name: "Hessa D.", nameAr: "حصة", birthYear: Y - 16, interests: ["business", "investing"] },
  { id: "r-18", name: "Majid E.", nameAr: "ماجد", birthYear: Y - 15, interests: ["gaming"] },
];

export const CLASSES: TeacherClass[] = [
  { id: "cl-8a", name: "8A Science", nameAr: "علوم 8أ", subject: "Science", grade: "8", room: "Lab 2", color: "#4073FF", source: "Google Classroom",
    studentIds: ["stu-sara", "stu-omar", "stu-mariam", "r-04", "r-05", "r-06", "r-07", "r-08"] },
  { id: "cl-8b", name: "8B Science", nameAr: "علوم 8ب", subject: "Science", grade: "8", room: "Lab 2", color: "#8C59F2", source: "Google Classroom",
    studentIds: ["r-09", "r-10", "r-19", "r-20", "r-21", "r-22"] },
  { id: "cl-9a", name: "9A Physics", nameAr: "فيزياء 9أ", subject: "Science", grade: "9", room: "Lab 1", color: "#E35CC4", source: "Microsoft Teams",
    studentIds: ["r-11", "r-12", "r-13", "r-14", "r-15", "r-16", "r-17", "r-18"] },
];

/** Sunday-Thursday week is not assumed: slots use JS weekday numbers (Mon = 1 ... Fri = 5). */
export const TIMETABLE: TimetableSlot[] = [1, 2, 3, 4, 5].flatMap((day) => [
  { day, period: 1, start: "07:30", end: "08:20", classId: day % 2 ? "cl-8a" : "cl-9a" },
  { day, period: 2, start: "08:25", end: "09:15", classId: day === 3 ? undefined : "cl-8b", label: day === 3 ? "PLC meeting · Science dept" : undefined },
  { day, period: 3, start: "09:35", end: "10:25", label: day === 2 ? "Break duty · Gate B" : undefined, classId: day === 2 ? undefined : day % 2 ? "cl-9a" : "cl-8a" },
  { day, period: 4, start: "10:30", end: "11:20", classId: day === 5 ? undefined : "cl-8a", label: day === 5 ? "Planning" : undefined },
  { day, period: 5, start: "11:40", end: "12:30", classId: day % 2 ? "cl-8b" : "cl-9a" },
  { day, period: 6, start: "12:35", end: "13:25", label: day === 4 ? "Green Club" : "Planning" },
]);

export const T_ASSIGNMENTS: TAssignment[] = [
  { id: "as-1", classId: "cl-8a", title: "Forces & motion worksheet", kind: "homework", dueAt: at(2, 20), points: 20, createdAt: at(-5), status: "published" },
  { id: "as-2", classId: "cl-8a", title: "Lab report: density of liquids", kind: "lab", dueAt: at(-1, 20), points: 30, createdAt: at(-9), status: "published" },
  { id: "as-3", classId: "cl-8a", title: "Quiz: states of matter", kind: "quiz", dueAt: at(-6, 12), points: 10, createdAt: at(-12), status: "published", returned: true },
  { id: "as-4", classId: "cl-8b", title: "Forces & motion worksheet", kind: "homework", dueAt: at(3, 20), points: 20, createdAt: at(-4), status: "published" },
  { id: "as-5", classId: "cl-8b", title: "Quiz: states of matter", kind: "quiz", dueAt: at(-2, 12), points: 10, createdAt: at(-8), status: "published" },
  { id: "as-6", classId: "cl-9a", title: "Circuits investigation", kind: "project", dueAt: at(6, 20), points: 40, createdAt: at(-3), status: "published" },
  { id: "as-7", classId: "cl-9a", title: "Ohm's law practice set", kind: "homework", dueAt: at(-3, 20), points: 15, createdAt: at(-10), status: "published" },
];

/** Deterministic sample submissions so the gradebook looks the same on every load. */
export function seedSubmissions(): Record<string, Record<string, import("./types").Submission>> {
  const out: Record<string, Record<string, import("./types").Submission>> = {};
  for (const a of T_ASSIGNMENTS) {
    const cls = CLASSES.find((c) => c.id === a.classId)!;
    out[a.id] = {};
    cls.studentIds.forEach((sid, i) => {
      const h = (a.id.charCodeAt(3) * 7 + i * 13) % 10;
      const past = new Date(a.dueAt).getTime() < Date.now();
      if (a.returned) out[a.id][sid] = { status: "graded", score: Math.max(4, a.points - (h % 5)), feedback: h > 6 ? "Great reasoning on question 3." : undefined };
      else if (!past) out[a.id][sid] = h < 4 ? { status: "submitted" } : { status: "missing" };
      else out[a.id][sid] = h === 0 ? { status: "missing" } : h === 1 ? { status: "late" } : h < 6 ? { status: "graded", score: Math.round(a.points * (0.55 + h * 0.07)) } : { status: "submitted" };
    });
  }
  return out;
}

export const RESOURCES: Resource[] = [
  { id: "rs-1", title: "Forces & motion worksheet (differentiated, 3 levels)", kind: "worksheet", subject: "Science", grades: ["8"], owner: "Ms Aisha", ownerId: "tch-aisha", school: "Al Noor Public School (sample)", scope: "mine", sizeKb: 412, fileName: "forces-worksheet.pdf", tags: ["forces", "differentiation"], saves: 0, createdAt: at(-6), sharedWith: ["cl-8a", "cl-8b"], summary: "Three versions of the same task: core, support and extension. Answer key on the last page." },
  { id: "rs-2", title: "Density lab: teacher guide and risk assessment", kind: "lesson_plan", subject: "Science", grades: ["8"], owner: "Ms Aisha", ownerId: "tch-aisha", school: "Al Noor Public School (sample)", scope: "mine", sizeKb: 220, fileName: "density-lab.docx", tags: ["practical", "safety"], saves: 0, createdAt: at(-11), summary: "Step-by-step practical with timings, kit list and a completed risk assessment." },
  { id: "rs-3", title: "States of matter: retrieval quiz bank (40 questions)", kind: "assessment", subject: "Science", grades: ["7", "8"], owner: "Mr Hassan", ownerId: "edu-hassan", school: "Al Noor Public School (sample)", scope: "school", sizeKb: 96, fileName: "matter-quiz-bank.xlsx", tags: ["retrieval", "quiz"], saves: 14, createdAt: at(-20), summary: "Shuffle-ready question bank with answers and common misconceptions." },
  { id: "rs-4", title: "Science department scheme of work, Term 2", kind: "lesson_plan", subject: "Science", grades: ["7", "8", "9"], owner: "Science department", ownerId: "dept-sci", school: "Al Noor Public School (sample)", scope: "school", sizeKb: 880, fileName: "sow-term2.pdf", tags: ["planning"], saves: 22, createdAt: at(-40), summary: "Week-by-week plan with MOE learning outcomes mapped to each lesson." },
  { id: "rs-5", title: "Circuits simulation lesson (PhET) with Arabic glossary", kind: "slides", subject: "Science", grades: ["9"], owner: "Ms Reem", ownerId: "edu-reem", school: "Creek Science Academy (sample)", scope: "network", sizeKb: 5300, fileName: "circuits-phet.pptx", tags: ["simulation", "bilingual"], saves: 63, createdAt: at(-9), summary: "Guided simulation lesson; every key term has its Arabic equivalent on the slide." },
  { id: "rs-6", title: "Climate action project: 4-week PBL unit", kind: "lesson_plan", subject: "Science", grades: ["8", "9"], owner: "Mr Daniel", ownerId: "edu-daniel", school: "Marina Innovation School (sample)", scope: "network", sizeKb: 1200, fileName: "climate-pbl.pdf", tags: ["PBL", "sustainability"], saves: 41, createdAt: at(-15), summary: "Project-based unit ending in a student pitch to the school leadership team." },
  { id: "rs-7", title: "Exam technique: command words poster (EN/AR)", kind: "worksheet", subject: "Science", grades: ["8", "9", "10"], owner: "Ms Reem", ownerId: "edu-reem", school: "Creek Science Academy (sample)", scope: "network", sizeKb: 300, fileName: "command-words.pdf", tags: ["exam", "bilingual"], saves: 88, createdAt: at(-30), summary: "Describe, explain, evaluate: what each command word asks for, with examples." },
  { id: "rs-8", title: "Intro to Python with micro:bit (6 lessons)", kind: "slides", subject: "Computing", grades: ["7", "8"], owner: "Ms Layla", ownerId: "edu-layla", school: "Al Noor Public School (sample)", scope: "school", sizeKb: 2400, fileName: "microbit-python.zip", tags: ["coding", "robotics"], saves: 19, createdAt: at(-25), summary: "Good bridge into the robotics club and the Junior Robotics Challenge." },
  { id: "rs-9", title: "Newton's laws explained (video, 7 min)", kind: "video", subject: "Science", grades: ["8", "9"], owner: "Mr Daniel", ownerId: "edu-daniel", school: "Marina Innovation School (sample)", scope: "network", url: "https://example.org/sample-video", tags: ["flipped"], saves: 35, createdAt: at(-12), summary: "Short flipped-learning video with three check questions." },
];

export const EDUCATORS: Educator[] = [
  { id: "edu-hassan", name: "Mr Hassan", nameAr: "الأستاذ حسن", schoolId: "sch-1", subjects: ["Science"], grades: "7-9", years: 11, bio: "Robotics club lead. Happy to co-coach competition teams.", openTo: ["competitions", "co_teaching"] },
  { id: "edu-layla", name: "Ms Layla", nameAr: "الأستاذة ليلى", schoolId: "sch-1", subjects: ["Computing", "Art"], grades: "6-9", years: 6, bio: "Computing and photography. Runs the photography club.", openTo: ["resource_swap", "competitions"] },
  { id: "edu-reem", name: "Ms Reem", nameAr: "الأستاذة ريم", schoolId: "sch-2", subjects: ["Science"], grades: "8-12", years: 14, bio: "Physics lead. Builds bilingual simulation lessons.", openTo: ["mentoring", "resource_swap"] },
  { id: "edu-daniel", name: "Mr Daniel", nameAr: "الأستاذ دانيال", schoolId: "sch-3", subjects: ["Science", "Computing"], grades: "8-10", years: 8, bio: "Project-based learning and the Smart City hackathon organiser.", openTo: ["co_teaching", "competitions"] },
  { id: "edu-mona", name: "Ms Mona", nameAr: "الأستاذة منى", schoolId: "sch-4", subjects: ["Maths"], grades: "7-9", years: 9, bio: "Maths olympiad coach. Shares past papers every term.", openTo: ["resource_swap", "competitions"] },
  { id: "edu-priya", name: "Ms Priya", nameAr: "الأستاذة بريا", schoolId: "sch-5", subjects: ["Science"], grades: "6-8", years: 5, bio: "Early-career teacher looking for a mentor in practical science.", openTo: ["mentoring"] },
  { id: "edu-salem", name: "Mr Salem", nameAr: "الأستاذ سالم", schoolId: "sch-6", subjects: ["Arabic", "Social Studies"], grades: "9-12", years: 16, bio: "Debate and MUN advisor across three schools.", openTo: ["competitions", "mentoring"] },
];

export const T_COMMUNITIES: TeacherCommunity[] = [
  { id: "tc-1", name: "UAE Science Teachers", nameAr: "معلمو العلوم في الإمارات", members: 1840, subject: "Science", about: "Practical ideas, lab safety and exam prep. Moderated by subject leads.", emirate: "All emirates", moderated: true },
  { id: "tc-2", name: "Competition Coaches Network", nameAr: "شبكة مدربي المسابقات", members: 420, about: "Find co-coaches, share timelines and build cross-school teams.", emirate: "Dubai", moderated: true },
  { id: "tc-3", name: "Bilingual Classroom", nameAr: "الفصل ثنائي اللغة", members: 960, about: "Teaching STEM in Arabic and English: glossaries, scaffolds, assessment.", emirate: "All emirates", moderated: true },
  { id: "tc-4", name: "Early-Career Teachers", nameAr: "المعلمون الجدد", members: 610, about: "Questions welcome. Mentors from experienced teachers.", emirate: "All emirates", moderated: true },
];

/** Sample postings. Real postings would come from school HR systems or official job portals. */
export const JOBS: JobPosting[] = [
  { id: "job-1", schoolId: "sch-2", title: "Physics teacher (Grades 9-12)", subject: "Science", grades: "9-12", start: "August", contract: "Full-time", postedAt: at(-4), closesAt: at(18), source: "Sample posting" },
  { id: "job-2", schoolId: "sch-3", title: "Head of Science", subject: "Science", grades: "6-12", start: "January", contract: "Full-time · leadership", postedAt: at(-10), closesAt: at(9), source: "Sample posting" },
  { id: "job-3", schoolId: "sch-6", title: "Middle-school Science teacher", subject: "Science", grades: "6-8", start: "August", contract: "Full-time", postedAt: at(-2), closesAt: at(25), source: "Sample posting" },
  { id: "job-4", schoolId: "sch-5", title: "STEM & robotics coordinator", subject: "Computing", grades: "5-10", start: "April", contract: "Full-time", postedAt: at(-7), closesAt: at(14), source: "Sample posting" },
  { id: "job-5", schoolId: "sch-4", title: "Maths teacher (Grades 7-9)", subject: "Maths", grades: "7-9", start: "August", contract: "Full-time", postedAt: at(-1), closesAt: at(30), source: "Sample posting" },
];

/** Sample programmes. Replace with real MOE / KHDA / provider listings and their links. */
export const PD: PdProgramme[] = [
  { id: "pd-1", title: "Inquiry-based practical science", provider: "Sample provider (to be replaced)", format: "blended", hours: 12, startsAt: at(10), subjects: ["Science"], cost: "Free (sample)", certificate: true, about: "Design practicals where students ask the question. Includes two observed lessons.", source: "Sample listing" },
  { id: "pd-2", title: "AI in the classroom: safe and useful", provider: "Sample provider (to be replaced)", format: "online", hours: 6, startsAt: at(4), subjects: ["All"], cost: "Free (sample)", certificate: true, about: "Planning, feedback and differentiation with AI, and where not to use it.", source: "Sample listing" },
  { id: "pd-3", title: "Coaching student competition teams", provider: "Sample provider (to be replaced)", format: "in_person", hours: 8, startsAt: at(17), subjects: ["Science", "Computing", "Maths"], cost: "AED 250 (sample)", certificate: false, about: "Timelines, team roles and judging criteria for robotics, olympiads and hackathons.", source: "Sample listing" },
  { id: "pd-4", title: "Teaching STEM bilingually", provider: "Sample provider (to be replaced)", format: "online", hours: 10, startsAt: at(21), subjects: ["Science", "Maths"], cost: "Free (sample)", certificate: true, about: "Scaffolds and glossaries for Arabic-English classrooms.", source: "Sample listing" },
  { id: "pd-5", title: "Middle leadership: leading a department", provider: "Sample provider (to be replaced)", format: "blended", hours: 20, startsAt: at(35), subjects: ["All"], cost: "AED 900 (sample)", certificate: true, about: "For teachers moving towards head-of-department roles.", source: "Sample listing" },
];

/** Integration status shown everywhere it matters. Nothing here is live in the prototype. */
export const INTEGRATIONS: { key: string; name: string; status: "mock" | "awaiting" | "sample" | "live"; note: string }[] = [
  { key: "google-classroom", name: "Google Classroom", status: "mock", note: "Classes 8A and 8B, assignments and submissions (sample data)" },
  { key: "teams", name: "Microsoft Teams", status: "mock", note: "Class 9A (sample data)" },
  { key: "managebac", name: "ManageBac", status: "awaiting", note: "Needs school API credentials" },
  { key: "khda", name: "KHDA school directory", status: "sample", note: "Sample rows until the Dubai Pulse CSV is imported" },
  { key: "moe", name: "MOE systems (Al Manhal, LMS)", status: "mock", note: "Simulated connectors" },
  { key: "ai", name: "SAWA AI", status: "live", note: "Live when ANTHROPIC_API_KEY is set; otherwise retrieval-only" },
];
