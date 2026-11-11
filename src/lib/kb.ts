import type { KbDoc } from "./types";

/**
 * Ask Sawa knowledge base (F4).
 *
 * DEMO CONTENT: these entries summarise how Sawa's own demo services work and
 * general guidance. Before the pitch, replace or extend them with text copied from
 * public MOE / u.ae help and FAQ pages, and set `sourceUrl` to the exact page.
 * Ask Sawa only answers from what is in this list and always shows the source.
 */
export const KB: KbDoc[] = [
  {
    id: "kb-transfer",
    serviceId: "svc-transfer",
    titleEn: "Transferring your child to another school",
    titleAr: "نقل الطالب إلى مدرسة أخرى",
    sourceName: "Sawa service guide (demo) — verify against MOE and KHDA",
    sourceUrl: "https://www.moe.gov.ae",
    keywords: ["transfer", "switch", "change school", "move school", "new school", "transferring", "another school", "نقل", "انتقال", "مدرسة أخرى", "تغيير المدرسة"],
    textEn:
      "To move schools: 1) Choose schools with seats in your child's grade and curriculum (Sawa lists nearby schools from the KHDA dataset). 2) Ask the new school about seats and an open day — use 'Ask the school about open days' in Sawa. 3) Once offered a seat, request a transfer certificate from the current school; Sawa pre-fills it from your family profile. 4) The new school needs the student's Emirates ID, passport, the last report card and the transfer certificate — documents you already added in Sawa are reused. Private-school transfers in Dubai follow KHDA rules; check the official page for your case.",
    textAr:
      "للانتقال إلى مدرسة أخرى: 1) اختر مدارس لديها مقاعد في صف الطالب ومنهجه (يعرض سوا المدارس القريبة من بيانات هيئة المعرفة). 2) اسأل المدرسة الجديدة عن المقاعد واليوم المفتوح عبر «اسأل المدرسة عن الأيام المفتوحة» في سوا. 3) بعد الحصول على مقعد، اطلب شهادة نقل من المدرسة الحالية ويعبّئها سوا مسبقاً من ملف العائلة. 4) تحتاج المدرسة الجديدة إلى الهوية والجواز وآخر تقرير وشهادة النقل، ويعيد سوا استخدام المستندات التي أضفتها. تخضع المدارس الخاصة في دبي لقواعد هيئة المعرفة؛ راجع الصفحة الرسمية لحالتك.",
  },
  {
    id: "kb-open-days",
    titleEn: "School open days and visits",
    titleAr: "الأيام المفتوحة وزيارة المدارس",
    sourceName: "Sawa service guide (demo)",
    sourceUrl: "https://www.khda.gov.ae",
    keywords: ["open day", "open days", "visit", "tour", "seats", "admission", "اليوم المفتوح", "الأيام المفتوحة", "زيارة", "مقاعد", "قبول"],
    textEn:
      "Most schools run open days each term for families thinking of joining. In Sawa, open 'Ask about switching schools' on your home screen, pick a school, and send 'Ask the school about open days'. The school's admissions office replies in Sawa with dates; the reply appears under Family › Enquiries and on your calendar.",
    textAr:
      "تنظم معظم المدارس أياماً مفتوحة كل فصل للأسر الراغبة في الانضمام. في سوا، افتح «الاستفسار عن نقل المدرسة» من الصفحة الرئيسية، واختر مدرسة، وأرسل «اسأل المدرسة عن الأيام المفتوحة». يرد مكتب القبول في سوا بالمواعيد، ويظهر الرد في العائلة › الاستفسارات وفي تقويمك.",
  },
  {
    id: "kb-fees",
    titleEn: "School fees, instalments and receipts",
    titleAr: "الرسوم المدرسية والأقساط والإيصالات",
    sourceName: "Sawa service guide (demo)",
    sourceUrl: "https://www.moe.gov.ae",
    keywords: ["fee", "fees", "pay", "payment", "instalment", "installment", "receipt", "cost", "رسوم", "دفع", "قسط", "أقساط", "إيصال"],
    textEn:
      "Sawa shows each instalment, its due date and how many days are left. Tap 'Pay fee' on your home screen to pay the next instalment; the receipt appears under 'Done this term'. Public schools charge activity and transport fees only; private-school tuition follows the school's KHDA-approved fee schedule.",
    textAr:
      "يعرض سوا كل قسط وتاريخ استحقاقه والأيام المتبقية. اضغط «دفع الرسوم» في الصفحة الرئيسية لدفع القسط التالي، ويظهر الإيصال في «أنجزته هذا الفصل». تفرض المدارس الحكومية رسوم الأنشطة والنقل فقط، أما رسوم المدارس الخاصة فتتبع الجدول المعتمد من هيئة المعرفة.",
  },
  {
    id: "kb-events-consent",
    titleEn: "Signing your child up for school events and trips",
    titleAr: "تسجيل الطالب في الفعاليات والرحلات المدرسية",
    sourceName: "Sawa service guide (demo)",
    sourceUrl: "https://www.moe.gov.ae",
    keywords: ["event", "events", "trip", "sign up", "signup", "consent", "permission", "club", "فعالية", "فعاليات", "رحلة", "تسجيل", "موافقة", "نادي"],
    textEn:
      "Under Family › Events you see every school event your child can join. Tap 'Sign Sara up' to register; trips that leave school need your consent, which you give once under Approvals. Students under 15 need a guardian's approval for anything outside their own school.",
    textAr:
      "في العائلة › الفعاليات ترى كل فعالية مدرسية يمكن لطفلك الانضمام إليها. اضغط «سجّل سارة» للتسجيل، والرحلات خارج المدرسة تحتاج موافقتك مرة واحدة من الموافقات. يحتاج الطلاب دون 15 سنة إلى موافقة ولي الأمر لأي نشاط خارج مدرستهم.",
  },
  {
    id: "kb-eid-update",
    serviceId: "svc-school-file",
    titleEn: "Updating a student's identity document on the school file",
    titleAr: "تحديث وثيقة هوية الطالب في الملف المدرسي",
    sourceName: "Sawa service guide (demo) — verify against MOE",
    sourceUrl: "https://www.moe.gov.ae",
    keywords: ["emirates id", "id", "renew", "renewed", "expired", "expiry", "document", "school file", "update", "هوية", "الهوية", "جددت", "تجديد", "منتهية", "ملف", "تحديث", "وثيقة"],
    textEn:
      "When a student's Emirates ID is renewed, the guardian updates the student's school file with the new card. In Sawa: open 'Update my child's school file', upload a photo of the new card, check the fields Sawa reads from it (ID number and expiry), and confirm. The update is shared with every connected service that uses those fields, so you do not re-type them anywhere else.",
    textAr:
      "عند تجديد الهوية الإماراتية للطالب، يقوم ولي الأمر بتحديث الملف المدرسي بالبطاقة الجديدة. في سوا: افتح خدمة «تحديث ملف الطالب المدرسي»، وارفع صورة البطاقة الجديدة، وراجع الحقول التي يقرأها سوا منها (رقم الهوية وتاريخ الانتهاء)، ثم أكّد. يُشارك التحديث مع جميع الخدمات المرتبطة التي تستخدم هذه الحقول، فلا تحتاج إلى إعادة كتابتها في أي مكان آخر.",
  },
  {
    id: "kb-reregistration",
    serviceId: "svc-reregistration",
    titleEn: "Re-registration for the next term or year",
    titleAr: "إعادة التسجيل للفصل أو العام القادم",
    sourceName: "Sawa service guide (demo) — verify against MOE",
    sourceUrl: "https://www.moe.gov.ae",
    keywords: ["re-registration", "reregistration", "re-enrolment", "reenrolment", "re-enrol", "reenrol", "prerequisite", "prerequisites", "what do i need", "need", "enrol", "enroll", "register", "next year", "next term", "documents", "required", "إعادة التسجيل", "التسجيل", "تسجيل", "قيد", "المستندات", "الوثائق", "مطلوب"],
    textEn:
      "Re-registration confirms your child's place for the next term or year during the window the school announces. Sawa reminds you when the window opens. Typically you confirm the student's details and make sure identity documents on the school file are valid (not expired). Sawa pre-fills the form from your family profile; check the official MOE page for the exact list of documents for your child's case.",
    textAr:
      "إعادة التسجيل تؤكد مقعد الطالب للفصل أو العام القادم خلال الفترة التي تعلنها المدرسة. يذكّرك سوا عند فتح النافذة. عادةً تؤكد بيانات الطالب وتتأكد من أن وثائق الهوية في الملف المدرسي سارية وغير منتهية. يعبّئ سوا النموذج مسبقاً من ملف العائلة؛ راجع صفحة وزارة التربية والتعليم الرسمية لمعرفة قائمة الوثائق المطلوبة بدقة لحالة طفلك.",
  },
  {
    id: "kb-uaepass",
    titleEn: "Signing in with UAE PASS and students under 16",
    titleAr: "تسجيل الدخول بالهوية الرقمية واستخدام الطلاب دون 16 سنة",
    sourceName: "UAE PASS",
    sourceUrl: "https://uaepass.ae",
    keywords: ["uae pass", "login", "sign in", "account", "password", "under 16", "child", "الهوية الرقمية", "دخول", "تسجيل الدخول", "حساب", "طفل"],
    textEn:
      "UAE PASS is the national digital identity used to sign in to government services. Guardians sign in to Sawa with UAE PASS (simulated in this prototype) and link their children. Students who do not have UAE PASS use guardian-verified identity: the guardian links them, and they sign in with their school login.",
    textAr:
      "الهوية الرقمية (UAE PASS) هي الهوية الوطنية الرقمية لتسجيل الدخول إلى الخدمات الحكومية. يسجّل أولياء الأمور الدخول إلى سوا بالهوية الرقمية (محاكاة في هذا النموذج) ويربطون أبناءهم. الطلاب الذين لا يملكون الهوية الرقمية يستخدمون هوية موثّقة من ولي الأمر: يربطهم ولي الأمر ثم يدخلون بحساب المدرسة.",
  },
  {
    id: "kb-transport",
    serviceId: "svc-transport",
    titleEn: "School transport requests",
    titleAr: "طلبات النقل المدرسي",
    sourceName: "Sawa service guide (demo) — verify against MOE",
    sourceUrl: "https://www.moe.gov.ae",
    keywords: ["bus", "transport", "route", "pick up", "حافلة", "النقل", "المواصلات", "باص"],
    textEn: "To request or change a school bus route, open 'School transport request'. Sawa pre-fills the student's name, home area and guardian contact from the family profile. If you moved house, update the address once and the transport request uses the new one.",
    textAr: "لطلب أو تغيير مسار الحافلة المدرسية، افتح خدمة «طلب النقل المدرسي». يعبّئ سوا اسم الطالب ومنطقة السكن وبيانات ولي الأمر مسبقاً من ملف العائلة. إذا انتقلت إلى منزل جديد، حدّث العنوان مرة واحدة وسيستخدمه طلب النقل.",
  },
  {
    id: "kb-competitions",
    titleEn: "Joining competitions and clubs (age rules)",
    titleAr: "المشاركة في المسابقات والأندية (قواعد العمر)",
    sourceName: "Sawa safety policy",
    sourceUrl: "https://www.tdra.gov.ae",
    keywords: ["competition", "hackathon", "club", "community", "join", "robotics", "mun", "event", "approval", "consent", "مسابقة", "هاكاثون", "نادي", "مجتمع", "انضمام", "موافقة", "فعالية"],
    textEn: "Students under 15 can join their own school's clubs and browse events; anything outside school (competitions, hackathons, trips) is sent to a linked guardian for approval first. Under-15 accounts cannot post publicly or send direct messages. Students aged 15 and over can also join moderated cross-school communities, where posts are reviewed before they appear.",
    textAr: "يمكن للطلاب دون 15 سنة الانضمام إلى أندية مدرستهم وتصفّح الفعاليات؛ أما المشاركة خارج المدرسة (مسابقات، هاكاثونات، رحلات) فتُرسل أولاً إلى ولي الأمر للموافقة. لا تستطيع حسابات من هم دون 15 سنة النشر العام أو إرسال رسائل خاصة. ويمكن لمن هم 15 سنة فأكثر الانضمام إلى مجتمعات مشتركة بين المدارس تخضع للإشراف، وتُراجع المنشورات قبل ظهورها.",
  },
  {
    id: "kb-certificate",
    serviceId: "svc-certificate",
    titleEn: "Proof of enrolment letter",
    titleAr: "شهادة إثبات القيد",
    sourceName: "Sawa service guide (demo) — verify against MOE",
    sourceUrl: "https://www.moe.gov.ae",
    keywords: ["certificate", "letter", "to whom", "proof", "enrolment letter", "شهادة", "لمن يهمه الأمر", "إثبات"],
    textEn: "A to-whom-it-may-concern letter proves your child is enrolled. Request it from the service hub; the student's name, ID and grade are filled in for you.",
    textAr: "شهادة «لمن يهمه الأمر» تثبت قيد الطالب. اطلبها من مركز الخدمات؛ ويُعبّأ اسم الطالب ورقم الهوية والصف تلقائياً.",
  },
  {
    id: "kb-privacy",
    titleEn: "How Sawa handles your data",
    titleAr: "كيف يتعامل سوا مع بياناتك",
    sourceName: "Sawa privacy notice (PDPL — Federal Decree-Law 45/2021)",
    sourceUrl: "https://u.ae",
    keywords: ["privacy", "data", "delete", "pdpl", "who can see", "خصوصية", "البيانات", "حذف", "من يرى"],
    textEn: "Sawa stores only the fields services need. Guardians see their own children only; students see only their own data. You can review every stored field under 'Tell us once' and ask for deletion. Names and ID numbers are removed before any question is sent to the AI.",
    textAr: "يحفظ سوا الحقول التي تحتاجها الخدمات فقط. يرى ولي الأمر أبناءه فقط، ويرى الطالب بياناته فقط. يمكنك مراجعة كل حقل محفوظ في «أخبرنا مرة واحدة» وطلب حذفه. تُحذف الأسماء وأرقام الهوية قبل إرسال أي سؤال إلى الذكاء الاصطناعي.",
  },
];

const AR_RE = /[؀-ۿ]/;
export const isArabic = (s: string) => AR_RE.test(s);

const norm = (s: string) =>
  s.toLowerCase().replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/[^\p{L}\p{N}\s-]/gu, " ");

/** Lightweight bilingual keyword retrieval. Swap for pgvector embeddings in production. */
export function retrieve(question: string, k = 2): { doc: KbDoc; score: number }[] {
  const q = norm(question);
  const tokens = new Set(q.split(/\s+/).filter((t) => t.length > 1));
  return KB.map((doc) => {
    let score = 0;
    for (const kw of doc.keywords) {
      const nk = norm(kw);
      if (nk.includes(" ") ? q.includes(nk) : tokens.has(nk) || [...tokens].some((t) => t.length > 3 && (t.startsWith(nk) || nk.startsWith(t)))) score += nk.includes(" ") ? 3 : 2;
    }
    for (const t of tokens) if (t.length > 3 && norm(doc.titleEn + " " + doc.titleAr).includes(t)) score += 1;
    return { doc, score };
  })
    .filter((r) => r.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

const PII_RES: [RegExp, string][] = [
  [/784[-\s]?\d{4}[-\s]?\d{7}[-\s]?\d/g, "[ID]"],
  [/\b0?5\d[\s-]?\d{3}[\s-]?\d{4}\b/g, "[PHONE]"],
  [/\+?971[\s-]?\d{1,2}[\s-]?\d{3}[\s-]?\d{4}/g, "[PHONE]"],
  [/[\w.+-]+@[\w-]+\.[\w.]+/g, "[EMAIL]"],
];
export function stripPii(s: string) {
  return PII_RES.reduce((acc, [re, rep]) => acc.replace(re, rep), s);
}

const UNSAFE = /(self[- ]?harm|suicide|kill|weapon|drugs?|alcohol|hack (?:into|someone)|انتحار|مخدرات|سلاح)/i;
export const isUnsafe = (s: string) => UNSAFE.test(s);
