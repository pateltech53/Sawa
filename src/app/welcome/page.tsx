"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Info, Lock, School, Search, ShieldCheck, Sparkles } from "lucide-react";
import { CurvedLabel, EASE, IdCard, Icon3D, MascotLive, Sheet, StepBars, spring } from "@/components/s/kit";
import { COMMUNITIES, INTERESTS, OPPORTUNITIES, SCHOOLS } from "@/lib/seed";
import { rankOpportunities, TYPE_LABEL } from "@/lib/match";
import { useStore } from "@/lib/store";
import type { Profile } from "@/lib/types";
import { SawaPreloader } from "@/components/s/SawaPreloader";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { AiLoader } from "@/components/ui/ai-loader";

type Step = "splash" | "start" | "school" | "consent" | "loading" | "verify" | "scan" | "face" | "verified" | "interests" | "matching" | "done";
const ORDER: Step[] = ["splash", "start", "school", "consent", "loading", "verify", "scan", "face", "verified", "interests", "matching", "done"];

const SAMPLE_IDS = [
  { key: "a", label: "Sample A", age: 14, note: "Under-15 tier" },
  { key: "b", label: "Sample B", age: 16, note: "15+ tier" },
] as const;

const page = {
  initial: { opacity: 0, y: 18, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: EASE } },
  exit: { opacity: 0, y: -12, filter: "blur(6px)", transition: { duration: 0.3, ease: EASE } },
};

export default function Welcome() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { state, signIn, recordVerification, completeStudentOnboarding } = useStore();
  const [step, setStep] = useState<Step>("splash");
  const [schoolId, setSchoolId] = useState("sch-1");
  const [sample, setSample] = useState<(typeof SAMPLE_IDS)[number]>(SAMPLE_IDS[0]);
  const [interests, setInterests] = useState<string[]>([]);
  const go = (s: Step) => setStep(s);
  const back = () => setStep(ORDER[Math.max(0, ORDER.indexOf(step) - 1)]);

  // splash → start (reduced motion skips the cinematic gate)
  useEffect(() => {
    if (step !== "splash" || !reduce) return;
    const t = setTimeout(() => go("start"), 400);
    return () => clearTimeout(t);
  }, [step, reduce]);

  const student = state.profiles.find((p) => p.id === "stu-sara")!;
  const birthYear = new Date().getFullYear() - sample.age;
  const draft: Profile = { ...student, interests, birthYear, schoolId };

  const finish = () => {
    completeStudentOnboarding({ interests, birthYear, schoolId });
    router.push("/app/today");
  };

  const showBack = !["splash", "start", "loading", "scan", "face", "matching", "done"].includes(step);
  const bg = step === "splash" ? "linear-gradient(180deg, #F2EDE3 0%, #8F8B85 49%, #423A31 100%)" : undefined;

  return (
    <main className="relative mx-auto min-h-dvh max-w-md overflow-hidden" style={{ background: bg }}>
      {showBack && (
        <button onClick={back} aria-label="Back" className="absolute start-4 top-5 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/40 backdrop-blur">
          <ArrowLeft size={18} className="rtl:rotate-180" />
        </button>
      )}
      <AnimatePresence mode="wait">
        {step === "splash" && (
          <motion.section key="splash" className="relative min-h-dvh" exit={{ opacity: 0, transition: { duration: 0.4 } }}>
            {reduce ? (
              <div className="flex min-h-dvh items-center justify-center"><Icon3D name="logo3d" size={150} alt="Sawa" /></div>
            ) : (
              <SawaPreloader onComplete={() => go("start")} />
            )}
            <button onClick={() => go("start")} className="absolute end-4 top-5 z-50 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/25">Skip intro</button>
          </motion.section>
        )}

        {step === "start" && (
          <motion.section key="start" {...page} className="flex min-h-dvh flex-col items-center px-6 pb-10 pt-16">
            <motion.div layoutId="brand" initial={{ y: 40, scale: 1.2 }} animate={{ y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 120, damping: 18 }}>
              { }
              <img src="/brand/logo-full.png" alt="Sawa · سوا" className="h-auto w-[120px]" />
            </motion.div>
            <motion.div className="relative mt-auto w-[150%] max-w-none" initial={{ y: 260, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25, duration: 1.1, ease: EASE }}>
              { }
              <img src="/figma/bg/mascot-dubai.png" alt="Sawa's mascot waving in front of the Dubai skyline" className="mx-auto w-full select-none" draggable={false} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.5, ease: EASE }} className="relative z-10 -mt-8 flex w-full justify-center">
              <LiquidMetalButton label="Get Started" width={300} height={58} onClick={() => go("school")} />
            </motion.div>
            <p className="mt-4 text-center text-xs text-[var(--muted)]">Prototype · sample data only</p>
          </motion.section>
        )}

        {step === "school" && <SchoolStep key="school" schoolId={schoolId} setSchoolId={setSchoolId} onNext={() => go("consent")} />}

        {step === "consent" && (
          <ConsentStep key="consent" schoolId={schoolId} onAllow={() => { signIn("student"); go("loading"); }} />
        )}

        {step === "loading" && <LoadingStep key="loading" onDone={() => go("verify")} />}

        {step === "verify" && (
          <motion.section key="verify" {...page} className="flex min-h-dvh flex-col px-6 pb-8 pt-14">
            <div className="flex justify-center"><Icon3D name="logo3d" size={40} /></div>
            <h1 className="mt-6 text-[30px] font-bold leading-tight tracking-tight">Verify your identity</h1>
            <p className="mt-2 text-[var(--muted)]">Scan your Emirates ID to keep your Sawa account safe.</p>
            <div className="mt-8 flex justify-center"><IdCard skew /></div>
            <div className="mt-8 rounded-2xl bg-white/35 p-3">
              <p className="label-xs mb-2 flex items-center gap-1.5"><Info size={12} /> Demo identity — no real card is read</p>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Sample identity">
                {SAMPLE_IDS.map((s) => (
                  <button key={s.key} role="radio" aria-checked={sample.key === s.key} onClick={() => setSample(s)}
                    className={`rounded-xl px-3 py-2 text-start text-sm transition ${sample.key === s.key ? "bg-[#121217] text-white" : "bg-white/60"}`}>
                    <span className="block font-semibold">{s.label} · age {s.age}</span>
                    <span className={`block text-xs ${sample.key === s.key ? "text-white/70" : "text-[var(--muted)]"}`}>{s.note}</span>
                  </button>
                ))}
              </div>
            </div>
            <ol className="mt-5 space-y-3">
              {["Scan your ID card", "Quick face match", "You're in"].map((t, i) => (
                <li key={t} className="flex items-center gap-3 font-medium text-black/75">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#8C59F2]/15 text-[13px] font-semibold text-[#8C59F2]">{i + 1}</span>{t}
                </li>
              ))}
            </ol>
            <div className="mt-auto pt-8"><StepBars done={0} /></div>
            <button className="btn-ink mt-6 w-full !min-h-14 text-[17px]" onClick={() => go("scan")}>Start verification</button>
          </motion.section>
        )}

        {step === "scan" && <ScanStep key="scan" onDone={() => go("face")} />}
        {step === "face" && <FaceStep key="face" onDone={() => { recordVerification(); go("verified"); }} />}

        {step === "verified" && (
          <motion.section key="verified" {...page} className="flex min-h-dvh flex-col items-center px-6 pb-8 pt-14 text-center">
            <Icon3D name="logo3d" size={40} />
            <motion.div initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 220, damping: 13, delay: 0.1 }}
              className="mt-16 grid h-[110px] w-[110px] place-items-center rounded-full text-white" style={{ background: "linear-gradient(135deg,#F280D9 0%,#734DF2 71%)", boxShadow: "0 16px 40px rgba(128,64,230,.5)" }}>
              <motion.svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.45, duration: 0.45, ease: EASE }} />
              </motion.svg>
            </motion.div>
            <h1 className="mt-6 text-[30px] font-bold tracking-tight">You&apos;re verified!</h1>
            <p className="mt-1.5 text-[var(--muted)]">Demo verification complete. In the pilot, this step runs through UAE PASS.</p>
            <div className="mt-8"><IdCard name={`${student.name} (sample)`} verified /></div>
            <div className="mt-auto w-full pt-8"><StepBars done={3} /></div>
            <button className="btn-ink mt-6 w-full !min-h-14 text-[17px]" onClick={() => go("interests")}>Continue</button>
          </motion.section>
        )}

        {step === "interests" && <InterestsStep key="interests" selected={interests} setSelected={setInterests} onNext={() => go("matching")} />}
        {step === "matching" && <MatchingStep key="matching" profile={draft} onDone={() => go("done")} />}
        {step === "done" && <DoneStep key="done" profile={draft} onEnter={finish} />}
      </AnimatePresence>
    </main>
  );
}

/** Keeps the latest callback without restarting timers on parent re-renders. */
function useLatest<T>(v: T) { const r = useRef(v); r.current = v; return r; }

/* ── School sign-in ── */
function SchoolStep({ schoolId, setSchoolId, onNext }: { schoolId: string; setSchoolId: (s: string) => void; onNext: () => void }) {
  const [q, setQ] = useState("");
  const list = SCHOOLS.filter((s) => `${s.name} ${s.area}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <motion.section {...page} className="flex min-h-dvh flex-col px-6 pb-8 pt-16">
      <div className="flex justify-center"><Icon3D name="logo3d" size={40} /></div>
      <h1 className="mt-6 text-[30px] font-bold leading-tight tracking-tight">Find your school</h1>
      <p className="mt-2 text-[var(--muted)]">You&apos;ll sign in with your school account. No new password to remember.</p>
      <label className="relative mt-6 block">
        <Search size={18} className="absolute start-4 top-1/2 -translate-y-1/2 opacity-50" />
        <input className="input !ps-11" placeholder="Search schools" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search schools" />
      </label>
      <ul className="mt-3 space-y-2" role="radiogroup" aria-label="School">
        {list.map((s, i) => {
          const on = s.id === schoolId;
          return (
            <motion.li key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, ease: EASE }}>
              <button role="radio" aria-checked={on} onClick={() => setSchoolId(s.id)}
                className={`flex w-full items-center gap-3 rounded-[20px] border px-3 py-3 text-start transition ${on ? "border-[#121217] bg-white/80" : "border-white/70 bg-white/35"}`}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/80"><School size={18} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{s.name}</span>
                  <span className="block text-xs text-[var(--muted)]">{s.area} · {s.curriculum}</span>
                </span>
                <span className={`grid h-6 w-6 place-items-center rounded-full border-2 ${on ? "border-[#121217] bg-[#121217] text-white" : "border-black/25"}`}>{on && <Check size={13} strokeWidth={3} />}</span>
              </button>
            </motion.li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-[var(--muted)]">School list in KHDA dataset format — sample rows.</p>
      <button className="btn-ink mt-auto w-full !min-h-14 text-[17px]" onClick={onNext}>Continue with school login</button>
    </motion.section>
  );
}

function ConsentStep({ schoolId, onAllow }: { schoolId: string; onAllow: () => void }) {
  const school = SCHOOLS.find((s) => s.id === schoolId)!;
  return (
    <motion.section {...page} className="flex min-h-dvh flex-col px-6 pb-8 pt-16">
      <div className="glass rounded-[28px] p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#121217] text-white"><School size={20} /></span>
          <div className="min-w-0">
            <p className="label-xs">Unified Login · simulated</p>
            <p className="truncate font-semibold">{school.name}</p>
          </div>
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">Sawa would like to</h1>
        <ul className="mt-3 space-y-2.5 text-[15px]">
          {["Read your name, grade and class list", "Read your timetable and school notices", "Use your guardian link to keep you safe"].map((t) => (
            <li key={t} className="flex gap-3"><Check size={18} className="mt-0.5 shrink-0 text-[#2E9E6B]" /> {t}</li>
          ))}
        </ul>
        <div className="mt-4 rounded-2xl bg-white/50 p-3 text-sm">
          <p className="flex items-center gap-2 font-semibold"><ShieldCheck size={16} /> Guardian-verified</p>
          <p className="mt-1 text-[var(--muted)]">Students under 16 may not have UAE PASS. Your guardian, already verified with UAE PASS (simulated), linked this account.</p>
        </div>
        <p className="mt-4 flex items-center gap-2 text-xs text-[var(--muted)]"><Lock size={12} /> Sawa never sees your school password.</p>
      </div>
      <div className="mt-auto space-y-3 pt-8">
        <button className="btn-ink w-full !min-h-14 text-[17px]" onClick={onAllow}>Allow and continue</button>
        <p className="text-center text-xs text-[var(--muted)]">Demo: no real school system is contacted.</p>
      </div>
    </motion.section>
  );
}

function LoadingStep({ onDone }: { onDone: () => void }) {
  const [p, setP] = useState(4);
  const reduce = useReducedMotion();
  const done = useLatest(onDone);
  useEffect(() => {
    const steps = [22, 48, 71, 100];
    const ts = steps.map((v, i) => setTimeout(() => setP(v), (reduce ? 120 : 420) * (i + 1)));
    const end = setTimeout(() => done.current(), reduce ? 700 : 2200);
    return () => { ts.forEach(clearTimeout); clearTimeout(end); };
  }, [done, reduce]);
  const status = p < 50 ? "Setting things up…" : p < 100 ? "Loading your school…" : "Almost there…";
  return (
    <motion.section {...page} className="flex min-h-dvh flex-col items-center justify-center px-6">
      <motion.div animate={{ filter: `drop-shadow(0 10px ${10 + p * 0.3}px rgba(140,89,242,${0.15 + p * 0.003}))`, scale: 1 + p * 0.0012 }} transition={{ duration: 0.5 }}>
        <Icon3D name="logo3d" size={116} alt="Sawa" />
      </motion.div>
      <div className="mt-16 h-1.5 w-40 overflow-hidden rounded-full bg-black/10" role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100}>
        <motion.div className="h-full rounded-full" style={{ background: "var(--grad-verify)" }} animate={{ width: `${p}%` }} transition={{ duration: 0.45, ease: EASE }} />
      </div>
      <AnimatePresence mode="wait">
        <motion.p key={status} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="mt-6 text-[15px] font-medium text-black/55">{status}</motion.p>
      </AnimatePresence>
    </motion.section>
  );
}

function ScanStep({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState(0);
  const labels = ["Reading card details…", "Checking security features…", "Card read"];
  const done = useLatest(onDone);
  useEffect(() => {
    const a = setTimeout(() => setPhase(1), reduce ? 300 : 1300);
    const b = setTimeout(() => setPhase(2), reduce ? 600 : 2500);
    const c = setTimeout(() => done.current(), reduce ? 900 : 3300);
    return () => [a, b, c].forEach(clearTimeout);
  }, [done, reduce]);
  return (
    <motion.section {...page} className="flex min-h-dvh flex-col px-6 pb-8 pt-14">
      <div className="flex justify-center"><Icon3D name="logo3d" size={40} /></div>
      <h1 className="mt-6 text-[30px] font-bold tracking-tight">Scanning your ID</h1>
      <p className="mt-2 text-[var(--muted)]">Hold your card steady inside the frame</p>
      <div className="relative mx-auto mt-12" style={{ width: 320, height: 220 }}>
        <div className="absolute left-[10px] top-[15px]"><IdCard scanning /></div>
        {/* corner brackets */}
        {[["top-0 left-0", "border-t-4 border-l-4 rounded-tl-md"], ["top-0 right-0", "border-t-4 border-r-4 rounded-tr-md"], ["bottom-0 left-0", "border-b-4 border-l-4 rounded-bl-md"], ["bottom-0 right-0", "border-b-4 border-r-4 rounded-br-md"]].map(([pos, b]) => (
          <span key={pos} className={`absolute h-7 w-7 border-[#8C59F2] ${pos} ${b}`} />
        ))}
        {!reduce && phase < 2 && (
          <motion.div className="absolute inset-x-0 h-[60px]" initial={{ top: -46 }} animate={{ top: [-46, 170, -46] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}>
            <div className="h-[57px] w-full" style={{ background: "linear-gradient(180deg, rgba(123,106,89,0) 0%, rgba(191,128,255,.45) 100%)" }} />
            <div className="h-[3px] w-full rounded bg-[#F2D9FF]" style={{ boxShadow: "0 0 12px 2px #B366FF" }} />
          </motion.div>
        )}
      </div>
      <div className="mt-10 flex justify-center">
        <motion.span layout className="inline-flex items-center gap-2 rounded-full bg-[#8C59F2]/12 px-4 py-2 text-sm font-medium text-[#8C59F2]">
          {phase < 2 ? <motion.span className="h-2 w-2 rounded-full bg-[#8C59F2]" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} /> : <Check size={14} />}
          {labels[phase]}
        </motion.span>
      </div>
      <div className="mt-auto pt-8"><StepBars done={1} /></div>
      <div className="btn-verify mt-6 w-full text-[17px]" aria-live="polite">Scanning…</div>
    </motion.section>
  );
}

function FaceStep({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();
  const [p, setP] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setP((v) => Math.min(100, v + (reduce ? 50 : 4))), 90);
    return () => clearInterval(id);
  }, [reduce]);
  const done = useLatest(onDone);
  useEffect(() => { if (p >= 100) { const t = setTimeout(() => done.current(), 450); return () => clearTimeout(t); } }, [p, done]);
  return (
    <motion.section {...page} className="flex min-h-dvh flex-col items-center px-6 pb-8 pt-14">
      <Icon3D name="logo3d" size={40} />
      <h1 className="mt-6 self-start text-[30px] font-bold tracking-tight">Quick face match</h1>
      <p className="mt-2 self-start text-[var(--muted)]">Simulated for the prototype — the camera is not used.</p>
      <div className="mt-5 opacity-70"><IdCard small /></div>
      <div className="relative -mt-2 grid h-[236px] w-[236px] place-items-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" aria-hidden>
          <defs><linearGradient id="ring" x1="0" x2="1"><stop offset="0" stopColor="#734DF2" /><stop offset="1" stopColor="#F280D9" /></linearGradient></defs>
          <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(0,0,0,.08)" strokeWidth="3" />
          <motion.circle cx="50" cy="50" r="47" fill="none" stroke="url(#ring)" strokeWidth="3" strokeLinecap="round" pathLength={1} initial={{ pathLength: 0 }} animate={{ pathLength: p / 100 }} transition={{ ease: "linear" }} />
        </svg>
        <div className="relative h-[200px] w-[200px] overflow-hidden rounded-full border-[3px] border-white bg-[#8C59F2]/12">
          <div className="absolute left-1/2 top-[22%] h-[44%] w-[37%] -translate-x-1/2 rounded-full bg-[#7B6A59]/35" />
          <div className="absolute bottom-[-12%] left-1/2 h-[48%] w-[80%] -translate-x-1/2 rounded-full bg-[#7B6A59]/35" />
          {!reduce && p < 100 && (
            <motion.div className="absolute inset-x-0" animate={{ top: ["-10%", "80%", "-10%"] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}>
              <div className="h-10" style={{ background: "linear-gradient(180deg, rgba(123,106,89,0), rgba(191,128,255,.45))" }} />
              <div className="h-0.5 bg-[#F2D9FF]" style={{ boxShadow: "0 0 8px 1px #B366FF" }} />
            </motion.div>
          )}
        </div>
      </div>
      <p className="mt-6 flex items-center gap-2 text-sm font-medium text-[#8C59F2]">
        <motion.span className="h-2 w-2 rounded-full bg-[#8C59F2]" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
        {p < 100 ? "Matching face to ID (demo)…" : "Match confirmed (demo)"}
      </p>
      <div className="mt-auto w-full pt-8"><StepBars done={2} /></div>
      <div className="btn-verify mt-6 w-full text-[17px]">{p < 100 ? "Matching…" : "Done"}</div>
    </motion.section>
  );
}

/* ── Interests: Figma carousel + "What else are you into?" sheet ── */
const FEATURED = INTERESTS.filter((i) => i.featured);
const AI_HINTS: Record<string, string[]> = {
  astro: ["science", "photography"], space: ["science"], robot: ["robotics", "coding"], app: ["coding"], game: ["gaming", "coding"], ai: ["coding"],
  film: ["photography", "arts"], draw: ["arts"], paint: ["arts"], fashion: ["arts", "business"], stock: ["investing"], money: ["investing", "business"],
  startup: ["business"], debate: ["debate"], mun: ["debate"], football: ["sports"], gym: ["sports"], guitar: ["music"], piano: ["music"], bake: ["cooking"],
  climate: ["environment"], plant: ["environment"], book: ["reading"], write: ["reading"], math: ["math"], chem: ["science"], physics: ["science"], trip: ["travel"],
};

function InterestsStep({ selected, setSelected, onNext }: { selected: string[]; setSelected: (s: string[]) => void; onNext: () => void }) {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [more, setMore] = useState(false);
  const cards = [...FEATURED, { id: "other", en: "Other", ar: "أخرى", img: "/figma/interests/other.png", tint: "#C9B6FA" }];
  const toggle = (id: string) => setSelected(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  const nav = (d: number) => setIdx((i) => Math.max(0, Math.min(cards.length - 1, i + d)));
  const cur = cards[idx];
  const label = (id: string) => INTERESTS.find((i) => i.id === id)?.en ?? id;

  return (
    <motion.section {...page} className="flex min-h-dvh flex-col pb-8 pt-14"
      onKeyDown={(e) => { if (e.key === "ArrowRight") nav(1); if (e.key === "ArrowLeft") nav(-1); }}>
      <div className="flex justify-center"><Icon3D name="logo3d" size={34} /></div>
      <div className="px-6">
        <h1 className="mt-5 text-[32px] font-bold leading-tight tracking-tight">What brings you here?</h1>
        <p className="mt-1 text-[17px] text-black/75">Please select 3 or more interests</p>
      </div>

      <div className="relative mt-6 h-[420px] select-none" role="listbox" aria-label="Interests" aria-multiselectable="true">
        {/* glow behind the active card */}
        <motion.div aria-hidden className="absolute left-1/2 top-[70px] h-[300px] w-[300px] -translate-x-1/2 rounded-full" animate={{ backgroundColor: cur.tint ?? "#A9C3FF" }} transition={{ duration: 0.5 }} style={{ filter: "blur(45px)", opacity: 0.7 }} />
        <motion.div className="absolute inset-0" drag={reduce ? false : "x"} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.25}
          onDragEnd={(_, i) => { if (i.offset.x < -50) nav(1); else if (i.offset.x > 50) nav(-1); }}>
          {cards.map((c, i) => {
            const d = i - idx;
            const on = selected.includes(c.id);
            const isOther = c.id === "other";
            return (
              <motion.button key={c.id} type="button" role="option" aria-selected={isOther ? undefined : on} aria-label={isOther ? "More interests" : c.en}
                onClick={() => { if (d !== 0) return setIdx(i); if (isOther) setMore(true); else toggle(c.id); }}
                className="absolute left-1/2 top-[30px] origin-center"
                initial={false}
                animate={{ x: `calc(-50% + ${d * 205}px)`, scale: d === 0 ? 1 : 0.62, opacity: Math.abs(d) > 1 ? 0 : d === 0 ? 1 : 0.75, rotateY: d * -18, zIndex: 10 - Math.abs(d) }}
                transition={spring}
                style={{ width: 262, height: 358, perspective: 900 }}
                tabIndex={d === 0 ? 0 : -1}>
                <motion.div className="relative h-full w-full overflow-hidden rounded-[22px] border"
                  animate={{ borderColor: on ? "#8C59F2" : "rgba(255,255,255,.7)", backgroundColor: on ? "rgba(178,156,250,.72)" : "rgba(255,255,255,.22)", boxShadow: d === 0 ? (on ? "0 18px 40px rgba(140,89,242,.45)" : "0 18px 40px rgba(64,115,255,.25)") : "none" }}
                  transition={{ duration: 0.3 }} style={{ borderWidth: 2, backdropFilter: "blur(8px)" }}>
                  { }
                  <img src={c.img} alt="" draggable={false} className="absolute left-1/2 top-5 h-[240px] w-[240px] -translate-x-1/2 object-contain drop-shadow-[0_12px_14px_rgba(0,0,0,.18)]" />
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2"><CurvedLabel text={c.en} width={230} size={40} curve={18} /></div>
                  <AnimatePresence>
                    {on && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={spring} className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-[#8C59F2] text-white shadow"><Check size={17} strokeWidth={3} /></motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.button>
            );
          })}
        </motion.div>
        <button aria-label="Previous interest" onClick={() => nav(-1)} disabled={idx === 0} className="absolute start-2 top-[190px] z-20 grid h-10 w-10 place-items-center rounded-full bg-white/50 backdrop-blur transition disabled:opacity-0"><ChevronLeft size={20} className="rtl:rotate-180" /></button>
        <button aria-label="Next interest" onClick={() => nav(1)} disabled={idx === cards.length - 1} className="absolute end-2 top-[190px] z-20 grid h-10 w-10 place-items-center rounded-full bg-white/50 backdrop-blur transition disabled:opacity-0"><ChevronRight size={20} className="rtl:rotate-180" /></button>
      </div>

      <div className="flex justify-center gap-1.5" aria-hidden>
        {cards.map((c, i) => <motion.span key={c.id} className="h-1.5 rounded-full bg-black/70" animate={{ width: i === idx ? 18 : 6, opacity: i === idx ? 1 : 0.25 }} />)}
      </div>

      <div className="mt-4 min-h-[36px] px-6">
        <div className="flex flex-wrap justify-center gap-1.5">
          <AnimatePresence>
            {selected.map((id) => (
              <motion.button layout key={id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={() => toggle(id)}
                className="chip !bg-white/75" aria-label={`Remove ${label(id)}`}>{label(id)} <span aria-hidden className="opacity-50">×</span></motion.button>
            ))}
          </AnimatePresence>
          <button className="chip !border-dashed" onClick={() => setMore(true)}>+ More</button>
        </div>
      </div>

      <div className="mt-auto px-6 pt-6">
        <p className="mb-2 text-center text-sm text-[var(--muted)]" aria-live="polite">{selected.length < 3 ? `${selected.length} of 3 selected` : `${selected.length} selected`}</p>
        <button className="btn-glass w-full" disabled={selected.length < 3} onClick={onNext}>Continue <ArrowRight size={22} className="rtl:rotate-180" /></button>
      </div>

      <MoreInterests open={more} onClose={() => setMore(false)} selected={selected} toggle={toggle} add={(ids) => setSelected([...new Set([...selected, ...ids])])} />
    </motion.section>
  );
}

function MoreInterests({ open, onClose, selected, toggle, add }: { open: boolean; onClose: () => void; selected: string[]; toggle: (id: string) => void; add: (ids: string[]) => void }) {
  const [q, setQ] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const suggest = () => {
    const words = q.toLowerCase();
    const ids = [...new Set(Object.entries(AI_HINTS).filter(([k]) => words.includes(k)).flatMap(([, v]) => v))];
    if (ids.length) { add(ids); setHint(`Added ${ids.map((i) => INTERESTS.find((x) => x.id === i)?.en).join(", ")}`); }
    else setHint("No match yet — try another word, or pick from the list.");
    setQ("");
  };
  return (
    <Sheet open={open} onClose={onClose} title="What else are you into?" tone="violet">
      <p className="-mt-2 mb-5 text-white/85">Pick a few, or describe one and Sawa will match it</p>
      <div className="flex flex-wrap gap-2.5">
        {INTERESTS.filter((i) => !["robotics"].includes(i.id)).map((i) => {
          const on = selected.includes(i.id);
          return (
            <motion.button key={i.id} layout whileTap={{ scale: 0.95 }} onClick={() => toggle(i.id)} aria-pressed={on}
              className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-[15px] font-medium transition ${on ? "border-white bg-white text-[#5C29BF] shadow-[0_6px_16px_rgba(102,38,204,.3)]" : "border-white/45 bg-white/18 text-white"}`}>
              {on ? <Check size={14} /> : <span aria-hidden>+</span>} {i.en}
            </motion.button>
          );
        })}
      </div>
      <p className="mt-8 flex items-center gap-1.5 text-sm font-medium"><Sparkles size={14} /> Suggestions</p>
      <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) suggest(); }} className="mt-2 flex items-center gap-2 rounded-full border border-white/60 bg-white/20 p-1.5 ps-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type an interest… e.g. astrophotography" aria-label="Describe an interest" className="min-w-0 flex-1 bg-transparent text-white placeholder:text-white/70 outline-none" />
        <button aria-label="Suggest" className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#5C29BF]"><ArrowRight size={18} className="-rotate-90" /></button>
      </form>
      <p className="mt-2 min-h-5 text-sm text-white/90" aria-live="polite">{hint}</p>
      <p className="text-xs text-white/70">Matched on this device from keywords — nothing is sent to an AI service.</p>
      <button className="mt-5 w-full rounded-full bg-white py-3.5 font-semibold text-[#5C29BF]" onClick={onClose}>Done · {selected.length} selected</button>
    </Sheet>
  );
}

/* ── Matching: real ranking over the opportunity catalogue, shown stage by stage ── */
function MatchingStep({ profile, onDone }: { profile: Profile; onDone: () => void }) {
  const reduce = useReducedMotion();
  const ranked = useMemo(() => rankOpportunities(profile, OPPORTUNITIES), [profile]);
  const open = ranked.filter((m) => m.score > 20);
  const top = ranked.slice(0, 3);
  const school = SCHOOLS.find((s) => s.id === profile.schoolId)!;
  const communities = COMMUNITIES.filter((c) => c.interests.some((i) => profile.interests.includes(i))).length;
  const [stage, setStage] = useState(0);
  const done = useLatest(onDone);
  const stages = [
    `Reading your ${profile.interests.length} interests`,
    `Checking ${OPPORTUNITIES.length} opportunities for age ${new Date().getFullYear() - (profile.birthYear ?? 2012)}`,
    `Ranking by distance from ${school.name.replace(" (sample)", "")}`,
    `Found ${open.length} matches and ${communities} communities`,
  ];
  useEffect(() => {
    const ts = stages.map((_, i) => setTimeout(() => setStage(i + 1), (reduce ? 150 : 900) * (i + 1)));
    const end = setTimeout(() => done.current(), reduce ? 900 : 4900);
    return () => { ts.forEach(clearTimeout); clearTimeout(end); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <motion.section {...page} className="flex min-h-dvh flex-col px-6 pb-8 pt-14">
      <div className="flex justify-center">
        <AiLoader text={stage >= 4 ? "Matched" : "Matching"} size={124} />
      </div>
      <h1 className="mt-5 text-center text-[28px] font-bold tracking-tight">Personalising Sawa</h1>
      <ul className="mt-6 space-y-3" aria-live="polite">
        {stages.map((t, i) => (
          <motion.li key={t} initial={{ opacity: 0, x: -8 }} animate={{ opacity: stage >= i ? 1 : 0.35, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3">
            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${stage > i ? "bg-[#8C59F2] text-white" : "bg-black/8"}`}>
              {stage > i ? <Check size={14} strokeWidth={3} /> : stage === i ? <motion.span className="h-2 w-2 rounded-full bg-[#8C59F2]" animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} /> : null}
            </span>
            <span className="font-medium">{t}</span>
          </motion.li>
        ))}
      </ul>
      <div className="mt-2 flex flex-wrap gap-1.5 ps-10">
        {profile.interests.map((id, i) => (
          <motion.span key={id} className="chip" initial={{ opacity: 0, y: 6 }} animate={{ opacity: stage >= 1 ? 1 : 0, y: 0, backgroundColor: stage >= 1 ? "rgba(140,89,242,.14)" : "rgba(255,255,255,.5)" }} transition={{ delay: i * 0.08 }}>
            {INTERESTS.find((x) => x.id === id)?.en}
          </motion.span>
        ))}
      </div>
      <div className="relative mt-6 flex-1">
        {top.map((m, i) => (
          <motion.div key={m.o.id} className="glass mb-3 flex items-center gap-3 rounded-[22px] p-3"
            initial={{ opacity: 0, y: 40, scale: 0.94 }} animate={stage >= 3 ? { opacity: 1, y: 0, scale: 1 } : {}} transition={{ delay: i * 0.18, ...spring }}>
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl" style={{ background: m.o.tint }}>
              {m.o.image ? <img src={m.o.image} alt="" className="h-12 w-12 object-contain" /> : <Sparkles size={20} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="label-xs">{TYPE_LABEL[m.o.type]}</p>
              <p className="truncate font-semibold">{m.o.titleEn}</p>
              <p className="truncate text-xs text-[var(--muted)]">{m.reasons[0]}</p>
            </div>
            <span className="text-lg font-bold text-[#8C59F2]">{m.score}%</span>
          </motion.div>
        ))}
      </div>
      <button className="mx-auto mt-2 text-sm font-semibold text-[var(--muted)] underline" onClick={onDone}>Skip</button>
    </motion.section>
  );
}

function DoneStep({ profile, onEnter }: { profile: Profile; onEnter: () => void }) {
  const ranked = useMemo(() => rankOpportunities(profile, OPPORTUNITIES).slice(0, 3), [profile]);
  const comms = COMMUNITIES.filter((c) => c.interests.some((i) => profile.interests.includes(i)));
  const age = new Date().getFullYear() - (profile.birthYear ?? 2012);
  return (
    <motion.section {...page} className="flex min-h-dvh flex-col px-6 pb-8 pt-10">
      <div className="flex justify-center"><MascotLive size={150} /></div>
      <h1 className="mt-3 text-center text-[30px] font-bold tracking-tight">You&apos;re all set, {profile.name}</h1>
      <p className="mt-1 text-center text-[var(--muted)]">Your Sawa is ready. Here&apos;s what we found for you.</p>
      <div className="mt-6 grid grid-cols-3 gap-2 text-center">
        {[[String(ranked.length > 0 ? rankOpportunities(profile, OPPORTUNITIES).filter((m) => m.score > 20).length : 0), "matches"], [String(comms.length), "communities"], [age < 15 ? "U15" : "15+", "safety tier"]].map(([n, l]) => (
          <div key={l} className="glass rounded-2xl py-3"><p className="text-2xl font-bold">{n}</p><p className="text-xs text-[var(--muted)]">{l}</p></div>
        ))}
      </div>
      <p className="label-xs mt-6 mb-2">Top picks</p>
      <ul className="space-y-2">
        {ranked.map((m) => (
          <li key={m.o.id} className="flex items-center justify-between rounded-2xl bg-white/45 px-4 py-3 text-sm">
            <span className="truncate font-semibold">{m.o.titleEn}</span><span className="font-bold text-[#8C59F2]">{m.score}%</span>
          </li>
        ))}
      </ul>
      {age < 15 && <p className="mt-4 rounded-2xl bg-white/40 p-3 text-xs text-[var(--muted)]">Under-15 tier: your school&apos;s clubs are open to you; activities outside school go to your guardian first. No public posts or direct messages.</p>}
      <button className="btn-ink mt-auto w-full !min-h-14 text-[17px]" onClick={onEnter}>Enter Sawa</button>
    </motion.section>
  );
}
