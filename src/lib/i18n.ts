import type { Lang } from "./types";

const dict = {
  tagline: ["One front door to school life in the UAE.", "بوابة واحدة للحياة المدرسية في الإمارات."],
  pitch: ["Sign in once. Never re-type the same details. Every service, lesson and notice in one place.", "سجّل الدخول مرة واحدة. لا تُعِد كتابة البيانات نفسها. كل الخدمات والدروس والإشعارات في مكان واحد."],
  iAm: ["I am a…", "أنا…"],
  student: ["Student", "طالب"],
  parent: ["Parent / guardian", "ولي أمر"],
  teacher: ["Teacher / school staff", "معلم / موظف مدرسة"],
  continueUaePass: ["Sign in with UAE PASS", "الدخول بالهوية الرقمية"],
  simulated: ["Simulated for the prototype", "محاكاة لأغراض النموذج الأولي"],
  sampleData: ["Sample data · prototype · no real student records", "بيانات تجريبية · نموذج أولي · لا توجد سجلات طلاب حقيقية"],
  today: ["Today", "اليوم"],
  services: ["Services", "الخدمات"],
  ask: ["Ask Sawa", "اسأل سوا"],
  explore: ["Explore", "استكشف"],
  profile: ["Profile", "الملف"],
  approvals: ["Approvals", "الموافقات"],
  post: ["Post", "نشر"],
  office: ["Office", "المكتب"],
  needsYou: ["need you this week", "تحتاج انتباهك هذا الأسبوع"],
  whySee: ["Why am I seeing this?", "لماذا أرى هذا؟"],
  all: ["All", "الكل"],
  markDone: ["Mark done", "تم"],
  done: ["Done", "منجز"],
  from: ["from", "من"],
  week: ["This week", "هذا الأسبوع"],
  nothing: ["You're all caught up.", "لا شيء متبقٍ. أحسنت!"],
  verifiedGuardian: ["Verified guardian · UAE PASS (simulated)", "ولي أمر موثّق · الهوية الرقمية (محاكاة)"],
  language: ["العربية", "English"],
  resetDemo: ["Reset demo data", "إعادة ضبط البيانات التجريبية"],
  switchRole: ["Switch role (demo)", "تبديل الدور (عرض)"],
  dataSources: ["Data sources", "مصادر البيانات"],
  tellUsOnce: ["Tell us once", "أخبرنا مرة واحدة"],
  impact: ["Before / after", "قبل / بعد"],
  signOut: ["Sign out", "تسجيل الخروج"],
} as const;

export type Key = keyof typeof dict;
export const t = (lang: Lang, k: Key) => dict[k][lang === "ar" ? 1 : 0];

export function fmtDate(iso: string | undefined, lang: Lang, withTime = false) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(lang === "ar" ? "ar-AE" : "en-GB", {
    weekday: "short", day: "numeric", month: "short",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function relDays(iso: string | undefined, lang: Lang) {
  if (!iso) return "";
  const days = Math.round((new Date(iso).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86_400_000);
  if (lang === "ar") return days === 0 ? "اليوم" : days === 1 ? "غداً" : days < 0 ? `منذ ${-days} يوم` : `بعد ${days} أيام`;
  return days === 0 ? "today" : days === 1 ? "tomorrow" : days < 0 ? `${-days}d ago` : `in ${days} days`;
}
