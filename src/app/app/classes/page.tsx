"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ClipboardPlus, Megaphone } from "lucide-react";
import { AssignmentSheet } from "@/components/t/AssignmentSheet";
import { EmptyState, Meter, PageHead, Panel, PanelHead, SourceBadge } from "@/components/t/kit";
import { CLASSES } from "@/lib/seed-teacher";
import { relDays, fmtDate } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { classById, classStats, KIND_LABEL } from "@/lib/teacher";

function ClassesInner() {
  const { state, me } = useStore();
  const params = useSearchParams();
  const router = useRouter();
  const ar = state.lang === "ar";
  const L = state.lang;
  const [open, setOpen] = useState(params.get("new") === "1");
  if (!me) return null;
  if (me.role !== "teacher") return <Panel>{ar ? "للمعلمين فقط." : "Teachers only."}</Panel>;

  const upcoming = state.tAssignments.filter((a) => new Date(a.dueAt).getTime() > Date.now() - 86_400_000).sort((a, b) => +new Date(a.dueAt) - +new Date(b.dueAt));

  return (
    <div className="space-y-4">
      <PageHead
        title={ar ? "صفوفي" : "My classes"}
        sub={ar ? "الواجبات والدرجات والحضور في مكان واحد، تُقرأ من Google Classroom وTeams." : "Assignments, grades and attendance in one place, read from Google Classroom and Teams."}
        right={
          <div className="flex gap-2">
            <Link href="/app/post" className="btn-ghost !min-h-11"><Megaphone size={16} aria-hidden /> {ar ? "انشر" : "Post once"}</Link>
            <button className="btn-ink !min-h-11" onClick={() => setOpen(true)}><ClipboardPlus size={16} aria-hidden /> {ar ? "واجب جديد" : "New assignment"}</button>
          </div>
        }
      />

      <ul className="grid gap-3 md:grid-cols-3">
        {CLASSES.map((c) => {
          const s = classStats(c, state.tAssignments, state.tSubs);
          return (
            <li key={c.id}>
              <Link href={`/app/classes/${c.id}`} className="t-card group block h-full rounded-[24px] p-4 lg-lift">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="flex items-center gap-2 text-lg font-bold"><span className="h-3 w-3 rounded-full" style={{ background: c.color }} aria-hidden />{ar ? c.nameAr : c.name}</p>
                    <p className="text-[13px] text-grey">{c.room} · {c.studentIds.length} {ar ? "طلاب" : "students"}</p>
                  </div>
                  <ArrowRight size={18} className="opacity-40 transition group-hover:opacity-90 rtl:rotate-180" aria-hidden />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5"><SourceBadge status="mock" label={`${c.source} · mock`} /></div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="t-row py-2"><dt className="text-[11px] text-grey">{ar ? "المتوسط" : "Average"}</dt><dd className="font-bold tabular-nums">{s.average ?? "-"}{s.average !== null && "%"}</dd></div>
                  <div className="t-row py-2"><dt className="text-[11px] text-grey">{ar ? "للتصحيح" : "To grade"}</dt><dd className={`font-bold tabular-nums ${s.toGrade ? "text-sawa" : ""}`}>{s.toGrade}</dd></div>
                  <div className="t-row py-2"><dt className="text-[11px] text-grey">{ar ? "متأخر" : "Missing"}</dt><dd className={`font-bold tabular-nums ${s.missing ? "text-aered-600" : ""}`}>{s.missing}</dd></div>
                </dl>
                <div className="mt-3"><Meter value={s.submissionRate ?? 0} color={c.color} label={ar ? "نسبة التسليم" : "Submission rate"} /></div>
              </Link>
            </li>
          );
        })}
      </ul>

      <Panel>
        <PanelHead title={ar ? "الواجبات القادمة" : "Coming up"} sub={ar ? "عبر كل صفوفك" : "Across all your classes"} />
        {upcoming.length === 0 ? (
          <EmptyState icon={ClipboardPlus} title={ar ? "لا واجبات قادمة" : "Nothing due"} text={ar ? "أنشئ واجباً وسيظهر للطلاب فوراً." : "Create an assignment and students see it right away."} action={<button className="btn-ink" onClick={() => setOpen(true)}>{ar ? "واجب جديد" : "New assignment"}</button>} />
        ) : (
          <ul className="divide-y divide-black/5">
            {upcoming.map((a) => {
              const c = classById(a.classId)!;
              const subs = Object.values(state.tSubs[a.id] ?? {});
              const handed = subs.filter((x) => x.status !== "missing").length;
              return (
                <li key={a.id}>
                  <button onClick={() => router.push(`/app/classes/${c.id}?tab=assignments&a=${a.id}`)} className="flex w-full items-center gap-3 rounded-xl px-1 py-2.5 text-start transition hover:bg-white/50">
                    <span className="h-9 w-1 rounded-full" style={{ background: c.color }} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{a.title}</span>
                      <span className="block text-[12px] text-grey">{ar ? c.nameAr : c.name} · {KIND_LABEL[a.kind][ar ? 1 : 0]} · {a.points} {ar ? "درجة" : "pts"}</span>
                    </span>
                    <span className="text-end text-[12px]"><span className="block font-semibold">{relDays(a.dueAt, L)}</span><span className="text-grey">{handed}/{subs.length} {ar ? "سلّموا" : "in"} · {fmtDate(a.dueAt, L)}</span></span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <AssignmentSheet open={open} onClose={() => { setOpen(false); if (params.get("new")) router.replace("/app/classes"); }} />
    </div>
  );
}

export default function Classes() {
  return <Suspense><ClassesInner /></Suspense>;
}
