"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight, BookOpenCheck, Building2, CalendarClock, ClipboardCheck, ClipboardPlus, Coffee, Megaphone, Sparkles, Telescope, UploadCloud, Users,
} from "lucide-react";
import { EASE } from "@/components/s/kit";
import { classStats, attendanceKey, bestOpportunitiesFor, nowAndNext, classById } from "@/lib/teacher";
import { CLASSES, EDUCATORS, INTEGRATIONS, PD } from "@/lib/seed-teacher";
import { SCHOOLS } from "@/lib/seed";
import { fmtDate, relDays } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Initials, Meter, Panel, PanelHead, SourceBadge } from "./kit";

const rise = (i: number) => ({ initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.04 * i, duration: 0.42, ease: EASE } });

export function TeacherHome() {
  const { state, me } = useStore();
  const ar = state.lang === "ar";
  const L = state.lang;
  const nn = useMemo(() => nowAndNext(), []);
  if (!me) return null;

  const school = SCHOOLS.find((s) => s.id === me.schoolId);
  const stats = CLASSES.map((c) => ({ c, s: classStats(c, state.tAssignments, state.tSubs) }));
  const toGrade = stats.reduce((n, x) => n + x.s.toGrade, 0);
  const missing = stats.reduce((n, x) => n + x.s.missing, 0);
  const pendingReq = state.requests.filter((r) => r.status !== "done").length;
  const todaysClasses = [...new Set(nn.slots.filter((s) => s.classId).map((s) => s.classId!))];
  const attendanceDue = nn.weekend ? [] : todaysClasses.filter((cid) => !state.tAttendanceSent[attendanceKey(cid)]);
  const myPosts = state.announcements.filter((a) => a.teacherId === me.id);
  const hour = new Date().getHours();
  const greet = ar ? (hour < 12 ? "صباح الخير" : "مساء الخير") : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = (ar ? me.nameAr : me.name).replace(/^(Ms|Mr|الأستاذة|الأستاذ)\s+/, "");

  const needs = [
    toGrade > 0 && { icon: BookOpenCheck, text: ar ? `${toGrade} تسليمات بانتظار التصحيح` : `${toGrade} submissions waiting for a grade`, href: "/app/classes", cta: ar ? "صحّح" : "Grade" },
    attendanceDue.length > 0 && { icon: ClipboardCheck, text: ar ? `الحضور لم يُرسل لـ ${attendanceDue.length} صفوف اليوم` : `Attendance not sent for ${attendanceDue.length} of today's classes`, href: `/app/classes/${attendanceDue[0]}?tab=attendance`, cta: ar ? "سجّل" : "Take" },
    pendingReq > 0 && { icon: Building2, text: ar ? `${pendingReq} طلبات من أولياء الأمور` : `${pendingReq} parent request${pendingReq > 1 ? "s" : ""} to review`, href: "/app/office", cta: ar ? "راجع" : "Review" },
    missing > 0 && { icon: CalendarClock, text: ar ? `${missing} أعمال متأخرة لم تُسلّم` : `${missing} overdue pieces of work not handed in`, href: "/app/classes", cta: ar ? "اعرض" : "View" },
  ].filter(Boolean) as { icon: typeof BookOpenCheck; text: string; href: string; cta: string }[];

  const quick = [
    { href: "/app/post", icon: Megaphone, en: "Post to a class", ar: "انشر لصف" },
    { href: "/app/classes?new=1", icon: ClipboardPlus, en: "New assignment", ar: "واجب جديد" },
    { href: "/app/resources?upload=1", icon: UploadCloud, en: "Upload a file", ar: "ارفع ملفاً" },
    { href: "/app/opportunities", icon: Telescope, en: "Find competitions", ar: "ابحث عن مسابقات" },
  ];

  const recs = CLASSES.flatMap((c) => bestOpportunitiesFor(c, 1).map((x) => ({ ...x, c }))).slice(0, 3);
  const suggestedPeers = EDUCATORS.filter((e) => !state.tConnections[e.id] && e.subjects.includes("Science")).slice(0, 2);
  const nextPd = PD.filter((p) => p.subjects.includes("Science") || p.subjects.includes("All")).sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))[0];

  return (
    <div className="space-y-4">
      <motion.div {...rise(0)} className="flex flex-wrap items-end justify-between gap-3 pt-1">
        <div>
          <p className="label-xs">{new Date().toLocaleDateString(ar ? "ar-AE" : "en-GB", { weekday: "long", day: "numeric", month: "long" })} · {ar ? school?.nameAr : school?.name}</p>
          <h1 className="mt-1 text-[28px] font-bold leading-tight tracking-tight sm:text-[32px]">{greet}, {firstName}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {needs.length === 0 ? (ar ? "لا شيء عاجل. يوم هادئ!" : "Nothing urgent. Enjoy the calm.") : ar ? `${needs.length} أمور تحتاجك اليوم.` : `${needs.length} things need you today.`}
          </p>
        </div>
        <div className="no-scrollbar -mx-4 flex w-[calc(100%+2rem)] gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:w-auto sm:flex-wrap sm:px-0">
          {INTEGRATIONS.slice(0, 3).map((i) => (
            <Link href="/app/data" key={i.key} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/55 py-1 pe-1 ps-2.5 text-[12px] font-semibold">
              {i.name} <SourceBadge status={i.status} />
            </Link>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_1fr]">
        <motion.div {...rise(1)}>
          <Panel className="h-full">
            <PanelHead
              title={nn.weekend ? (ar ? "جدول الأسبوع القادم" : "Your timetable (next school day)") : ar ? "جدول اليوم" : "Today's timetable"}
              sub={nn.current ? (ar ? "يحدث الآن" : "Happening now") + ` · ${nn.current.start}-${nn.current.end}` : nn.next ? (ar ? "التالي عند " : "Next at ") + nn.next.start : ar ? "انتهى اليوم الدراسي" : "School day finished"}
              action={<SourceBadge status="mock" label={ar ? "من جدول المدرسة (تجريبي)" : "School timetable (mock)"} />}
            />
            <ol className="space-y-1.5">
              {nn.slots.map((s) => {
                const cls = s.classId ? classById(s.classId) : undefined;
                const isNow = nn.current?.period === s.period;
                const isNext = !nn.current && nn.next?.period === s.period;
                const body = (
                  <>
                    <span className="w-[86px] shrink-0 text-[12px] font-semibold tabular-nums text-[var(--muted)]">{s.start}-{s.end}</span>
                    <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: cls?.color ?? "rgba(0,0,0,.15)" }} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{cls ? (ar ? cls.nameAr : cls.name) : s.label ?? (ar ? "حصة فراغ" : "Free")}</span>
                      {cls && <span className="block text-[12px] text-[var(--muted)]">{cls.room} · {cls.studentIds.length} {ar ? "طلاب" : "students"}</span>}
                    </span>
                    {isNow && <span className="rounded-full bg-pink-500 px-2 py-0.5 text-[11px] font-bold text-white">{ar ? "الآن" : "Now"}</span>}
                    {isNext && <span className="rounded-full bg-blue-500 px-2 py-0.5 text-[11px] font-bold text-white">{ar ? "التالي" : "Next"}</span>}
                    {!cls && <Coffee size={15} className="text-[var(--muted)]" aria-hidden />}
                  </>
                );
                const cls2 = `flex items-center gap-3 rounded-2xl px-3 py-2 transition ${isNow ? "bg-white shadow-sm" : "bg-white/45 hover:bg-white/75"}`;
                return <li key={s.period}>{cls ? <Link href={`/app/classes/${cls.id}`} className={cls2}>{body}</Link> : <div className={cls2}>{body}</div>}</li>;
              })}
            </ol>
          </Panel>
        </motion.div>

        <div className="space-y-4">
          <motion.div {...rise(2)}>
            <Panel>
              <PanelHead title={ar ? "يحتاجك" : "Needs you"} />
              {needs.length === 0 ? (
                <p className="rounded-2xl bg-aegreen-50 px-4 py-3 text-sm font-semibold text-aegreen-800">{ar ? "كل شيء منجز. أحسنت." : "All caught up. Nice work."}</p>
              ) : (
                <ul className="space-y-1.5">
                  {needs.map((n) => (
                    <li key={n.text}>
                      <Link href={n.href} className="flex items-center gap-3 rounded-2xl bg-white/60 px-3 py-2.5 transition hover:bg-white">
                        <n.icon size={18} className="shrink-0 text-pink-600" aria-hidden />
                        <span className="min-w-0 flex-1 text-sm font-medium">{n.text}</span>
                        <span className="text-[13px] font-semibold text-blue-700">{n.cta}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </motion.div>
          <motion.div {...rise(3)} className="grid grid-cols-2 gap-2">
            {quick.map((q) => (
              <Link key={q.href} href={q.href} className="glass flex items-center gap-2.5 rounded-2xl px-3 py-3 text-[13px] font-semibold transition hover:bg-white/70 active:scale-[0.98]">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink text-white"><q.icon size={17} aria-hidden /></span>
                {ar ? q.ar : q.en}
              </Link>
            ))}
          </motion.div>
        </div>
      </div>

      <motion.section {...rise(4)} aria-labelledby="classes-h">
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 id="classes-h" className="section-title">{ar ? "صفوفك" : "Your classes"}</h2>
          <Link href="/app/classes" className="link-info">{ar ? "الكل" : "All classes"}</Link>
        </div>
        <ul className="grid gap-3 sm:grid-cols-3">
          {stats.map(({ c, s }) => (
            <li key={c.id}>
              <Link href={`/app/classes/${c.id}`} className="glass group block rounded-[22px] p-4 transition hover:-translate-y-0.5 hover:bg-white/60">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-bold"><span className="h-3 w-3 rounded-full" style={{ background: c.color }} aria-hidden />{ar ? c.nameAr : c.name}</span>
                  <ArrowRight size={16} className="opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-80 rtl:rotate-180" aria-hidden />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-1 text-center">
                  <div><p className="text-lg font-bold tabular-nums">{s.average ?? "-"}{s.average !== null && "%"}</p><p className="text-[11px] text-[var(--muted)]">{ar ? "المتوسط" : "Average"}</p></div>
                  <div><p className={`text-lg font-bold tabular-nums ${s.toGrade ? "text-pink-600" : ""}`}>{s.toGrade}</p><p className="text-[11px] text-[var(--muted)]">{ar ? "للتصحيح" : "To grade"}</p></div>
                  <div><p className={`text-lg font-bold tabular-nums ${s.missing ? "text-aered-600" : ""}`}>{s.missing}</p><p className="text-[11px] text-[var(--muted)]">{ar ? "متأخر" : "Missing"}</p></div>
                </div>
                <div className="mt-3"><Meter value={s.submissionRate ?? 0} color={c.color} label={ar ? "نسبة التسليم" : "Submission rate"} /></div>
                <p className="mt-1.5 text-[11px] text-[var(--muted)]">{s.submissionRate ?? 0}% {ar ? "نسبة التسليم" : "handed in"} · {c.source}</p>
              </Link>
            </li>
          ))}
        </ul>
      </motion.section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div {...rise(5)}>
          <Panel className="h-full">
            <PanelHead title={ar ? "فرص تناسب طلابك" : "Opportunities that fit your students"} sub={ar ? "مطابقة حسب العمر والاهتمامات" : "Matched on age rules and interests"} action={<Link href="/app/opportunities" className="link-info">{ar ? "الكل" : "See all"}</Link>} />
            <ul className="space-y-2">
              {recs.map(({ o, e, c }) => (
                <li key={`${c.id}-${o.id}`}>
                  <Link href={`/app/opportunities?open=${o.id}&class=${c.id}`} className="flex items-center gap-3 rounded-2xl bg-white/60 p-3 transition hover:bg-white">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg" style={{ background: o.tint }} aria-hidden>
                      {o.image ? <img src={o.image} alt="" className="h-9 w-9 object-contain" /> : <Telescope size={18} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{ar ? o.titleAr : o.titleEn}</span>
                      <span className="block text-[12px] text-[var(--muted)]">{ar ? `${e.matched.length} من ${c.nameAr} مهتمون` : `${e.matched.length} in ${c.name} would love this`}{o.deadline ? ` · ${ar ? "آخر موعد" : "closes"} ${relDays(o.deadline, L)}` : ""}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </motion.div>

        <motion.div {...rise(6)}>
          <Panel className="h-full">
            <PanelHead title={ar ? "اسأل SAWA AI" : "Ask SAWA AI"} sub={ar ? "مبني على بيانات سوا المعتمدة، مع ذكر المصدر" : "Grounded in approved SAWA data, with sources"} action={<Sparkles size={18} className="text-pink-500" aria-hidden />} />
            <div className="flex flex-col gap-1.5">
              {[
                ar ? "ما المسابقات المتاحة لطلاب 14-16 سنة في دبي؟" : "What competitions are open to students aged 14-16 in Dubai?",
                ar ? "تلقيت عرض عمل من أكاديمية الخور للعلوم. ماذا يجب أن أعرف؟" : "I've received a job offer from Creek Science Academy. What should I know?",
                ar ? "اكتب رسالة لأولياء أمور 8أ عن اختبار العلوم" : "Draft a message to 8A parents about the science quiz",
              ].map((q) => (
                <Link key={q} href={`/app/ask?q=${encodeURIComponent(q)}`} dir="auto" className="rounded-2xl bg-white/60 px-3.5 py-2.5 text-[13.5px] font-medium transition hover:bg-white">{q}</Link>
              ))}
            </div>
          </Panel>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div {...rise(7)} className="lg:col-span-2">
          <Panel className="h-full">
            <PanelHead title={ar ? "منشوراتك" : "Your posts"} sub={ar ? "تصل إلى «اليوم» لدى الطلاب وأولياء الأمور" : "Lands in every student's and parent's Today"} action={<Link href="/app/post" className="btn-ink !min-h-9 !px-3.5 text-sm"><Megaphone size={15} aria-hidden /> {ar ? "جديد" : "New"}</Link>} />
            {myPosts.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">{ar ? "لم تنشر شيئاً بعد. انشر مرة واحدة ليصل للجميع، بلا رسائل واتساب." : "Nothing posted yet. Post once and it reaches everyone, no WhatsApp forwarding."}</p>
            ) : (
              <ul className="space-y-1.5">
                {myPosts.slice(0, 4).map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white/60 px-3.5 py-2.5 text-sm">
                    <span className="min-w-0"><span className="block truncate font-semibold">{p.title}</span><span className="text-[12px] text-[var(--muted)]">{fmtDate(p.createdAt, L, true)}</span></span>
                    <span className="shrink-0 text-[12px] font-semibold">{ar ? "شوهد" : "Seen"} {p.seenBy.length}/{p.recipients.length}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </motion.div>
        <motion.div {...rise(8)}>
          <Panel className="h-full">
            <PanelHead title={ar ? "شبكتك ونموّك" : "Grow & connect"} action={<Link href="/app/growth" className="link-info">{ar ? "افتح" : "Open"}</Link>} />
            <ul className="space-y-2">
              {suggestedPeers.map((e) => (
                <li key={e.id} className="flex items-center gap-2.5">
                  <Initials name={e.name} size={34} />
                  <span className="min-w-0 flex-1 text-sm"><span className="block font-semibold">{ar ? e.nameAr : e.name}</span><span className="block truncate text-[12px] text-[var(--muted)]">{e.subjects.join(", ")} · {SCHOOLS.find((s) => s.id === e.schoolId)?.name}</span></span>
                </li>
              ))}
              {nextPd && (
                <li className="rounded-2xl bg-[image:var(--grad-brand-soft)] p-3 text-sm">
                  <p className="label-xs">{ar ? "تطوير مهني قادم" : "Next PD"}</p>
                  <p className="font-semibold">{nextPd.title}</p>
                  <p className="text-[12px] text-[var(--muted)]">{fmtDate(nextPd.startsAt, L)} · {nextPd.hours}h · <SourceBadge status="sample" /></p>
                </li>
              )}
            </ul>
            <Link href="/app/growth?tab=network" className="btn-ghost mt-3 w-full !min-h-10 text-sm"><Users size={15} aria-hidden /> {ar ? "اكتشف معلمين" : "Find educators"}</Link>
          </Panel>
        </motion.div>
      </div>
    </div>
  );
}

