"use client";

// Parent and teacher onboarding in the student Figma language: silk ground, Playfair
// titles, frosted Continue, the 3D card carousel and the sample ID cards.
// Parent:  family match (you are Sara's father) → what Sawa should handle → controls → school documents → tools → done
// Teacher: verified → school (name, logo, colour) → what you'll use Sawa for → invite → tools → done
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Copy, FileText, ImagePlus, Lock, ScanLine, ShieldCheck, Upload } from "lucide-react";
import { LangToggle } from "@/components/ui";
import { MascotVideo, type MascotMood } from "@/components/shell/MascotVideo";
import { ConnectTools } from "@/components/shell/ConnectTools";
import { CardCarousel, type CarouselCard } from "@/components/s/CardCarousel";
import { Avatar, EASE, IdCard, StepBars, useToast, ToastProvider } from "@/components/s/kit";
import { SCHOOLS } from "@/lib/seed";
import { ageOf, useStore } from "@/lib/store";
import type { ParentControls } from "@/lib/types";

const PALETTES = [
  { name: "Ink", accent: "#121217" }, { name: "Ocean", accent: "#2C58E6" }, { name: "Orchid", accent: "#9C2E85" },
  { name: "Palm", accent: "#1F7A50" }, { name: "Sand", accent: "#9A6B2F" },
];

const PARENT_CARDS = (ar: boolean): CarouselCard[] => [
  { id: "fees", label: ar ? "الرسوم" : "Fees", sub: ar ? "تذكير بالأقساط والدفع" : "Instalment reminders and paying", img: "/figma/interests/investing.png", tint: "#9EDDBB" },
  { id: "documents", label: ar ? "المستندات" : "Documents", sub: ar ? "الهوية والجواز وملف المدرسة" : "ID, passport and the school file", img: "/figma/interests/business.png", tint: "#E8CFA8" },
  { id: "grades", label: ar ? "الدرجات" : "Grades", sub: ar ? "الواجبات والاختبارات والتقارير" : "Homework, tests and reports", img: "/figma/icons/journey.png", tint: "#A9C3FF" },
  { id: "events", label: ar ? "الفعاليات" : "Events", sub: ar ? "الرحلات والأنشطة والتسجيل" : "Trips, clubs and sign-ups", img: "/figma/interests/photography.png", tint: "#FFC9A3" },
  { id: "schools", label: ar ? "المدارس" : "Schools", sub: ar ? "التسجيل والنقل والأيام المفتوحة" : "Enrolment, transfers, open days", img: "/figma/icons/home.png", tint: "#C9B6FA" },
];
const TEACHER_CARDS = (ar: boolean): CarouselCard[] => [
  { id: "post", label: ar ? "النشر" : "Posting", sub: ar ? "إعلان واحد يصل للجميع" : "One post reaches every family", img: "/figma/icons/journey.png", tint: "#A9C3FF" },
  { id: "events", label: ar ? "الفعاليات" : "Events", sub: ar ? "استضافة ودعوة ورعاية" : "Host, invite, get sponsored", img: "/figma/interests/photography.png", tint: "#FFC9A3" },
  { id: "parents", label: ar ? "الأهالي" : "Parents", sub: ar ? "طلبات بلا إعادة إدخال" : "Requests with no re-typing", img: "/figma/icons/people.png", tint: "#BFE3B5" },
  { id: "growth", label: ar ? "التطوير" : "Workshops", sub: ar ? "ورش للمعلمين والطلاب" : "For you and your students", img: "/figma/interests/coding.png", tint: "#E8CFA8" },
];
const DOCS = [
  { kind: "eid", en: "Sara's Emirates ID", ar: "هوية سارة", fields: 5 },
  { kind: "passport", en: "Sara's passport", ar: "جواز سارة", fields: 6 },
  { kind: "birth", en: "Birth certificate", ar: "شهادة الميلاد", fields: 4 },
  { kind: "vaccination", en: "Vaccination record", ar: "سجل التطعيمات", fields: 3 },
] as const;

const page = {
  initial: { opacity: 0, y: 16, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: EASE } },
  exit: { opacity: 0, y: -10, filter: "blur(6px)", transition: { duration: 0.25, ease: EASE } },
};

function Inner() {
  const router = useRouter();
  const toast = useToast();
  const reduce = useReducedMotion();
  const { state, ready, me, myChildren, finishOnboarding, setParentControls, setSchoolBrand, addDocument, setPriorities } = useStore();
  const ar = state.lang === "ar";
  const [step, setStep] = useState(0);
  const [matched, setMatched] = useState(false);
  const [prio, setPrio] = useState<string[]>([]);
  const [controls, setControls] = useState<ParentControls>({ outsideSchool: true, autoApproveSchoolClubs: true, messages: "school_only", feedWindow: "after_school" });
  const school = SCHOOLS.find((s) => s.id === me?.schoolId);
  const [brand, setBrand] = useState({ name: "", logo: "", accent: PALETTES[1].accent, image: "" });
  const [toolsDone, setToolsDone] = useState(false);
  const [reading, setReading] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const [docKind, setDocKind] = useState<string>("eid");

  useEffect(() => {
    if (!ready) return;
    if (!me) router.replace("/");
    else if (me.role === "student") router.replace("/welcome");
  }, [ready, me, router]);
  useEffect(() => { if (school && !brand.name) setBrand((b) => ({ ...b, name: school.name.replace(" (sample)", ""), logo: initials(school.name) })); }, [school, brand.name]);

  const steps = me?.role === "parent" ? ["match", "priorities", "controls", "documents", "tools", "done"] : ["verified", "school", "priorities", "invite", "tools", "done"];
  const cur = steps[step];

  useEffect(() => {
    if (cur !== "match") return;
    setMatched(false);
    const t = setTimeout(() => setMatched(true), reduce ? 100 : 1800);
    return () => clearTimeout(t);
  }, [cur, reduce]);

  if (!me || me.role === "student") return null;
  const child = myChildren[0];
  const myDocs = state.documents.filter((d) => d.ownerId === me.id);

  const next = () => {
    if (cur === "priorities") setPriorities(prio);
    if (cur === "controls") setParentControls(controls);
    if (cur === "school") setSchoolBrand({ name: brand.name, logo: brand.logo || initials(brand.name), accent: brand.accent, inviteCode: "ALN-8-" + brand.name.length.toString().padStart(2, "0") + "K" });
    if (step < steps.length - 1) setStep(step + 1);
    else { finishOnboarding(); router.push("/app/today"); }
  };
  const canNext = cur === "match" ? matched : cur === "tools" ? toolsDone : cur === "school" ? brand.name.trim().length > 1 : cur === "priorities" ? prio.length > 0 : cur === "documents" ? myDocs.length > 0 : true;

  const upload = (kind: string, file: string) => {
    const d = DOCS.find((x) => x.kind === kind)!;
    setReading(kind);
    setTimeout(() => { addDocument(kind, file, d.fields, child?.id); setReading(null); toast(ar ? `قرأ سوا ${d.fields} حقول` : `Sawa read ${d.fields} fields — nothing to re-type`); }, reduce ? 50 : 1200);
  };

  const mood: MascotMood = cur === "done" ? "celebrate" : cur === "match" && !matched ? "thinking" : cur === "tools" || cur === "documents" ? "presenting" : "waving";
  const titles: Record<string, [string, string, string, string]> = {
    match: ["We found your family", "وجدنا عائلتك", "UAE PASS matched you through the family book.", "طابقت الهوية الرقمية عائلتك عبر خلاصة القيد."],
    priorities: ["What should Sawa handle?", "بماذا يساعدك سوا؟", "Pick one or more. Your home screen follows.", "اختر واحداً أو أكثر. تتبعها صفحتك الرئيسية."],
    controls: ["You decide what needs your OK", "أنت تقرر ما يحتاج موافقتك", "You can change these any time in Profile.", "يمكنك تغييرها في أي وقت من الملف."],
    documents: ["Add Sara's school documents once", "أضف مستندات سارة مرة واحدة", "Sawa reads each one and fills every form that needs it.", "يقرأ سوا كل مستند ويعبّئ كل نموذج يحتاجه."],
    tools: ["Joining up your school systems", "نربط أنظمة المدرسة", "Simulated with sample data.", "محاكاة ببيانات تجريبية."],
    verified: ["You're verified as an educator", "تم التحقق منك كمعلم", "UAE PASS confirmed your staff record.", "أكدت الهوية الرقمية سجلّك الوظيفي."],
    school: ["Make Sawa look like your school", "اجعل سوا بهوية مدرستك", "Students and parents see your name, logo and colour.", "يرى الطلاب والأهالي اسم مدرستك وشعارها ولونها."],
    invite: ["Invite your students", "ادعُ طلابك", "One class code. Guardians are linked automatically.", "رمز صف واحد. يُربط أولياء الأمور تلقائياً."],
    done: ["You're all set", "كل شيء جاهز", "Everything for your school life, in one place.", "كل ما يخص حياتك المدرسية في مكان واحد."],
  };
  const [tEn, tAr, sEn, sAr] = titles[cur];

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-8 pt-5">
      <header className="flex items-center justify-between">
        {step > 0 ? <button onClick={() => setStep(step - 1)} aria-label="Back" className="grid h-10 w-10 place-items-center rounded-full bg-white/45 backdrop-blur"><ArrowLeft size={18} className="rtl:rotate-180" /></button> : <span className="w-10" />}
        <img src="/figma/icons/logo3d.png" alt="Sawa" className="h-9 w-9 object-contain" />
        <LangToggle />
      </header>
      <div className="mt-4"><StepBars total={steps.length} done={step + 1} /></div>

      <AnimatePresence mode="wait">
        <motion.section key={cur} {...page} className="flex flex-1 flex-col">
          <div className="mt-6 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="h-display text-[30px] leading-[1.1]">{ar ? tAr : tEn}</h1>
              <p className="mt-1.5 text-[16px] text-black/70">{ar ? sAr : sEn}</p>
            </div>
            <MascotVideo mood={mood} size={84} decorative />
          </div>

          <div className="mt-6 flex-1">
            {cur === "match" && child && (
              <div className="relative flex flex-col items-center">
                <motion.div initial={{ x: -30, opacity: 0, rotate: -4 }} animate={{ x: 0, opacity: 1, rotate: -3 }} transition={{ duration: 0.6, ease: EASE }}>
                  <IdCard name={ar ? "خالد (أنت)" : "Khalid (you)"} number="784-19XX-XXXXXXX-X" small verified={matched} />
                </motion.div>
                <div className="relative my-3 flex h-16 items-center">
                  <motion.span className="w-[2px] bg-[#121217]" initial={{ height: 0 }} animate={{ height: 64 }} transition={{ duration: 0.8, delay: 0.4 }} />
                  <AnimatePresence>
                    {matched && (
                      <motion.span initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute start-4 rounded-full bg-[#121217] px-3 py-1.5 text-sm font-semibold text-white">
                        {ar ? "الأب" : "Father"}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <motion.div initial={{ x: 30, opacity: 0, rotate: 4 }} animate={{ x: 0, opacity: 1, rotate: 3 }} transition={{ duration: 0.6, delay: 0.2, ease: EASE }}>
                  <IdCard name={ar ? "سارة" : "Sara"} number="784-20XX-XXXXXXX-X" small verified={matched} />
                </motion.div>
                <AnimatePresence>
                  {matched && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass mt-6 flex w-full items-center gap-3 rounded-[22px] p-3.5">
                      <Avatar name={child.name} size={48} verified />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{ar ? `أنت مسجّل والداً لـ${child.nameAr}` : `You're registered as ${child.name}'s father`}</p>
                        <p className="text-xs text-[var(--muted)]">{ar ? `الصف ${child.grade} · ${ageOf(child)} سنة · ${school?.nameAr}` : `Grade ${child.grade} · age ${ageOf(child)} · ${school?.name.replace(" (sample)", "")}`}</p>
                      </div>
                      <ShieldCheck size={20} className="shrink-0" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <p className="mt-3 text-center text-xs text-[var(--muted)]">{ar ? "بطاقات تجريبية · الربط محاكاة" : "Sample cards · the match is simulated"}</p>
              </div>
            )}

            {cur === "priorities" && (
              <>
                <CardCarousel ariaLabel={ar ? "ما يتولاه سوا" : "What Sawa handles"} cards={me.role === "parent" ? PARENT_CARDS(ar) : TEACHER_CARDS(ar)} selected={prio} onToggle={(id) => setPrio(prio.includes(id) ? prio.filter((x) => x !== id) : [...prio, id])} />
                <p className="mt-3 text-center text-sm text-[var(--muted)]" aria-live="polite">{ar ? `اخترت ${prio.length}` : `${prio.length} selected`}</p>
              </>
            )}

            {cur === "controls" && (
              <div className="space-y-2.5">
                <Toggle label={ar ? "الأنشطة خارج المدرسة تحتاج موافقتي" : "Outside-school activities need my OK"} sub={ar ? "إلزامي لمن هم دون 15" : "Always on under 15"} on locked />
                <Toggle label={ar ? "الموافقة التلقائية على أندية المدرسة" : "Auto-approve my child's own school clubs"} on={controls.autoApproveSchoolClubs} onClick={() => setControls({ ...controls, autoApproveSchoolClubs: !controls.autoApproveSchoolClubs })} />
                <Choice label={ar ? "من يمكنه مراسلة طفلي" : "Who can message my child"} value={controls.messages} options={[["school_only", ar ? "المعلمون فقط" : "Teachers only"], ["nobody", ar ? "لا أحد" : "Nobody"]]} onChange={(v) => setControls({ ...controls, messages: v as ParentControls["messages"] })} />
                <Choice label={ar ? "وقت المجتمعات" : "Community time"} value={controls.feedWindow} options={[["after_school", ar ? "بعد المدرسة" : "After school"], ["weekends", ar ? "عطلة الأسبوع" : "Weekends"], ["off", ar ? "إيقاف" : "Off"]]} onChange={(v) => setControls({ ...controls, feedWindow: v as ParentControls["feedWindow"] })} />
              </div>
            )}

            {cur === "documents" && (
              <div>
                <ul className="space-y-2">
                  {DOCS.map((d) => {
                    const have = myDocs.find((x) => x.kind === d.kind);
                    return (
                      <li key={d.kind} className="glass flex items-center gap-3 rounded-[20px] p-3">
                        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${have ? "bg-[#121217] text-white" : "bg-white/70"}`}>{have ? <Check size={18} strokeWidth={3} /> : reading === d.kind ? <ScanLine size={18} /> : <FileText size={18} />}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold">{ar ? d.ar : d.en}</span>
                          <span className="block truncate text-xs text-[var(--muted)]">{reading === d.kind ? (ar ? "يقرأ سوا المستند…" : "Sawa is reading it…") : have ? (ar ? `${have.fields} حقول قُرئت · ${have.file}` : `${have.fields} fields read · ${have.file}`) : (ar ? "لم يُرفع بعد" : "Not added yet")}</span>
                        </span>
                        {!have && reading !== d.kind && (
                          <div className="flex shrink-0 gap-1.5">
                            <button type="button" className="btn-ghost !min-h-9 !bg-white !px-3 text-xs" onClick={() => { setDocKind(d.kind); docRef.current?.click(); }}><Upload size={13} /> {ar ? "رفع" : "Upload"}</button>
                            <button type="button" className="btn-ink !min-h-9 !px-3 text-xs" onClick={() => upload(d.kind, ar ? "عينة.jpg" : "sample.jpg")}>{ar ? "عينة" : "Sample"}</button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
                <input ref={docRef} type="file" accept="image/*,application/pdf" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(docKind, f.name); e.target.value = ""; }} />
                <p className="mt-3 flex gap-2 text-xs text-[var(--muted)]"><Lock size={13} className="mt-0.5 shrink-0" /> {ar ? "تبقى المستندات في ملف العائلة ولا تُشارك إلا مع مدرسة سارة. استخدم عينات فقط في هذا النموذج." : "Documents stay in your family profile and are shared only with Sara's school. Use samples only in this prototype."}</p>
              </div>
            )}

            {cur === "verified" && (
              <div className="glass flex flex-col items-center rounded-[28px] p-6 text-center">
                <Avatar name={me.name} size={96} ring verified />
                <p className="h-display mt-3 text-[22px]">{ar ? me.nameAr : me.name}</p>
                <p className="text-sm text-[var(--muted)]">{ar ? school?.nameAr : school?.name}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#121217] px-3 py-1.5 text-sm font-semibold text-white"><ShieldCheck size={15} /> {ar ? "معلم موثّق · محاكاة" : "Verified educator · simulated"}</span>
              </div>
            )}

            {cur === "school" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-[22px] p-3 text-white" style={{ background: brand.accent }}>
                  {brand.image ? <img src={brand.image} alt="" className="h-14 w-14 rounded-2xl bg-white object-cover" /> : <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20 text-xl font-bold ring-1 ring-white/40">{brand.logo || initials(brand.name)}</span>}
                  <div className="min-w-0"><p className="text-xs font-semibold text-white/70">{ar ? "معاينة" : "Preview"}</p><p className="truncate text-lg font-semibold">{brand.name || (ar ? "اسم المدرسة" : "School name")}</p></div>
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
                      <button key={p.accent} type="button" aria-label={p.name} aria-pressed={brand.accent === p.accent} onClick={() => setBrand({ ...brand, accent: p.accent })} className="grid h-11 w-11 place-items-center rounded-full ring-2 ring-offset-2 ring-offset-white/60" style={{ background: p.accent, ["--tw-ring-color" as string]: brand.accent === p.accent ? p.accent : "transparent" }}>
                        {brand.accent === p.accent && <Check size={16} className="text-white" strokeWidth={3} />}
                      </button>
                    ))}
                    <label className="relative grid h-11 w-11 cursor-pointer place-items-center overflow-hidden rounded-full border-2 border-dashed border-black/25 text-xs font-bold" title={ar ? "لون مخصص" : "Custom colour"}>
                      +<input type="color" value={brand.accent} onChange={(e) => setBrand({ ...brand, accent: e.target.value })} className="absolute inset-0 cursor-pointer opacity-0" aria-label={ar ? "لون مخصص" : "Custom colour"} />
                    </label>
                  </div>
                </fieldset>
              </div>
            )}

            {cur === "invite" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-[22px] bg-white p-4">
                  <div><p className="text-xs font-semibold text-[var(--muted)]">{ar ? "رمز الصف" : "Class code"}</p><p className="text-2xl font-semibold tracking-[0.12em] tabular-nums">{state.schoolBrand?.inviteCode ?? "ALN-8-K"}</p></div>
                  <button className="btn-ghost !min-h-10 !bg-[#f4efe5] text-sm" onClick={() => { navigator.clipboard?.writeText(state.schoolBrand?.inviteCode ?? "").catch(() => {}); toast(ar ? "تم النسخ" : "Code copied"); }}><Copy size={15} /> {ar ? "نسخ" : "Copy"}</button>
                </div>
                <ul className="space-y-1.5">
                  {["8A · Science · 26", "8B · Science · 24", "9A · Physics · 22"].map((c) => <li key={c} className="flex items-center justify-between rounded-[16px] bg-white/70 px-4 py-2.5 text-sm font-semibold">{c} {ar ? "طالب" : "students"}<Lock size={13} className="opacity-40" /></li>)}
                </ul>
              </div>
            )}

            {cur === "tools" && <ConnectTools role={me.role} onDone={() => setToolsDone(true)} />}

            {cur === "done" && (
              <div className="flex flex-col items-center pt-4 text-center">
                <MascotVideo mood="celebrate" size={190} />
                <p className="text-sm text-[var(--muted)]">{me.role === "parent" ? (ar ? `${myDocs.length} مستندات · ${prio.length} أولويات` : `${myDocs.length} documents added · ${prio.length} priorities set`) : (ar ? "تم إعداد مدرستك" : `${state.schoolBrand?.name ?? ""} is set up`)}</p>
              </div>
            )}
          </div>

          <button className="btn-glass mt-6 w-full" onClick={next} disabled={!canNext}>
            {cur === "done" ? (ar ? "ادخل سوا" : "Enter Sawa") : ar ? "متابعة" : "Continue"} <ArrowRight size={20} className="rtl:rotate-180" />
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
    <button type="button" role="switch" aria-checked={on} onClick={onClick} disabled={locked} className="glass flex w-full items-center justify-between gap-3 rounded-[20px] px-4 py-3.5 text-start text-[15px] disabled:opacity-100">
      <span><span className="block font-medium">{label}</span>{sub && <span className="block text-xs text-[var(--muted)]">{sub}</span>}</span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? "bg-[#121217]" : "bg-black/20"} ${locked ? "opacity-60" : ""}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${on ? "start-6" : "start-1"}`} /></span>
    </button>
  );
}

function Choice({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (v: string) => void }) {
  return (
    <div className="glass rounded-[20px] px-4 py-3.5">
      <p className="text-[15px] font-medium">{label}</p>
      <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label={label}>
        {options.map(([k, l]) => <button key={k} type="button" role="radio" aria-checked={value === k} className="chip" onClick={() => onChange(k)}>{l}</button>)}
      </div>
    </div>
  );
}

export default function Onboarding() {
  return <ToastProvider><Inner /></ToastProvider>;
}
