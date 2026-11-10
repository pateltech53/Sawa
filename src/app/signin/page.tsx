"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SignIn2 } from "@/components/ui/clean-minimal-sign-in";
import { LangToggle, Logo, Mascot, Pill } from "@/components/ui";
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

      <div className="mt-4 rise">
        <SignIn2
          lang={L}
          step={step}
          roleLabel={t(L, role)}
          title={isStudent ? (ar ? "ادخل بحساب مدرستك" : "Sign in with your school account") : t(L, "continueUaePass")}
          subtitle={isStudent
            ? ar
              ? "الطلاب دون 16 سنة قد لا يملكون الهوية الرقمية. يربطك ولي أمرك الموثّق، ثم تدخل بحساب المدرسة."
              : "Students under 16 may not have UAE PASS. Your verified guardian links you, then you sign in with your school login."
            : role === "teacher"
              ? ar ? "هوية رقمية واحدة لصفوفك وموارد مدرستك وفرص طلابك." : "One national identity for your classes, school resources and student opportunities."
              : ar ? "هوية رقمية واحدة لكل الأنظمة التعليمية، بدون كلمات مرور متعددة." : "One national identity for every education system, no more separate logins."}
          primaryLabel={isStudent ? (ar ? "الدخول (حساب المدرسة)" : "Continue with school login") : t(L, "continueUaePass")}
          emailFallback={role === "teacher"}
          onUaePass={go}
          onEmailSignIn={go}
          footer={
            <div className="flex flex-wrap justify-center gap-2">
              <Pill tone="gold">{t(L, "simulated")}</Pill>
              <Pill>{ar ? "لا تُشارك أي بيانات حقيقية" : "No real data shared"}</Pill>
            </div>
          }
        />
      </div>

      <p className="mt-4 text-center text-xs text-[var(--muted)]">
        {ar ? "في التجربة الفعلية: يتصل سوا بالهوية الرقمية وبالدخول الموحد لوزارة التربية والتعليم." : "In the pilot, Sawa connects to UAE PASS and MOE Unified Login (SSO)."}
      </p>
    </main>
  );
}

export default function SignIn() {
  return <Suspense><SignInInner /></Suspense>;
}
