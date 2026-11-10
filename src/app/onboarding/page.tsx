"use client";

// Parent and teacher onboarding, in the same Figma language as the student flow.
// Parent:  find & verify children → parental controls → connect tools → done
// Teacher: verified → set up your school (name, logo, colours) → invite students → connect tools → done
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Check, Copy, FileSearch, ImagePlus, Lock, ShieldCheck, Upload } from "lucide-react";
import { LangToggle, Logo } from "@/components/ui";
import { MascotVideo, type MascotMood } from "@/components/shell/MascotVideo";
import { ConnectTools } from "@/components/shell/ConnectTools";
import { Avatar, EASE, StepBars, useToast, ToastProvider } from "@/components/s/kit";
import { SCHOOLS } from "@/lib/seed";
import { ageOf, tierOf, useStore } from "@/lib/store";
import type { ParentControls } from "@/lib/types";

const PALETTES = [
  { name: "Ink", accent: "#121217" },
  { name: "Ocean", accent: "#2C58E6" },
  { name: "Orchid", accent: "#C23EA5" },
  { name: "Palm", accent: "#1F7A50" },
  { name: "Sand", accent: "#9A6B2F" },
];

const page = {
  initial: { opacity: 0, y: 16, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: EASE } },
  exit: { opacity: 0, y: -10, filter: "blur(6px)", transition: { duration: 0.25, ease: EASE } },
};

function Inner() {
  const router = useRouter();
  const toast = useToast();
  const reduce = useReducedMotion();
  const { state, ready, me, myChildren, finishOnboarding, setParentControls, setSchoolBrand } = useStore();
  const ar = state.lang === "ar";
  const [step, setStep] = useState(0);
  const [found, setFound] = useState(0);
  const [controls, setControls] = useState<ParentControls>({ outsideSchool: true, autoApproveSchoolClubs: true, messages: "school_only", feedWindow: "after_school" });
  const school = SCHOOLS.find((s) => s.id === me?.schoolId);
  const [brand, setBrand] = useState({ name: "", logo: "", accent: PALETTES[1].accent, image: "" });
  const [toolsDone, setToolsDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!ready) return;
    if (!me) router.replace("/");
    else if (me.role === "student") router.replace("/welcome");
  }, [ready, me, router]);
  useEffect(() => { if (school && !brand.name) setBrand((b) => ({ ...b, name: school.name.replace(" (sample)", ""), logo: initials(school.name) })); }, [school, brand.name]);

  const steps = me?.role === "parent" ? ["children", "controls", "tools", "done"] : ["verified", "school", "invite", "tools", "done"];
  const cur = steps[step];

  // "Finding your children" — reveal linked children one by one.
  useEffect(() => {
    if (cur !== "children") return;
    setFound(0);
    const ts = [setTimeout(() => setFound(1), reduce ? 100 : 1300), setTimeout(() => setFound(2), reduce ? 200 : 2200)];
    return () => ts.forEach(clearTimeout);
  }, [cur, reduce]);

  if (!me || me.role === "student") return null;

  const next = () => {
    if (cur === "controls") setParentControls(controls);
    if (cur === "school") setSchoolBrand({ name: brand.name, logo: brand.logo || initials(brand.name), accent: brand.accent, inviteCode: "ALN-8-" + brand.name.length.toString().padStart(2, "0") + "K" });
    if (step < steps.length - 1) setStep(step + 1);
    else { finishOnboarding(); router.push("/app/today"); }
  };
  const canNext = cur === "children" ? found >= 2 : cur === "tools" ? toolsDone : cur === "school" ? brand.name.trim().length > 1 : true;

  const mood: MascotMood = cur === "done" ? "celebrate" : cur === "children" && found < 2 ? "thinking" : cur === "tools" ? "presenting" : "idle";
  const line: Record<string, [string, string]> = {
    children: ["Looking for your children in the family book…", "أبحث عن أبنائك في خلاصة القيد…"],
    controls: ["You decide what needs your OK.", "أنت تقرر ما يحتاج موافقتك."],
    tools: ["Joining up the systems you already use.", "أربط الأنظمة التي تستخدمها أصلاً."],
    verified: ["You're verified as an educator.", "تم التحقق منك كمعلم."],
    school: ["Make Sawa look like your school.", "اجعل سوا بهوية مدرستك."],
    invite: ["Bring your students in with one code.", "أضف طلابك برمز واحد."],
    done: ["All set. Welcome to Sawa!", "كل شيء جاهز. أهلاً بك في سوا!"],
  };
  const inviteCode = state.schoolBrand?.inviteCode ?? "ALN-8-K";

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-8 pt-5">
      <header className="flex items-center justify-between">
        {step > 0 ? <button onClick={() => setStep(step - 1)} aria-label="Back" className="grid h-10 w-10 place-items-center rounded-full bg-white/45 backdrop-blur"><ArrowLeft size={18} className="rtl:rotate-180" /></button> : <span className="w-10" />}
        <Logo size={28} />
        <LangToggle />
      </header>
      <div className="mt-4"><StepBars total={steps.length} done={step + 1} /></div>

      <div className="mt-3 flex items-end gap-2">
        <MascotVideo mood={mood} size={104} />
        <AnimatePresence mode="wait"><motion.p key={cur + mood} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass glass-strong mb-5 rounded-3xl rounded-bl-md px-4 py-3 text-sm font-medium">{line[cur][ar ? 1 : 0]}</motion.p></AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        <motion.section key={cur} {...page} className="glass glass-strong rounded-[30px] p-5">
          {cur === "children" && (
            <div>
              <h1 className="text-[22px] font-bold tracking-tight">{ar ? "التحقق من أبنائك" : "Verifying your children"}</h1>
              <p className="mt-1 text-sm text-[var(--muted)]">{ar ? "من خلاصة القيد المرتبطة بهويتك (عينة)." : "From the family book linked to your UAE PASS (sample)."}</p>
              <div className="mt-4 space-y-2.5">
                {found === 0 && (
                  <div className="flex items-center gap-3 rounded-[20px] bg-white/70 p-4">
                    <motion.span animate={reduce ? {} : { rotate: [0, 12, -12, 0] }} transition={{ duration: 1.2, repeat: Infinity }} className="grid h-11 w-11 place-items-center rounded-2xl bg-[#121217] text-white"><FileSearch size={20} /></motion.span>
                    <span className="text-sm font-medium">{ar ? "جارٍ البحث…" : "Searching the family book…"}</span>
                  </div>
                )}
                {found >= 1 && myChildren.map((c) => (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 22 }} className="flex items-center gap-3 rounded-[22px] bg-white p-3.5 shadow-[0_10px_24px_-16px_rgba(18,18,23,.5)]">
                    <Avatar name={c.name} size={52} ring verified={found >= 2} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{ar ? c.nameAr : c.name} · {ageOf(c)}</p>
                      <p className="text-xs text-[var(--muted)]">{ar ? "الصف" : "Grade"} {c.grade} · {ar ? school?.nameAr : school?.name}</p>
                      <p className="text-xs text-[var(--muted)]">{tierOf(c) === "u15" ? (ar ? "فئة دون 15 سنة" : "Under-15 tier") : "15+"}</p>
                    </div>
                    <AnimatePresence>{found >= 2 && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="grid h-8 w-8 place-items-center rounded-full text-white" style={{ background: "var(--grad-verify)" }}><Check size={16} strokeWidth={3} /></motion.span>}</AnimatePresence>
                  </motion.div>
                ))}
              </div>
              {found >= 2 && <p className="mt-3 text-xs text-[var(--muted)]">{ar ? "تم الربط عبر الهوية الرقمية لولي الأمر (محاكاة)." : "Linked through your UAE PASS as guardian (simulated)."}</p>}
            </div>
          )}

          {cur === "controls" && (
            <div className="space-y-2.5">
              <h1 className="text-[22px] font-bold tracking-tight">{ar ? "ضوابط ولي الأمر" : "Parental controls"}</h1>
              <Toggle label={ar ? "الأنشطة خارج المدرسة تحتاج موافقتي" : "Outside-school activities need my OK"} sub={ar ? "إلزامي لمن هم دون 15" : "Always on under 15"} on locked />
              <Toggle label={ar ? "الموافقة التلقائية على أندية المدرسة" : "Auto-approve my child's own school clubs"} on={controls.autoApproveSchoolClubs} onClick={() => setControls({ ...controls, autoApproveSchoolClubs: !controls.autoApproveSchoolClubs })} />
              <Choice label={ar ? "من يمكنه مراسلة طفلي" : "Who can message my child"} value={controls.messages} options={[["school_only", ar ? "المعلمون فقط" : "Teachers only"], ["nobody", ar ? "لا أحد" : "Nobody"]]} onChange={(v) => setControls({ ...controls, messages: v as ParentControls["messages"] })} />
              <Choice label={ar ? "وقت المجتمعات" : "Community time"} value={controls.feedWindow} options={[["after_school", ar ? "بعد المدرسة" : "After school"], ["weekends", ar ? "عطلة الأسبوع" : "Weekends"], ["off", ar ? "إيقاف" : "Off"]]} onChange={(v) => setControls({ ...controls, feedWindow: v as ParentControls["feedWindow"] })} />
            </div>
          )}

          {cur === "verified" && (
            <div className="text-center">
              <div className="mx-auto w-fit"><Avatar name={me.name} size={92} ring verified /></div>
              <h1 className="mt-3 text-[22px] font-bold">{ar ? me.nameAr : me.name}</h1>
              <p className="text-sm text-[var(--muted)]">{ar ? school?.nameAr : school?.name}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-white" style={{ background: "var(--grad-verify)" }}><ShieldCheck size={15} /> {ar ? "معلم موثّق · محاكاة" : "Verified educator · simulated"}</span>
            </div>
          )}

          {cur === "school" && (
            <div className="space-y-4">
              <h1 className="text-[22px] font-bold tracking-tight">{ar ? "جهّز مدرستك" : "Set up your school"}</h1>
              <div className="flex items-center gap-3 rounded-[22px] p-3 text-white" style={{ background: `linear-gradient(135deg, ${brand.accent}, ${brand.accent}cc)` }}>
                {brand.image ? <img src={brand.image} alt="" className="h-14 w-14 rounded-2xl bg-white object-cover" /> : <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20 text-xl font-bold ring-1 ring-white/40">{brand.logo || initials(brand.name)}</span>}
                <div className="min-w-0"><p className="label-xs !text-white/70">{ar ? "معاينة" : "Preview"}</p><p className="truncate text-lg font-bold">{brand.name || (ar ? "اسم المدرسة" : "School name")}</p></div>
              </div>
              <label className="block text-sm font-semibold">{ar ? "اسم المدرسة" : "School name"}<input className="input mt-1 !bg-white" value={brand.name} onChange={(e) => setBrand({ ...brand, name: e.target.value, logo: initials(e.target.value) })} /></label>
              <div>
                <p className="text-sm font-semibold">{ar ? "الشعار" : "Logo"}</p>
                <div className="mt-1 flex gap-2">
                  <button type="button" className="btn-ghost !min-h-11 flex-1 !bg-white text-sm" onClick={() => fileRef.current?.click()}><Upload size={15} /> {ar ? "رفع صورة" : "Upload image"}</button>
                  <button type="button" className="btn-ghost !min-h-11 flex-1 !bg-white text-sm" onClick={() => setBrand({ ...brand, image: "" })}><ImagePlus size={15} /> {ar ? "استخدم الأحرف" : "Use initials"}</button>
                </div>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml" className="sr-only" onChange={(e) => {
                  const f = e.target.files?.[0]; if (!f) return;
                  if (f.size > 1_000_000) { toast(ar ? "الصورة أكبر من 1 ميغابايت" : "Logo must be under 1 MB"); return; }
                  const r = new FileReader(); r.onload = () => setBrand((b) => ({ ...b, image: String(r.result) })); r.readAsDataURL(f);
                }} />
              </div>
              <fieldset>
                <legend className="text-sm font-semibold">{ar ? "لون المدرسة" : "School colour"}</legend>
                <div className="mt-2 flex flex-wrap items-center gap-2.5">
                  {PALETTES.map((p) => (
                    <button key={p.accent} type="button" aria-label={p.name} aria-pressed={brand.accent === p.accent} onClick={() => setBrand({ ...brand, accent: p.accent })} className="grid h-11 w-11 place-items-center rounded-full ring-2 ring-offset-2 ring-offset-white/60 transition" style={{ background: p.accent, ["--tw-ring-color" as string]: brand.accent === p.accent ? p.accent : "transparent" }}>
                      {brand.accent === p.accent && <Check size={16} className="text-white" strokeWidth={3} />}
                    </button>
                  ))}
                  <label className="relative grid h-11 w-11 cursor-pointer place-items-center overflow-hidden rounded-full border-2 border-dashed border-black/25 text-xs font-bold" title={ar ? "لون مخصص" : "Custom colour"}>
                    +<input type="color" value={brand.accent} onChange={(e) => setBrand({ ...brand, accent: e.target.value })} className="absolute inset-0 cursor-pointer opacity-0" aria-label={ar ? "لون مخصص" : "Custom colour"} />
                  </label>
                </div>
                <p className="mt-2 text-xs text-[var(--muted)]">{ar ? "يظهر في رأس الصفحة وأزرار مدرستك. الشعارات الرسمية تبقى بالذهبي." : "Used on your school's header and buttons. Official marks stay gold (UAE Design System)."}</p>
              </fieldset>
            </div>
          )}

          {cur === "invite" && (
            <div className="space-y-3">
              <h1 className="text-[22px] font-bold tracking-tight">{ar ? "ادعُ طلابك" : "Invite your students"}</h1>
              <p className="text-sm text-[var(--muted)]">{ar ? "يدخل الطلاب بحساب المدرسة ثم يكتبون الرمز. أولياء الأمور يُربطون تلقائياً." : "Students sign in with their school login and enter the code. Their guardians are linked automatically."}</p>
              <div className="flex items-center justify-between rounded-[20px] bg-white p-4">
                <div><p className="label-xs">{ar ? "رمز الصف" : "Class code"}</p><p className="text-2xl font-bold tracking-[0.12em]">{inviteCode}</p></div>
                <button className="btn-ghost !min-h-10 !bg-[#f4efe5] text-sm" onClick={() => { navigator.clipboard?.writeText(inviteCode).catch(() => {}); toast(ar ? "تم النسخ" : "Code copied"); }}><Copy size={15} /> {ar ? "نسخ" : "Copy"}</button>
              </div>
              <ul className="space-y-1.5">
                {["8A · Science · 26", "8B · Science · 24", "9A · Physics · 22"].map((c) => <li key={c} className="flex items-center justify-between rounded-[16px] bg-white/70 px-4 py-2.5 text-sm font-semibold">{c} {ar ? "طالب" : "students"}<Lock size={13} className="opacity-40" /></li>)}
              </ul>
              <p className="text-xs text-[var(--muted)]">{ar ? "الصفوف من جدول المدرسة (عينة)." : "Classes come from the school timetable (sample)."}</p>
            </div>
          )}

          {cur === "tools" && (
            <div>
              <h1 className="text-[22px] font-bold tracking-tight">{ar ? "اربط أدواتك" : "Connect your tools"}</h1>
              <p className="mt-1 text-sm text-[var(--muted)]">{ar ? "محاكاة ببيانات عينة. في التجربة يوافق مدير المدرسة على كل تطبيق." : "Simulated with sample data. In the pilot the school administrator approves each app."}</p>
              <div className="mt-2"><ConnectTools role={me.role} onDone={() => setToolsDone(true)} /></div>
            </div>
          )}

          {cur === "done" && (
            <div className="text-center">
              <h1 className="text-[26px] font-bold tracking-tight">{ar ? "أهلاً بك في سوا!" : "Welcome to Sawa!"}</h1>
              <p className="mt-1 text-sm text-[var(--muted)]">{me.role === "parent" ? (ar ? "كل ما يخص أبناءك في مكان واحد." : "Everything for your children, in one place.") : ar ? "صفوفك وفعالياتك وطلبات أولياء الأمور في مكان واحد." : "Your classes, events and parent requests in one place."}</p>
            </div>
          )}

          <button className="btn-ink mt-5 w-full" onClick={next} disabled={!canNext}>
            {cur === "done" ? (ar ? "ابدأ" : "Let's go") : ar ? "متابعة" : "Continue"}
          </button>
        </motion.section>
      </AnimatePresence>
    </main>
  );
}

function initials(name: string) {
  return name.replace(/\(.*?\)/g, "").split(/\s+/).filter((w) => w && !/^(the|of|school|al)$/i.test(w)).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "S";
}

function Toggle({ label, sub, on, locked, onClick }: { label: string; sub?: string; on: boolean; locked?: boolean; onClick?: () => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={onClick} disabled={locked} className="flex w-full items-center justify-between gap-3 rounded-[18px] bg-white/75 px-4 py-3 text-start text-sm disabled:opacity-100">
      <span><span className="block font-medium">{label}</span>{sub && <span className="block text-xs text-[var(--muted)]">{sub}</span>}</span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? "bg-[#121217]" : "bg-black/20"} ${locked ? "opacity-60" : ""}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${on ? "start-6" : "start-1"}`} /></span>
    </button>
  );
}

function Choice({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (v: string) => void }) {
  return (
    <div className="rounded-[18px] bg-white/75 px-4 py-3">
      <p className="text-sm font-medium">{label}</p>
      <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
        {options.map(([k, l]) => <button key={k} type="button" role="radio" aria-checked={value === k} className="chip" onClick={() => onChange(k)}>{l}</button>)}
      </div>
    </div>
  );
}

export default function Onboarding() {
  return <ToastProvider><Inner /></ToastProvider>;
}
