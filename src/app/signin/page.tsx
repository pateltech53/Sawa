"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Fingerprint, School, Smartphone, CheckCircle2 } from "lucide-react";
import { Card, LangToggle, Logo, Mascot, Pill } from "@/components/ui";
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

  const go = () => {
    setStep("waiting");
    setTimeout(() => setStep("ok"), 1400);
    setTimeout(() => {
      const id = signIn(role);
      router.push(state.onboarded[id] ? "/app/today" : "/onboarding");
    }, 2200);
  };

  const isStudent = role === "student";

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-8 pt-5">
      <header className="flex items-center justify-between">
        <Link href="/" className="btn-ghost !min-h-10 !px-3" aria-label="Back"><ArrowLeft size={18} className="rtl:rotate-180" /></Link>
        <Logo size={32} />
        <LangToggle />
      </header>

      <div className="mt-6 flex justify-center"><Mascot size={150} wave /></div>

      <Card strong className="mt-4 rise">
        <p className="text-sm font-semibold text-[var(--muted)]">{t(L, role)}</p>
        <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-extrabold">
          {isStudent ? (ar ? "ادخل بحساب مدرستك" : "Sign in with your school account") : t(L, "continueUaePass")}
        </h1>
        <p className="mt-2 text-sm text-[var(--ink-2)]">
          {isStudent
            ? ar
              ? "الطلاب دون 16 سنة قد لا يملكون الهوية الرقمية. يربطك ولي أمرك الموثّق، ثم تدخل بحساب المدرسة (هوية موثّقة من ولي الأمر)."
              : "Students under 16 may not have UAE PASS. Your verified guardian links you, then you sign in with your school login (guardian-verified identity)."
            : ar
              ? "هوية رقمية واحدة لكل الأنظمة التعليمية — بدون كلمات مرور متعددة."
              : "One national identity for every education system — no more separate logins."}
        </p>

        <div className="mt-5 space-y-3">
          {step === "idle" && (
            <button className="btn-ink w-full !min-h-14 text-base" onClick={go}>
              {isStudent ? <School size={20} /> : <Fingerprint size={20} />}
              {isStudent ? (ar ? "الدخول (حساب المدرسة)" : "Continue with school login") : t(L, "continueUaePass")}
            </button>
          )}
          {step === "waiting" && (
            <div className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 pop">
              <Smartphone className="animate-pulse" />
              <div className="text-sm">
                <p className="font-semibold">{ar ? "وافق على الطلب في تطبيقك…" : "Approve the request in your app…"}</p>
                <p className="text-[var(--muted)]">{ar ? "محاكاة — لا يتم الاتصال بخدمة حقيقية" : "Simulated — no real service is contacted"}</p>
              </div>
            </div>
          )}
          {step === "ok" && (
            <div className="flex items-center gap-3 rounded-2xl bg-aegreen-50 p-4 text-aegreen-800 pop">
              <CheckCircle2 />
              <p className="text-sm font-semibold">{ar ? "تم التحقق من الهوية" : "Identity verified"}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <Pill tone="gold">{t(L, "simulated")}</Pill>
            <Pill>{ar ? "لا تُشارك أي بيانات حقيقية" : "No real data shared"}</Pill>
          </div>
        </div>
      </Card>

      <p className="mt-4 text-center text-xs text-[var(--muted)]">
        {ar ? "في التجربة الفعلية: يتصل سوا بالهوية الرقمية وبالدخول الموحد لوزارة التربية والتعليم." : "In the pilot, Sawa connects to UAE PASS and MOE Unified Login (SSO)."}
      </p>
    </main>
  );
}

export default function SignIn() {
  return <Suspense><SignInInner /></Suspense>;
}
