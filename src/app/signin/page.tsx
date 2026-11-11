"use client";

// UAE PASS sign-in for parents and teachers, in the same Figma language as the student
// welcome: wordmark, the mascot in front of the skyline, one frosted action.
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, Fingerprint, Smartphone } from "lucide-react";
import { LangToggle } from "@/components/ui";
import { EASE, Sheet } from "@/components/s/kit";
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
    setTimeout(() => setStep("ok"), 1600);
    setTimeout(() => {
      const id = signIn(role);
      router.push(role === "teacher" ? (state.onboarded[id] ? "/onboarding?step=school" : "/onboarding") : state.onboarded[id] ? "/app/today" : "/onboarding");
    }, 2700);
  };

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col items-center overflow-hidden px-6 pb-10 pt-6">
      <header className="flex w-full items-center justify-between">
        <Link href="/" className="grid h-10 w-10 place-items-center rounded-full bg-white/45 backdrop-blur" aria-label="Back"><ArrowLeft size={18} className="rtl:rotate-180" /></Link>
        <LangToggle />
      </header>

      <motion.img src="/brand/logo-full.png" alt="Sawa · سوا" className="mt-2 h-auto w-[104px]" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: EASE }} />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5, ease: EASE }} className="mt-5 text-center">
        <p className="label-xs">{t(L, role)}</p>
        <h1 className="h-display mt-1 text-[30px] leading-tight">{role === "parent" ? (ar ? "كل ما يخص أبناءك، بدخول واحد" : "Your children's school life, one sign-in") : ar ? "صفوفك ومدرستك، بدخول واحد" : "Your classes and school, one sign-in"}</h1>
      </motion.div>

      <motion.div className="relative mt-auto w-[150%] max-w-none" initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 1, ease: EASE }}>
        <img src="/figma/bg/mascot-dubai.png" alt="" className="mx-auto w-full select-none" draggable={false} />
      </motion.div>

      <motion.button initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5, ease: EASE }}
        onClick={go} disabled={step !== "idle"} className="btn-glass relative z-10 -mt-8 w-full max-w-[320px]">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-aegold-600 text-white"><Fingerprint size={20} /></span>
        {t(L, "continueUaePass")}
      </motion.button>
      <p className="mt-4 text-center text-xs text-[var(--muted)]">{ar ? "محاكاة · لا تُشارك أي بيانات حقيقية" : "Simulated · no real data is shared"}</p>

      <Sheet open={step !== "idle"} onClose={() => {}} title="UAE PASS">
        <AnimatePresence mode="wait">
          {step === "waiting" ? (
            <motion.div key="w" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-4 rounded-[22px] bg-white p-4">
              <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-aegold-50">
                <motion.span className="absolute inset-0 rounded-full border-2 border-aegold-500" animate={{ scale: [1, 1.45], opacity: [0.8, 0] }} transition={{ duration: 1.1, repeat: Infinity }} />
                <Smartphone size={20} />
              </span>
              <div className="text-sm"><p className="font-semibold">{ar ? "وافق على الطلب في تطبيق الهوية الرقمية" : "Approve the request in the UAE PASS app"}</p><p className="text-[var(--muted)]">{ar ? "محاكاة · لا يتم الاتصال بخدمة حقيقية" : "Simulated · no real service is contacted"}</p></div>
            </motion.div>
          ) : (
            <motion.div key="o" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 rounded-[22px] bg-[#121217] p-4 text-white">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15"><Check size={20} strokeWidth={3} /></span>
              <div><p className="font-semibold">{ar ? "تم التحقق من الهوية" : "Identity verified"}</p><p className="text-sm text-white/75">{role === "parent" ? (ar ? "خالد" : "Khalid") : ar ? "الأستاذة عائشة" : "Ms Aisha"}</p></div>
            </motion.div>
          )}
        </AnimatePresence>
      </Sheet>
    </main>
  );
}

export default function SignIn() {
  return <Suspense><SignInInner /></Suspense>;
}
