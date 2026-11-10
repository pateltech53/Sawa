"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CLASSES } from "@/lib/seed-teacher";
import { CheckCircle2, Megaphone, Users } from "lucide-react";
import { Card, PageTitle, Pill } from "@/components/ui";
import { fmtDate } from "@/lib/i18n";
import { useStore } from "@/lib/store";

/** F8 — the teacher posts once; it lands in every student's and parent's Today. */
function PostInner() {
  const { state, me, postAnnouncement } = useStore();
  const params = useSearchParams();
  const preClass = CLASSES.find((c) => c.id === params.get("class"));
  const L = state.lang;
  const ar = L === "ar";
  const [title, setTitle] = useState(params.get("title") ?? "Grade 8 exam timetable");
  const [body, setBody] = useState(params.get("body") ?? "Science exam on Thursday, period 2. Revise chapters 3–5. Bring a calculator.");
  const [kind, setKind] = useState<"notice" | "exam" | "event">(params.get("body") ? "notice" : "exam");
  const [date, setDate] = useState(() => new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10));
  const [includeParents, setIncludeParents] = useState(true);
  const [sent, setSent] = useState<string | null>(null);
  const [grade, setGrade] = useState(preClass?.grade ?? me?.grade ?? "8");
  if (!me) return null;
  if (me.role !== "teacher") return <Card>{ar ? "للمعلمين فقط." : "Teachers only."}</Card>;

  const students = state.profiles.filter((p) => p.role === "student" && p.grade === grade && p.schoolId === me.schoolId);
  const mine = state.announcements.filter((a) => a.teacherId === me.id);

  const send = () => {
    const id = postAnnouncement({ title, body, kind, startsAt: new Date(date + "T08:00:00").toISOString(), audience: { grade, includeParents } });
    setSent(id);
    setTimeout(() => setSent(null), 4000);
  };

  return (
    <div className="space-y-4">
      <PageTitle title={ar ? "انشر مرة واحدة" : "Post once"} sub={ar ? "يصل إلى قائمة «اليوم» لكل طالب وولي أمر — بلا واتساب ولا بوابة ثانية" : "Lands in every student's and parent's Today — no WhatsApp forward, no second portal"} />
      <Card strong>
        <div className="space-y-3">
          <div className="flex gap-2" role="group" aria-label="Type">
            {(["exam", "notice", "event"] as const).map((k) => (
              <button key={k} aria-pressed={kind === k} className="chip !py-2" onClick={() => setKind(k)}>
                {k === "exam" ? (ar ? "امتحان" : "Exam") : k === "notice" ? (ar ? "إعلان" : "Notice") : ar ? "فعالية" : "Event"}
              </button>
            ))}
          </div>
          <label className="block text-sm font-semibold">{ar ? "العنوان" : "Title"}<input className="input mt-1" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
          <label className="block text-sm font-semibold">{ar ? "التفاصيل" : "Details"}<textarea className="input mt-1 min-h-24" value={body} onChange={(e) => setBody(e.target.value)} /></label>
          <label className="block text-sm font-semibold">{ar ? "التاريخ" : "Date"}<input type="date" className="input mt-1" value={date} onChange={(e) => setDate(e.target.value)} /></label>
          <div className="rounded-2xl bg-white/70 p-3">
            <p className="flex items-center gap-2 text-sm font-semibold"><Users size={16} /> {ar ? "الجمهور" : "Audience"}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[...new Set(CLASSES.map((c) => c.grade))].map((g) => (
                <button key={g} className="chip" aria-pressed={grade === g} onClick={() => setGrade(g)}>{ar ? `الصف ${g}` : `Grade ${g}`}</button>
              ))}
              <Pill tone="ink">{students.length} {ar ? "طلاب على سوا" : "students on Sawa"}</Pill>
              <button className="chip" aria-pressed={includeParents} onClick={() => setIncludeParents(!includeParents)}>{ar ? "+ أولياء الأمور" : "+ Parents"}</button>
            </div>
          </div>
          <button className="btn-ink w-full !min-h-12" onClick={send} disabled={!title.trim()}><Megaphone size={18} /> {ar ? "انشر" : "Post"}</button>
          {sent && (
            <p role="status" className="flex items-center gap-2 rounded-2xl bg-aegreen-50 p-3 text-sm font-semibold text-aegreen-800 pop">
              <CheckCircle2 size={18} /> {ar ? `وصل إلى ${students.length} طلاب${includeParents ? " وأولياء أمورهم" : ""}.` : `Delivered to ${students.length} students${includeParents ? " and their parents" : ""}.`}
            </p>
          )}
        </div>
      </Card>

      {mine.length > 0 && (
        <Card>
          <h2 className="mb-2 font-bold">{ar ? "المرسلة" : "Sent"}</h2>
          <ul className="space-y-2">
            {mine.map((a) => (
              <li key={a.id} className="rounded-2xl bg-white/70 px-4 py-3">
                <div className="flex items-center justify-between gap-2"><span className="font-semibold">{a.title}</span><Pill tone="green">{ar ? "شوهد" : "Seen"} {a.seenBy.length}/{a.recipients.length}</Pill></div>
                <p className="text-xs text-[var(--muted)]">{fmtDate(a.createdAt, L, true)} · {ar ? "الصف" : "Grade"} {a.audience.grade}{a.audience.includeParents ? (ar ? " + أولياء الأمور" : " + parents") : ""}</p>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-[var(--muted)]">{ar ? "افتح سوا كولي أمر في نافذة أخرى لترى الإعلان يصل مباشرة." : "Open Sawa as the parent in another window to watch it arrive live."}</p>
        </Card>
      )}
    </div>
  );
}

export default function Post() {
  return <Suspense><PostInner /></Suspense>;
}
