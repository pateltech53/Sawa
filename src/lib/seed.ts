// SAMPLE DATA ONLY — every person, document and number below is synthetic.
// No real student names, Emirates ID numbers or phone numbers are used anywhere in Sawa.
import type {
  Announcement, Approval, Community, GuardianLink, Notice, Opportunity, Profile,
  ProfileFact, School, Service, ServiceRequest,
} from "./types";
import importedSchools from "./schools.generated.json";

const DAY = 86_400_000;
export const at = (days: number, hour = 8) => {
  const d = new Date(Date.now() + days * DAY);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const INTERESTS = [
  { id: "robotics", en: "Robotics", ar: "الروبوتات", icon: "🤖" },
  { id: "coding", en: "Coding & AI", ar: "البرمجة والذكاء الاصطناعي", icon: "💻" },
  { id: "science", en: "Science", ar: "العلوم", icon: "🔬" },
  { id: "math", en: "Maths", ar: "الرياضيات", icon: "➗" },
  { id: "debate", en: "Debate & MUN", ar: "المناظرات ونموذج الأمم المتحدة", icon: "🎤" },
  { id: "arts", en: "Arts & Design", ar: "الفنون والتصميم", icon: "🎨" },
  { id: "sports", en: "Sports", ar: "الرياضة", icon: "⚽" },
  { id: "business", en: "Entrepreneurship", ar: "ريادة الأعمال", icon: "🚀" },
  { id: "reading", en: "Reading & Writing", ar: "القراءة والكتابة", icon: "📚" },
  { id: "environment", en: "Sustainability", ar: "الاستدامة", icon: "🌱" },
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

export const OPPORTUNITIES: Opportunity[] = [
  { id: "op-1", schoolId: "sch-5", type: "competition", startsAt: at(9), interests: ["robotics", "coding"], minAge: 12, needsConsent: true,
    titleEn: "Junior Robotics Challenge", titleAr: "تحدي الروبوتات للناشئين",
    descEn: "Teams of 3 build a line-following robot. Hosted at a nearby school.", descAr: "فرق من ثلاثة طلاب تبني روبوتاً يتبع الخط. في مدرسة قريبة منك." },
  { id: "op-2", schoolId: "sch-3", type: "hackathon", startsAt: at(16), interests: ["coding", "business"], minAge: 15, needsConsent: true,
    titleEn: "Smart City Youth Hackathon", titleAr: "هاكاثون الشباب للمدينة الذكية",
    descEn: "48-hour hackathon for students aged 15+.", descAr: "هاكاثون لمدة 48 ساعة للطلاب من عمر 15 فما فوق." },
  { id: "op-3", schoolId: "sch-2", type: "workshop", startsAt: at(5), interests: ["science"], minAge: 11, needsConsent: false,
    titleEn: "Saturday Lab: Chemistry of Colour", titleAr: "مختبر السبت: كيمياء الألوان",
    descEn: "Hands-on lab, 2 hours.", descAr: "مختبر تطبيقي لمدة ساعتين." },
  { id: "op-4", schoolId: "sch-4", type: "mun", startsAt: at(21), interests: ["debate"], minAge: 13, needsConsent: true,
    titleEn: "Dubai Schools MUN", titleAr: "نموذج الأمم المتحدة لمدارس دبي",
    descEn: "Two-day conference, delegates aged 13–17.", descAr: "مؤتمر لمدة يومين للمندوبين من 13 إلى 17 سنة." },
  { id: "op-5", schoolId: "sch-1", type: "club", startsAt: at(3), interests: ["environment", "science"], minAge: 11, needsConsent: false,
    titleEn: "Green Club — school garden", titleAr: "النادي الأخضر — حديقة المدرسة", descEn: "Your own school club. Teacher-moderated.", descAr: "نادي مدرستك. بإشراف المعلمين." },
  { id: "op-6", schoolId: "sch-5", type: "workshop", startsAt: at(12), interests: ["arts"], minAge: 12, needsConsent: false,
    titleEn: "Digital Illustration Workshop", titleAr: "ورشة الرسم الرقمي", descEn: "Bring a tablet if you have one.", descAr: "أحضر جهازاً لوحياً إن وُجد." },
];

export const COMMUNITIES: Community[] = [
  { id: "c1", name: "Al Noor Robotics Club", nameAr: "نادي الروبوتات — النور", scope: "school", minAge: 11, moderated: true, members: 53, interests: ["robotics"], emirate: "Dubai" },
  { id: "c2", name: "Al Noor Green Club", nameAr: "النادي الأخضر — النور", scope: "school", minAge: 11, moderated: true, members: 31, interests: ["environment"], emirate: "Dubai" },
  { id: "c3", name: "UAE Student Coders", nameAr: "مبرمجو الطلبة في الإمارات", scope: "cross_school", minAge: 15, moderated: true, members: 412, interests: ["coding"], emirate: "All emirates" },
  { id: "c4", name: "Model UN Network", nameAr: "شبكة نموذج الأمم المتحدة", scope: "cross_school", minAge: 15, moderated: true, members: 343, interests: ["debate"], emirate: "Dubai" },
  { id: "c5", name: "Young Designers", nameAr: "المصممون الصغار", scope: "cross_school", minAge: 15, moderated: true, members: 43, interests: ["arts"], emirate: "Abu Dhabi" },
];

export const ANNOUNCEMENTS: Announcement[] = [];
export const REQUESTS: ServiceRequest[] = [];
export const APPROVALS: Approval[] = [];
