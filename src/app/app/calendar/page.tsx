"use client";

import { Card, PageTitle, SourceTag } from "@/components/ui";
import { fmtDate } from "@/lib/i18n";
import { OPPORTUNITIES } from "@/lib/seed";
import { useStore } from "@/lib/store";

/** One calendar: school timetable, LMS assignments, e-books and the competitions you joined. */
export default function Calendar() {
  const { state, me, visibleNotices } = useStore();
  const L = state.lang;
  const ar = L === "ar";
  if (!me) return null;
  const reg = OPPORTUNITIES.filter((o) => (state.registered[me.id] ?? []).includes(o.id)).map((o) => ({
    id: o.id, title: ar ? o.titleAr : o.titleEn, at: o.startsAt, source: "Sawa",
  }));
  const items = [
    ...visibleNotices.filter((n) => n.dueAt && n.status === "open").map((n) => ({ id: n.id, title: ar ? n.titleAr : n.titleEn, at: n.dueAt!, source: n.sourceSystem })),
    ...reg,
  ].sort((a, b) => a.at.localeCompare(b.at));
  const byDay = items.reduce<Record<string, typeof items>>((acc, it) => {
    const k = new Date(it.at).toDateString();
    (acc[k] ||= []).push(it);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      <PageTitle title={ar ? "التقويم" : "Calendar"} sub={ar ? "الواجبات والامتحانات والمسابقات معاً" : "Assignments, exams and competitions together"} />
      {Object.entries(byDay).map(([day, list]) => (
        <Card key={day} className="!p-4">
          <h2 className="mb-2 text-sm font-bold">{fmtDate(list[0].at, L)}</h2>
          <ul className="space-y-2">
            {list.map((i) => (
              <li key={i.id} className="flex items-center gap-2 rounded-2xl bg-white/70 px-3 py-2 text-sm">
                <SourceTag source={i.source} /> <span className="font-semibold">{i.title}</span>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
