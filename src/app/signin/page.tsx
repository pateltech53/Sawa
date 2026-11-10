"use client";

// UAE PASS sign-in for parents and teachers, in the same Figma language as the student
// onboarding: silk background, glass card, mascot, gradient verification moment.
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, Fingerprint, Smartphone } from "lucide-react";
import { LangToggle, Logo } from "@/components/ui";
import { MascotVideo } from "@/components/shell/MascotVideo";
import { EASE } from "@/components/s/kit";
import { t } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

function SignInInner() {
  const params = useSearchParams();
  const role = (params.get("role") as Role) || "parent";
  const router = useRouter();
  const { state, signIn } = useStore();
  const L = state.lang;
  const ar = L === "ar";
  const [step, setStep] = useState<"idle" | "waiting" | "ok">("idle");

  useEffect(() => { if (role === "student") router.replace("/welcome"); }, [role, router]);

  const go = () => {
    setStep("waiting");
    setTimeout(() => setStep("ok"), 1500);
    setTimeout(() => {
      const id = signIn(role);
      router.push(state.onboarded[id] ? "/app/today" : "/onboarding");
    }, 2600);
  };
  const name = role === "parent" ? (ar ? "خالد" : "Khalid") : ar ? "الأستاذة عائشة" : "Ms Aisha";

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-8 pt-5">
      <header className="flex items-center justify-between">
        <Link href="/" className="grid h-10 w-10 place-items-center rounded-full bg-white/45 backdrop-blur" aria-label="Back"><ArrowLeft size={18} className="rtl:rotate-180" /></Link>
        <Logo size={28} />
        <LangToggle />
      </header>

      <div className="mt-6 flex justify-center">
        <MascotVideo mood={step === "ok" ? "celebrate" : "waving"} size={190} />
      </div>

      <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="glass glass-strong -mt-4 rounded-[32px] p-6">
        <p className="label-xs">{t(L, role)}</p>
        <h1 className="mt-1 text-[26px] font-bold leading-tight tracking-tight">{ar ? "ادخل مرة واحدة، لكل شيء" : "One sign-in for everything"}</h1>
        <p className="mt-2 text-[15px] text-[var(--muted)]">
          {role === "parent"
            ? ar ? "نتحقق من هويتك، ثم نجد أبناءك ونربطهم بك تلقائياً." : "We verify you, then find your children and link them to you automatically."
            : ar ? "نتحقق منك كمعلم، ثم تجهّز مدرستك وصفوفك في دقيقة." : "We verify you as an educator, then you set up your school and classes in a minute."}
        </p>

        <div className="mt-6 min-h-[64px]">
          <AnimatePresence mode="wait">
            {step === "idle" && (
              <motion.button key="b" exit={{ opacity: 0, scale: 0.96 }} onClick={go} className="flex h-16 w-full items-center justify-center gap-3 rounded-[22px] bg-[#121217] text-[17px] font-semibold text-white shadow-[0_14px_30px_-14px_rgba(18,18,23,.7)] transition active:scale-[.98]">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-aegold-500 text-white"><Fingerprint size={20} /></span>
                {t(L, "continueUaePass")}
              </motion.button>
            )}
            {step === "waiting" && (
              <motion.div key="w" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-4 rounded-[22px] bg-white/75 p-4">
                <span className="relative grid h-12 w-12 place-items-center rounded-full bg-white">
                  <motion.span className="absolute inset-0 rounded-full border-2 border-aegold-500" animate={{ scale: [1, 1.45], opacity: [0.8, 0] }} transition={{ duration: 1.1, repeat: Infinity }} />
                  <Smartphone size={20} />
                </span>
                <div className="text-sm"><p className="font-semibold">{ar ? "وافق على الطلب في تطبيق الهوية الرقمية" : "Approve the request in the UAE PASS app"}</p><p className="text-[var(--muted)]">{ar ? "محاكاة · لا يتم الاتصال بخدمة حقيقية" : "Simulated · no real service is contacted"}</p></div>
              </motion.div>
            )}
            {step === "ok" && (
              <motion.div key="o" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 rounded-[22px] p-4 text-white" style={{ background: "var(--grad-verify)" }}>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white/20"><Check size={20} strokeWidth={3} /></span>
                <div><p className="font-semibold">{ar ? "تم التحقق من الهوية" : "Identity verified"}</p><p className="text-sm text-white/85">{name}</p></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="mt-4 text-center text-xs text-[var(--muted)]">{ar ? "محاكاة · لا تُشارك أي بيانات حقيقية" : "Simulated · no real data is shared"}</p>
      </motion.section>

      <p className="mt-auto pt-6 text-center text-xs text-[var(--muted)]">{ar ? "في التجربة الفعلية: يتصل سوا بالهوية الرقمية وبالدخول الموحد لوزارة التربية والتعليم." : "In the pilot, Sawa connects to UAE PASS and MOE Unified Login (SSO)."}</p>
    </main>
  );
}

export default function SignIn() {
  return <Suspense><SignInInner /></Suspense>;
}
