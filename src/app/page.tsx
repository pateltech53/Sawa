"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, BookOpen, Fingerprint, Globe, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { EASE, MascotLive } from "@/components/s/kit";
import { LangToggle } from "@/components/ui";
import FooterSection from "@/components/ui/footer";
import { LogoCarousel } from "@/components/ui/logo-carousel";
import { SYSTEM_MARKS } from "@/components/s/system-marks";
import { t } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export default function Landing() {
  const { state } = useStore();
  const router = useRouter();
  const L = state.lang;
  const ar = L === "ar";
  const [leaving, setLeaving] = useState<string | null>(null);
  const roles = [
    { role: "student", href: "/welcome", icon: GraduationCap, label: t(L, "student"), hint: ar ? "اكتشف الفرص والمجتمعات وجدولك" : "Your week, opportunities and communities" },
    { role: "parent", href: "/signin?role=parent", icon: ShieldCheck, label: t(L, "parent"), hint: ar ? "يدخل بالهوية الرقمية ويربط أبناءه" : "Verify with UAE PASS and link your children" },
    { role: "teacher", href: "/signin?role=teacher", icon: Users, label: t(L, "teacher"), hint: ar ? "ينشر مرة واحدة ليصل للجميع" : "Post once, reach every student and parent" },
  ];
  const go = (role: string, href: string) => { setLeaving(role); setTimeout(() => router.push(href), 420); };

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-8 pt-6">
      <header className="flex items-center justify-between">
        <span className="label-xs">UAE Hackathon 2026 · Rising Stars</span>
        <LangToggle />
      </header>

      <motion.div className="mt-8 flex flex-col items-center text-center" initial={{ opacity: 0, y: 12 }} animate={{ opacity: leaving ? 0 : 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
        { }
        <img src="/brand/logo-full.png" alt="Sawa · سوا" className="w-[96px]" />
        <h1 className="mt-6 text-[30px] font-bold leading-[1.12] tracking-tight">{t(L, "tagline")}</h1>
        <p className="mt-3 max-w-sm text-[15px] text-[var(--muted)]">{t(L, "pitch")}</p>
      </motion.div>

      <motion.div className="my-6 flex justify-center" animate={{ opacity: leaving && leaving !== "student" ? 0 : 1, y: leaving === "student" ? -30 : 0, scale: leaving === "student" ? 1.08 : 1 }} transition={{ duration: 0.45, ease: EASE }}>
        <MascotLive size={170} delay={0.2} />
      </motion.div>

      <motion.section className="mb-6 flex flex-col items-center" initial={{ opacity: 0 }} animate={{ opacity: leaving ? 0 : 1 }} transition={{ delay: 0.3 }}>
        <p className="label-xs mb-1">{ar ? "كل أنظمة المدرسة في مكان واحد" : "Every school system, one front door"}</p>
        <LogoCarousel columnCount={3} logos={SYSTEM_MARKS} />
      </motion.section>

      <section className="mt-auto" aria-labelledby="iam">
        <h2 id="iam" className="label-xs mb-2.5 px-1">{t(L, "iAm")}</h2>
        <ul className="space-y-2.5">
          {roles.map((r, i) => (
            <motion.li key={r.role} initial={{ opacity: 0, y: 14 }} animate={{ opacity: leaving && leaving !== r.role ? 0 : 1, y: 0, scale: leaving === r.role ? 1.02 : 1 }} transition={{ delay: leaving ? 0 : 0.15 + i * 0.07, duration: 0.4, ease: EASE }}>
              <motion.button whileTap={{ scale: 0.98 }} onClick={() => go(r.role, r.href)}
                className={`flex w-full items-center gap-3.5 rounded-[24px] border p-3.5 text-start transition-[box-shadow,background-color] ${r.role === "student" ? "border-white/40 bg-[image:var(--grad-brand)] text-white shadow-[var(--shadow-brand)] hover:shadow-[0_22px_46px_-18px_rgba(64,115,255,.65)]" : "glass hover:bg-white/60"}`}>
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${r.role === "student" ? "bg-white/20" : r.role === "parent" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"}`}><r.icon size={22} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[17px] font-semibold">{r.label}</span>
                  <span className={`block text-[13px] ${r.role === "student" ? "text-white/85" : "text-[var(--muted)]"}`}>{r.hint}</span>
                </span>
                <ArrowRight size={18} className="shrink-0 opacity-60 rtl:rotate-180" />
              </motion.button>
            </motion.li>
          ))}
        </ul>
      </section>

      <FooterSection
        className="-mx-5 mt-4 !pb-0"
        links={[
          { title: ar ? "للطلاب" : "Students", href: "/welcome" },
          { title: ar ? "لأولياء الأمور" : "Parents", href: "/signin?role=parent" },
          { title: ar ? "للمعلمين" : "Teachers", href: "/signin?role=teacher" },
        ]}
        socials={[
          { label: "u.ae — UAE government portal", href: "https://u.ae", icon: Globe },
          { label: "UAE PASS", href: "https://uaepass.ae", icon: Fingerprint },
          { label: ar ? "وزارة التربية والتعليم" : "Ministry of Education", href: "https://www.moe.gov.ae", icon: BookOpen },
        ]}
        note={<>{t(L, "sampleData")} · {ar ? "الدخول بالهوية الرقمية محاكاة" : "UAE PASS and school sign-in are simulated"}</>}
        copyright={ar ? "سوا · هاكاثون الإمارات" : "Sawa · UAE Hackathon 2026"}
      />
    </main>
  );
}
