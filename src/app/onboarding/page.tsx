"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Lock, ShieldCheck, UserCheck } from "lucide-react";
import { Card, LangToggle, Logo, Mascot, Pill } from "@/components/ui";
import { INTERESTS, SCHOOLS } from "@/lib/seed";
import { ageOf, tierOf, useStore } from "@/lib/store";

export default function Onboarding() {
  const router = useRouter();
  const { state, ready, me, myChildren, finishOnboarding } = useStore();
  const ar = state.lang === "ar";
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<string[]>([]);
  const [autoApproveSchool, setAutoApproveSchool] = useState(true);

  useEffect(() => {
    if (ready && !me) router.replace("/");
    if (me) setInterests(me.interests);
  }, [ready, me, router]);
  if (!me) return null;

  const school = SCHOOLS.find((s) => s.id === me.schoolId);
  const steps =
    me.role === "student" ? ["profile", "interests", "safety", "done"] : me.role === "parent" ? ["verified", "children", "controls", "done"] : ["verified", "classes", "done"];
  const cur = steps[step];
  const next = () => (step < steps.length - 1 ? setStep(step + 1) : (finishOnboarding(me.role === "student" ? { interests } : undefined), router.push("/app/today")));

  const mascotLine: Record<string, [string, string]> = {
    profile: ["I already know the basics from your school record — no typing!", "أعرف بياناتك الأساسية من سجل المدرسة — لا حاجة للكتابة!"],
    interests: ["What do you love? I'll find clubs and competitions that match.", "ماذا تحب؟ سأجد لك أندية ومسابقات تناسبك."],
    safety: ["Here's how Sawa keeps you safe.", "هكذا يحافظ سوا على سلامتك."],
    verified: ["You're verified. I pulled your details from your national identity.", "تم التحقق منك. جلبت بياناتك من الهوية الوطنية."],
    children: ["These are your linked children.", "هؤلاء أبناؤك المرتبطون."],
    controls: ["You decide what needs your approval.", "أنت تقرر ما يحتاج إلى موافقتك."],
    classes: ["Your classes come straight from the school timetable.", "صفوفك مأخوذة مباشرة من جدول المدرسة."],
    done: ["All set! Welcome to Sawa.", "كل شيء جاهز! أهلاً بك في سوا."],
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-8 pt-5">
      <header className="flex items-center justify-between">
        <Logo size={32} />
        <LangToggle />
      </header>

      <div className="mt-4 flex gap-1.5" aria-label={`Step ${step + 1} of ${steps.length}`}>
        {steps.map((s, i) => <span key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-black" : "bg-black/15"}`} />)}
      </div>

      <div className="mt-5 flex items-end gap-3">
        <Mascot size={92} wave={cur === "done"} />
        <div className="glass glass-strong mb-6 rounded-3xl rounded-bl-md px-4 py-3 text-sm font-medium pop" key={cur}>
          {mascotLine[cur][ar ? 1 : 0]}
        </div>
      </div>

      <Card strong className="rise mt-1" key={cur + "c"}>
        {cur === "profile" && (
          <div className="space-y-3">
            <h1 className="text-xl font-bold">{ar ? "ملفك الشخصي" : "Your profile"}</h1>
            {[
              [ar ? "الاسم" : "Name", ar ? me.nameAr : me.name],
              [ar ? "المدرسة" : "School", ar ? school?.nameAr : school?.name],
              [ar ? "الصف" : "Grade", me.grade],
              [ar ? "العمر" : "Age", String(ageOf(me))],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
                <span className="text-sm text-[var(--muted)]">{k}</span>
                <span className="flex items-center gap-2 font-semibold">{v} <Lock size={14} className="opacity-40" /></span>
              </div>
            ))}
            <Pill tone="green"><Check size={12} /> {ar ? "معبّأ مسبقاً · 0 حقول مكتوبة" : "Pre-filled · 0 fields typed"}</Pill>
          </div>
        )}

        {cur === "interests" && (
          <div>
            <h1 className="text-xl font-bold">{ar ? "اختر اهتماماتك" : "Pick your interests"}</h1>
            <p className="mb-3 text-sm text-[var(--muted)]">{ar ? "تساعدنا على اقتراح الأندية والفعاليات والهاكاثونات." : "They help us suggest clubs, events and hackathons."}</p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => {
                const on = interests.includes(i.id);
                return (
                  <button key={i.id} aria-pressed={on} className="chip !py-2 !text-sm" onClick={() => setInterests(on ? interests.filter((x) => x !== i.id) : [...interests, i.id])}>
                    {ar ? i.ar : i.en}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {cur === "safety" && (
          <div className="space-y-3">
            <h1 className="text-xl font-bold">{tierOf(me) === "u15" ? (ar ? "فئة دون 15 سنة" : "Under-15 tier") : (ar ? "فئة 15 سنة فأكثر" : "15+ tier")}</h1>
            <ul className="space-y-2 text-sm">
              {(tierOf(me) === "u15"
                ? ar
                  ? ["أندية مدرستك وفعالياتها ✔", "الأنشطة خارج المدرسة تحتاج موافقة ولي الأمر", "لا منشورات عامة ولا رسائل خاصة", "لا متابعين ولا إعجابات"]
                  : ["Your school's clubs and events ✔", "Outside-school activities need your guardian's OK", "No public posts and no direct messages", "No followers, no likes"]
                : ar
                  ? ["مجتمعات مشتركة بين المدارس مع إشراف", "المنشورات تُراجع قبل الظهور"]
                  : ["Moderated cross-school communities", "Posts are reviewed before they appear"]
              ).map((x) => <li key={x} className="flex gap-2 rounded-2xl bg-white/70 px-4 py-3"><ShieldCheck size={18} className="shrink-0" /> {x}</li>)}
            </ul>
            <p className="text-xs text-[var(--muted)]">{ar ? "مصمّم مع مراعاة قانون حماية القاصرين على وسائل التواصل (قرار مجلس الوزراء 106 لسنة 2026)." : "Designed with the under-15 social media rules in mind (Cabinet Resolution 106 of 2026)."}</p>
          </div>
        )}

        {cur === "verified" && (
          <div className="space-y-3">
            <Pill tone="green"><UserCheck size={12} /> {me.role === "parent" ? (ar ? "ولي أمر موثّق · الهوية الرقمية (محاكاة)" : "Verified guardian · UAE PASS (simulated)") : (ar ? "معلم موثّق · الهوية الرقمية (محاكاة)" : "Verified educator · UAE PASS (simulated)")}</Pill>
            <h1 className="text-xl font-bold">{ar ? me.nameAr : me.name}</h1>
            <p className="text-sm text-[var(--ink-2)]">{ar ? school?.nameAr : school?.name}</p>
          </div>
        )}

        {cur === "children" && (
          <div className="space-y-3">
            <h1 className="text-xl font-bold">{ar ? "الأبناء المرتبطون" : "Linked children"}</h1>
            {myChildren.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-2xl bg-white/70 p-3">
                <span className="jelly h-11 w-11 text-lg font-bold">{c.avatar}</span>
                <div className="flex-1">
                  <p className="font-semibold">{ar ? c.nameAr : c.name} · {ageOf(c)}</p>
                  <p className="text-xs text-[var(--muted)]">{ar ? "الصف" : "Grade"} {c.grade} · {tierOf(c) === "u15" ? (ar ? "فئة دون 15" : "Under-15 tier") : "15+"}</p>
                </div>
                <Pill tone="green"><Check size={12} /></Pill>
              </div>
            ))}
            <p className="text-xs text-[var(--muted)]">{ar ? "الربط عبر الهوية الرقمية لولي الأمر (محاكاة)." : "Linked through the guardian's UAE PASS (simulated)."}</p>
          </div>
        )}

        {cur === "controls" && (
          <div className="space-y-3">
            <h1 className="text-xl font-bold">{ar ? "الضوابط" : "Controls"}</h1>
            {[
              [ar ? "أنشطة خارج المدرسة تحتاج موافقتي" : "Outside-school activities need my approval", true, () => {}],
              [ar ? "الموافقة التلقائية على أندية المدرسة" : "Auto-approve my child's own school clubs", autoApproveSchool, () => setAutoApproveSchool(!autoApproveSchool)],
            ].map(([label, on, fn], i) => (
              <button key={i} onClick={fn as () => void} disabled={i === 0} className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white/70 px-4 py-3 text-start text-sm">
                {label as string}
                <span role="switch" aria-checked={on as boolean} className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-black" : "bg-black/20"}`}>
                  <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${on ? "start-6" : "start-1"}`} />
                </span>
              </button>
            ))}
            <p className="text-xs text-[var(--muted)]">{ar ? "الخيار الأول إلزامي للأبناء دون 15 سنة." : "The first is always on for children under 15."}</p>
          </div>
        )}

        {cur === "classes" && (
          <div className="space-y-2">
            <h1 className="text-xl font-bold">{ar ? "صفوفك" : "Your classes"}</h1>
            {["8A · Science", "8B · Science", "8C · Science"].map((c) => (
              <div key={c} className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3 text-sm font-semibold">{c}<Lock size={14} className="opacity-40" /></div>
            ))}
          </div>
        )}

        {cur === "done" && (
          <div className="text-center">
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-extrabold">{ar ? "أهلاً بك في سوا!" : "Welcome to Sawa!"}</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">{ar ? "كل خدماتك ودروسك وإشعاراتك في مكان واحد." : "Every service, lesson and notice in one place."}</p>
          </div>
        )}

        <button className="btn-ink mt-5 w-full" onClick={next} disabled={cur === "interests" && interests.length === 0}>
          {cur === "done" ? (ar ? "ابدأ" : "Let's go") : ar ? "التالي" : "Continue"}
        </button>
      </Card>
    </main>
  );
}
