"use client";

// Teacher › Classes: each class with its next lesson, work to grade and a one-tap
// "post once" into that class. Parent requests sit here too, so nothing is in a second inbox.
import Link from "next/link";
import { BookOpenCheck, ChevronRight, Inbox, Megaphone } from "lucide-react";
import { PageTitle } from "@/components/ui";
import { TIMETABLE } from "@/components/teacher/TeacherToday";
import { useStore } from "@/lib/store";

const CLASSES = [
  { id: "8A", subject: "Science", students: 26, toGrade: 8, avg: 78, color: "#4073FF", photo: "/photos/lab.jpg" },
  { id: "8B", subject: "Science", students: 24, toGrade: 6, avg: 74, color: "#2E9E6B", photo: "/photos/circuit.jpg" },
  { id: "9A", subject: "Physics", students: 22, toGrade: 5, avg: 81, color: "#8C59F2", photo: "/photos/drafting.jpg" },
];

export default function Classes() {
  const { state, me } = useStore();
  const ar = state.lang === "ar";
  if (!me) return null;
  const requests = state.requests.filter((r) => r.status !== "done").length;
  return (
    <div className="space-y-4">
      <PageTitle title={ar ? "صفوفك" : "Your classes"} sub={ar ? "من جدول المدرسة (عينة)" : "From the school timetable (sample)"} right={<Link href="/app/post" className="btn-ink !min-h-10 text-sm"><Megaphone size={15} /> {ar ? "انشر مرة واحدة" : "Post once"}</Link>} />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CLASSES.map((c) => {
          const next = TIMETABLE.find((p) => p.cls.startsWith(c.id));
          return (
            <li key={c.id} className="glass overflow-hidden rounded-[26px]">
              <div className="relative h-28">
                <img src={c.photo} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <p className="absolute bottom-2.5 start-3 text-lg font-bold text-white">{c.id} · {c.subject}</p>
              </div>
              <div className="p-3.5">
                <dl className="grid grid-cols-3 gap-2 text-center">
                  {[[c.students, ar ? "طالب" : "students"], [c.toGrade, ar ? "للتصحيح" : "to grade"], [`${c.avg}%`, ar ? "المعدل" : "average"]].map(([v, k]) => (
                    <div key={String(k)} className="rounded-2xl bg-white/65 py-2"><dd className="text-lg font-bold">{v}</dd><dt className="text-[11px] text-[var(--muted)]">{k}</dt></div>
                  ))}
                </dl>
                {next && <p className="mt-2.5 text-xs text-[var(--muted)]">{ar ? "الحصة القادمة" : "Next lesson"}: {next.start} · {next.room}</p>}
                <div className="mt-3 flex gap-2">
                  <Link href={`/app/post?class=${c.id}`} className="btn-ghost !min-h-9 flex-1 !bg-white text-sm"><Megaphone size={14} /> {ar ? "انشر" : "Post"}</Link>
                  <Link href={`/app/students?class=${c.id}`} className="btn-ink !min-h-9 flex-1 text-sm" style={{ background: c.color }}><BookOpenCheck size={14} /> {ar ? "الطلاب" : "Students"}</Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <Link href="/app/office" className="glass flex items-center gap-3 rounded-[24px] p-4">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#121217] text-white"><Inbox size={19} /></span>
        <span className="min-w-0 flex-1"><span className="block font-semibold">{ar ? "طلبات أولياء الأمور" : "Parent requests"}</span><span className="block text-xs text-[var(--muted)]">{requests ? (ar ? `${requests} بانتظار المراجعة` : `${requests} waiting for review`) : ar ? "لا شيء معلّق" : "Nothing waiting"}</span></span>
        <ChevronRight size={18} className="rtl:rotate-180" />
      </Link>
    </div>
  );
}
