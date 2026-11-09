"use client";

import Link from "next/link";
import { GraduationCap, ShieldCheck, Users, Sparkles, Database, Repeat2 } from "lucide-react";
import { Card, LangToggle, Logo, Mascot } from "@/components/ui";
import { t } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export default function Landing() {
  const { state } = useStore();
  const L = state.lang;
  const roles = [
    { role: "parent", icon: ShieldCheck, label: t(L, "parent"), hint: L === "ar" ? "يدخل بالهوية الرقمية ويربط أبناءه" : "Verifies with UAE PASS, links children" },
    { role: "student", icon: GraduationCap, label: t(L, "student"), hint: L === "ar" ? "فئة دون 15 أو 15 فما فوق" : "Under-15 or 15+ tier" },
    { role: "teacher", icon: Users, label: t(L, "teacher"), hint: L === "ar" ? "ينشر مرة واحدة ليصل للجميع" : "Posts once, reaches everyone" },
  ] as const;
  const pillars = [
    { icon: Repeat2, en: "Tell us once — AI reads documents and fills every form", ar: "أخبرنا مرة واحدة — الذكاء الاصطناعي يقرأ الوثائق ويعبّئ النماذج" },
    { icon: Sparkles, en: "Ask Sawa — answers in Arabic & English, with sources", ar: "اسأل سوا — إجابات بالعربية والإنجليزية مع المصادر" },
    { icon: Database, en: "Built on UAE open data and the UAE Design System", ar: "مبني على البيانات المفتوحة ونظام التصميم الإماراتي" },
  ];

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 pb-10 pt-5">
      <header className="flex items-center justify-between">
        <Logo />
        <LangToggle />
      </header>

      <div className="mt-6 grid items-center gap-8 md:grid-cols-[1.1fr_.9fr]">
        <div className="rise">
          <p className="chip mb-4 w-fit">🇦🇪 UAE Hackathon 2026 · Rising Stars</p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            {t(L, "tagline")}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-[var(--ink-2)]">{t(L, "pitch")}</p>
          <ul className="mt-6 space-y-2">
            {pillars.map((p, i) => (
              <li key={i} className="flex items-center gap-3 text-sm font-medium">
                <span className="jelly h-8 w-8 rounded-xl"><p.icon size={16} /></span>
                {L === "ar" ? p.ar : p.en}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative mx-auto">
          <div className="absolute inset-x-6 bottom-2 h-10 rounded-full bg-black/15 blur-2xl" />
          <Mascot size={300} />
        </div>
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-[var(--muted)]">{t(L, "iAm")}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {roles.map((r, i) => (
            <Link key={r.role} href={`/signin?role=${r.role}`} className="rise" style={{ animationDelay: `${i * 80}ms` }}>
              <Card className="flex h-full items-center gap-4 transition hover:-translate-y-0.5 hover:bg-white/60">
                <span className="jelly h-14 w-14 shrink-0"><r.icon size={26} /></span>
                <span>
                  <span className="block text-lg font-bold">{r.label}</span>
                  <span className="block text-sm text-[var(--muted)]">{r.hint}</span>
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <p className="mt-auto pt-10 text-center text-xs text-[var(--muted)]">
        {t(L, "sampleData")} · {L === "ar" ? "الدخول بالهوية الرقمية محاكاة" : "UAE PASS sign-in is simulated"}
      </p>
    </main>
  );
}
