// What Sawa looked at to answer a question, shown above each Ask answer. Derived from
// the role, the question and the sources the answer cites — no hidden work is implied.
import type { Role } from "./types";

export type AgentStep = { name: string; message: string; system: string; color: string; output?: string };

const has = (q: string, words: string[]) => words.some((w) => q.includes(w));

export function agentSteps(question: string, role: Role | undefined, sources: { title: string; name: string }[] = [], openItems = 0, ar = false): AgentStep[] {
  const q = question.toLowerCase();
  const steps: AgentStep[] = [];
  const T = (en: string, a: string) => (ar ? a : en);
  if (role === "parent") {
    steps.push({ name: "profile", message: T("Read Sara's family profile", "قرأ ملف عائلة سارة"), system: "Family profile", color: "#121217", output: T("Grade 8 · ID expires in 12 days", "الصف الثامن · الهوية تنتهي خلال 12 يوماً") });
    if (has(q, ["fee", "pay", "instal", "رسوم", "دفع", "قسط"])) steps.push({ name: "fees", message: T("Checked the term 3 fee plan", "راجع خطة رسوم الفصل الثالث"), system: "School fees portal", color: "#9C2E85", output: T("2 instalments left", "قسطان متبقيان") });
    if (has(q, ["transfer", "switch", "school", "open day", "نقل", "مدرسة", "مفتوح"])) steps.push({ name: "khda", message: T("Searched nearby schools with seats", "بحث عن مدارس قريبة فيها مقاعد"), system: "KHDA dataset (sample)", color: "#2C58E6", output: T("3 schools within 8 km", "3 مدارس ضمن 8 كم") });
    if (has(q, ["enrol", "register", "document", "id", "تسجيل", "هوية", "مستند", "جددت"])) steps.push({ name: "docs", message: T("Checked Sara's documents on file", "راجع مستندات سارة في الملف"), system: "Tell us once", color: "#B68A35", output: T("ID expiring soon · passport on file", "الهوية قريبة الانتهاء · الجواز مرفوع") });
    if (has(q, ["week", "due", "test", "أسبوع", "مستحق", "اختبار"])) steps.push({ name: "week", message: T("Read Sara's week", "قرأ أسبوع سارة"), system: "LMS · Minhaji · School", color: "#2E9E6B", output: T(`${openItems} open items`, `${openItems} عناصر مفتوحة`) });
  } else if (role === "teacher") {
    steps.push({ name: "timetable", message: T("Checked your timetable", "راجع جدولك"), system: "School timetable", color: "#121217", output: T("6 periods today", "6 حصص اليوم") });
    if (has(q, ["competition", "hackathon", "grade", "event", "مسابق", "هاكاثون", "فعالي"])) steps.push({ name: "opps", message: T("Filtered opportunities by grade and age", "صفّى الفرص حسب الصف والعمر"), system: "Opportunities (MyMUN, CloudHub, UAE Hackathon)", color: "#5C29BF", output: T("4 open to Grade 9", "4 متاحة للصف التاسع") });
    if (has(q, ["school", "career", "job", "مدرس"])) steps.push({ name: "khda", message: T("Searched the KHDA school list", "بحث في قائمة مدارس هيئة المعرفة"), system: "KHDA dataset (sample)", color: "#2C58E6" });
    if (has(q, ["parent", "data", "sign in", "student", "أولياء", "بيانات", "طلاب"])) steps.push({ name: "policy", message: T("Read Sawa's data and sign-in rules", "قرأ قواعد البيانات والدخول في سوا"), system: "Sawa policy", color: "#2E9E6B" });
  } else {
    steps.push({ name: "week", message: T("Checked your week", "راجع أسبوعك"), system: "LMS · Google Classroom · School", color: "#121217", output: T(`${openItems} open items`, `${openItems} عناصر مفتوحة`) });
    if (has(q, ["competition", "join", "hackathon", "robot", "club", "مسابق", "انضم", "هاكاثون", "روبوت"])) steps.push({ name: "match", message: T("Ranked opportunities for your age and interests", "رتّب الفرص حسب عمرك واهتماماتك"), system: "Opportunities", color: "#5C29BF", output: T("Age 14 · guardian approval needed outside school", "العمر 14 · خارج المدرسة يحتاج موافقة ولي الأمر") });
    if (has(q, ["data", "see", "privacy", "بيانات", "يرى", "خصوص"])) steps.push({ name: "policy", message: T("Read Sawa's privacy rules", "قرأ قواعد الخصوصية في سوا"), system: "Sawa policy", color: "#2E9E6B" });
  }
  if (sources.length) steps.push({ name: "kb", message: T(`Searched official guidance · ${sources.length} found`, `بحث في الإرشادات الرسمية · ${sources.length}`), system: sources.map((s) => s.name).join(" · "), color: "#B68A35", output: sources.map((s) => s.title).join(" · ") });
  return steps;
}
