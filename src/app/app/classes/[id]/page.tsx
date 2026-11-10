"use client";

import { Suspense, use, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { ArrowLeft, Check, ClipboardCheck, ClipboardPlus, Clock, Lock, Megaphone, MessageSquareText, Send, Sparkles, Telescope, UserX } from "lucide-react";
import { Sheet, useToast } from "@/components/s/kit";
import { AssignmentSheet } from "@/components/t/AssignmentSheet";
import { EmptyState, Initials, Meter, PageHead, Panel, PanelHead, SourceBadge, Stat, Tabs, useConfirm } from "@/components/t/kit";
import { fmtDate, relDays } from "@/lib/i18n";
import { OPPORTUNITIES } from "@/lib/seed";
import { useStore, type Attendance } from "@/lib/store";
import { ageOfRoster, attendanceKey, classById, classStats, eligibility, KIND_LABEL, studentAverage, studentById } from "@/lib/teacher";
import type { RosterStudent, TAssignment } from "@/lib/types";

type Tab = "overview" | "assignments" | "gradebook" | "attendance" | "students";

function ClassInner({ id }: { id: string }) {
  const { state, me } = useStore();
  const params = useSearchParams();
  const router = useRouter();
  const ar = state.lang === "ar";
  const cls = classById(id);
  const [tab, setTab] = useState<Tab>((params.get("tab") as Tab) || "overview");
  const [grading, setGrading] = useState<string | null>(params.get("a"));
  const [student, setStudent] = useState<string | null>(params.get("student"));
  const [newOpen, setNewOpen] = useState(false);
  if (!me) return null;
  if (me.role !== "teacher") return <Panel>{ar ? "للمعلمين فقط." : "Teachers only."}</Panel>;
  if (!cls) return <EmptyState icon={UserX} title={ar ? "لم يُعثر على الصف" : "Class not found"} action={<Link href="/app/classes" className="btn-ink">{ar ? "صفوفي" : "My classes"}</Link>} />;

  const stats = classStats(cls, state.tAssignments, state.tSubs);
  const assignments = state.tAssignments.filter((a) => a.classId === cls.id).sort((a, b) => +new Date(b.dueAt) - +new Date(a.dueAt));
  const students = cls.studentIds.map(studentById).filter(Boolean) as RosterStudent[];

  return (
    <div className="space-y-4">
      <Link href="/app/classes" className="inline-flex items-center gap-1.5 text-sm font-semibold text-grey hover:text-ink"><ArrowLeft size={16} className="rtl:rotate-180" aria-hidden /> {ar ? "صفوفي" : "My classes"}</Link>
      <PageHead
        eyebrow={`${cls.subject} · ${ar ? "الصف" : "Grade"} ${cls.grade} · ${cls.room}`}
        title={ar ? cls.nameAr : cls.name}
        right={
          <div className="flex flex-wrap items-center gap-2">
            <SourceBadge status="mock" label={`${cls.source} · mock`} />
            <Link href={`/app/post?class=${cls.id}`} className="btn-ghost !min-h-10 text-sm"><Megaphone size={15} aria-hidden /> {ar ? "انشر" : "Post"}</Link>
            <button className="btn-ink !min-h-10 text-sm" onClick={() => setNewOpen(true)}><ClipboardPlus size={15} aria-hidden /> {ar ? "واجب" : "Assignment"}</button>
          </div>
        }
      />
      <Tabs<Tab>
        label={ar ? "أقسام الصف" : "Class sections"}
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "overview", label: ar ? "نظرة عامة" : "Overview" },
          { id: "assignments", label: ar ? "الواجبات" : "Assignments", count: assignments.length },
          { id: "gradebook", label: ar ? "سجل الدرجات" : "Gradebook" },
          { id: "attendance", label: ar ? "الحضور" : "Attendance" },
          { id: "students", label: ar ? "الطلاب" : "Students", count: students.length },
        ]}
      />

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
        {tab === "overview" && <Overview clsId={cls.id} stats={stats} students={students} onStudent={setStudent} onGrade={() => setTab("assignments")} />}
        {tab === "assignments" && <AssignmentList assignments={assignments} clsId={cls.id} onOpen={setGrading} onNew={() => setNewOpen(true)} />}
        {tab === "gradebook" && <Gradebook clsId={cls.id} assignments={assignments} students={students} onStudent={setStudent} />}
        {tab === "attendance" && <AttendanceTab clsId={cls.id} students={students} />}
        {tab === "students" && <Students clsId={cls.id} students={students} onStudent={setStudent} />}
      </motion.div>

      <GradingSheet asgId={grading} onClose={() => { setGrading(null); router.replace(`/app/classes/${cls.id}?tab=${tab}`); }} />
      <StudentSheet sid={student} clsId={cls.id} onClose={() => setStudent(null)} />
      <AssignmentSheet open={newOpen} onClose={() => setNewOpen(false)} classId={cls.id} />
    </div>
  );
}

function Overview({ clsId, stats, students, onStudent, onGrade }: { clsId: string; stats: ReturnType<typeof classStats>; students: RosterStudent[]; onStudent: (id: string) => void; onGrade: () => void }) {
  const { state } = useStore();
  const ar = state.lang === "ar";
  const cls = classById(clsId)!;
  const rows = students.map((s) => ({ s, ...studentAverage(s.id, cls, state.tAssignments, state.tSubs) }));
  const checkIn = rows.filter((r) => r.missing >= 2 || (r.average !== null && r.average < 60));
  const stretch = rows.filter((r) => (r.average ?? 0) >= 85 || r.s.support === "extension");
  const opp = OPPORTUNITIES.map((o) => ({ o, e: eligibility(o, cls) })).filter((x) => x.e.matched.length).sort((a, b) => b.e.matched.length - a.e.matched.length)[0];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat value={stats.average !== null ? `${stats.average}%` : "-"} label={ar ? "متوسط الصف" : "Class average"} />
        <Stat value={`${stats.submissionRate ?? 0}%`} label={ar ? "نسبة التسليم" : "Handed in"} tone="blue" />
        <Stat value={stats.toGrade} label={ar ? "بانتظار التصحيح" : "Waiting for a grade"} tone={stats.toGrade ? "blue" : "ink"} />
        <Stat value={stats.missing} label={ar ? "أعمال متأخرة" : "Overdue, not handed in"} tone={stats.missing ? "red" : "ink"} />
      </div>
      {stats.toGrade > 0 && (
        <button onClick={onGrade} className="flex w-full items-center gap-3 rounded-2xl bg-white/40 px-4 py-3 text-start text-sm font-semibold text-sawa transition hover:bg-white/60">
          <ClipboardCheck size={18} aria-hidden /> <span className="flex-1">{ar ? `${stats.toGrade} تسليمات جاهزة للتصحيح` : `${stats.toGrade} submissions are ready to grade`}</span> <span aria-hidden>{ar ? "←" : "→"}</span>
        </button>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <Panel>
          <PanelHead title={ar ? "يستحقون متابعة" : "Worth a check-in"} sub={ar ? "عملان متأخران أو أكثر، أو متوسط أقل من 60٪" : "2+ overdue pieces, or average under 60%"} />
          {checkIn.length === 0 ? <p className="text-sm text-grey">{ar ? "لا أحد الآن. رائع." : "Nobody right now."}</p> : (
            <ul className="space-y-1.5">
              {checkIn.map((r) => (
                <li key={r.s.id}><button onClick={() => onStudent(r.s.id)} className="flex w-full items-center gap-2.5 t-row px-3 py-2 text-start">
                  <Initials name={r.s.name} size={30} /><span className="flex-1 text-sm font-semibold">{ar ? r.s.nameAr : r.s.name}</span>
                  <span className="text-[12px] text-grey">{r.missing} {ar ? "متأخر" : "missing"} · {r.average ?? "-"}%</span>
                </button></li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel>
          <PanelHead title={ar ? "جاهزون لتحدٍّ أكبر" : "Ready for a stretch"} sub={ar ? "متوسط 85٪ فأكثر أو مسار إثرائي" : "85%+ average or on an extension pathway"} />
          {stretch.length === 0 ? <p className="text-sm text-grey">-</p> : (
            <ul className="flex flex-wrap gap-1.5">{stretch.map((r) => <li key={r.s.id}><button onClick={() => onStudent(r.s.id)} className="chip">{ar ? r.s.nameAr : r.s.name}</button></li>)}</ul>
          )}
          {opp && (
            <Link href={`/app/opportunities?open=${opp.o.id}&class=${clsId}`} className="mt-3 flex items-center gap-2.5 t-row px-3 py-2.5 text-sm">
              <Telescope size={17} className="text-sawa" aria-hidden />
              <span className="flex-1"><b>{ar ? opp.o.titleAr : opp.o.titleEn}</b> · {ar ? `${opp.e.matched.length} طلاب مهتمون` : `${opp.e.matched.length} students match`}</span>
            </Link>
          )}
        </Panel>
      </div>
    </div>
  );
}

function AssignmentList({ assignments, clsId, onOpen, onNew }: { assignments: TAssignment[]; clsId: string; onOpen: (id: string) => void; onNew: () => void }) {
  const { state } = useStore();
  const ar = state.lang === "ar";
  const L = state.lang;
  const cls = classById(clsId)!;
  if (!assignments.length) return <EmptyState icon={ClipboardPlus} title={ar ? "لا واجبات بعد" : "No assignments yet"} action={<button className="btn-ink" onClick={onNew}>{ar ? "واجب جديد" : "New assignment"}</button>} />;
  return (
    <ul className="space-y-2">
      {assignments.map((a) => {
        const subs = cls.studentIds.map((sid) => state.tSubs[a.id]?.[sid]);
        const handed = subs.filter((x) => x && x.status !== "missing").length;
        const toGrade = subs.filter((x) => x?.status === "submitted" || x?.status === "late").length;
        return (
          <li key={a.id}>
            <button onClick={() => onOpen(a.id)} className="t-card flex w-full flex-wrap items-center gap-3 rounded-[20px] p-3.5 text-start transition hover:bg-white/35">
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-1.5"><span className="font-semibold">{a.title}</span>{a.returned && <span className="rounded-full bg-aegreen-100 px-2 py-0.5 text-[11px] font-semibold text-aegreen-800">{ar ? "أُعيدت" : "Returned"}</span>}</span>
                <span className="block text-[12px] text-grey">{KIND_LABEL[a.kind][ar ? 1 : 0]} · {a.points} {ar ? "درجة" : "pts"} · {ar ? "التسليم" : "due"} {fmtDate(a.dueAt, L)} ({relDays(a.dueAt, L)})</span>
              </span>
              <span className="w-28"><Meter value={handed} max={cls.studentIds.length} color={cls.color} label={ar ? "سلّموا" : "Handed in"} /><span className="mt-1 block text-[11px] text-grey">{handed}/{cls.studentIds.length} {ar ? "سلّموا" : "handed in"}</span></span>
              {toGrade > 0 && <span className="rounded-full bg-sawa px-2.5 py-1 text-[12px] font-bold text-white">{toGrade} {ar ? "للتصحيح" : "to grade"}</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

const STATUS_STYLE: Record<string, string> = {
  graded: "bg-aegreen-100 text-aegreen-800",
  submitted: "bg-sawa/12 text-sawa",
  late: "bg-aegold-100 text-aegold-800",
  missing: "bg-aered-100 text-aered-800",
};
const STATUS_LABEL: Record<string, [string, string]> = { graded: ["Graded", "مصحّح"], submitted: ["Handed in", "مُسلّم"], late: ["Late", "متأخر"], missing: ["Missing", "لم يُسلّم"] };

function GradingSheet({ asgId, onClose }: { asgId: string | null; onClose: () => void }) {
  const { state, setSubmission, returnGrades } = useStore();
  const toast = useToast();
  const { ask, ui } = useConfirm();
  const ar = state.lang === "ar";
  const a = state.tAssignments.find((x) => x.id === asgId);
  const cls = a ? classById(a.classId) : undefined;
  const [onlyToGrade, setOnlyToGrade] = useState(false);
  if (!a || !cls) return <Sheet open={false} onClose={onClose}>{null}</Sheet>;
  const rows = cls.studentIds.map((sid) => ({ s: studentById(sid)!, sub: state.tSubs[a.id]?.[sid] ?? { status: "missing" as const } }));
  const shown = onlyToGrade ? rows.filter((r) => r.sub.status === "submitted" || r.sub.status === "late") : rows;
  const graded = rows.filter((r) => r.sub.status === "graded").length;

  return (
    <>
      <Sheet open={!!asgId} onClose={onClose} title={a.title}>
        <p className="-mt-2 mb-3 text-sm text-grey">{ar ? cls.nameAr : cls.name} · {a.points} {ar ? "درجة" : "points"} · {graded}/{rows.length} {ar ? "مصحّح" : "graded"}</p>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={onlyToGrade} onChange={(e) => setOnlyToGrade(e.target.checked)} className="rounded" /> {ar ? "أظهر غير المصحّح فقط" : "Only show work waiting for a grade"}</label>
        <ul className="space-y-1.5">
          {shown.map(({ s, sub }, i) => (
            <li key={s.id} className="rounded-2xl bg-white px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <Initials name={s.name} size={30} />
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{ar ? s.nameAr : s.name}</span><span className={`inline-block rounded-full px-1.5 text-[10.5px] font-semibold ${STATUS_STYLE[sub.status]}`}>{STATUS_LABEL[sub.status][ar ? 1 : 0]}</span></span>
                <label className="flex items-center gap-1 text-sm">
                  <span className="sr-only">{ar ? `درجة ${s.nameAr}` : `Score for ${s.name}`}</span>
                  <input
                    inputMode="numeric"
                    data-grade-row={i}
                    className="w-16 rounded-xl border border-black/10 bg-zinc-50 px-2 py-1.5 text-center font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-300"
                    value={sub.score ?? ""}
                    placeholder="-"
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9]/g, "");
                      if (v === "") return setSubmission(a.id, s.id, { score: undefined, status: sub.status === "graded" ? "submitted" : sub.status });
                      setSubmission(a.id, s.id, { score: Math.min(a.points, +v) });
                    }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); document.querySelector<HTMLInputElement>(`[data-grade-row="${i + 1}"]`)?.focus(); } }}
                  />
                  <span className="text-grey">/{a.points}</span>
                </label>
              </div>
              {sub.status === "graded" && (
                <input className="mt-2 w-full rounded-xl border border-black/5 bg-zinc-50 px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder={ar ? "ملاحظة قصيرة (اختياري)" : "Short feedback (optional)"} value={sub.feedback ?? ""} onChange={(e) => setSubmission(a.id, s.id, { feedback: e.target.value.slice(0, 160) })} />
              )}
            </li>
          ))}
          {shown.length === 0 && <li className="rounded-2xl bg-aegreen-50 px-4 py-3 text-sm font-semibold text-aegreen-800">{ar ? "لا شيء بانتظار التصحيح." : "Nothing left to grade."}</li>}
        </ul>
        <div className="sticky bottom-0 -mx-5 mt-4 bg-[#f3f1ee] px-5 pt-3">
          <button className="btn-ink w-full" disabled={!graded} onClick={() => ask({
            title: ar ? "إعادة الدرجات للطلاب؟" : "Return grades to students?",
            body: ar ? `سيرى ${graded} طلاب درجاتهم وملاحظاتك، وستُرسل إلى ${cls.source} (محاكاة).` : `${graded} students will see their score and your feedback. Grades sync to ${cls.source} (simulated).`,
            confirm: ar ? "أعد الدرجات" : "Return grades",
            run: () => { returnGrades(a.id); toast(ar ? "أُعيدت الدرجات" : "Grades returned to students"); },
          })}>
            <Send size={16} aria-hidden /> {a.returned ? (ar ? "أعد الإرسال" : "Return again") : ar ? "أعد الدرجات" : "Return grades"} ({graded})
          </button>
        </div>
      </Sheet>
      {ui}
    </>
  );
}

function Gradebook({ clsId, assignments, students, onStudent }: { clsId: string; assignments: TAssignment[]; students: RosterStudent[]; onStudent: (id: string) => void }) {
  const { state, setSubmission } = useStore();
  const ar = state.lang === "ar";
  const cls = classById(clsId)!;
  const cols = [...assignments].reverse();
  if (!cols.length) return <EmptyState icon={ClipboardPlus} title={ar ? "لا واجبات بعد" : "No assignments yet"} />;
  return (
    <Panel className="!p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
          <caption className="sr-only">{ar ? "سجل الدرجات" : "Gradebook"}</caption>
          <thead>
            <tr className="text-[12px] text-grey">
              <th scope="col" className="sticky start-0 z-10 bg-[#efece7] px-3 py-2.5 text-start font-semibold">{ar ? "الطالب" : "Student"}</th>
              {cols.map((a) => <th key={a.id} scope="col" className="min-w-[96px] px-2 py-2.5 text-center font-semibold"><span className="line-clamp-2">{a.title}</span><span className="font-normal">/{a.points}</span></th>)}
              <th scope="col" className="px-3 py-2.5 text-center font-semibold">{ar ? "المتوسط" : "Avg"}</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const avg = studentAverage(s.id, cls, state.tAssignments, state.tSubs).average;
              return (
                <tr key={s.id} className="group">
                  <th scope="row" className="sticky start-0 z-10 border-t border-black/5 bg-[#f5f3ef] px-3 py-1.5 text-start font-semibold group-hover:bg-white/70">
                    <button onClick={() => onStudent(s.id)} className="hover:underline">{ar ? s.nameAr : s.name}</button>
                  </th>
                  {cols.map((a) => {
                    const sub = state.tSubs[a.id]?.[s.id] ?? { status: "missing" as const };
                    return (
                      <td key={a.id} className="border-t border-black/5 px-1.5 py-1.5 text-center">
                        <input
                          aria-label={`${s.name}, ${a.title}`}
                          inputMode="numeric"
                          className={`w-14 rounded-lg px-1 py-1 text-center font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-300 ${sub.status === "graded" ? "bg-white" : sub.status === "missing" ? "bg-aered-50 text-aered-700 placeholder:text-aered-400" : "bg-sawa/12 placeholder:text-blue-500"}`}
                          value={sub.score ?? ""}
                          placeholder={sub.status === "missing" ? "M" : sub.status === "late" ? "L" : "In"}
                          onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ""); setSubmission(a.id, s.id, v === "" ? { score: undefined } : { score: Math.min(a.points, +v) }); }}
                        />
                      </td>
                    );
                  })}
                  <td className={`border-t border-black/5 px-3 py-1.5 text-center font-bold tabular-nums ${avg !== null && avg < 60 ? "text-aered-600" : ""}`}>{avg ?? "-"}{avg !== null && "%"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="flex flex-wrap gap-3 border-t border-black/5 px-3 py-2 text-[11px] text-grey">
        <span>M = {ar ? "لم يُسلّم" : "missing"}</span><span>L = {ar ? "متأخر" : "late"}</span><span>In = {ar ? "مُسلّم، بانتظار الدرجة" : "handed in, needs a grade"}</span><span>{ar ? "التعديلات تُحفظ تلقائياً" : "Changes save automatically"}</span>
      </p>
    </Panel>
  );
}

function AttendanceTab({ clsId, students }: { clsId: string; students: RosterStudent[] }) {
  const { state, setAttendance, markAllPresent, submitAttendance } = useStore();
  const toast = useToast();
  const { ask, ui } = useConfirm();
  const ar = state.lang === "ar";
  const L = state.lang;
  const key = attendanceKey(clsId);
  const sent = state.tAttendanceSent[key];
  const [editing, setEditing] = useState(false);
  const marks = state.tAttendance[key] ?? {};
  const locked = !!sent && !editing;
  const counts = {
    present: students.filter((s) => (marks[s.id] ?? "present") === "present").length,
    absent: students.filter((s) => marks[s.id] === "absent").length,
    late: students.filter((s) => marks[s.id] === "late").length,
  };
  const opts: { v: Attendance; en: string; ar: string; cls: string; icon: typeof Check }[] = [
    { v: "present", en: "Present", ar: "حاضر", cls: "bg-aegreen-600 text-white", icon: Check },
    { v: "late", en: "Late", ar: "متأخر", cls: "bg-aegold-500 text-white", icon: Clock },
    { v: "absent", en: "Absent", ar: "غائب", cls: "bg-aered-600 text-white", icon: UserX },
  ];
  return (
    <Panel>
      <PanelHead
        title={ar ? "حضور اليوم" : "Today's attendance"}
        sub={`${fmtDate(new Date().toISOString(), L)} · ${counts.present} ${ar ? "حاضر" : "present"} · ${counts.late} ${ar ? "متأخر" : "late"} · ${counts.absent} ${ar ? "غائب" : "absent"}`}
        action={sent ? <span className="inline-flex items-center gap-1 rounded-full bg-aegreen-100 px-2.5 py-1 text-[12px] font-semibold text-aegreen-800"><Lock size={12} aria-hidden /> {ar ? "أُرسل" : "Sent"} {new Date(sent).toLocaleTimeString(ar ? "ar-AE" : "en-GB", { hour: "2-digit", minute: "2-digit" })}</span> : <SourceBadge status="mock" label={ar ? "إلى نظام المدرسة (محاكاة)" : "To school MIS (simulated)"} />}
      />
      {!locked && <button className="chip mb-3" onClick={() => markAllPresent(key, students.map((s) => s.id))}><Check size={14} aria-hidden /> {ar ? "الجميع حاضر" : "Everyone present"}</button>}
      <ul className="space-y-1.5">
        {students.map((s) => {
          const cur = marks[s.id] ?? "present";
          return (
            <li key={s.id} className="flex flex-wrap items-center gap-2.5 t-row px-3 py-2">
              <Initials name={s.name} size={30} />
              <span className="min-w-0 flex-1 text-sm font-semibold">{ar ? s.nameAr : s.name}</span>
              <div role="radiogroup" aria-label={ar ? `حضور ${s.nameAr}` : `Attendance for ${s.name}`} className="flex gap-1">
                {opts.map((o) => (
                  <button key={o.v} role="radio" aria-checked={cur === o.v} disabled={locked} onClick={() => setAttendance(key, s.id, o.v)}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] font-semibold transition disabled:opacity-60 ${cur === o.v ? o.cls : "bg-black/5 text-ink/70 hover:bg-black/10"}`}>
                    <o.icon size={12} aria-hidden /> <span className="hidden sm:inline">{ar ? o.ar : o.en}</span>
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex gap-2">
        {locked ? (
          <button className="btn-ghost w-full" onClick={() => setEditing(true)}>{ar ? "تعديل" : "Edit attendance"}</button>
        ) : (
          <button className="btn-ink w-full" onClick={() => ask({
            title: ar ? "إرسال الحضور؟" : "Send attendance?",
            body: ar ? `${counts.absent} غائب و${counts.late} متأخر. يُبلَّغ أولياء أمور الغائبين عبر سوا.` : `${counts.absent} absent and ${counts.late} late. Guardians of absent students are notified through Sawa (simulated).`,
            confirm: ar ? "أرسل" : "Send to school system",
            run: () => { submitAttendance(key); setEditing(false); toast(ar ? "أُرسل الحضور" : "Attendance sent"); },
          })}>
            <Send size={16} aria-hidden /> {ar ? "أرسل إلى نظام المدرسة" : "Send to school system"}
          </button>
        )}
      </div>
      {ui}
    </Panel>
  );
}

function Students({ clsId, students, onStudent }: { clsId: string; students: RosterStudent[]; onStudent: (id: string) => void }) {
  const { state } = useStore();
  const ar = state.lang === "ar";
  const cls = classById(clsId)!;
  const [q, setQ] = useState("");
  const list = students.filter((s) => `${s.name} ${s.nameAr}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-3">
      <input className="input" placeholder={ar ? "ابحث عن طالب" : "Search students"} value={q} onChange={(e) => setQ(e.target.value)} aria-label={ar ? "ابحث عن طالب" : "Search students"} />
      <ul className="grid gap-2 sm:grid-cols-2">
        {list.map((s) => {
          const st = studentAverage(s.id, cls, state.tAssignments, state.tSubs);
          return (
            <li key={s.id}>
              <button onClick={() => onStudent(s.id)} className="t-card flex w-full items-center gap-3 rounded-[20px] p-3 text-start transition hover:bg-white/35">
                <Initials name={s.name} size={40} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 font-semibold">{ar ? s.nameAr : s.name}{s.support && <span className="rounded-full bg-white/60 px-1.5 text-[10.5px] font-semibold text-ink">{s.support === "extension" ? (ar ? "إثراء" : "Extension") : (ar ? "دعم" : "Support")}</span>}</span>
                  <span className="block truncate text-[12px] text-grey">{ar ? "العمر" : "Age"} {ageOfRoster(s)} · {s.interests.join(", ")}</span>
                </span>
                <span className="text-end text-[12px]"><span className="block font-bold tabular-nums">{st.average ?? "-"}{st.average !== null && "%"}</span>{st.missing > 0 && <span className="text-aered-600">{st.missing} {ar ? "متأخر" : "missing"}</span>}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {list.length === 0 && <EmptyState icon={UserX} title={ar ? "لا نتائج" : "No students match"} />}
      <p className="text-[12px] text-grey">{ar ? "يرى المعلم فقط بيانات طلاب صفوفه. لا تُعرض معلومات صحية أو عائلية." : "You only see students in your own classes. No health or family details are shown."}</p>
    </div>
  );
}

function StudentSheet({ sid, clsId, onClose }: { sid: string | null; clsId: string; onClose: () => void }) {
  const { state } = useStore();
  const ar = state.lang === "ar";
  const s = sid ? studentById(sid) : undefined;
  const cls = classById(clsId)!;
  if (!s) return <Sheet open={false} onClose={onClose}>{null}</Sheet>;
  const st = studentAverage(s.id, cls, state.tAssignments, state.tSubs);
  const age = ageOfRoster(s);
  const matches = OPPORTUNITIES.filter((o) => age >= o.minAge && (!o.maxAge || age <= o.maxAge) && o.interests.some((i) => s.interests.includes(i))).slice(0, 3);
  const work = state.tAssignments.filter((a) => a.classId === cls.id).slice(0, 5);
  const hasAccount = state.profiles.some((p) => p.id === s.id);
  return (
    <Sheet open={!!sid} onClose={onClose} title={ar ? s.nameAr : s.name}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Initials name={s.name} size={52} />
          <div className="text-sm">
            <p>{ar ? cls.nameAr : cls.name} · {ar ? "العمر" : "Age"} {age}</p>
            <p className="text-grey">{hasAccount ? (ar ? "يستخدم سوا" : "Uses Sawa") : (ar ? "لا يملك حساباً في سوا بعد" : "Not on Sawa yet (sample roster row)")}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Stat value={st.average !== null ? `${st.average}%` : "-"} label={ar ? "المتوسط" : "Average"} />
          <Stat value={st.missing} label={ar ? "أعمال متأخرة" : "Missing work"} tone={st.missing ? "red" : "ink"} />
        </div>
        <div>
          <p className="label-xs mb-1.5">{ar ? "آخر الأعمال" : "Recent work"}</p>
          <ul className="space-y-1">
            {work.map((a) => {
              const sub = state.tSubs[a.id]?.[s.id] ?? { status: "missing" as const };
              return <li key={a.id} className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 text-[13px]"><span className="truncate">{a.title}</span><span className={`shrink-0 rounded-full px-2 text-[11px] font-semibold ${STATUS_STYLE[sub.status]}`}>{sub.score !== undefined ? `${sub.score}/${a.points}` : STATUS_LABEL[sub.status][ar ? 1 : 0]}</span></li>;
            })}
          </ul>
        </div>
        <div>
          <p className="label-xs mb-1.5">{ar ? "فرص تناسبه" : "Opportunities that fit"}</p>
          {matches.length === 0 ? <p className="text-sm text-grey">-</p> : (
            <ul className="space-y-1">
              {matches.map((o) => <li key={o.id}><Link href={`/app/opportunities?open=${o.id}&class=${cls.id}`} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-[13px] font-semibold hover:bg-sawa/12"><Telescope size={14} className="text-sawa" aria-hidden />{ar ? o.titleAr : o.titleEn}</Link></li>)}
            </ul>
          )}
        </div>
        <Link href={`/app/ask?q=${encodeURIComponent(ar ? `اكتب رسالة لطيفة لولي أمر طالب في ${cls.nameAr} لديه ${st.missing} أعمال متأخرة` : `Draft a kind message to the parent of a student in ${cls.name} who has ${st.missing} missing assignments`)}`} className="btn-ghost w-full !bg-white">
          <MessageSquareText size={16} aria-hidden /> {ar ? "صياغة رسالة لولي الأمر" : "Draft a note to the guardian"} <Sparkles size={14} className="text-sawa" aria-hidden />
        </Link>
        <p className="text-[12px] text-grey">{ar ? "لا يُرسل اسم الطالب إلى الذكاء الاصطناعي." : "The student's name is not sent to the AI."}</p>
      </div>
    </Sheet>
  );
}

export default function ClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Suspense><ClassInner id={id} /></Suspense>;
}
