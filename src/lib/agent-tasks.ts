// Ask Sawa can do things, not just answer. Each request is matched to one task; the chat
// shows the plan as steps, the person confirms once, and Sawa runs it right there in the
// chat using the same store actions as the screens. Nothing runs without that tap.
import { FEE_PLAN, OPPORTUNITIES, COMMUNITIES, SCHOOLS, SCHOOL_EVENTS } from "./seed";
import type { State } from "./store";
import type { Profile } from "./types";

export type TaskStep = { label: string; system: string };
export type AgentTask = {
  id: string;
  title: string;
  summary: string;
  steps: TaskStep[];
  confirm: string;
  /** Present when Sawa can't do it yet; the card shows why and how to fix it. */
  blocked?: { reason: string; fix?: { label: string; href: string } };
  run: () => { result: string; href?: string; linkLabel?: string };
};

type Actions = {
  payFee: (label: string, amountAed: number, approvalId?: string) => void;
  submitRequest: (r: { serviceId: string; childId: string; payload: Record<string, string>; fieldsRetyped: number; fieldsPrefilled: number }) => string;
  toggleEventSignup: (key: string) => void;
  decide: (id: string, ok: boolean) => void;
  sendEnquiry: (schoolId: string, topic: "open_day" | "transfer", childId?: string) => string;
  replyEnquiry: (id: string, reply: string) => void;
  addReminder: (title: string, at: string, linkHref?: string) => void;
  toggleSave: (opId: string) => void;
  register: (opId: string) => "registered" | "pending" | "ineligible";
  joinCommunity: (cid: string) => void;
  connectIntegration: (key: string) => void;
  postAnnouncement: (a: { title: string; body: string; kind: "notice" | "exam" | "event"; startsAt: string; audience: { grade: string; includeParents: boolean } }) => string;
  createEvent: (e: { title: string; startsAt: string; place: string; classes: string[] }) => string;
};

const has = (q: string, words: string[]) => words.some((w) => q.includes(w));
const tomorrow9 = () => { const d = new Date(Date.now() + 86_400_000); d.setHours(9, 0, 0, 0); return d.toISOString(); };
const days = (n: number) => new Date(Date.now() + n * 86_400_000).toISOString();

export function planTask(question: string, me: Profile | null, state: State, kids: Profile[], a: Actions, ar: boolean): AgentTask | null {
  if (!me) return null;
  const q = question.toLowerCase();
  const T = (en: string, arT: string) => (ar ? arT : en);
  const child = kids[0];

  // ── shared: reminders ──
  if (has(q, ["remind me", "reminder", "ذكرني", "ذكّرني", "تذكير"])) {
    const what = question.replace(/.*?(remind me (to|about)?|ذكّ?رني (بـ|ب)?)/i, "").trim() || T("Check Sawa", "مراجعة سوا");
    return {
      id: "reminder", title: T("Add a reminder", "إضافة تذكير"), summary: T(`“${what}” · tomorrow 9:00`, `«${what}» · غداً 9:00`),
      steps: [{ label: T("Create the reminder", "إنشاء التذكير"), system: "Sawa" }, { label: T("Put it on your calendar", "إضافته إلى تقويمك"), system: T("Calendar", "التقويم") }],
      confirm: T("Add reminder", "أضف التذكير"),
      run: () => { a.addReminder(what, tomorrow9()); return { result: T("Done. It's on your calendar for tomorrow at 9:00.", "تم. أُضيف إلى تقويمك غداً 9:00."), href: "/app/calendar", linkLabel: T("Open calendar", "فتح التقويم") }; },
    };
  }

  if (me.role === "parent" && child) {
    const first = (ar ? child.nameAr : child.name).split(" ")[0];
    if (has(q, ["pay", "fee", "instal", "ادفع", "دفع", "رسوم", "قسط"])) {
      const paid = state.payments.filter((p) => p.label.startsWith("Activity fee")).length;
      const next = FEE_PLAN[paid];
      const ap = state.approvals.find((x) => x.kind === "fees" && x.status === "pending");
      if (!next) return { id: "fee", title: T("Pay a fee", "دفع رسوم"), summary: T("All instalments are paid.", "كل الأقساط مدفوعة."), steps: [], confirm: "", blocked: { reason: T("Nothing is due — all 3 instalments are paid.", "لا شيء مستحق، دُفعت الأقساط الثلاثة.") }, run: () => ({ result: "" }) };
      return {
        id: "fee", title: T(`Pay instalment ${next.n} for ${first}`, `دفع القسط ${next.n} لـ${first}`), summary: T(`Term 3 activity fee · AED ${next.amountAed}`, `رسوم أنشطة الفصل الثالث · ${next.amountAed} درهم`),
        steps: [{ label: T("Find the next unpaid instalment", "إيجاد القسط التالي"), system: T("School fees portal", "بوابة الرسوم") }, { label: T(`Pay AED ${next.amountAed} (simulated)`, `دفع ${next.amountAed} درهم (محاكاة)`), system: "UAE PASS" }, { label: T("File the receipt", "حفظ الإيصال"), system: T("Done this term", "أنجزته هذا الفصل") }],
        confirm: T(`Pay AED ${next.amountAed}`, `ادفع ${next.amountAed} درهم`),
        run: () => { a.payFee(`Activity fee · instalment ${next.n}`, next.amountAed, paid === 0 ? ap?.id : undefined); return { result: T(`Paid instalment ${next.n}. ${FEE_PLAN.length - paid - 1} left. The receipt is under Done this term.`, `دُفع القسط ${next.n}. متبقٍ ${FEE_PLAN.length - paid - 1}. الإيصال في «أنجزته».`), href: "/app/today", linkLabel: T("See home", "الرئيسية") }; },
      };
    }
    if (has(q, ["re-enrol", "reenrol", "re-enroll", "re-register", "إعادة التسجيل", "اعادة التسجيل"])) {
      const exp = state.facts.find((f) => f.childId === child.id && f.field === "eid_expiry")?.value;
      const idDays = exp ? Math.ceil((new Date(exp).getTime() - Date.now()) / 86_400_000) : 0;
      const done = state.requests.find((r) => r.serviceId === "svc-reregistration" && r.childId === child.id);
      const base = { id: "reenrol", title: T(`Re-enrol ${first} for next year`, `إعادة تسجيل ${first} للعام القادم`), summary: T("5 fields pre-filled from your family profile", "5 حقول معبّأة من ملف العائلة"),
        steps: [{ label: T("Check the ID is valid", "التحقق من صلاحية الهوية"), system: T("Family profile", "ملف العائلة") }, { label: T("Fill the form from your profile", "تعبئة النموذج من الملف"), system: "Tell us once" }, { label: T("Send to the school", "الإرسال إلى المدرسة"), system: "Al Manhal" }],
        confirm: T("Send re-enrolment", "أرسل إعادة التسجيل") };
      if (done) return { ...base, blocked: { reason: T("Already sent.", "أُرسل مسبقاً."), fix: { label: T("Track it", "تتبّعه"), href: `/app/requests/${done.id}` } }, run: () => ({ result: "" }) };
      if (idDays <= 30) return { ...base, blocked: { reason: T(`${first}'s Emirates ID expires in ${idDays} days. The school needs a valid ID first — update it, then ask me again.`, `هوية ${first} تنتهي خلال ${idDays} يوماً. حدّثها أولاً ثم اطلب مني مجدداً.`), fix: { label: T("Update the ID", "تحديث الهوية"), href: "/app/services/school-file" } }, run: () => ({ result: "" }) };
      return { ...base, run: () => { const id = a.submitRequest({ serviceId: "svc-reregistration", childId: child.id, payload: { grade: String(Number(child.grade ?? 8) + 1) }, fieldsRetyped: 0, fieldsPrefilled: 5 }); return { result: T("Sent to Al Manhal. 0 fields typed.", "أُرسل إلى المنهل. لم تُكتب أي حقول."), href: `/app/requests/${id}`, linkLabel: T("Track status", "تتبّع الحالة") }; } };
    }
    if (has(q, ["open day", "transfer", "switch school", "another school", "اليوم المفتوح", "نقل", "مدرسة أخرى"])) {
      const s = SCHOOLS.find((x) => x.id !== child.schoolId)!;
      return {
        id: "openday", title: T("Ask a school about open days", "الاستفسار عن الأيام المفتوحة"), summary: T(`${s.name.replace(" (sample)", "")} · ${s.area} · ${s.curriculum}`, `${s.nameAr} · ${s.area}`),
        steps: [{ label: T(`Find schools with Grade ${child.grade} seats`, `إيجاد مدارس فيها مقاعد للصف ${child.grade}`), system: "KHDA dataset" }, { label: T("Send your enquiry to admissions", "إرسال الاستفسار لمكتب القبول"), system: T("School inbox", "بريد المدرسة") }],
        confirm: T("Send enquiry", "أرسل الاستفسار"),
        run: () => { const id = a.sendEnquiry(s.id, "open_day", child.id); setTimeout(() => a.replyEnquiry(id, T("Open day: Tuesday 9:00–11:00 · seats available in Grade 8", "يوم مفتوح: الثلاثاء 9:00–11:00 · يوجد مقاعد في الصف الثامن")), 2600); return { result: T("Sent. The school's reply will appear under Family › Enquiries.", "أُرسل. سيظهر رد المدرسة في العائلة › الاستفسارات."), href: "/app/approvals?tab=enquiries", linkLabel: T("Open enquiries", "فتح الاستفسارات") }; },
      };
    }
    if (has(q, ["sign", "event", "fair", "trip", "clean", "سجّل", "سجل", "فعالية", "معرض", "رحلة"])) {
      const ev = SCHOOL_EVENTS.find((e) => q.includes(e.title.toLowerCase().split(" ")[0].toLowerCase()) || question.includes(e.titleAr.split(" ")[0])) ?? SCHOOL_EVENTS[0];
      const key = `${child.id}:${ev.id}`;
      const on = (state.eventSignups[me.id] ?? []).includes(key);
      return {
        id: "event", title: T(`Sign ${first} up: ${ev.title}`, `تسجيل ${first}: ${ev.titleAr}`), summary: `${new Date(ev.at).toLocaleDateString(ar ? "ar-AE" : "en-GB", { weekday: "short", day: "numeric", month: "short" })} · ${ev.place}`,
        steps: [{ label: T("Check seats and age", "التحقق من المقاعد والعمر"), system: ev.by }, ...(ev.consent ? [{ label: T("Record your consent", "تسجيل موافقتك"), system: "UAE PASS" }] : []), { label: T(`Add it to ${first}'s calendar`, `إضافتها إلى تقويم ${first}`), system: T("Calendar", "التقويم") }],
        confirm: T(`Sign ${first} up`, `سجّل ${first}`),
        blocked: on ? { reason: T("Already signed up.", "مسجّلة مسبقاً."), fix: { label: T("See events", "الفعاليات"), href: "/app/approvals?tab=events" } } : undefined,
        run: () => { a.toggleEventSignup(key); return { result: T(`${first} is signed up${ev.consent ? " and your consent is recorded" : ""}.`, `تم تسجيل ${first}${ev.consent ? " مع موافقتك" : ""}.`), href: "/app/approvals?tab=events", linkLabel: T("See events", "الفعاليات") }; },
      };
    }
    if (has(q, ["approve", "permission", "consent", "وافق", "موافقة", "اذن", "إذن"])) {
      const p = state.approvals.filter((x) => x.guardianId === me.id && x.status === "pending").find((x) => (x.titleEn ?? "").toLowerCase().split(" ").some((w) => w.length > 3 && q.includes(w))) ?? state.approvals.find((x) => x.guardianId === me.id && x.status === "pending");
      if (!p) return null;
      const title = (ar ? p.titleAr : p.titleEn) ?? OPPORTUNITIES.find((o) => o.id === p.opportunityId)?.titleEn ?? "";
      return {
        id: "approve", title: T(`Approve: ${title}`, `موافقة: ${title}`), summary: (ar ? p.detailAr : p.detailEn) ?? "",
        steps: [{ label: T("Sign with UAE PASS (simulated)", "التوقيع بالهوية الرقمية (محاكاة)"), system: "UAE PASS" }, { label: T("Tell the school and your child", "إبلاغ المدرسة وطفلك"), system: "Sawa" }],
        confirm: T("Approve", "موافقة"),
        run: () => { a.decide(p.id, true); return { result: T("Approved and signed. The school has it.", "تمت الموافقة والتوقيع ووصلت للمدرسة."), href: "/app/approvals", linkLabel: T("Family", "العائلة") }; },
      };
    }
  }

  if (me.role === "student") {
    if (has(q, ["classroom", "connect", "اربط", "كلاس"])) {
      return { id: "gc", title: T("Connect Google Classroom", "ربط Google Classroom"), summary: T("Classes and due dates on your week (demo)", "الصفوف والمواعيد في أسبوعك (عرض)"),
        steps: [{ label: T("Ask for read-only access", "طلب صلاحية قراءة فقط"), system: "Google Classroom (simulated)" }, { label: T("Sync classwork to your calendar", "مزامنة الواجبات مع تقويمك"), system: T("Calendar", "التقويم") }],
        confirm: T("Connect", "اربط"), blocked: state.integrations[me.id]?.gclassroom ? { reason: T("Already connected.", "متصل مسبقاً.") } : undefined,
        run: () => { a.connectIntegration("gclassroom"); return { result: T("Connected. 4 classes synced.", "تم الربط. زُومنت 4 صفوف."), href: "/app/today", linkLabel: T("See my week", "أسبوعي") }; } };
    }
    const c = COMMUNITIES.find((x) => q.includes(x.name.toLowerCase().split(" ").slice(-1)[0]) || question.includes(x.nameAr.split(" ")[0]));
    if (c && has(q, ["join", "انضم"])) {
      return { id: "community", title: T(`Join ${c.name}`, `الانضمام إلى ${c.nameAr}`), summary: T(`${c.schools} schools · moderated`, `${c.schools} مدرسة · تحت الإشراف`),
        steps: [{ label: T("Check your age tier", "التحقق من فئتك العمرية"), system: "Sawa" }, { label: T("Join and follow its activities", "الانضمام ومتابعة أنشطته"), system: T("Communities", "المجتمعات") }],
        confirm: T("Join", "انضم"), run: () => { a.joinCommunity(c.id); return { result: T(`You're in ${c.name}.`, `انضممت إلى ${c.nameAr}.`), href: `/app/communities/${c.id}`, linkLabel: T("Open", "فتح") }; } };
    }
    const o = OPPORTUNITIES.find((x) => x.titleEn.toLowerCase().split(" ").filter((w) => w.length > 4).some((w) => q.includes(w)));
    if (o && has(q, ["join", "register", "enter", "save", "sign", "سجل", "سجّل", "احفظ", "انضم"])) {
      const save = has(q, ["save", "احفظ"]);
      return { id: "opp", title: save ? T(`Save ${o.titleEn}`, `حفظ ${o.titleAr}`) : T(`Register for ${o.titleEn}`, `التسجيل في ${o.titleAr}`), summary: new Date(o.startsAt).toLocaleDateString(ar ? "ar-AE" : "en-GB", { weekday: "short", day: "numeric", month: "short" }),
        steps: save ? [{ label: T("Save it and add the date", "حفظه وإضافة الموعد"), system: T("Calendar", "التقويم") }] : [{ label: T("Check age and eligibility", "التحقق من العمر والأهلية"), system: "Sawa" }, { label: T("Register, or ask your guardian if it's outside school", "التسجيل أو طلب موافقة ولي الأمر"), system: o.needsConsent ? T("Guardian approval", "موافقة ولي الأمر") : o.organiser ?? "School" }],
        confirm: save ? T("Save", "احفظ") : T("Go ahead", "تابع"),
        run: () => {
          if (save) { a.toggleSave(o.id); return { result: T("Saved. It's on your calendar.", "حُفظت وهي في تقويمك."), href: `/app/opportunities/${o.id}`, linkLabel: T("Open", "فتح") }; }
          const r = a.register(o.id);
          return { result: r === "registered" ? T("You're registered.", "تم تسجيلك.") : r === "pending" ? T("Sent to your guardian to approve. You'll get a notice when they decide.", "أُرسل لولي أمرك للموافقة.") : T("This one isn't open to your age yet.", "غير متاحة لعمرك بعد."), href: `/app/opportunities/${o.id}`, linkLabel: T("Open", "فتح") };
        } };
    }
  }

  if (me.role === "teacher") {
    if (has(q, ["post", "announce", "tell", "انشر", "أعلن", "اعلن"])) {
      const body = question.replace(/^.*?(post|announce|tell( my)?( class(es)?)?|انشر|أعلن)\s*(that|to|:)?/i, "").trim() || T("Reminder from your teacher", "تذكير من المعلمة");
      return { id: "post", title: T("Post to Grade 8", "نشر للصف الثامن"), summary: `“${body.slice(0, 90)}”`,
        steps: [{ label: T("Send to every Grade 8 student", "الإرسال لكل طلاب الصف الثامن"), system: T("Today", "اليوم") }, { label: T("Copy their guardians", "إرسال نسخة لأولياء الأمور"), system: T("Parents' Today", "صفحة الأهالي") }],
        confirm: T("Post", "انشر"), run: () => { a.postAnnouncement({ title: body.slice(0, 60), body, kind: "notice", startsAt: days(1), audience: { grade: me.grade ?? "8", includeParents: true } }); return { result: T("Posted once — it's in every student's and parent's Today.", "نُشر مرة واحدة ووصل للجميع."), href: "/app/post", linkLabel: T("See seen-by", "من شاهده") }; } };
    }
    if (has(q, ["event", "host", "workshop", "فعالية", "استضف", "ورشة"])) {
      const title = question.replace(/^.*?(host|create|plan|استضف|أنشئ)\s*(an?|the)?\s*(event|workshop)?\s*(called|for|:)?/i, "").trim() || T("Class event", "فعالية الصف");
      return { id: "event", title: T(`Host: ${title}`, `استضافة: ${title}`), summary: T("Next week · invite 8A and 8B", "الأسبوع القادم · دعوة 8A و8B"),
        steps: [{ label: T("Create the event", "إنشاء الفعالية"), system: T("Events", "الفعاليات") }, { label: T("Invite 8A and 8B", "دعوة 8A و8B"), system: T("Students' calendars", "تقاويم الطلاب") }],
        confirm: T("Create and invite", "أنشئ وادعُ"), run: () => { a.createEvent({ title, startsAt: days(7), place: T("School", "المدرسة"), classes: ["8A", "8B"] }); return { result: T("Created and invited 8A and 8B.", "أُنشئت ودُعي 8A و8B."), href: "/app/students", linkLabel: T("Open events", "الفعاليات") }; } };
    }
  }
  return null;
}

/** Example "do it for me" requests for the empty chat, per role. */
export const TASK_EXAMPLES: Record<string, { en: string; ar: string }[]> = {
  parent: [
    { en: "Pay Sara's next fee instalment", ar: "ادفع القسط التالي لسارة" },
    { en: "Sign Sara up for the science fair", ar: "سجّل سارة في معرض العلوم" },
    { en: "Ask a school about open days", ar: "اسأل مدرسة عن الأيام المفتوحة" },
  ],
  student: [
    { en: "Connect my Google Classroom", ar: "اربط Google Classroom" },
    { en: "Join UAE Student Coders", ar: "انضم إلى مبرمجي الطلبة" },
    { en: "Remind me to bring my calculator", ar: "ذكّرني بإحضار الآلة الحاسبة" },
  ],
  teacher: [
    { en: "Post that the science quiz moves to Thursday", ar: "انشر أن اختبار العلوم انتقل إلى الخميس" },
    { en: "Host an event called Coding day", ar: "استضف فعالية يوم البرمجة" },
    { en: "Remind me to mark the 8A lab reports", ar: "ذكّرني بتصحيح تقارير 8A" },
  ],
};
