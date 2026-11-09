"use client";

import { Database, ExternalLink } from "lucide-react";
import { Card, PageTitle, Pill } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { DataSource } from "@/lib/types";

// F7 — every dataset Sawa uses, its portal and freshness. Update `lastUpdated` and `status`
// when the real files are imported (see scripts/import-schools.mjs and docs/sources.md).
const SOURCES: DataSource[] = [
  { name: "Dubai private schools (KHDA)", portal: "Dubai Pulse", url: "https://www.dubaipulse.gov.ae", usedFor: "School picker, opportunity map, distance matching", lastUpdated: "Check on download", status: "sample" },
  { name: "Students, schools, teachers & staff 2018–2024", portal: "MOE Open Data", url: "https://www.moe.gov.ae/En/OpenData", usedFor: "Impact sizing (how many families one front door serves)", lastUpdated: "Check on download", status: "sample" },
  { name: "Education statistics (federal)", portal: "Bayanat (FCSC)", url: "https://bayanat.ae", usedFor: "Third source for national figures", lastUpdated: "Check on download", status: "sample" },
];

const SYSTEMS = [
  ["UAE PASS", "National digital identity — guardian & teacher sign-in"],
  ["MOE Unified Login (SSO)", "Student sign-in, guardian-verified"],
  ["Al Manhal", "Student records, re-registration, school file"],
  ["Student Portal / LMS", "Assignments, report cards"],
  ["Minhaji", "E-books"],
];

export default function DataSources() {
  const { state } = useStore();
  const ar = state.lang === "ar";
  const asked = state.aiLog.length;
  const flagged = state.aiLog.filter((l) => l.flagged).length;
  const grounded = state.aiLog.filter((l) => l.mode.startsWith("ai:") || l.mode.startsWith("retrieval")).length;

  return (
    <div className="space-y-4">
      <PageTitle title={ar ? "مصادر البيانات" : "Data sources"} sub={ar ? "البيانات المفتوحة المستخدمة داخل سوا، ومن أين تأتي" : "Open data used inside Sawa, and where it comes from"} />
      <ul className="space-y-3">
        {SOURCES.map((s) => (
          <Card as="li" key={s.name} className="!p-4">
            <div className="flex items-start gap-3">
              <span className="jelly h-10 w-10 shrink-0 rounded-xl"><Database size={18} /></span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2"><p className="font-bold">{s.name}</p><Pill tone={s.status === "imported" ? "green" : "gold"}>{s.status === "imported" ? "Imported" : "Sample rows — import pending"}</Pill></div>
                <p className="text-sm text-[var(--ink-2)]">{s.usedFor}</p>
                <p className="mt-1 text-xs text-[var(--muted)]">{s.portal} · {ar ? "آخر تحديث" : "Last updated"}: {s.lastUpdated} · <a className="inline-flex items-center gap-0.5 underline" href={s.url} target="_blank" rel="noreferrer">{ar ? "البوابة" : "Portal"} <ExternalLink size={10} /></a></p>
              </div>
            </div>
          </Card>
        ))}
      </ul>

      <Card>
        <h2 className="font-bold">{ar ? "الأنظمة التي تتصل خلال التجربة (90 يوماً)" : "Systems connected in the 90-day pilot"}</h2>
        <ul className="mt-2 space-y-1.5 text-sm">
          {SYSTEMS.map(([n, d]) => <li key={n} className="flex flex-wrap gap-2 rounded-2xl border border-dashed border-black/20 px-3 py-2"><b>{n}</b><span className="text-[var(--muted)]">{d}</span></li>)}
        </ul>
        <p className="mt-2 text-xs text-[var(--muted)]">{ar ? "في هذا النموذج تُحاكى هذه الأنظمة بموصلات تجريبية مع بيانات معنونة كعينة." : "In this prototype they are simulated by mock connectors with data labelled as sample."}</p>
      </Card>

      <Card>
        <h2 className="font-bold">{ar ? "استخدام الذكاء الاصطناعي (هذه الجلسة)" : "AI use (this session)"}</h2>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          {[[asked, ar ? "أسئلة" : "questions"], [grounded, ar ? "بمصادر" : "with sources"], [flagged, ar ? "رُفضت (أمان)" : "refused (safety)"]].map(([n, l]) => (
            <div key={String(l)} className="rounded-2xl bg-white/70 p-3"><p className="text-2xl font-extrabold">{n}</p><p className="text-[11px] text-[var(--muted)]">{l}</p></div>
          ))}
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">{ar ? "التصميم: نظام التصميم الإماراتي من هيئة تنظيم الاتصالات والحكومة الرقمية (@aegov/design-system 3.0.7)." : "Design: TDRA UAE Design System (@aegov/design-system 3.0.7)."}</p>
      </Card>
    </div>
  );
}
