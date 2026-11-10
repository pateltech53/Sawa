"use client";

// 21st.dev "Clean minimal sign in", adapted for Sawa:
// - UAE PASS is the primary path (national identity standard); Google/Facebook/Apple buttons removed
// - email + password kept as a staff-account fallback, with inline validation
// - card sits on the app background (no full-screen white page), bilingual labels, RTL-safe icons
import * as React from "react";
import { useState } from "react";
import { CheckCircle2, Eye, EyeOff, Fingerprint, Loader2, Lock, LogIn, Mail, Smartphone } from "lucide-react";

export type SignInStep = "idle" | "waiting" | "ok";

export interface SignIn2Props {
  title?: string;
  subtitle?: string;
  roleLabel?: string;
  primaryLabel?: string;
  step?: SignInStep;
  lang?: "en" | "ar";
  onUaePass?: () => void;
  onEmailSignIn?: (email: string, password: string) => void;
  /** Hide the email fallback (e.g. students, who use school SSO). */
  emailFallback?: boolean;
  footer?: React.ReactNode;
}

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const SignIn2 = ({
  title = "Sign in",
  subtitle,
  roleLabel,
  primaryLabel = "Sign in with UAE PASS",
  step = "idle",
  lang = "en",
  onUaePass,
  onEmailSignIn,
  emailFallback = true,
  footer,
}: SignIn2Props) => {
  const ar = lang === "ar";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [showEmail, setShowEmail] = useState(false);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return setError(ar ? "أدخل البريد الإلكتروني وكلمة المرور." : "Please enter both email and password.");
    if (!validateEmail(email)) return setError(ar ? "أدخل بريداً إلكترونياً صحيحاً." : "Please enter a valid email address.");
    setError("");
    onEmailSignIn?.(email, password);
  };

  return (
    <div className="w-full rounded-[28px] border border-white/80 bg-gradient-to-b from-blue-50/70 to-white/85 p-7 text-black shadow-xl shadow-black/5 backdrop-blur-xl">
      <div className="mb-5 flex flex-col items-center text-center">
        <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-lg shadow-black/5">
          <LogIn className="h-7 w-7 text-black rtl:-scale-x-100" aria-hidden />
        </div>
        {roleLabel && <p className="mb-1 text-sm font-semibold text-[var(--muted)]">{roleLabel}</p>}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-[var(--muted)]">{subtitle}</p>}
      </div>

      {step === "idle" && (
        <button type="button" onClick={onUaePass} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-zinc-700 to-zinc-900 font-medium text-white shadow transition hover:brightness-110 active:scale-[0.99]">
          <Fingerprint size={19} aria-hidden /> {primaryLabel}
        </button>
      )}
      {step === "waiting" && (
        <div className="flex items-center gap-3 rounded-xl bg-white/80 p-4" role="status">
          <Smartphone className="animate-pulse" aria-hidden />
          <div className="text-sm">
            <p className="font-semibold">{ar ? "وافق على الطلب في تطبيقك..." : "Approve the request in your app..."}</p>
            <p className="text-[var(--muted)]">{ar ? "محاكاة: لا يتم الاتصال بخدمة حقيقية" : "Simulated: no real service is contacted"}</p>
          </div>
        </div>
      )}
      {step === "ok" && (
        <div className="flex items-center gap-3 rounded-xl bg-aegreen-50 p-4 text-aegreen-800" role="status">
          <CheckCircle2 aria-hidden /> <p className="text-sm font-semibold">{ar ? "تم التحقق من الهوية" : "Identity verified"}</p>
        </div>
      )}

      {emailFallback && step === "idle" && (
        <>
          <div className="my-4 flex w-full items-center">
            <div className="flex-grow border-t border-dashed border-zinc-300" />
            <button type="button" onClick={() => setShowEmail((v) => !v)} className="mx-2 rounded-md px-1 text-xs text-zinc-500 hover:text-zinc-800" aria-expanded={showEmail}>
              {ar ? "أو بحساب الموظف في المدرسة" : "Or use your school staff account"}
            </button>
            <div className="flex-grow border-t border-dashed border-zinc-300" />
          </div>
          {showEmail && (
            <form onSubmit={handleSignIn} className="flex w-full flex-col gap-3" noValidate>
              <label className="relative block">
                <span className="sr-only">{ar ? "البريد الإلكتروني" : "Email"}</span>
                <Mail className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden />
                <input placeholder={ar ? "البريد الإلكتروني للمدرسة" : "School email"} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pe-3 ps-10 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-200" aria-invalid={!!error} />
              </label>
              <label className="relative block">
                <span className="sr-only">{ar ? "كلمة المرور" : "Password"}</span>
                <Lock className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden />
                <input placeholder={ar ? "كلمة المرور" : "Password"} type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pe-10 ps-10 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-200" aria-invalid={!!error} />
                <button type="button" onClick={() => setShow((v) => !v)} className="absolute end-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700" aria-label={show ? (ar ? "إخفاء كلمة المرور" : "Hide password") : (ar ? "إظهار كلمة المرور" : "Show password")}>
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </label>
              <div className="flex items-center justify-between gap-2">
                {error ? <p className="text-sm text-aered-600" role="alert">{error}</p> : <span />}
                <button type="button" className="shrink-0 text-xs font-medium hover:underline" onClick={() => setError(ar ? "في التجربة، يعيد مسؤول المدرسة ضبط كلمة المرور." : "In the pilot, your school admin resets passwords.")}>
                  {ar ? "نسيت كلمة المرور؟" : "Forgot password?"}
                </button>
              </div>
              <button className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white font-medium text-zinc-900 transition hover:bg-zinc-50">
                {ar ? "متابعة" : "Continue"}
              </button>
            </form>
          )}
        </>
      )}
      {step !== "idle" && <Loader2 className="mx-auto mt-3 animate-spin text-zinc-400" size={18} aria-hidden />}
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
};

export { SignIn2 };
