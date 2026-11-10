"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import * as seed from "./seed";
import type {
  AgeTier, Announcement, Approval, ChatMsg, CommunityPost, ParentControls, SchoolBrand, TeacherEvent, Lang, Notice, Profile, ProfileFact, Project, Reminder, RequestStatus, Role, ServiceRequest,
} from "./types";

const KEY = "sawa-demo-v2"; // bumped with each redesign so an old saved demo cannot hide the new screens

export interface State {
  v: 1;
  lang: Lang;
  sessionUserId: string | null;
  onboarded: Record<string, boolean>;
  profiles: Profile[];
  links: typeof seed.GUARDIAN_LINKS;
  notices: Notice[];
  requests: ServiceRequest[];
  facts: ProfileFact[];
  announcements: Announcement[];
  approvals: Approval[];
  joined: Record<string, string[]>;
  registered: Record<string, string[]>;
  aiLog: { q: string; mode: string; at: string; flagged?: boolean }[];
  // ── student experience ──
  saved: Record<string, string[]>;
  integrations: Record<string, Record<string, { connectedAt: string }>>;
  reminders: Reminder[];
  posts: CommunityPost[];
  helpfulBy: Record<string, string[]>;
  activitiesJoined: Record<string, string[]>;
  projects: Project[];
  verification: Record<string, { verifiedAt: string; method: "sample_id_simulated" }>;
  feedUnlockedOn: Record<string, string>;
  bios: Record<string, { handle: string; bio: string }>;
  // ── whole-app pass ──
  schoolBrand?: SchoolBrand;
  parentControls: Record<string, ParentControls>;
  events: TeacherEvent[];
  chat: ChatMsg[];
  payments: { id: string; approvalId?: string; amountAed: number; at: string; label: string }[];
}

export const initialState = (): State => ({
  v: 1,
  lang: "en",
  sessionUserId: null,
  onboarded: {},
  profiles: structuredClone(seed.PROFILES),
  links: structuredClone(seed.GUARDIAN_LINKS),
  notices: structuredClone(seed.NOTICES),
  requests: [],
  facts: structuredClone(seed.PROFILE_FACTS),
  announcements: [],
  approvals: structuredClone(seed.SEED_APPROVALS),
  joined: { "stu-sara": ["c1"] },
  registered: {},
  aiLog: [],
  saved: { "stu-sara": ["op-10"] },
  integrations: {},
  reminders: [],
  posts: structuredClone(seed.COMMUNITY_POSTS),
  helpfulBy: {},
  activitiesJoined: {},
  projects: [
    { id: "pr-1", userId: "stu-sara", title: "Line-follower robot", role: "Robotics Club · Builder", progress: 45, due: seed.at(20), image: "/figma/interests/coding.png" },
    { id: "pr-2", userId: "stu-sara", title: "Reflections photo series", role: "Photography Club", progress: 30, due: seed.at(28), image: "/figma/interests/photography.png" },
  ],
  verification: {},
  feedUnlockedOn: {},
  bios: { "stu-sara": { handle: "sara.builds", bio: "Grade 8 · robots, cameras and code." } },
  parentControls: {},
  events: structuredClone(seed.TEACHER_EVENTS),
  chat: structuredClone(seed.COMMUNITY_CHAT),
  payments: [],
});

export const ageOf = (p?: Profile) => (p?.birthYear ? new Date().getFullYear() - p.birthYear : 30);
export const tierOf = (p?: Profile): AgeTier => (ageOf(p) < 15 ? "u15" : "15plus");
const uid = () => Math.random().toString(36).slice(2, 9);
const now = () => new Date().toISOString();

/** F5 — rules table: trigger → task. Evaluated on every state change (idempotent by notice id). */
function evaluateNudges(s: State): State {
  const notices = [...s.notices];
  const upsert = (n: Notice) => {
    const i = notices.findIndex((x) => x.id === n.id);
    if (i === -1) notices.unshift(n);
  };
  const close = (id: string) => {
    const i = notices.findIndex((x) => x.id === id);
    if (i !== -1 && notices[i].status === "open") notices[i] = { ...notices[i], status: "done" };
  };
  for (const link of s.links) {
    const child = s.profiles.find((p) => p.id === link.childId);
    const expiry = s.facts.find((f) => f.childId === link.childId && f.field === "eid_expiry")?.value;
    const id = `nudge-eid-${link.childId}`;
    if (expiry) {
      const days = (new Date(expiry).getTime() - Date.now()) / 86_400_000;
      if (days < 30) {
        upsert({
          id, userId: link.guardianId, sourceSystem: "Sawa", kind: "proactive", priority: 1, status: "open", dueAt: expiry,
          titleEn: `${child?.name}'s ID expires ${days < 0 ? "— expired" : `in ${Math.ceil(days)} days`}. Her school file needs the new copy.`,
          titleAr: `هوية ${child?.nameAr} ${days < 0 ? "منتهية" : `تنتهي خلال ${Math.ceil(days)} يوماً`}. يحتاج ملفها المدرسي إلى النسخة الجديدة.`,
          bodyEn: "Snap a photo of the renewed card. Sawa reads it and updates every connected service — you re-type nothing.",
          bodyAr: "صوّر البطاقة المجددة. يقرؤها سوا ويحدّث كل الخدمات المرتبطة — دون أن تعيد كتابة أي شيء.",
          reasonEn: "Rule eid_expiry_lt_30d: the ID expiry on your child's family profile is less than 30 days away. Al Manhal, the school file and Transport all use this field.",
          reasonAr: "القاعدة eid_expiry_lt_30d: تاريخ انتهاء الهوية في ملف العائلة أقل من 30 يوماً. تستخدم هذا الحقل خدمات المنهل والملف المدرسي والنقل.",
          action: { labelEn: "Update now", labelAr: "حدّث الآن", href: "/app/services/school-file" },
        });
      } else close(id);
    }
    const rereg = s.notices.find((n) => n.id === "n3");
    if (rereg) {
      upsert({
        id: `nudge-rereg-${link.childId}`, userId: link.guardianId, sourceSystem: "Sawa", kind: "proactive", priority: 2, status: "open", dueAt: rereg.dueAt,
        titleEn: `Re-registration for ${child?.name} opens soon — already 80% filled for you.`,
        titleAr: `إعادة تسجيل ${child?.nameAr} تبدأ قريباً — النموذج معبّأ مسبقاً بنسبة 80٪.`,
        bodyEn: "Sawa pre-filled the form from your family profile. You'll only confirm.",
        bodyAr: "عبّأ سوا النموذج من ملف العائلة. عليك التأكيد فقط.",
        reasonEn: "Rule rereg_window_open: Al Manhal announced the re-registration window for your child's school.",
        reasonAr: "القاعدة rereg_window_open: أعلن نظام المنهل عن فترة إعادة التسجيل لمدرسة طفلك.",
        action: { labelEn: "Ask Sawa what's needed", labelAr: "اسأل سوا عن المطلوب", href: "/app/ask?q=What%20do%20I%20need%20for%20re-enrolment%3F" },
      });
    }
  }
  return { ...s, notices };
}

type Ctx = ReturnType<typeof useBuildStore>;
const StoreCtx = createContext<Ctx | null>(null);

function useBuildStore() {
  const [state, setState] = useState<State>(() => evaluateNudges(initialState()));
  const [ready, setReady] = useState(false);
  const skipSave = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      // merge so older saved demo data picks up new fields
      if (raw) setState(evaluateNudges({ ...initialState(), ...JSON.parse(raw), v: 1 }));
    } catch {}
    setReady(true);
    // Cross-tab sync: a teacher posting in one window updates the parent's window live.
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY || !e.newValue) return;
      try {
        const incoming = { ...initialState(), ...JSON.parse(e.newValue) } as State;
        skipSave.current = true;
        setState((cur) => ({ ...incoming, sessionUserId: cur.sessionUserId, lang: cur.lang }));
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (skipSave.current) { skipSave.current = false; return; }
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
  }, [state, ready]);

  const update = useCallback((fn: (s: State) => State) => setState((s) => evaluateNudges(fn(s))), []);

  const me = state.profiles.find((p) => p.id === state.sessionUserId) ?? null;
  const childrenOf = useCallback(
    (guardianId: string) => state.links.filter((l) => l.guardianId === guardianId).map((l) => state.profiles.find((p) => p.id === l.childId)!).filter(Boolean),
    [state.links, state.profiles],
  );
  const myChildren = useMemo(() => (me?.role === "parent" ? childrenOf(me.id) : []), [me, childrenOf]);
  const guardianOf = (childId: string) => state.links.find((l) => l.childId === childId)?.guardianId;

  /** Row-level visibility, mirroring the Supabase RLS policies in supabase/migrations. */
  const visibleNotices = useMemo(() => {
    if (!me) return [];
    const ids = new Set([me.id, ...myChildren.map((c) => c.id)]);
    return state.notices.filter((n) => ids.has(n.userId));
  }, [me, myChildren, state.notices]);

  const actions = {
    setLang: (lang: Lang) => update((s) => ({ ...s, lang })),
    signIn: (role: Role) => {
      const id = role === "student" ? "stu-sara" : role === "parent" ? "par-khalid" : "tch-aisha";
      update((s) => ({ ...s, sessionUserId: id }));
      return id;
    },
    signOut: () => update((s) => ({ ...s, sessionUserId: null })),
    finishOnboarding: (patch?: Partial<Profile>) =>
      update((s) => ({
        ...s,
        onboarded: { ...s.onboarded, [s.sessionUserId!]: true },
        profiles: s.profiles.map((p) => (p.id === s.sessionUserId ? { ...p, ...patch } : p)),
      })),
    reset: () => {
      const fresh = evaluateNudges(initialState());
      setState({ ...fresh, lang: state.lang });
    },
    toggleNotice: (id: string) =>
      update((s) => ({ ...s, notices: s.notices.map((n) => (n.id === id ? { ...n, status: n.status === "open" ? "done" : "open" } : n)) })),
    markSeen: (announcementIds: string[], userId: string) =>
      update((s) => ({
        ...s,
        announcements: s.announcements.map((a) => (announcementIds.includes(a.id) && !a.seenBy.includes(userId) ? { ...a, seenBy: [...a.seenBy, userId] } : a)),
      })),
    /** F8 — post once; fan out to every student in the grade (and so their guardians' Today). */
    postAnnouncement: (a: Pick<Announcement, "title" | "body" | "kind" | "startsAt" | "audience">) => {
      const id = `ann-${uid()}`;
      update((s) => {
        const teacher = s.profiles.find((p) => p.id === s.sessionUserId)!;
        const students = s.profiles.filter((p) => p.role === "student" && p.schoolId === teacher.schoolId && p.grade === a.audience.grade);
        const guardians = a.audience.includeParents
          ? students.map((st) => s.links.find((l) => l.childId === st.id)?.guardianId ?? seed.OTHER_GUARDIANS[st.id]).filter(Boolean) as string[]
          : [];
        const fan: Notice[] = students.map((st) => ({
          id: `${id}-${st.id}`, userId: st.id, sourceSystem: "School", kind: a.kind, priority: a.kind === "exam" ? 1 : 2, status: "open",
          titleEn: a.title, titleAr: a.title, bodyEn: `${a.body}\n— ${teacher.name}`, bodyAr: `${a.body}\n— ${teacher.nameAr}`,
          dueAt: a.startsAt, announcementId: id,
        }));
        return {
          ...s,
          notices: [...fan, ...s.notices],
          announcements: [{ ...a, id, teacherId: teacher.id, createdAt: now(), recipients: [...students.map((x) => x.id), ...guardians], seenBy: [] }, ...s.announcements],
        };
      });
      return id;
    },
    /** F9 — confirm AI-extracted fields into the single family profile. */
    confirmFacts: (childId: string, values: Record<string, string>, sourceDoc: string) =>
      update((s) => {
        const facts = [...s.facts];
        for (const [field, value] of Object.entries(values)) {
          const i = facts.findIndex((f) => f.childId === childId && f.field === field);
          const row: ProfileFact = { childId, field, value, sourceDoc, verifiedBy: s.sessionUserId!, verifiedAt: now() };
          if (i === -1) facts.push(row); else facts[i] = row;
        }
        return { ...s, facts };
      }),
    /** F3 — submit a service request built from profile facts. */
    submitRequest: (r: Pick<ServiceRequest, "serviceId" | "childId" | "payload" | "fieldsRetyped" | "fieldsPrefilled">) => {
      const id = `req-${uid()}`;
      update((s) => {
        const svc = seed.SERVICES.find((x) => x.id === r.serviceId)!;
        const req: ServiceRequest = { ...r, id, requesterId: s.sessionUserId!, status: "submitted", history: [{ status: "submitted", at: now(), by: s.sessionUserId! }], updatedAt: now() };
        const n: Notice = {
          id: `rn-${id}`, userId: s.sessionUserId!, sourceSystem: svc.ownerSystem, kind: "notice", priority: 3, status: "open",
          titleEn: `Request received: ${svc.nameEn}`, titleAr: `تم استلام الطلب: ${svc.nameAr}`,
          bodyEn: "Track its status in Services.", bodyAr: "تابع حالته في الخدمات.",
          action: { labelEn: "Track", labelAr: "تتبّع", href: `/app/requests/${id}` },
        };
        return { ...s, requests: [req, ...s.requests], notices: [n, ...s.notices] };
      });
      return id;
    },
    /** Staff action (school office) — only staff can change status. */
    setRequestStatus: (id: string, status: RequestStatus) =>
      update((s) => {
        const req = s.requests.find((r) => r.id === id);
        if (!req) return s;
        const svc = seed.SERVICES.find((x) => x.id === req.serviceId)!;
        const n: Notice = {
          id: `rs-${id}-${status}`, userId: req.requesterId, sourceSystem: svc.ownerSystem, kind: "notice", priority: status === "done" ? 2 : 3, status: "open",
          titleEn: status === "done" ? `Done: ${svc.nameEn}` : `In review: ${svc.nameEn}`,
          titleAr: status === "done" ? `مكتمل: ${svc.nameAr}` : `قيد المراجعة: ${svc.nameAr}`,
          bodyEn: status === "done" ? "The school file is updated in every connected system." : "The school office is reviewing your request.",
          bodyAr: status === "done" ? "تم تحديث الملف المدرسي في كل الأنظمة المرتبطة." : "يراجع مكتب المدرسة طلبك.",
          action: { labelEn: "View", labelAr: "عرض", href: `/app/requests/${id}` },
        };
        return {
          ...s,
          requests: s.requests.map((r) => (r.id === id ? { ...r, status, updatedAt: now(), history: [...r.history, { status, at: now(), by: s.sessionUserId! }] } : r)),
          notices: [n, ...s.notices],
        };
      }),
    joinCommunity: (cid: string) =>
      update((s) => ({ ...s, joined: { ...s.joined, [s.sessionUserId!]: [...new Set([...(s.joined[s.sessionUserId!] ?? []), cid])] } })),
    /** F6 — register; under-15 + outside-school activity → guardian approval first. */
    register: (opId: string): "registered" | "pending" | "ineligible" => {
      const op = seed.OPPORTUNITIES.find((o) => o.id === opId)!;
      const meP = state.profiles.find((p) => p.id === state.sessionUserId)!;
      const age = ageOf(meP);
      if (age < op.minAge) return "ineligible";
      const needsApproval = op.needsConsent && age < 15;
      update((s) => {
        if (!needsApproval) return { ...s, registered: { ...s.registered, [meP.id]: [...new Set([...(s.registered[meP.id] ?? []), opId])] } };
        const g = s.links.find((l) => l.childId === meP.id)?.guardianId;
        if (!g) return s;
        const ap: Approval = { id: `ap-${uid()}`, childId: meP.id, guardianId: g, opportunityId: opId, status: "pending", createdAt: now() };
        const n: Notice = {
          id: `apn-${ap.id}`, userId: g, sourceSystem: "Sawa", kind: "proactive", priority: 1, status: "open",
          titleEn: `${meP.name} asked to join: ${op.titleEn}`, titleAr: `${meP.nameAr} تطلب الانضمام إلى: ${op.titleAr}`,
          bodyEn: "Approve or decline in Approvals.", bodyAr: "وافق أو ارفض من صفحة الموافقات.",
          reasonEn: "Students under 15 need a guardian's approval for activities outside their school.",
          reasonAr: "يحتاج الطلاب دون 15 سنة إلى موافقة ولي الأمر للأنشطة خارج المدرسة.",
          action: { labelEn: "Review", labelAr: "مراجعة", href: "/app/approvals" },
        };
        return { ...s, approvals: [ap, ...s.approvals], notices: [n, ...s.notices] };
      });
      return needsApproval ? "pending" : "registered";
    },
    decide: (approvalId: string, approve: boolean) =>
      update((s) => {
        const ap = s.approvals.find((a) => a.id === approvalId);
        if (!ap) return s;
        const op = seed.OPPORTUNITIES.find((o) => o.id === ap.opportunityId);
        if (!op) // school-originated approvals (trip, fees, media): just record the decision
          return { ...s, approvals: s.approvals.map((a) => (a.id === approvalId ? { ...a, status: approve ? "approved" : "denied", decidedAt: now() } : a)) };
        const n: Notice = {
          id: `apd-${ap.id}`, userId: ap.childId, sourceSystem: "Sawa", kind: "notice", priority: 2, status: "open",
          titleEn: approve ? `Approved! You're registered for ${op.titleEn}` : `Your guardian declined: ${op.titleEn}`,
          titleAr: approve ? `تمت الموافقة! أنت مسجّل في ${op.titleAr}` : `رفض ولي أمرك: ${op.titleAr}`,
          bodyEn: approve ? "It's on your calendar." : "Talk to your guardian if you have questions.",
          bodyAr: approve ? "أُضيفت إلى تقويمك." : "تحدّث مع ولي أمرك إن كانت لديك أسئلة.",
          dueAt: approve ? op.startsAt : undefined,
        };
        return {
          ...s,
          approvals: s.approvals.map((a) => (a.id === approvalId ? { ...a, status: approve ? "approved" : "denied", decidedAt: now() } : a)),
          registered: approve ? { ...s.registered, [ap.childId]: [...new Set([...(s.registered[ap.childId] ?? []), op.id])] } : s.registered,
          notices: [n, ...s.notices.map((x) => (x.id === `apn-${ap.id}` ? { ...x, status: "done" as const } : x))],
        };
      }),
    // ── student actions ──
    /** Interactive onboarding: verified (simulated) DOB, interests and school are written to the profile. */
    completeStudentOnboarding: (patch: { interests: string[]; birthYear?: number; schoolId?: string }) =>
      update((s) => {
        const id = s.sessionUserId!;
        return {
          ...s,
          onboarded: { ...s.onboarded, [id]: true },
          profiles: s.profiles.map((p) => (p.id === id ? { ...p, interests: patch.interests, ...(patch.birthYear ? { birthYear: patch.birthYear } : {}), ...(patch.schoolId ? { schoolId: patch.schoolId } : {}) } : p)),
        };
      }),
    recordVerification: () =>
      update((s) => ({ ...s, verification: { ...s.verification, [s.sessionUserId!]: { verifiedAt: now(), method: "sample_id_simulated" } } })),
    setInterests: (interests: string[]) =>
      update((s) => ({ ...s, profiles: s.profiles.map((p) => (p.id === s.sessionUserId ? { ...p, interests } : p)) })),
    updateBio: (handle: string, bio: string) => update((s) => ({ ...s, bios: { ...s.bios, [s.sessionUserId!]: { handle, bio } } })),
    toggleSave: (opId: string) =>
      update((s) => {
        const id = s.sessionUserId!; const cur = s.saved[id] ?? [];
        return { ...s, saved: { ...s.saved, [id]: cur.includes(opId) ? cur.filter((x) => x !== opId) : [...cur, opId] } };
      }),
    connectIntegration: (key: string) =>
      update((s) => ({ ...s, integrations: { ...s.integrations, [s.sessionUserId!]: { ...(s.integrations[s.sessionUserId!] ?? {}), [key]: { connectedAt: now() } } } })),
    disconnectIntegration: (key: string) =>
      update((s) => {
        const cur = { ...(s.integrations[s.sessionUserId!] ?? {}) }; delete cur[key];
        return { ...s, integrations: { ...s.integrations, [s.sessionUserId!]: cur } };
      }),
    addReminder: (title: string, at: string, linkHref?: string) => {
      const id = `rem-${uid()}`;
      update((s) => ({ ...s, reminders: [...s.reminders, { id, userId: s.sessionUserId!, title, at, done: false, linkHref }] }));
      return id;
    },
    toggleReminder: (id: string) => update((s) => ({ ...s, reminders: s.reminders.map((r) => (r.id === id ? { ...r, done: !r.done } : r)) })),
    removeReminder: (id: string) => update((s) => ({ ...s, reminders: s.reminders.filter((r) => r.id !== id) })),
    leaveCommunity: (cid: string) =>
      update((s) => ({ ...s, joined: { ...s.joined, [s.sessionUserId!]: (s.joined[s.sessionUserId!] ?? []).filter((x) => x !== cid) } })),
    /** 15+ only. Posts enter a moderation queue; they are never published instantly. */
    createPost: (communityId: string, body: string): "pending" | "blocked" => {
      const meP = state.profiles.find((p) => p.id === state.sessionUserId)!;
      if (ageOf(meP) < 15) return "blocked";
      update((s) => ({
        ...s,
        posts: [{ id: `post-${uid()}`, communityId, author: `${meP.name} (you)`, role: "member", kind: "discussion", body: body.slice(0, 500), createdAt: now(), status: "pending", helpful: 0 }, ...s.posts],
      }));
      return "pending";
    },
    toggleHelpful: (postId: string) =>
      update((s) => {
        const id = s.sessionUserId!; const cur = s.helpfulBy[postId] ?? [];
        return { ...s, helpfulBy: { ...s.helpfulBy, [postId]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] } };
      }),
    toggleActivity: (activityId: string) =>
      update((s) => {
        const id = s.sessionUserId!; const cur = s.activitiesJoined[id] ?? [];
        return { ...s, activitiesJoined: { ...s.activitiesJoined, [id]: cur.includes(activityId) ? cur.filter((x) => x !== activityId) : [...cur, activityId] } };
      }),
    addProject: (title: string, role: string) =>
      update((s) => ({ ...s, projects: [...s.projects, { id: `pr-${uid()}`, userId: s.sessionUserId!, title, role, progress: 0 }] })),
    setProjectProgress: (id: string, progress: number) =>
      update((s) => ({ ...s, projects: s.projects.map((p) => (p.id === id ? { ...p, progress: Math.max(0, Math.min(100, progress)) } : p)) })),
    unlockFeed: () => update((s) => ({ ...s, feedUnlockedOn: { ...s.feedUnlockedOn, [s.sessionUserId!]: new Date().toDateString() } })),
    payFee: (label: string, amountAed: number, approvalId?: string) =>
      update((s) => ({
        ...s,
        payments: [...s.payments, { id: `pay-${uid()}`, approvalId, amountAed, label, at: now() }],
        approvals: approvalId ? s.approvals.map((a) => (a.id === approvalId ? { ...a, status: "approved", decidedAt: now() } : a)) : s.approvals,
      })),
    setSchoolBrand: (b: SchoolBrand) => update((s) => ({ ...s, schoolBrand: b })),
    setParentControls: (c: ParentControls) => update((s) => ({ ...s, parentControls: { ...s.parentControls, [s.sessionUserId!]: c } })),
    decideApproval: (id: string, ok: boolean) =>
      update((s) => ({ ...s, approvals: s.approvals.map((a) => (a.id === id ? { ...a, status: ok ? "approved" : "denied", decidedAt: now() } : a)) })),
    createEvent: (e: Pick<TeacherEvent, "title" | "startsAt" | "place" | "classes">) => {
      const id = `ev-${uid()}`;
      update((s) => ({ ...s, events: [{ ...e, id, hostId: s.sessionUserId! }, ...s.events] }));
      return id;
    },
    inviteClasses: (eventId: string, classes: string[]) =>
      update((s) => ({ ...s, events: s.events.map((e) => (e.id === eventId ? { ...e, classes: [...new Set([...e.classes, ...classes])] } : e)) })),
    requestSponsorship: (eventId: string, amountAed: number, reason: string) =>
      update((s) => ({ ...s, events: s.events.map((e) => (e.id === eventId ? { ...e, sponsorship: { amountAed, reason, status: "requested", history: [{ status: "requested", at: now() }] } } : e)) })),
    advanceSponsorship: (eventId: string) =>
      update((s) => ({
        ...s,
        events: s.events.map((e) => {
          if (e.id !== eventId || !e.sponsorship) return e;
          const nextStatus = e.sponsorship.status === "requested" ? "reviewing" : "approved";
          return { ...e, sponsorship: { ...e.sponsorship, status: nextStatus, history: [...e.sponsorship.history, { status: nextStatus, at: now() }] } };
        }),
      })),
    sendChat: (communityId: string, body: string): "visible" | "pending" | "blocked" => {
      const me = state.profiles.find((p) => p.id === state.sessionUserId);
      if (!me || (me.role === "student" && ageOf(me) < 15)) return "blocked";
      const school = seed.SCHOOLS.find((x) => x.id === me.schoolId)?.name.replace(" (sample)", "") ?? "";
      update((s) => ({ ...s, chat: [...s.chat, { id: `m-${uid()}`, communityId, authorId: me.id, author: me.name, school, body, at: now(), status: "pending" }] }));
      return "pending";
    },
    logAi: (q: string, mode: string, flagged?: boolean) =>
      update((s) => ({ ...s, aiLog: [{ q: q.slice(0, 80), mode, flagged, at: now() }, ...s.aiLog].slice(0, 50) })),
  };

  return { state, ready, me, myChildren, childrenOf, guardianOf, visibleNotices, ...actions };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const store = useBuildStore();
  return <StoreCtx.Provider value={store}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore outside StoreProvider");
  return ctx;
}
