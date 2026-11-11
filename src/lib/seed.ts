// SAMPLE DATA ONLY — every person, document and number below is synthetic.
// No real student names, Emirates ID numbers or phone numbers are used anywhere in Sawa.
import type {
  ChatMsg, TeacherEvent,
  Announcement, Approval, Community, GuardianLink, Notice, Opportunity, Profile,
  ProfileFact, School, Service, ServiceRequest, CommunityPost, CommunityActivity, ClassroomCourse, ClassroomWork,
} from "./types";
import importedSchools from "./schools.generated.json";

const DAY = 86_400_000;
export const at = (days: number, hour = 8) => {
  const d = new Date(Date.now() + days * DAY);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const INTERESTS: { id: string; en: string; ar: string; img?: string; featured?: boolean; tint?: string }[] = [
  { id: "coding", en: "Coding", ar: "البرمجة", img: "/figma/interests/coding.png", featured: true, tint: "#A9C3FF" },
  { id: "photography", en: "Photography", ar: "التصوير", img: "/figma/interests/photography.png", featured: true, tint: "#FFC9A3" },
  { id: "business", en: "Business", ar: "الأعمال", img: "/figma/interests/business.png", featured: true, tint: "#D9B595" },
  { id: "investing", en: "Investing", ar: "الاستثمار", img: "/figma/interests/investing.png", featured: true, tint: "#9EDDBB" },
  { id: "robotics", en: "Robotics", ar: "الروبوتات", img: "/figma/interests/coding.png", tint: "#A9C3FF" },
  { id: "science", en: "Science", ar: "العلوم", tint: "#B9D7F5" },
  { id: "math", en: "Maths", ar: "الرياضيات", tint: "#C9C3F5" },
  { id: "debate", en: "Debate & MUN", ar: "المناظرات ونموذج الأمم المتحدة", tint: "#E8CFA8" },
  { id: "arts", en: "Design", ar: "التصميم", tint: "#F3C1D9" },
  { id: "music", en: "Music", ar: "الموسيقى", tint: "#D8C3F5" },
  { id: "gaming", en: "Gaming", ar: "الألعاب", tint: "#C3D3F5" },
  { id: "sports", en: "Fitness & Sport", ar: "الرياضة واللياقة", tint: "#B8E3C8" },
  { id: "travel", en: "Travel", ar: "السفر", tint: "#F5DEB3" },
  { id: "cooking", en: "Cooking", ar: "الطبخ", tint: "#F5C9B3" },
  { id: "environment", en: "Sustainability", ar: "الاستدامة", tint: "#BFE3B5" },
  { id: "reading", en: "Reading & Writing", ar: "القراءة والكتابة", tint: "#E3D6C3" },
];

export const PROFILES: Profile[] = [
  { id: "stu-sara", role: "student", name: "Sara", nameAr: "سارة", schoolId: "sch-1", grade: "8", birthYear: new Date().getFullYear() - 14, interests: ["robotics", "coding", "science"], avatar: "S" },
  { id: "par-khalid", role: "parent", name: "Khalid (Sara's father)", nameAr: "خالد (والد سارة)", schoolId: "sch-1", interests: [], avatar: "K" },
  { id: "tch-aisha", role: "teacher", name: "Ms Aisha", nameAr: "الأستاذة عائشة", schoolId: "sch-1", grade: "8", interests: [], avatar: "A" },
  // classmates in grade 8 (receive teacher posts too)
  { id: "stu-omar", role: "student", name: "Omar", nameAr: "عمر", schoolId: "sch-1", grade: "8", birthYear: new Date().getFullYear() - 13, interests: ["sports"], avatar: "O" },
  { id: "stu-mariam", role: "student", name: "Mariam", nameAr: "مريم", schoolId: "sch-1", grade: "8", birthYear: new Date().getFullYear() - 14, interests: ["arts"], avatar: "M" },
];

export const GUARDIAN_LINKS: GuardianLink[] = [
  { guardianId: "par-khalid", childId: "stu-sara", verifiedVia: "uae_pass_sim", createdAt: at(-120) },
];
/** classmates' guardians, so "include parents" fans out to real rows */
export const OTHER_GUARDIANS: Record<string, string> = { "stu-omar": "par-omar", "stu-mariam": "par-mariam" };

export const NOTICES: Notice[] = [
  { id: "n1", userId: "stu-sara", sourceSystem: "LMS", kind: "assignment", priority: 2, status: "open", dueAt: at(2, 20),
    titleEn: "Science: Forces & motion worksheet", titleAr: "العلوم: ورقة عمل القوى والحركة",
    bodyEn: "Submit on the Smart Learning Portal.", bodyAr: "يُسلَّم عبر بوابة التعلّم الذكي." },
  { id: "n2", userId: "stu-sara", sourceSystem: "Minhaji", kind: "assignment", priority: 3, status: "open", dueAt: at(4, 20),
    titleEn: "Read e-book chapter 5 — Arabic", titleAr: "قراءة الفصل الخامس — اللغة العربية",
    bodyEn: "Chapter 5 is in your Minhaji library.", bodyAr: "الفصل الخامس متاح في مكتبة منهجي." },
  { id: "n3", userId: "stu-sara", sourceSystem: "Al Manhal", kind: "notice", priority: 2, status: "open", dueAt: at(6),
    titleEn: "Term 2 re-registration window opens Sunday", titleAr: "تُفتح نافذة إعادة التسجيل للفصل الثاني يوم الأحد",
    bodyEn: "Guardians confirm re-enrolment for next term.", bodyAr: "يؤكد أولياء الأمور إعادة التسجيل للفصل القادم." },
  { id: "n4", userId: "stu-sara", sourceSystem: "School", kind: "event", priority: 3, status: "open", dueAt: at(5, 13),
    titleEn: "Parent–teacher meeting (Grade 8)", titleAr: "اجتماع أولياء الأمور والمعلمين (الصف الثامن)",
    bodyEn: "Book a slot in the school hall.", bodyAr: "احجز موعداً في قاعة المدرسة." },
  { id: "n5", userId: "stu-sara", sourceSystem: "LMS", kind: "assignment", priority: 2, status: "open", dueAt: at(1, 20),
    titleEn: "Maths: Algebra quiz practice", titleAr: "الرياضيات: تدريب على اختبار الجبر",
    bodyEn: "10 questions, auto-marked.", bodyAr: "عشرة أسئلة بتصحيح آلي." },
  { id: "n6", userId: "stu-sara", sourceSystem: "School", kind: "notice", priority: 3, status: "done", dueAt: at(-1),
    titleEn: "Sports day kit reminder", titleAr: "تذكير بزي اليوم الرياضي",
    bodyEn: "Bring PE kit on Thursday.", bodyAr: "أحضر الزي الرياضي يوم الخميس." },
];

export const SERVICES: Service[] = [
  { id: "svc-school-file", nameEn: "Update my child's school file", nameAr: "تحديث ملف الطالب المدرسي", ownerSystem: "Al Manhal",
    descEn: "Replace an expired document or change address and contact details.", descAr: "استبدال وثيقة منتهية أو تحديث العنوان وبيانات التواصل.",
    isDemoFlow: true, href: "/app/services/school-file", fields: ["full_name", "eid_number", "eid_expiry", "nationality", "date_of_birth", "address_area", "guardian_name", "guardian_mobile"] },
  { id: "svc-reregistration", nameEn: "Annual re-registration", nameAr: "إعادة التسجيل السنوية", ownerSystem: "Al Manhal",
    descEn: "Confirm your child's place for the next academic year.", descAr: "تأكيد مقعد الطالب للعام الدراسي القادم.",
    isDemoFlow: false, fields: ["full_name", "eid_number", "eid_expiry", "grade", "guardian_name"] },
  { id: "svc-transport", nameEn: "School transport request", nameAr: "طلب النقل المدرسي", ownerSystem: "Transport",
    descEn: "Request or change a school bus route.", descAr: "طلب أو تغيير مسار الحافلة المدرسية.",
    isDemoFlow: false, fields: ["full_name", "address_area", "guardian_mobile"] },
  { id: "svc-certificate", nameEn: "To-whom-it-may-concern letter", nameAr: "شهادة لمن يهمه الأمر", ownerSystem: "Student Portal",
    descEn: "Proof of enrolment for visas, banks or other entities.", descAr: "إثبات قيد للتأشيرات أو البنوك أو الجهات الأخرى.",
    isDemoFlow: false, fields: ["full_name", "eid_number", "grade"] },
  { id: "svc-transfer", nameEn: "School transfer", nameAr: "النقل بين المدارس", ownerSystem: "Al Manhal",
    descEn: "Move to another public school.", descAr: "الانتقال إلى مدرسة حكومية أخرى.",
    isDemoFlow: false, fields: ["full_name", "eid_number", "address_area", "grade"] },
  { id: "svc-results", nameEn: "View report card", nameAr: "عرض الشهادة المدرسية", ownerSystem: "Student Portal",
    descEn: "Term results and teacher comments.", descAr: "نتائج الفصل وملاحظات المعلمين.", isDemoFlow: false, fields: ["full_name"] },
  { id: "svc-absence", nameEn: "Report an absence", nameAr: "الإبلاغ عن غياب", ownerSystem: "School",
    descEn: "Tell the school why your child is away.", descAr: "إبلاغ المدرسة بسبب غياب الطالب.", isDemoFlow: false, fields: ["full_name", "guardian_name"] },
  { id: "svc-ebooks", nameEn: "E-book library access", nameAr: "الدخول إلى مكتبة الكتب الإلكترونية", ownerSystem: "Minhaji",
    descEn: "Open your textbooks.", descAr: "افتح كتبك المدرسية.", isDemoFlow: false, fields: ["full_name", "grade"] },
];

export const FIELD_LABELS: Record<string, { en: string; ar: string }> = {
  full_name: { en: "Full name", ar: "الاسم الكامل" },
  eid_number: { en: "ID number", ar: "رقم الهوية" },
  eid_expiry: { en: "ID expiry", ar: "تاريخ انتهاء الهوية" },
  nationality: { en: "Nationality", ar: "الجنسية" },
  date_of_birth: { en: "Date of birth", ar: "تاريخ الميلاد" },
  address_area: { en: "Home area", ar: "منطقة السكن" },
  guardian_name: { en: "Guardian name", ar: "اسم ولي الأمر" },
  guardian_mobile: { en: "Guardian mobile", ar: "هاتف ولي الأمر" },
  grade: { en: "Grade", ar: "الصف" },
};

/** F9 — the single family profile that every connected service reads */
export const PROFILE_FACTS: ProfileFact[] = [
  { childId: "stu-sara", field: "full_name", value: "Sara Khalid (sample)", sourceDoc: "UAE PASS (simulated)", verifiedBy: "uae_pass_sim", verifiedAt: at(-120) },
  { childId: "stu-sara", field: "eid_number", value: "784-0000-0000000-1 (sample)", sourceDoc: "ID card (sample)", verifiedBy: "par-khalid", verifiedAt: at(-700) },
  { childId: "stu-sara", field: "eid_expiry", value: at(12).slice(0, 10), sourceDoc: "ID card (sample)", verifiedBy: "par-khalid", verifiedAt: at(-700) },
  { childId: "stu-sara", field: "nationality", value: "United Arab Emirates", sourceDoc: "UAE PASS (simulated)", verifiedBy: "uae_pass_sim", verifiedAt: at(-120) },
  { childId: "stu-sara", field: "date_of_birth", value: `${new Date().getFullYear() - 14}-03-14`, sourceDoc: "UAE PASS (simulated)", verifiedBy: "uae_pass_sim", verifiedAt: at(-120) },
  { childId: "stu-sara", field: "address_area", value: "Al Barsha, Dubai", sourceDoc: "Guardian entry", verifiedBy: "par-khalid", verifiedAt: at(-300) },
  { childId: "stu-sara", field: "guardian_name", value: "Khalid (sample)", sourceDoc: "UAE PASS (simulated)", verifiedBy: "uae_pass_sim", verifiedAt: at(-120) },
  { childId: "stu-sara", field: "guardian_mobile", value: "05X XXX XXXX (sample)", sourceDoc: "UAE PASS (simulated)", verifiedBy: "uae_pass_sim", verifiedAt: at(-120) },
  { childId: "stu-sara", field: "grade", value: "8", sourceDoc: "School record", verifiedBy: "sch-1", verifiedAt: at(-60) },
];

// Sample schools. Replace with the KHDA "Dubai private schools" dataset (Dubai Pulse)
// using `npm run import:schools -- path/to/khda.csv`. Names below are fictional.
const SAMPLE_SCHOOLS: School[] = [
  { id: "sch-1", name: "Al Noor Public School (sample)", nameAr: "مدرسة النور الحكومية (عينة)", area: "Al Barsha", lat: 25.1046, lng: 55.1983, curriculum: "MOE", source: "Sample — to be replaced by MOE school list" },
  { id: "sch-2", name: "Creek Science Academy (sample)", nameAr: "أكاديمية الخور للعلوم (عينة)", area: "Al Garhoud", lat: 25.2410, lng: 55.3500, curriculum: "UK", source: "Sample — KHDA via Dubai Pulse format" },
  { id: "sch-3", name: "Marina Innovation School (sample)", nameAr: "مدرسة المرسى للابتكار (عينة)", area: "Dubai Marina", lat: 25.0800, lng: 55.1400, curriculum: "IB", source: "Sample — KHDA via Dubai Pulse format" },
  { id: "sch-4", name: "Mirdif Future School (sample)", nameAr: "مدرسة مردف للمستقبل (عينة)", area: "Mirdif", lat: 25.2200, lng: 55.4200, curriculum: "US", source: "Sample — KHDA via Dubai Pulse format" },
  { id: "sch-5", name: "Al Quoz Arts & Tech School (sample)", nameAr: "مدرسة القوز للفنون والتقنية (عينة)", area: "Al Quoz", lat: 25.1400, lng: 55.2350, curriculum: "Indian", source: "Sample — KHDA via Dubai Pulse format" },
];

/** Sample rows + any rows imported from the real KHDA CSV. */
export const SCHOOLS: School[] = [...SAMPLE_SCHOOLS, ...(importedSchools as School[])];

// Sample opportunities. Organisers and venues are fictional; replace with real listings from schools/KHDA.
export const OPPORTUNITIES: Opportunity[] = [
  { id: "op-1", photo: "/photos/robot.jpg", source: "UAE Hackathon (TDRA)", schoolId: "sch-5", type: "competition", startsAt: at(9), deadline: at(4, 23), interests: ["robotics", "coding"], minAge: 12, maxAge: 17, needsConsent: true,
    organiser: "Al Quoz Arts & Tech School (sample)", emirate: "Dubai", durationEn: "1 day · 9:00–15:00", fee: "Free", teamSize: "Teams of 3",
    image: "/figma/interests/coding.png", tint: "#A9C3FF",
    titleEn: "Junior Robotics Challenge", titleAr: "تحدي الروبوتات للناشئين",
    descEn: "Teams of 3 build a line-following robot. Hosted at a nearby school.", descAr: "فرق من ثلاثة طلاب تبني روبوتاً يتبع الخط. في مدرسة قريبة منك.",
    detailsEn: "Design, build and program a line-following robot in teams of three. Kits are provided on the day; bring a laptop if you have one. Judges score speed, reliability and your design notebook." },
  { id: "op-2", photo: "/photos/hackathon-talk.jpg", source: "CloudHub · 1i1.ae", schoolId: "sch-3", type: "hackathon", startsAt: at(16), deadline: at(10, 23), interests: ["coding", "business"], minAge: 15, maxAge: 18, needsConsent: true,
    organiser: "Marina Innovation School (sample)", emirate: "Dubai", durationEn: "48 hours", fee: "Free", teamSize: "2–5",
    image: "/figma/interests/coding.png", tint: "#A9C3FF",
    titleEn: "Smart City Youth Hackathon", titleAr: "هاكاثون الشباب للمدينة الذكية",
    descEn: "48-hour hackathon for students aged 15+.", descAr: "هاكاثون لمدة 48 ساعة للطلاب من عمر 15 فما فوق.",
    detailsEn: "Prototype a digital service that makes a Dubai neighbourhood smarter, greener or safer. Mentors from local start-ups join on day two." },
  { id: "op-3", photo: "/photos/lab.jpg", source: "School listing", schoolId: "sch-2", type: "workshop", startsAt: at(5), interests: ["science"], minAge: 11, needsConsent: false,
    organiser: "Creek Science Academy (sample)", emirate: "Dubai", durationEn: "2 hours", fee: "Free", teamSize: "Individual",
    tint: "#B9D7F5",
    titleEn: "Saturday Lab: Chemistry of Colour", titleAr: "مختبر السبت: كيمياء الألوان",
    descEn: "Hands-on lab, 2 hours.", descAr: "مختبر تطبيقي لمدة ساعتين.", detailsEn: "Extract natural pigments and test how pH changes their colour. Lab coats and goggles provided." },
  { id: "op-4", photo: "/photos/conference.jpg", source: "MyMUN", schoolId: "sch-4", type: "mun", startsAt: at(21), deadline: at(12, 23), interests: ["debate"], minAge: 13, maxAge: 17, needsConsent: true,
    organiser: "Mirdif Future School (sample)", emirate: "Dubai", durationEn: "2 days", fee: "AED 50 (sample)", teamSize: "Delegations of 2",
    tint: "#E8CFA8",
    titleEn: "Dubai Schools MUN", titleAr: "نموذج الأمم المتحدة لمدارس دبي",
    descEn: "Two-day conference, delegates aged 13–17.", descAr: "مؤتمر لمدة يومين للمندوبين من 13 إلى 17 سنة.", detailsEn: "Represent a country in one of four committees. A training session for first-time delegates runs the week before." },
  { id: "op-5", photo: "/photos/garden.jpg", source: "Your school", schoolId: "sch-1", type: "club", startsAt: at(3), interests: ["environment", "science"], minAge: 11, needsConsent: false,
    organiser: "Al Noor Public School (sample)", emirate: "Dubai", durationEn: "Weekly · Wednesdays", fee: "Free", teamSize: "Open",
    tint: "#BFE3B5",
    titleEn: "Green Club — school garden", titleAr: "النادي الأخضر — حديقة المدرسة", descEn: "Your own school club. Teacher-moderated.", descAr: "نادي مدرستك. بإشراف المعلمين.", detailsEn: "Plan and grow the school's native-plant garden and run the recycling drive." },
  { id: "op-6", photo: "/photos/digital-art.jpg", source: "Eventbrite UAE", schoolId: "sch-5", type: "workshop", startsAt: at(12), interests: ["arts", "photography"], minAge: 12, needsConsent: false,
    organiser: "Al Quoz Arts & Tech School (sample)", emirate: "Dubai", durationEn: "3 hours", fee: "Free", teamSize: "Individual",
    image: "/figma/interests/photography.png", tint: "#FFC9A3",
    titleEn: "Digital Illustration & Photo Workshop", titleAr: "ورشة الرسم الرقمي والتصوير", descEn: "Bring a tablet or phone camera.", descAr: "أحضر جهازاً لوحياً أو كاميرا الهاتف.", detailsEn: "Learn composition with your phone camera, then turn your best shot into a digital illustration." },
  { id: "op-7", photo: "/photos/vegetables.jpg", source: "Eventbrite UAE", schoolId: "sch-2", type: "volunteering", startsAt: at(7), interests: ["environment", "travel"], minAge: 12, needsConsent: true,
    organiser: "Creek Science Academy (sample)", emirate: "Dubai", durationEn: "Half day", fee: "Free", teamSize: "Individual",
    tint: "#BFE3B5",
    titleEn: "Beach Clean-up Volunteer Morning", titleAr: "صباح تطوعي لتنظيف الشاطئ", descEn: "Volunteer hours certificate included.", descAr: "تشمل شهادة ساعات تطوع.", detailsEn: "Join a supervised clean-up and log what you collect for a citizen-science dataset. Hats, gloves and water provided." },
  { id: "op-8", photo: "/photos/auditorium.jpg", source: "Your school", schoolId: "sch-1", type: "leadership", startsAt: at(14), deadline: at(8, 23), interests: ["business", "debate"], minAge: 13, needsConsent: false,
    organiser: "Al Noor Public School (sample)", emirate: "Dubai", durationEn: "4 weeks · after school", fee: "Free", teamSize: "Cohort of 20",
    image: "/figma/interests/business.png", tint: "#D9B595",
    titleEn: "Student Council Leadership Programme", titleAr: "برنامج قيادة مجلس الطلبة", descEn: "Four after-school sessions on leading projects.", descAr: "أربع جلسات بعد المدرسة حول قيادة المشاريع.", detailsEn: "Learn to run meetings, plan a school event and pitch an idea to the principal. Ends with a project showcase." },
  { id: "op-9", photo: "/photos/markets.jpg", source: "dev.events", schoolId: "sch-3", type: "competition", startsAt: at(25), deadline: at(15, 23), interests: ["investing", "business", "math"], minAge: 14, needsConsent: true,
    organiser: "Marina Innovation School (sample)", emirate: "Dubai", durationEn: "6-week online round + final", fee: "Free", teamSize: "Teams of 2–3",
    image: "/figma/interests/investing.png", tint: "#9EDDBB",
    titleEn: "Young Investors Challenge", titleAr: "تحدي المستثمرين الصغار", descEn: "Manage a virtual portfolio and pitch your strategy.", descAr: "أدر محفظة افتراضية وقدّم استراتيجيتك.", detailsEn: "Each team gets a virtual AED 100,000 portfolio. No real money is involved. Finalists present to a judging panel." },
  { id: "op-10", photo: "/photos/camera-film.jpg", source: "Eventbrite UAE", schoolId: "sch-4", type: "event", startsAt: at(6, 17), interests: ["photography", "travel", "arts"], minAge: 11, needsConsent: true,
    organiser: "Mirdif Future School (sample)", emirate: "Dubai", durationEn: "Evening", fee: "Free", teamSize: "Individual",
    image: "/figma/interests/photography.png", tint: "#FFC9A3",
    titleEn: "Golden-Hour Photo Walk", titleAr: "جولة تصوير وقت الغروب", descEn: "Guided walk with a photography teacher.", descAr: "جولة بإرشاد معلم تصوير.", detailsEn: "A teacher-led walk around the creek at sunset. Phones are fine. Best photos go into the school exhibition." },
  { id: "op-11", photo: "/photos/circuit.jpg", source: "Your school", schoolId: "sch-1", type: "club", startsAt: at(2, 14), interests: ["coding", "robotics", "gaming"], minAge: 11, needsConsent: false,
    organiser: "Al Noor Public School (sample)", emirate: "Dubai", durationEn: "Weekly · Tuesdays", fee: "Free", teamSize: "Open",
    image: "/figma/interests/coding.png", tint: "#A9C3FF",
    titleEn: "Code & Robots After-school Club", titleAr: "نادي البرمجة والروبوتات بعد المدرسة", descEn: "Your school's coding club.", descAr: "نادي البرمجة في مدرستك.", detailsEn: "Build games and simple robots. Beginners welcome; the club runs in the computer lab." },
  { id: "op-12", photo: "/photos/writing.jpg", source: "School listing", schoolId: "sch-2", type: "competition", startsAt: at(30), deadline: at(18, 23), interests: ["math", "science"], minAge: 11, needsConsent: true,
    organiser: "Creek Science Academy (sample)", emirate: "Dubai", durationEn: "1 day", fee: "Free", teamSize: "Individual",
    tint: "#C9C3F5",
    titleEn: "Inter-school Maths Olympiad", titleAr: "أولمبياد الرياضيات بين المدارس", descEn: "Individual problem-solving contest.", descAr: "مسابقة فردية لحل المسائل.", detailsEn: "Two papers of challenging problems. Past papers are shared in the Maths community." },
];

export const COMMUNITIES: Community[] = [
  // Communities connect students ACROSS schools. School clubs live under Opportunities.
  { id: "c1", name: "UAE Young Roboticists", nameAr: "روبوتيون شباب الإمارات", scope: "cross_school", minAge: 11, moderated: true, members: 612, online: 18, schools: 41, interests: ["robotics", "coding"], emirate: "All emirates", category: "stem",
    photo: "/photos/robot.jpg", image: "/figma/interests/coding.png", tint: "#A9C3FF", moderators: ["Sawa moderation team", "Mr Hassan (Al Noor)"], aboutEn: "Builders from 41 schools share designs, find competition teammates and get help from mentors. Teacher-moderated." },
  { id: "c2", name: "Green Schools Network", nameAr: "شبكة المدارس الخضراء", scope: "cross_school", minAge: 11, moderated: true, members: 388, online: 9, schools: 27, interests: ["environment"], emirate: "Dubai & Sharjah", category: "clubs",
    photo: "/photos/garden.jpg", tint: "#BFE3B5", moderators: ["Ms Aisha (Al Noor)"], aboutEn: "Garden, recycling and clean-up projects. Schools compare results and run joint beach clean-ups." },
  { id: "c6", name: "Dubai Student Photographers", nameAr: "مصورو الطلبة في دبي", scope: "cross_school", minAge: 11, moderated: true, members: 254, online: 6, schools: 19, interests: ["photography", "arts"], emirate: "Dubai", category: "creative",
    photo: "/photos/camera.jpg", image: "/figma/interests/photography.png", tint: "#FFC9A3", moderators: ["Ms Layla (Al Quoz Arts & Tech)"], aboutEn: "Weekly challenges, critique threads and a joint end-of-term exhibition. Photos of people need consent." },
  { id: "c3", name: "UAE Student Coders", nameAr: "مبرمجو الطلبة في الإمارات", scope: "cross_school", minAge: 11, moderated: true, members: 1412, online: 37, schools: 63, interests: ["coding"], emirate: "All emirates", category: "stem",
    photo: "/photos/code.jpg", image: "/figma/interests/coding.png", tint: "#A9C3FF", moderators: ["Sawa moderation team"], aboutEn: "Share projects, ask for code reviews and find hackathon teammates. Posts are reviewed before they appear." },
  { id: "c4", name: "UAE Youth MUN Circle", nameAr: "دائرة نموذج الأمم المتحدة للشباب", scope: "cross_school", minAge: 13, moderated: true, members: 743, online: 14, schools: 38, interests: ["debate"], emirate: "Dubai & Abu Dhabi", category: "leadership",
    photo: "/photos/conference.jpg", tint: "#E8CFA8", moderators: ["Sawa moderation team"], aboutEn: "Conference calendar from MyMUN, position-paper tips and delegate training across schools." },
  { id: "c5", name: "Young Designers UAE", nameAr: "المصممون الصغار", scope: "cross_school", minAge: 11, moderated: true, members: 243, online: 4, schools: 22, interests: ["arts", "photography"], emirate: "Abu Dhabi", category: "creative",
    photo: "/photos/digital-art.jpg", image: "/figma/interests/photography.png", tint: "#F3C1D9", moderators: ["Sawa moderation team"], aboutEn: "Portfolio reviews and design challenges." },
  { id: "c7", name: "Young Investors Circle", nameAr: "دائرة المستثمرين الصغار", scope: "cross_school", minAge: 13, moderated: true, members: 428, online: 7, schools: 24, interests: ["investing", "business"], emirate: "Dubai", category: "leadership",
    photo: "/photos/markets.jpg", image: "/figma/interests/investing.png", tint: "#9EDDBB", moderators: ["Sawa moderation team"], aboutEn: "Financial literacy, virtual portfolios and business case studies. No real trading." },
  { id: "c8", name: "Inter-school Football League", nameAr: "دوري كرة القدم بين المدارس", scope: "cross_school", minAge: 11, moderated: true, members: 1322, online: 40, schools: 52, interests: ["sports"], emirate: "Sharjah", category: "sports",
    photo: "/photos/football.jpg", tint: "#B8E3C8", moderators: ["Sawa moderation team"], aboutEn: "Fixtures, results and training tips for the inter-school league." },
];

const H = 3_600_000;
export const COMMUNITY_POSTS: CommunityPost[] = [
  { id: "p1", communityId: "c1", author: "Mr Hassan · Al Noor", role: "teacher", kind: "announcement", body: "Open build night on Thursday 4pm at Marina Innovation School — any member school can send a team of up to 4.", createdAt: new Date(Date.now() - 5 * H).toISOString(), status: "approved", helpful: 12 },
  { id: "p2", communityId: "c1", author: "Club captain", role: "moderator", kind: "discussion", body: "Looking for a 3rd teammate from another school for the Junior Robotics Challenge — we need someone who likes sensors.", createdAt: new Date(Date.now() - 26 * H).toISOString(), status: "approved", helpful: 8 },
  { id: "p3", communityId: "c2", author: "Ms Aisha · Al Noor", role: "teacher", kind: "announcement", body: "Joint beach clean-up with 6 schools on Saturday morning at Kite Beach. Sign up under Activities.", createdAt: new Date(Date.now() - 8 * H).toISOString(), status: "approved", helpful: 5 },
  { id: "p4", communityId: "c6", author: "Ms Layla · Al Quoz", role: "teacher", kind: "announcement", body: "This week's challenge: reflections. Submit one photo by Friday for the exhibition shortlist.", createdAt: new Date(Date.now() - 3 * H).toISOString(), status: "approved", helpful: 9 },
  { id: "p5", communityId: "c3", author: "Student (G11)", role: "member", kind: "discussion", body: "Built a bus-arrival notifier with open data — happy to share the code if anyone's learning APIs.", createdAt: new Date(Date.now() - 30 * H).toISOString(), status: "approved", helpful: 31 },
  { id: "p6", communityId: "c4", author: "Moderator", role: "moderator", kind: "announcement", body: "Position paper workshop online on Tuesday, 6pm. Link shared with registered members.", createdAt: new Date(Date.now() - 12 * H).toISOString(), status: "approved", helpful: 14 },
  { id: "p7", communityId: "c7", author: "Moderator", role: "moderator", kind: "discussion", body: "Case study of the week: how does a lemonade stand price for profit? Share your reasoning.", createdAt: new Date(Date.now() - 20 * H).toISOString(), status: "approved", helpful: 6 },
];

export const COMMUNITY_ACTIVITIES: CommunityActivity[] = [
  { id: "a1", communityId: "c1", titleEn: "Open build night (all schools)", startsAt: at(3, 16), place: "Marina Innovation School" },
  { id: "a2", communityId: "c2", titleEn: "Joint beach clean-up", startsAt: at(5, 8), place: "Kite Beach, Dubai" },
  { id: "a3", communityId: "c6", titleEn: "Reflections photo challenge closes", startsAt: at(4, 15), place: "Online" },
  { id: "a4", communityId: "c3", titleEn: "Code review night", startsAt: at(6, 18), place: "Online (moderated)" },
  { id: "a5", communityId: "c4", titleEn: "Position paper workshop", startsAt: at(1, 18), place: "Online" },
  { id: "a6", communityId: "c7", titleEn: "Portfolio pitch practice", startsAt: at(8, 17), place: "Marina Innovation School" },
  { id: "a7", communityId: "c8", titleEn: "League fixtures: week 6", startsAt: at(4, 16), place: "Sharjah" },
];

// Mock Google Classroom data — shown only after the student connects the (simulated) integration.
export const CLASSROOM_COURSES: ClassroomCourse[] = [
  { id: "gc-sci", name: "Grade 8 Science", teacher: "Mr Hassan", room: "Lab 2", color: "#4073FF" },
  { id: "gc-eng", name: "Grade 8 English", teacher: "Ms Rania", room: "B12", color: "#F280D9" },
  { id: "gc-math", name: "Grade 8 Maths", teacher: "Mr Omar", room: "B07", color: "#2E9E6B" },
  { id: "gc-cs", name: "Computing", teacher: "Ms Layla", room: "IT Lab", color: "#D9822B" },
];
export const CLASSROOM_WORK: ClassroomWork[] = [
  { id: "gw-1", courseId: "gc-sci", title: "Lab report: density of liquids", dueAt: at(1, 20), status: "assigned", points: 20 },
  { id: "gw-2", courseId: "gc-eng", title: "Persuasive essay draft", dueAt: at(3, 20), status: "assigned", points: 30 },
  { id: "gw-3", courseId: "gc-math", title: "Linear equations practice set", dueAt: at(2, 20), status: "submitted", points: 10 },
  { id: "gw-4", courseId: "gc-cs", title: "Scratch game: level design", dueAt: at(6, 20), status: "assigned", points: 25 },
  { id: "gw-5", courseId: "gc-sci", title: "Quiz: states of matter", dueAt: at(-2, 20), status: "returned", points: 10, grade: "9/10" },
  { id: "gw-6", courseId: "gc-eng", title: "Reading log week 9", dueAt: at(-1, 20), status: "missing", points: 5 },
];

export const ANNOUNCEMENTS: Announcement[] = [];
export const REQUESTS: ServiceRequest[] = [];
export const APPROVALS: Approval[] = [];

/** Where real listings would come from. The prototype attributes, it does not fetch. */
export const LISTING_SOURCES = [
  { name: "MyMUN", what: "Model UN conferences in the UAE", url: "https://mymun.com/conferences/united-arab-emirates" },
  { name: "CloudHub · 1i1.ae", what: "UAE hackathons directory", url: "https://1i1.ae/explore/hackathons" },
  { name: "Eventbrite UAE", what: "Student workshops and hackathons", url: "https://www.eventbrite.com/d/united-arab-emirates--dby/hackathon/" },
  { name: "dev.events", what: "Dubai tech hackathons", url: "https://dev.events/hackathons/AS/AE/Dubai/tech" },
  { name: "UAE Hackathon (TDRA)", what: "National hackathon, themes and open data", url: "https://hackathon.ae" },
  { name: "Bayanat", what: "Federal open data", url: "https://u.ae/en/about-the-uae/digital-uae/data/open-government-data" },
  { name: "Dubai Pulse", what: "Dubai city data", url: "https://www.dubaipulse.gov.ae" },
] as const;

export const SEED_APPROVALS: Approval[] = [
  { id: "ap-trip", kind: "trip", childId: "stu-sara", guardianId: "par-khalid", status: "pending", createdAt: at(-1), dueAt: at(3, 12),
    titleEn: "Field trip: Museum of the Future", titleAr: "رحلة: متحف المستقبل", detailEn: "Grade 8 science trip · leaves 8:00, back 13:30 · bus provided · no fee", detailAr: "رحلة علوم للصف الثامن · المغادرة 8:00 والعودة 13:30 · حافلة متاحة · بدون رسوم", fromEn: "Ms Aisha · Al Noor" },
  { id: "ap-comp", kind: "opportunity", opportunityId: "op-12", childId: "stu-sara", guardianId: "par-khalid", status: "pending", createdAt: at(-2), dueAt: at(5, 23),
    titleEn: "Inter-school Maths Olympiad", titleAr: "أولمبياد الرياضيات بين المدارس", detailEn: "Outside school · individual problem-solving round · Sara asked to join", detailAr: "خارج المدرسة · جولة فردية لحل المسائل", fromEn: "Sara, via Sawa" },
  { id: "ap-fees", kind: "fees", childId: "stu-sara", guardianId: "par-khalid", status: "pending", createdAt: at(-3), dueAt: at(12, 12),
    titleEn: "Term 3 activity fee plan", titleAr: "خطة رسوم أنشطة الفصل الثالث", detailEn: "AED 450 in 3 instalments of AED 150 · first due in 12 days", detailAr: "450 درهم على 3 دفعات · الأولى خلال 12 يوماً", fromEn: "School finance office" },
  { id: "ap-swim", kind: "trip", childId: "stu-sara", guardianId: "par-khalid", status: "pending", createdAt: at(-1), dueAt: at(6, 12),
    titleEn: "Swimming lessons at Hamdan Sports Complex", titleAr: "دروس السباحة في مجمع حمدان الرياضي", detailEn: "6 Thursdays from next week · school bus both ways · lifeguard on duty", detailAr: "6 أيام خميس من الأسبوع القادم · حافلة المدرسة ذهاباً وإياباً", fromEn: "PE department · Al Noor" },
  { id: "ap-pickup", kind: "media", childId: "stu-sara", guardianId: "par-khalid", status: "pending", createdAt: at(0), dueAt: at(2, 12),
    titleEn: "Late pick-up after science fair practice", titleAr: "استلام متأخر بعد تدريب معرض العلوم", detailEn: "Sara stays until 15:30 on Monday · pick-up at Gate B", detailAr: "تبقى سارة حتى 15:30 يوم الاثنين · الاستلام من البوابة ب", fromEn: "Ms Aisha · Al Noor" },
  { id: "ap-media", kind: "media", childId: "stu-sara", guardianId: "par-khalid", status: "approved", createdAt: at(-20), decidedAt: at(-19),
    titleEn: "Photo consent: sports day", titleAr: "موافقة التصوير: اليوم الرياضي", detailEn: "Group photos on the school website only", fromEn: "School media team" },
];

export const TEACHER_EVENTS: TeacherEvent[] = [
  { id: "ev-1", title: "Science fair practice round", startsAt: at(6, 13), place: "Lab 2", classes: ["8A", "8B"], hostId: "tch-aisha" },
  { id: "ev-2", title: "Robotics showcase for parents", startsAt: at(15, 16), place: "Main hall", classes: ["8A"], hostId: "tch-aisha",
    sponsorship: { amountAed: 1200, reason: "Kits and printing for 6 teams", status: "reviewing", history: [{ status: "requested", at: at(-3) }, { status: "reviewing", at: at(-1) }] } },
];

export const COMMUNITY_CHAT: ChatMsg[] = [
  { id: "m1", communityId: "c1", authorId: "x1", author: "Yousef", school: "Marina Innovation School", body: "Anyone tried the new ultrasonic sensors? Ours keep reading 0 on carpet.", at: at(0, -3), status: "visible" },
  { id: "m2", communityId: "c1", authorId: "x2", author: "Mentor · Mr Hassan", school: "Al Noor", body: "Carpet absorbs the pulse. Tilt the sensor 10° down and average 5 readings.", at: at(0, -2), status: "visible" },
  { id: "m3", communityId: "c1", authorId: "x3", author: "Noor", school: "Creek Science Academy", body: "That fixed it for us too. We're 2 people looking for a 3rd for the Challenge.", at: at(0, -1), status: "visible" },
  { id: "m4", communityId: "c3", authorId: "x4", author: "Hamdan", school: "Mirdif Future School", body: "Code review night is Thursday — post your repo link in Activities.", at: at(0, -5), status: "visible" },
  { id: "m5", communityId: "c2", authorId: "x5", author: "Ms Aisha", school: "Al Noor", body: "6 schools confirmed for the clean-up. Bring water and a hat!", at: at(0, -4), status: "visible" },
];

/** Term 3 activity fee plan (sample). Pay fee pays the next unpaid instalment. */
export const FEE_PLAN = [
  { n: 1, amountAed: 150, dueAt: at(12, 12) },
  { n: 2, amountAed: 150, dueAt: at(42, 12) },
  { n: 3, amountAed: 150, dueAt: at(72, 12) },
];

/** Sara's current marks (sample, from the Smart Learning Portal). */
export const GRADES = [
  { subject: "Science", subjectAr: "العلوم", mark: 91, prev: 86, teacher: "Ms Aisha", last: "Forces quiz · 18/20" },
  { subject: "Maths", subjectAr: "الرياضيات", mark: 84, prev: 88, teacher: "Mr Omar", last: "Algebra test · 42/50" },
  { subject: "English", subjectAr: "اللغة الإنجليزية", mark: 88, prev: 85, teacher: "Ms Rania", last: "Persuasive essay · B+" },
  { subject: "Arabic", subjectAr: "اللغة العربية", mark: 93, prev: 92, teacher: "Ms Huda", last: "Reading comprehension · A" },
  { subject: "Computing", subjectAr: "الحوسبة", mark: 96, prev: 90, teacher: "Ms Layla", last: "Scratch game · 24/25" },
];

/** School and inter-school events a parent can sign their child up for (sample). */
export const SCHOOL_EVENTS = [
  { id: "se-1", title: "Science fair", titleAr: "معرض العلوم", at: at(9, 9), place: "Main hall, Al Noor", photo: "/photos/lab.jpg", consent: false, seats: 40, by: "Al Noor Public School" },
  { id: "se-2", title: "Museum of the Future trip", titleAr: "رحلة متحف المستقبل", at: at(3, 8), place: "Museum of the Future", photo: "/photos/auditorium.jpg", consent: true, seats: 25, by: "Grade 8 · Ms Aisha" },
  { id: "se-3", title: "Inter-school robotics open build", titleAr: "بناء روبوتات مفتوح بين المدارس", at: at(3, 16), place: "Marina Innovation School", photo: "/photos/robot.jpg", consent: true, seats: 30, by: "UAE Young Roboticists" },
  { id: "se-4", title: "Beach clean-up with 6 schools", titleAr: "تنظيف الشاطئ مع 6 مدارس", at: at(5, 8), place: "Kite Beach, Dubai", photo: "/photos/garden.jpg", consent: true, seats: 80, by: "Green Schools Network" },
  { id: "se-5", title: "Parent–teacher evening", titleAr: "أمسية أولياء الأمور والمعلمين", at: at(4, 17), place: "Al Noor", photo: "/photos/classroom.jpg", consent: false, seats: 200, by: "Al Noor Public School" },
];
