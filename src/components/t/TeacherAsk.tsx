"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle, ArrowUp, BadgeCheck, Briefcase, Building, ChevronDown, ClipboardCopy, ExternalLink, FileText, Lightbulb, MessageSquareText, RotateCcw,
  ShieldCheck, Sparkles, Telescope, Trash2, Users,
} from "lucide-react";
import { useToast } from "@/components/s/kit";
import { SCHOOLS } from "@/lib/seed";
import { useStore } from "@/lib/store";
import type { TeacherAiAnswer } from "@/lib/types";
import { SourceBadge } from "./kit";

interface Msg { role: "user" | "sawa"; text: string; data?: TeacherAiAnswer; error?: boolean }

const GROUPS: { icon: typeof Building; en: string; ar: string; qs: [string, string][] }[] = [
  { icon: Building, en: "Schools & career", ar: "المدارس والمسار المهني", qs: [
    ["I've received a job offer from Al Diyafah High School. Can you help me understand whether this school would be a good career move?", "تلقيت عرض عمل من مدرسة الضيافة الثانوية. هل هي خطوة مهنية جيدة؟"],
    ["Which Outstanding-rated UK curriculum schools in Dubai have science roles?", "ما المدارس ذات التقييم المتميز بالمنهج البريطاني في دبي التي لديها وظائف علوم؟"],
    ["What career and PD options fit a science teacher with 7 years' experience?", "ما خيارات المسار المهني والتطوير المناسبة لمعلم علوم بخبرة 7 سنوات؟"],
  ] },
  { icon: Telescope, en: "Student opportunities", ar: "فرص الطلاب", qs: [
    ["What competitions are available for students aged 14-16 in Dubai?", "ما المسابقات المتاحة لطلاب 14-16 سنة في دبي؟"],
    ["Which hackathons are open to Grade 9 students?", "ما الهاكاثونات المتاحة لطلاب الصف التاسع؟"],
  ] },
  { icon: MessageSquareText, en: "Classroom", ar: "الصف", qs: [
    ["Draft a message to 8A parents about next week's science quiz", "اكتب رسالة لأولياء أمور 8أ عن اختبار العلوم الأسبوع القادم"],
    ["Suggest how to adapt the forces worksheet for students who need extra support", "اقترح طريقة لتكييف ورقة عمل القوى للطلاب الذين يحتاجون دعماً"],
  ] },
  { icon: Users, en: "Network", ar: "الشبكة", qs: [["Which science teachers could mentor me or co-coach a robotics team?", "من معلمو العلوم الذين يمكنهم إرشادي أو تدريب فريق روبوتات معي؟"]] },
];

const STEPS: Record<string, [string, string]> = {
  school: ["Checking SAWA school data", "أبحث في بيانات المدارس"],
  opp: ["Searching opportunity listings", "أبحث في قوائم الفرص"],
  career: ["Looking at roles and PD", "أبحث في الوظائف والتطوير المهني"],
  draft: ["Drafting your message", "أصيغ رسالتك"],
  any: ["Reading approved sources", "أقرأ المصادر المعتمدة"],
};
const stepsFor = (q: string) => {
  const t = q.toLowerCase();
  const s: string[] = [];
  if (/school|academy|offer|مدرسة/.test(t)) s.push("school");
  if (/competition|hackathon|opportunit|aged|مسابق/.test(t)) s.push("opp");
  if (/career|job|pd|role|وظيف/.test(t)) s.push("career");
  if (/draft|write|message|اكتب|رسالة/.test(t)) s.push("draft");
  return [...s, "any"];
};

export function TeacherAsk() {
  const { state, me, logAi } = useStore();
  const params = useSearchParams();
  const toast = useToast();
  const ar = state.lang === "ar";
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const end = useRef<HTMLDivElement>(null);
  const asked = useRef(false);

  async function ask(question: string) {
    if (!question.trim() || busy) return;
    const history = msgs.slice(-4).map((m) => ({ role: m.role, text: m.data?.answer ?? m.text }));
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setQ("");
    setBusy(question);
    setStep(0);
    const tick = setInterval(() => setStep((s) => s + 1), 900);
    try {
      const res = await fetch("/api/teacher-ai", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ question, lang: state.lang, role: me?.role, history, teacher: { name: me?.name, subjects: ["Science", "Computing"], grades: "8-9", years: 7, school: SCHOOLS.find((s) => s.id === me?.schoolId)?.name } }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as TeacherAiAnswer;
      setMsgs((m) => [...m, { role: "sawa", text: data.answer, data }]);
      logAi(question, data.mode, data.flagged);
    } catch {
      setMsgs((m) => [...m, { role: "sawa", text: question, error: true }]);
    } finally {
      clearInterval(tick);
      setBusy(null);
    }
  }

  useEffect(() => {
    const pre = params.get("q");
    if (pre && !asked.current) { asked.current = true; ask(pre); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs, busy]);

  const steps = busy ? stepsFor(busy) : [];

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-3xl flex-col">
      {msgs.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-white "><Sparkles size={22} aria-hidden /></span>
            <div>
              <h1 className="text-[26px] font-bold leading-tight tracking-tight">SAWA AI</h1>
              <p className="text-sm text-grey">{ar ? "مساعدك في المدرسة: مبني على بيانات سوا المعتمدة، ويقول بوضوح ما لا يعرفه." : "Your school-day assistant. Grounded in approved SAWA data, and clear about what it doesn't know."}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5 text-[12px]">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/60 px-2.5 py-1 font-medium"><ShieldCheck size={12} aria-hidden /> {ar ? "لا تُرسل أسماء الطلاب" : "Student names never sent"}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/60 px-2.5 py-1 font-medium"><BadgeCheck size={12} aria-hidden /> {ar ? "الحقائق مع مصادرها" : "Facts shown with sources"}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/60 px-2.5 py-1 font-medium"><Lightbulb size={12} aria-hidden /> {ar ? "النصائح موسومة كنصائح" : "Advice labelled as advice"}</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {GROUPS.map((g) => (
              <section key={g.en} className="t-card rounded-[22px] p-3.5" aria-label={ar ? g.ar : g.en}>
                <p className="mb-2 flex items-center gap-1.5 text-[13px] font-bold"><g.icon size={15} aria-hidden /> {ar ? g.ar : g.en}</p>
                <div className="flex flex-col gap-1.5">
                  {g.qs.map(([en, a]) => <button key={en} dir="auto" onClick={() => ask(ar ? a : en)} className="t-row px-3 py-2.5 text-start text-[13.5px] font-medium active:scale-[0.99]">{ar ? a : en}</button>)}
                </div>
              </section>
            ))}
          </div>
          <details className="mt-4 t-row px-4 py-3 text-[13px]">
            <summary className="cursor-pointer font-semibold">{ar ? "ما الذي يمكن لـ SAWA AI رؤيته؟" : "What can SAWA AI see?"}</summary>
            <ul className="mt-2 space-y-1.5">
              <li className="flex items-center justify-between gap-2">{ar ? "دليل المدارس (صيغة KHDA)" : "School directory (KHDA format)"} <SourceBadge status={SCHOOLS.some((s) => s.id.startsWith("khda-")) ? "imported" : "sample"} /></li>
              <li className="flex items-center justify-between gap-2">{ar ? "فرص ومسابقات الطلاب" : "Student opportunities & competitions"} <SourceBadge status="sample" /></li>
              <li className="flex items-center justify-between gap-2">{ar ? "الوظائف والتطوير المهني" : "Jobs & professional development"} <SourceBadge status="sample" /></li>
              <li className="flex items-center justify-between gap-2">{ar ? "مكتبة الموارد وشبكة المعلمين" : "Resource library & teacher network"} <SourceBadge status="sample" /></li>
              <li className="flex items-center justify-between gap-2">{ar ? "سجلات الطلاب" : "Student records"} <span className="text-[11px] font-semibold text-grey">{ar ? "لا يراها" : "Not visible to the AI"}</span></li>
            </ul>
          </details>
        </motion.div>
      )}

      <ul className="flex-1 space-y-4 pt-2" aria-live="polite">
        {msgs.map((m, i) => (
          <motion.li key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={m.role === "user" ? "flex justify-end" : ""}>
            {m.role === "user" ? (
              <p dir="auto" className="max-w-[85%] rounded-3xl rounded-ee-md bg-ink px-4 py-3 text-white">{m.text}</p>
            ) : m.error ? (
              <div className="flex items-center gap-3 rounded-3xl bg-aered-50 px-4 py-3 text-sm text-aered-800" role="alert">
                <AlertTriangle size={18} aria-hidden /> <span className="flex-1">{ar ? "تعذّر الوصول إلى SAWA AI." : "Couldn't reach SAWA AI."}</span>
                <button className="chip !py-1.5" onClick={() => { setMsgs((x) => x.filter((_, j) => j !== i && j !== i - 1)); ask(m.text); }}><RotateCcw size={13} aria-hidden /> {ar ? "أعد المحاولة" : "Try again"}</button>
              </div>
            ) : m.data ? (
              <AnswerCard d={m.data} onCopy={(t) => { navigator.clipboard?.writeText(t).then(() => toast(ar ? "نُسخ" : "Copied"), () => toast(ar ? "تعذّر النسخ" : "Couldn't copy")); }} onAsk={ask} />
            ) : null}
          </motion.li>
        ))}
        {busy && (
          <li className="t-card max-w-md rounded-3xl px-4 py-3" aria-label={ar ? "يعمل" : "Working"}>
            <ul className="space-y-1.5 text-[13px]">
              {steps.map((s, i) => (
                <li key={s} className={`flex items-center gap-2 transition-opacity ${i <= step ? "opacity-100" : "opacity-35"}`}>
                  {i < Math.min(step, steps.length - 1) ? <BadgeCheck size={14} className="text-aegreen-700" aria-hidden /> : <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-sawa border-t-transparent" aria-hidden />}
                  {STEPS[s][ar ? 1 : 0]}
                </li>
              ))}
            </ul>
          </li>
        )}
      </ul>
      <div ref={end} />

      <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="sticky bottom-28 mt-4">
        <div className="t-card flex items-center gap-2 rounded-full p-1.5 ps-4 shadow-lg">
          <Sparkles size={17} className="shrink-0 text-sawa" aria-hidden />
          <input dir="auto" className="min-w-0 flex-1 bg-transparent py-2 outline-none" placeholder={ar ? "اسأل عن مدرسة، مسابقة، أو اطلب مسودة..." : "Ask about a school, a competition, or request a draft..."} value={q} onChange={(e) => setQ(e.target.value)} aria-label={ar ? "سؤالك" : "Your question"} maxLength={800} />
          {msgs.length > 0 && <button type="button" onClick={() => setMsgs([])} className="grid h-10 w-10 place-items-center rounded-full text-ink/50 hover:text-ink" aria-label={ar ? "محادثة جديدة" : "New conversation"}><Trash2 size={17} /></button>}
          <button className="grid h-10 w-10 place-items-center rounded-full bg-ink text-white transition disabled:opacity-30" aria-label={ar ? "إرسال" : "Send"} disabled={!!busy || !q.trim()}><ArrowUp size={18} /></button>
        </div>
      </form>
    </div>
  );
}

function AnswerCard({ d, onCopy, onAsk }: { d: TeacherAiAnswer; onCopy: (t: string) => void; onAsk: (q: string) => void }) {
  const { state } = useStore();
  const ar = state.lang === "ar";
  const [showFacts, setShowFacts] = useState(true);
  const live = d.mode.startsWith("ai:");
  const ICON = { school: Building, opportunity: Telescope, job: Briefcase, pd: BadgeCheck, educator: Users, resource: FileText } as const;
  return (
    <article className="t-card rounded-[26px] rounded-es-md p-4 sm:p-5">
      <p className="text-[15.5px] leading-relaxed" dir="auto">{d.answer}</p>

      {d.verified.length > 0 && (
        <section className="mt-4 rounded-2xl bg-white/80 p-3" aria-label={ar ? "معلومات موثقة" : "Verified information"}>
          <button className="flex w-full items-center justify-between gap-2 text-start" onClick={() => setShowFacts((v) => !v)} aria-expanded={showFacts}>
            <span className="flex items-center gap-1.5 text-[13px] font-bold text-aegreen-800"><BadgeCheck size={15} aria-hidden /> {ar ? "من بيانات سوا" : "From SAWA data"} <span className="font-normal text-grey">({d.verified.length})</span></span>
            <ChevronDown size={16} className={`transition ${showFacts ? "rotate-180" : ""}`} aria-hidden />
          </button>
          <AnimatePresence initial={false}>
            {showFacts && (
              <motion.dl initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-2 overflow-hidden">
                {d.verified.map((v, i) => (
                  <div key={i} className="border-t border-black/5 py-1.5 first:border-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3"><dt className="text-[12.5px] text-grey">{v.label}</dt><dd className="text-[13.5px] font-semibold">{v.value}</dd></div>
                    <p className="text-[11px] text-grey">{v.source}</p>
                  </div>
                ))}
              </motion.dl>
            )}
          </AnimatePresence>
        </section>
      )}

      {d.advice.length > 0 && (
        <section className="mt-3 t-row p-3" aria-label={ar ? "إرشاد بالذكاء الاصطناعي" : "AI guidance"}>
          <p className="flex items-center gap-1.5 text-[13px] font-bold text-ink"><Lightbulb size={15} aria-hidden /> {ar ? "إرشاد (ليس حقائق موثقة)" : "Guidance (advice, not verified fact)"}</p>
          <ul className="mt-1.5 list-disc space-y-1 ps-5 text-[14px]">{d.advice.map((a, i) => <li key={i} dir="auto">{a}</li>)}</ul>
        </section>
      )}

      {!!d.questions?.length && (
        <section className="mt-3 t-row p-3">
          <p className="text-[13px] font-bold">{ar ? "أسئلة تطرحها قبل القبول" : "Questions to ask before you accept"}</p>
          <ol className="mt-1.5 list-decimal space-y-1 ps-5 text-[14px]">{d.questions.map((x, i) => <li key={i} dir="auto">{x}</li>)}</ol>
        </section>
      )}

      {d.missing.length > 0 && (
        <section className="mt-3 rounded-2xl border border-aegold-200 bg-aegold-50 p-3" aria-label={ar ? "غير متوفر" : "Not in SAWA's data"}>
          <p className="flex items-center gap-1.5 text-[13px] font-bold text-aegold-900"><AlertTriangle size={15} aria-hidden /> {ar ? "غير موجود في بيانات سوا" : "Not in SAWA's data"}</p>
          <ul className="mt-1 space-y-0.5 text-[13px] text-aegold-900">{d.missing.map((m, i) => <li key={i}>{m}</li>)}</ul>
        </section>
      )}

      {d.draft && (
        <section className="mt-3 rounded-2xl bg-white p-3">
          <div className="flex items-center justify-between gap-2"><p className="text-[13px] font-bold">{ar ? "مسودة" : "Draft"}: {d.draft.title}</p><button className="chip !py-1" onClick={() => onCopy(`${d.draft!.title}\n\n${d.draft!.body}`)}><ClipboardCopy size={13} aria-hidden /> {ar ? "نسخ" : "Copy"}</button></div>
          <p className="mt-2 whitespace-pre-line text-[14px]" dir="auto">{d.draft.body}</p>
        </section>
      )}

      {d.records.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {d.records.map((r) => { const I = ICON[r.type]; return <Link key={`${r.type}-${r.id}`} href={r.href} className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-[12.5px] font-semibold"><I size={13} aria-hidden /> {r.title.replace(" (sample)", "")}</Link>; })}
        </div>
      )}

      {d.actions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {d.actions.map((a) => (
            <div key={a.href} className="flex flex-col">
              <Link href={a.href} className="btn-ink !min-h-10 text-sm">{a.label}</Link>
              {a.confirm && <span className="mt-1 text-[11px] text-grey">{a.confirm}</span>}
            </div>
          ))}
        </div>
      )}

      <footer className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-black/10 pt-2 text-[11px] text-grey">
        {d.sources.map((s) => (
          <a key={s.n} href={s.url} target={s.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="inline-flex items-center gap-1 hover:text-ink">[{s.n}] {s.title.replace(" (sample)", "")} {s.url.startsWith("http") && <ExternalLink size={10} aria-hidden />} <SourceBadge status={s.status} /></a>
        ))}
        <span className="ms-auto">{d.mode === "policy" ? (ar ? "سياسة الأمان" : "Safety policy") : live ? (ar ? "ذكاء اصطناعي مباشر" : "Live AI") : ar ? "وضع الاسترجاع فقط (بلا مفتاح)" : "Retrieval-only mode (no AI key)"}{d.tools.length ? ` · ${ar ? "أدوات" : "searched"}: ${d.tools.join(", ")}` : ""}</span>
      </footer>
      {d.records.some((r) => r.type === "school") && (
        <button className="mt-2 text-[12.5px] font-semibold text-sawa hover:underline" onClick={() => onAsk(ar ? "ما المدارس المشابهة التي لديها وظائف علوم مفتوحة؟" : "Which similar schools have open science roles?")}>{ar ? "اعرض مدارس مشابهة لديها وظائف" : "Show similar schools that are hiring"}</button>
      )}
    </article>
  );
}
