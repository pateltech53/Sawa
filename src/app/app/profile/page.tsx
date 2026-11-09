"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, ChevronRight, Database, FileCheck2, Languages, LogOut, RotateCcw, ShieldCheck, Users } from "lucide-react";
import { Card, PageTitle, Pill } from "@/components/ui";
import { t } from "@/lib/i18n";
import { INTERESTS, SCHOOLS } from "@/lib/seed";
import { ageOf, tierOf, useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

export default function Profile() {
  const { state, me, myChildren, setLang, signIn, signOut, reset } = useStore();
  const router = useRouter();
  const L = state.lang;
  const ar = L === "ar";
  if (!me) return null;
  const school = SCHOOLS.find((s) => s.id === me.schoolId);

  const switchTo = (r: Role) => { signIn(r); router.push("/app/today"); };
  const links = [
    { href: "/app/documents", icon: FileCheck2, label: t(L, "tellUsOnce") },
    { href: "/app/impact", icon: BarChart3, label: t(L, "impact") },
    { href: "/app/data", icon: Database, label: t(L, "dataSources") },
    ...(me.role === "parent" ? [{ href: "/app/services", icon: Users, label: t(L, "services") }] : []),
  ];

  return (
    <div className="space-y-4">
      <PageTitle title={t(L, "profile")} />
      <Card strong className="flex items-center gap-4">
        <span className="jelly h-16 w-16 rounded-full text-2xl font-bold">{me.avatar}</span>
        <div className="min-w-0">
          <p className="text-xl font-bold">{ar ? me.nameAr : me.name}</p>
          <p className="text-sm text-[var(--muted)]">{ar ? school?.nameAr : school?.name}{me.grade ? ` · ${ar ? "الصف" : "Grade"} ${me.grade}` : ""}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Pill tone="ink">{t(L, me.role)}</Pill>
            {me.role === "student" && <Pill tone="gold">{tierOf(me) === "u15" ? (ar ? `دون 15 · ${ageOf(me)}` : `Under-15 · ${ageOf(me)}`) : "15+"}</Pill>}
            {me.role !== "student" && <Pill tone="green"><ShieldCheck size={12} /> UAE PASS (sim)</Pill>}
          </div>
        </div>
      </Card>

      {me.role === "student" && (
        <Card>
          <h2 className="mb-2 font-bold">{ar ? "اهتماماتي" : "My interests"}</h2>
          <div className="flex flex-wrap gap-2">{me.interests.map((i) => { const x = INTERESTS.find((y) => y.id === i); return <span key={i} className="chip">{x?.icon} {ar ? x?.ar : x?.en}</span>; })}</div>
        </Card>
      )}
      {me.role === "parent" && (
        <Card>
          <h2 className="mb-2 font-bold">{ar ? "الأبناء المرتبطون" : "Linked children"}</h2>
          {myChildren.map((c) => <p key={c.id} className="rounded-2xl bg-white/70 px-4 py-3 font-semibold">{ar ? c.nameAr : c.name} · {ar ? "الصف" : "Grade"} {c.grade} · {ageOf(c)}</p>)}
        </Card>
      )}

      <Card className="!p-2">
        <ul>
          {links.map((l) => (
            <li key={l.href}><Link href={l.href} className="flex items-center gap-3 rounded-2xl px-3 py-3 hover:bg-white/60"><l.icon size={18} /> <span className="flex-1 font-semibold">{l.label}</span><ChevronRight size={16} className="rtl:rotate-180" /></Link></li>
          ))}
          <li><button onClick={() => setLang(ar ? "en" : "ar")} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 hover:bg-white/60"><Languages size={18} /> <span className="flex-1 text-start font-semibold">{ar ? "اللغة" : "Language"}</span><span className="chip">{t(L, "language")}</span></button></li>
        </ul>
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-[var(--muted)]">{t(L, "switchRole")}</h2>
        <div className="grid grid-cols-3 gap-2">
          {(["parent", "student", "teacher"] as Role[]).map((r) => (
            <button key={r} className={me.role === r ? "btn-ink !min-h-10 text-xs" : "btn-ghost !min-h-10 text-xs"} onClick={() => switchTo(r)}>{t(L, r).split(" /")[0]}</button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-ghost !min-h-10 text-sm" onClick={() => { if (confirm(ar ? "إعادة ضبط كل البيانات التجريبية؟" : "Reset all demo data?")) { reset(); router.push("/"); } }}><RotateCcw size={15} /> {t(L, "resetDemo")}</button>
          <button className="btn-ghost !min-h-10 text-sm" onClick={() => { signOut(); router.push("/"); }}><LogOut size={15} /> {t(L, "signOut")}</button>
        </div>
      </Card>
    </div>
  );
}
