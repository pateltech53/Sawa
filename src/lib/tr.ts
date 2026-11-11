"use client";

// Arabic for every screen. Two layers share one dictionary:
//  1. useTr(): explicit translation for strings built in code.
//  2. <DomTranslator/> (components/shell/DomTranslator.tsx): while Arabic is on, swaps
//     known English UI strings (and placeholders / aria-labels) in the rendered page.
// Seed data that already carries Arabic (opportunities, communities, notices, services,
// interests, schools) is added to the dictionary automatically.
import { useCallback } from "react";
import { useStore } from "./store";
import * as seed from "./seed";

export const AR: Record<string, string> = {
  // shell & navigation
  "Home": "الرئيسية", "Explore": "استكشف", "Communities": "المجتمعات", "Profile": "الملف الشخصي", "Services": "الخدمات",
  "Family": "العائلة", "Today": "اليوم", "Classes": "الصفوف", "Students": "الطلاب", "Events": "الفعاليات", "Ask Sawa": "اسأل سوا",
  "Main": "التنقل الرئيسي", "Sawa home": "الصفحة الرئيسية لسوا", "Search": "بحث", "Notifications": "التنبيهات", "Language": "اللغة",
  "Quick actions": "إجراءات سريعة", "My account": "حسابي", "Sign out": "تسجيل الخروج", "Back": "رجوع", "Close": "إغلاق", "Next": "التالي",
  "Previous": "السابق", "Continue": "متابعة", "Done": "تم", "Save": "حفظ", "Edit": "تعديل", "Open": "فتح", "View": "عرض", "Send": "إرسال",
  "See all": "عرض الكل", "Find more": "المزيد", "Skip": "تخطٍّ", "Join": "انضمام", "Joined": "منضم", "Going": "سأحضر", "Post": "نشر",
  "Calendar": "التقويم", "Reminder": "تذكير", "Settings": "الإعدادات", "Details": "التفاصيل", "Start": "ابدأ", "Approve": "موافقة", "Decline": "رفض",
  "Add a reminder": "إضافة تذكير", "Start a project": "بدء مشروع", "Connect a school app": "ربط تطبيق مدرسي", "Connect": "ربط", "Disconnect": "فصل",
  "Toggle language": "تبديل اللغة", "Voice input (coming soon)": "الإدخال الصوتي (قريباً)", "Prototype · sample data only": "نموذج أولي · بيانات تجريبية فقط",
  "Simulated": "محاكاة", "Sample": "عينة", "Verified": "موثّق", "New today": "جديد اليوم", "Moderated": "تحت الإشراف", "All moderated": "جميعها تحت الإشراف",
  // student home
  "This week": "هذا الأسبوع", "Needs you this week": "يحتاجك هذا الأسبوع", "Open full calendar": "فتح التقويم الكامل", "Days": "الأيام",
  "You're all caught up.": "لا شيء متبقٍ. أحسنت.", "Marked done": "تم الإنجاز", "Mark done": "تحديد كمنجز", "Mark not done": "إلغاء الإنجاز",
  "More for you": "المزيد لك", "Top match": "أفضل تطابق", "Meet students from other schools": "تعرّف على طلاب من مدارس أخرى",
  "Moderated, cross-school groups": "مجموعات بين المدارس تحت الإشراف", "Bring in your Google Classroom": "أضف Google Classroom",
  "See assignments here and on your calendar": "شاهد الواجبات هنا وفي تقويمك", "Connected": "متصل", "Nothing due": "لا شيء مستحق",
  "Good morning": "صباح الخير", "Good afternoon": "مساء الخير", "Good evening": "مساء الخير",
  // explore & opportunities
  "Opportunities": "الفرص", "Ranked for you by interests, age and distance — reasons on every card.": "مرتبة لك حسب اهتماماتك وعمرك والمسافة، مع السبب على كل بطاقة.",
  "Search opportunities": "ابحث عن الفرص", "Filter by type": "تصفية حسب النوع", "All": "الكل", "Competitions": "مسابقات", "Hackathons": "هاكاثونات",
  "Workshops": "ورش عمل", "Volunteering": "تطوع", "Leadership": "قيادة", "Clubs": "أندية", "MUN": "نموذج الأمم المتحدة", "Saved": "المحفوظة",
  "Discover": "اكتشف", "List": "قائمة", "Map": "خريطة", "Sourced from": "المصادر",
  "Listings are samples modelled on these sources. In the pilot Sawa syncs them, with each school's approval.": "القوائم عينات على غرار هذه المصادر. في التجربة يزامنها سوا بموافقة كل مدرسة.",
  "Discover opportunities. Use left and right arrow keys to skip or save.": "اكتشف الفرص. استخدم السهمين للتخطي أو الحفظ.",
  "You've seen them all": "شاهدتها كلها", "Start again": "ابدأ من جديد", "Open details": "عرض التفاصيل", "SAVE": "حفظ", "SKIP": "تخطٍّ",
  "Saved — it's on your calendar": "تم الحفظ، وهي في تقويمك", "Removed from saved": "أزيلت من المحفوظات", "Save opportunity": "حفظ الفرصة", "Remove from saved": "إزالة من المحفوظات",
  "Eligibility check": "التحقق من الأهلية", "Check now": "تحقّق الآن", "Ask my guardian": "اطلب موافقة ولي أمري", "Waiting for guardian": "بانتظار ولي الأمر",
  "Registered": "مسجّل", "Register": "سجّل", "Why it matches you": "لماذا تناسبك", "Why it matched": "لماذا تطابقت", "Your school": "مدرستك",
  "Outside your school: your guardian approves before you register.": "خارج مدرستك: يوافق ولي أمرك قبل التسجيل.", "Opportunity not found.": "الفرصة غير موجودة.",
  "Remind me the day before": "ذكّرني قبل يوم", "Reminder set for the day before": "تم ضبط التذكير قبل يوم", "Add a reminder before the deadline": "أضف تذكيراً قبل الموعد النهائي",
  "Checks your age, location and team requirements before you apply.": "يتحقق من عمرك وموقعك ومتطلبات الفريق قبل التقديم.",
  "Sample schools in KHDA dataset format. Gold marks your school.": "مدارس تجريبية بصيغة بيانات هيئة المعرفة. الذهبي يحدد مدرستك.",
  // communities
  "Meet students from other schools who like what you like. Every community is moderated.": "تعرّف على طلاب من مدارس أخرى يحبون ما تحب. كل المجتمعات تحت الإشراف.",
  "Search communities": "ابحث في المجتمعات", "Featured for you": "مختار لك", "Your communities": "مجتمعاتك", "Trending across schools": "الأكثر نشاطاً بين المدارس",
  "Results": "النتائج", "Join community": "انضم إلى المجتمع", "Joined · tap to leave": "منضم · اضغط للمغادرة", "Board": "اللوحة", "Chat": "الدردشة",
  "Activities": "الأنشطة", "About": "عن المجتمع", "Moderators": "المشرفون", "Community rules": "قواعد المجتمع", "Held for a moderator": "بانتظار المشرف",
  "Awaiting review": "بانتظار المراجعة", "Helpful": "مفيد", "Nothing here yet.": "لا شيء هنا بعد.", "New post": "منشور جديد", "Chat message": "رسالة دردشة",
  "Reviewed by a moderator before it appears": "يراجعه مشرف قبل ظهوره", "Community not found.": "المجتمع غير موجود.",
  "Be kind and stay on topic.": "كن لطيفاً والتزم بالموضوع.", "Every post is reviewed before it appears.": "كل منشور يُراجع قبل ظهوره.",
  "No direct messages — talk in the community or in person.": "لا رسائل خاصة، تحدّث في المجتمع أو وجهاً لوجه.",
  "No personal contact details or photos of other students.": "لا بيانات تواصل شخصية ولا صور لطلاب آخرين.",
  "Join the community to add activities to your calendar.": "انضم إلى المجتمع لإضافة الأنشطة إلى تقويمك.", "Community highlights": "أبرز ما في المجتمعات",
  "Slide to open today's community highlights": "اسحب لفتح أبرز ما في المجتمعات اليوم", "Join a community to see highlights here.": "انضم إلى مجتمع لترى أبرز ما فيه هنا.",
  "Dubai": "دبي", "STEM": "العلوم والتقنية", "Creative": "إبداع", "Green": "البيئة", "Sports": "رياضة",
  // calendar
  "Month": "شهر", "Week": "أسبوع", "Agenda": "جدول", "Upcoming": "القادم", "Nothing scheduled.": "لا شيء مجدول.", "New reminder": "تذكير جديد",
  "Reminder added to your calendar": "أُضيف التذكير إلى تقويمك", "When": "متى", "Schoolwork": "واجبات مدرسية", "Exams": "اختبارات", "Reminders": "تذكيرات",
  // profile
  "Achievements": "الإنجازات", "Interests": "الاهتمامات", "Projects": "المشاريع", "Edit profile": "تعديل الملف", "Share profile": "مشاركة الملف",
  "Your interests": "اهتماماتك", "These shape your matches. Changes apply immediately.": "تحدد ما يُقترح لك. تُطبّق التغييرات فوراً.", "Progress": "التقدم",
  "Profile updated": "تم تحديث الملف", "Progress saved": "تم حفظ التقدم", "Project added to your profile": "أُضيف المشروع إلى ملفك", "Bio": "نبذة", "Handle": "اسم المستخدم",
  "Connected school apps": "تطبيقات المدرسة المرتبطة", "Data sources & privacy": "مصادر البيانات والخصوصية", "Reset demo": "إعادة ضبط العرض",
  "School apps": "تطبيقات المدرسة", "One place for the systems your school already uses.": "مكان واحد للأنظمة التي تستخدمها مدرستك.", "Joined up in Sawa": "مترابطة في سوا",
  "Your classes": "صفوفك", "View my classes": "عرض صفوفي", "Allow and connect": "اسمح واربط", "Not available": "غير متاح", "On": "مفعّل",
  // welcome / onboarding
  "Get Started": "ابدأ الآن", "Find your school": "اختر مدرستك", "Continue with school login": "المتابعة بحساب المدرسة", "Allow and continue": "اسمح وتابع",
  "Verify your identity": "تحقّق من هويتك", "Start verification": "ابدأ التحقق", "Scanning your ID": "جارٍ مسح الهوية", "Quick face match": "مطابقة سريعة للوجه",
  "You're verified!": "تم التحقق منك", "What brings you here?": "ما الذي يهمك؟", "Please select 3 or more interests": "اختر 3 اهتمامات أو أكثر",
  "What else are you into?": "ماذا تحب أيضاً؟", "Personalising Sawa": "نجهّز سوا لك", "See everything I matched": "عرض كل ما تطابق", "Tap a match to see why it fits you.": "اضغط على أي تطابق لتعرف السبب.",
  "Enter Sawa": "ادخل سوا", "Your Sawa is ready. Here's what we found for you.": "سوا جاهز. هذا ما وجدناه لك.", "Next interest": "الاهتمام التالي", "Previous interest": "الاهتمام السابق",
  "Hold your card steady inside the frame": "ثبّت البطاقة داخل الإطار", "Simulated for the prototype — the camera is not used.": "محاكاة للنموذج الأولي، لا تُستخدم الكاميرا.",
  "One sign-in for everything": "دخول واحد لكل شيء", "Sign in with UAE PASS": "الدخول بالهوية الرقمية", "Identity verified": "تم التحقق من الهوية",
  "Simulated · no real data is shared": "محاكاة · لا تُشارك أي بيانات حقيقية", "Let's go": "لنبدأ", "Welcome to Sawa!": "أهلاً بك في سوا",
  // parent
  "What would you like to do today?": "ماذا تريد أن تنجز اليوم؟", "Age": "العمر", "Grade": "الصف", "Days to fee": "أيام للرسوم", "Pay fee": "دفع الرسوم", "Re-enrol": "إعادة التسجيل",
  "Ask about switching schools": "الاستفسار عن نقل المدرسة", "Done this term": "أنجزته هذا الفصل", "Everything from school": "كل ما وصل من المدرسة",
  "Fees, enrolment, any school service": "الرسوم والتسجيل وأي خدمة مدرسية", "Approvals": "الموافقات", "Grades": "الدرجات", "Pay a fee": "دفع رسوم",
  "Switching schools": "نقل المدرسة", "Ask Sawa about transferring": "اسأل سوا عن النقل", "All services": "كل الخدمات", "Service hub": "مركز الخدمات",
  "My requests": "طلباتي", "History": "السجل", "Nothing waiting for you": "لا شيء بانتظارك", "School trip": "رحلة مدرسية", "Fees": "الرسوم",
  "Photo consent": "موافقة التصوير", "Outside school": "خارج المدرسة", "Parental controls": "ضوابط ولي الأمر", "Connect your tools": "اربط أدواتك",
  // teacher
  "Your events": "فعالياتك", "Needs you": "يحتاجك", "Today's timetable": "جدول اليوم", "Happening now": "يحدث الآن", "Now": "الآن", "Post to a class": "انشر لصف",
  "Host an event": "استضف فعالية", "Upload a file": "ارفع ملفاً", "Find competitions": "ابحث عن مسابقات", "Your classes ": "صفوفك", "Post once": "انشر مرة واحدة",
  "Parent requests": "طلبات أولياء الأمور", "Students & events": "الطلاب والفعاليات", "New event": "فعالية جديدة", "Invite classes": "دعوة صفوف",
  "Ask the school to sponsor": "اطلب رعاية المدرسة", "Sponsorship request": "طلب رعاية", "Create and invite": "إنشاء ودعوة", "Send invite": "أرسل الدعوة",
  "Send request": "أرسل الطلب", "Title": "العنوان", "Date": "التاريخ", "Place": "المكان", "Amount (AED)": "المبلغ (درهم)", "What it pays for": "ما الذي يغطيه",
  "Set up your school": "جهّز مدرستك", "School name": "اسم المدرسة", "Logo": "الشعار", "Upload image": "رفع صورة", "Use initials": "استخدم الأحرف", "School colour": "لون المدرسة",
  "Invite your students": "ادعُ طلابك", "Class code": "رمز الصف", "Copy": "نسخ", "Code copied": "تم النسخ",
};

/** Patterns for strings that carry numbers or names. */
export const AR_PATTERNS: [RegExp, string][] = [
  [/^(\d+) things need you this week$/, "$1 أمور تحتاجك هذا الأسبوع"],
  [/^From (\d+) sources, in one place$/, "من $1 مصادر في مكان واحد"],
  [/^(\d+) more matched in Explore$/, "$1 فرص أخرى في استكشف"],
  [/^(\d+) new in your communities$/, "$1 جديد في مجتمعاتك"],
  [/^(\d+) schools · ([\d,]+) members · (\d+) online now$/, "$1 مدرسة · $2 عضو · $3 متصل الآن"],
  [/^(\d+) schools · ([\d,]+) members$/, "$1 مدرسة · $2 عضو"],
  [/^(\d+) schools · (.+)$/, "$1 مدرسة · $2"],
  [/^Nothing on today\.$/, "لا شيء اليوم."],
  [/^(\d+) schools$/, "$1 مدرسة"],
  [/^(\d+(?:,\d+)?) members$/, "$1 عضو"],
  [/^(\d+) online$/, "$1 متصل"],
  [/^(\d+)% match$/, "تطابق $1٪"],
  [/^Nothing on (.+)\.$/, "لا شيء في $1."],
  [/^Good morning, (.+)$/, "صباح الخير يا $1"],
  [/^Good (afternoon|evening), (.+)$/, "مساء الخير يا $2"],
  [/^Coming up for (.+)$/, "القادم لـ$1"],
  [/^Hello (.+)$/, "مرحباً $1"],
  [/^Joined (.+)$/, "انضممت إلى $1"],
  [/^Welcome to (.+)$/, "أهلاً بك في $1"],
  [/^Age (\d+): outside-school activities go to your guardian first\.$/, "العمر $1: الأنشطة خارج المدرسة تذهب أولاً إلى ولي أمرك."],
  [/^(\d+) of (\d+) · swipe right to save, left to skip$/, "$1 من $2 · اسحب يميناً للحفظ ويساراً للتخطي"],
  [/^Connected (\d+) of (\d+) tools$/, "تم ربط $1 من $2 أدوات"],
  [/^Sawa checked (\d+) sources?$/, "راجع سوا $1 مصادر"],
];

let seedPairs: Record<string, string> | null = null;
function seedDictionary() {
  if (seedPairs) return seedPairs;
  const d: Record<string, string> = {};
  for (const o of seed.OPPORTUNITIES) d[o.titleEn] = o.titleAr;
  for (const c of seed.COMMUNITIES) d[c.name] = c.nameAr;
  for (const n of seed.NOTICES) d[n.titleEn] = n.titleAr;
  for (const s of seed.SERVICES) { d[s.nameEn] = s.nameAr; d[s.descEn] = s.descAr; }
  for (const i of seed.INTERESTS) d[i.en] = i.ar;
  for (const s of seed.SCHOOLS) { d[s.name] = s.nameAr; d[s.name.replace(" (sample)", "")] = s.nameAr; }
  seedPairs = d;
  return d;
}

/** Translate one English UI string to Arabic, or return null if unknown. */
export function toArabic(text: string): string | null {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t || !/[A-Za-z]/.test(t)) return null;
  const hit = AR[t] ?? seedDictionary()[t];
  if (hit) return hit;
  for (const [re, out] of AR_PATTERNS) if (re.test(t)) return t.replace(re, out);
  return null;
}

/** tr("English") → Arabic when the app is in Arabic, else the English. */
export function useTr() {
  const { state } = useStore();
  const ar = state.lang === "ar";
  return useCallback((en: string) => (ar ? toArabic(en) ?? en : en), [ar]);
}

/** Date locale for the current UI language (client components re-render on language change). */
export function uiLocale() {
  return typeof window !== "undefined" && (window as unknown as { __sawaLang?: string }).__sawaLang === "ar" ? "ar-AE" : "en-GB";
}
