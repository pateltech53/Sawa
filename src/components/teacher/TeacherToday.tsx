"use client";

// Teacher Today — kept from the team's teacher UI (greeting card + stats, timetable
// with a "Now" marker, "Needs you", quick actions), aligned to the shared glass system.
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { CalendarPlus, ClipboardCheck, FileUp, Megaphone, PartyPopper, Search, Users } from "lucide-react";
import { EASE } from "@/components/s/kit";
import { Mascot } from "@/components/ui";
import { ProactiveCard } from "@/components/shell/notices";
import { SCHOOLS } from "@/lib/seed";
import { useStore } from "@/lib/store";

/** Sample timetable (in the pilot: the school's timetable system). */
export const TIMETABLE = [
  { start: "07:30", end: "08:20", cls: "9A Physics", room: "Lab 1", students: 8, color: "#8C59F2" },
  { start: "08:25", end: "09:15", cls: "8B Science", room: "Lab 2", students: 6, color: "#4073FF" },
  { start: "09:35", end: "10:25", cls: "Break duty", room: "Gate B", students: 0, color: "#B68A35" },
  { start: "10:30", end: "11:20", cls: "8A Science", room: "Lab 2", students: 8, color: "#4073FF" },
  { start: "11:40", end: "12:30", cls: "9A Physics", room: "Lab 1", students: 8, color: "#8C59F2" },
  { start: "12:35", end: "13:25", cls: "Planning", room: "Staff room", students: 0, color: "#7B6A59" },
];

const toMin = (hhmm: string) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };

export function TeacherToday() {
  const { state, me, visibleNotices } = useStore();
  const reduce = useReducedMotion();
  const ar = state.lang === "ar";
  if (!me) return null;
  const school = SCHOOLS.find((s) => s.id === me.schoolId);
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  // Out of school hours the demo pins "now" to 10:45 so the marker is always visible.
  const t = nowMin >= toMin("07:30") && nowMin <= toMin("13:25") ? nowMin : toMin("10:45");
  const current = TIMETABLE.find((p) => toMin(p.start) <= t && t <= toMin(p.end));
  const requests = state.requests.filter((r) => r.status !== "done").length;
  const myPosts = state.announcements.filter((a) => a.teacherId === me.id);
  const events = state.events.filter((e) => e.hostId === me.id);
  const proactive = visibleNotices.filter((n) => n.kind === "proactive" && n.status === "open" && n.userId === me.id);
  const hour = new Date().getHours();
  const greet = ar ? (hour < 12 ? "صباح الخير" : "مساء الخير") : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const needs = [
    { id: "grade", text: ar ? "19 تسليماً بانتظار التصحيح" : "19 submissions waiting for a grade", action: ar ? "صحّح" : "Grade", href: "/app/classes" },
    { id: "reg", text: ar ? "لم يُسجَّل الحضور في صفّين اليوم" : "Attendance not taken for 2 of today's classes", action: ar ? "سجّل" : "Take", href: "/app/classes" },
    ...(requests ? [{ id: "req", text: ar ? `${requests} طلبات من أولياء الأمور` : `${requests} parent request${requests > 1 ? "s" : ""} to review`, action: ar ? "راجع" : "Review", href: "/app/office" }] : []),
    { id: "late", text: ar ? "3 أعمال متأخرة لم تُسلَّم" : "3 overdue pieces of work not handed in", action: ar ? "ذكّر" : "Nudge", href: "/app/students" },
  ];

  const quick = [
    { href: "/app/post", icon: Megaphone, label: ar ? "انشر لصف" : "Post to a class" },
    { href: "/app/students?new=event", icon: PartyPopper, label: ar ? "استضف فعالية" : "Host an event" },
    { href: "/app/documents", icon: FileUp, label: ar ? "ارفع ملفاً" : "Upload a file" },
    { href: "/app/career", icon: Search, label: ar ? "ابحث عن مسابقات" : "Find competitions" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start">
      <div className="min-w-0 space-y-4">
        <motion.section initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="glass glass-strong relative overflow-hidden rounded-[30px] p-5">
          <div aria-hidden className="pointer-events-none absolute end-3 top-3"><Mascot size={96} /></div>
          <p className="label-xs relative pe-24">{new Date().toLocaleDateString(ar ? "ar-AE" : "en-GB", { weekday: "long", day: "numeric", month: "long" })} · {state.schoolBrand?.name ?? (ar ? school?.nameAr : school?.name)}</p>
          <h1 className="relative mt-1.5 pe-24 text-[28px] font-bold leading-tight tracking-tight">{greet}, {(ar ? me.nameAr : me.name).replace(/^(Ms|Mr|الأستاذة|الأستاذ)\s*/, "")}</h1>
          <p className="relative text-sm text-[var(--muted)]">{ar ? `${needs.length} أمور تحتاجك اليوم` : `${needs.length} things need you today`}</p>
          <dl className="relative mt-4 grid max-w-[460px] grid-cols-3 gap-2">
            {[["19", ar ? "للتصحيح" : "to grade"], ["2", ar ? "سجلات حضور" : "registers due"], [String(requests), ar ? "طلبات أولياء الأمور" : "parent requests"]].map(([v, k]) => (
              <div key={k} className="rounded-[20px] bg-white/70 px-3 py-3">
                <dd className={`text-[26px] font-bold leading-none ${v === "0" ? "text-black/30" : ""}`}>{v}</dd>
                <dt className="mt-1 text-xs text-[var(--muted)]">{k}</dt>
              </div>
            ))}
          </dl>
        </motion.section>

        {proactive.map((n) => <ProactiveCard key={n.id} n={n} />)}

        <section className="glass rounded-[28px] p-4 sm:p-5" aria-labelledby="tt">
          <div className="mb-1 flex items-center justify-between">
            <h2 id="tt" className="section-title">{ar ? "جدول اليوم" : "Today's timetable"}</h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-bold text-violet-800">{ar ? "محاكاة" : "Simulated"}</span>
          </div>
          {current && <p className="mb-3 text-xs text-[var(--muted)]">{ar ? "الآن" : "Happening now"} · {current.start}–{current.end}</p>}
          <ol className="space-y-2">
            {TIMETABLE.map((p) => {
              const now = p === current;
              return (
                <li key={p.start} className={`flex items-center gap-3 rounded-[18px] px-3 py-2.5 ${now ? "bg-white shadow-[0_8px_20px_-12px_rgba(18,18,23,.4)]" : "bg-white/55"}`}>
                  <span className="w-[86px] shrink-0 text-xs tabular-nums text-[var(--muted)]">{p.start}–{p.end}</span>
                  <span className="h-9 w-1 shrink-0 rounded-full" style={{ background: p.color }} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{p.cls}</span>
                    <span className="block text-xs text-[var(--muted)]">{p.room}{p.students ? ` · ${p.students} ${ar ? "طلاب" : "students"}` : ""}</span>
                  </span>
                  {now && <span className="rounded-full bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white">{ar ? "الآن" : "Now"}</span>}
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      <div className="min-w-0 space-y-4">
        <section className="glass rounded-[28px] p-4 sm:p-5" aria-labelledby="needs">
          <h2 id="needs" className="section-title mb-3">{ar ? "يحتاجك" : "Needs you"}</h2>
          <ul className="space-y-2">
            {needs.map((n) => (
              <li key={n.id} className="flex items-center gap-3 rounded-[18px] bg-white/65 px-3 py-2.5">
                <ClipboardCheck size={17} className="shrink-0 text-[var(--muted)]" />
                <span className="min-w-0 flex-1 text-sm">{n.text}</span>
                <Link href={n.href} className="shrink-0 text-sm font-semibold text-blue-700">{n.action}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label={ar ? "إجراءات سريعة" : "Quick actions"} className="grid grid-cols-2 gap-2">
          {quick.map((q) => (
            <Link key={q.href} href={q.href} className="glass flex items-center gap-2.5 rounded-[22px] p-3 transition hover:bg-white/70">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#121217] text-white" style={state.schoolBrand ? { background: state.schoolBrand.accent } : undefined}><q.icon size={17} /></span>
              <span className="text-sm font-semibold leading-tight">{q.label}</span>
            </Link>
          ))}
        </section>

        <section className="glass rounded-[28px] p-4 sm:p-5" aria-labelledby="ev">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="ev" className="section-title">{ar ? "فعالياتك" : "Your events"}</h2>
            <Link href="/app/students" className="link-info">{ar ? "الكل" : "See all"}</Link>
          </div>
          <ul className="space-y-2">
            {events.slice(0, 3).map((e) => (
              <li key={e.id} className="flex items-center gap-3 rounded-[18px] bg-white/65 px-3 py-2.5">
                <CalendarPlus size={17} className="shrink-0 text-[var(--muted)]" />
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{e.title}</span><span className="block text-xs text-[var(--muted)]"><Users size={11} className="inline" /> {e.classes.join(", ")}{e.sponsorship ? ` · ${ar ? "رعاية" : "Sponsorship"}: ${e.sponsorship.status}` : ""}</span></span>
              </li>
            ))}
          </ul>
          {myPosts.length > 0 && <p className="mt-3 text-xs text-[var(--muted)]">{ar ? "آخر منشور" : "Last post"}: {myPosts[0].title} · {ar ? "شوهد" : "seen by"} {myPosts[0].seenBy.length}/{myPosts[0].recipients.length}</p>}
        </section>
      </div>
    </div>
  );
}
