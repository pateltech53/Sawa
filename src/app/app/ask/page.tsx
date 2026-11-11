"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowUp, CalendarDays, ExternalLink, FileText, Mic, School, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { MascotVideo } from "@/components/shell/MascotVideo";
import { DotPattern } from "@/components/ui/dot-pattern";
import { ShiningText } from "@/components/ui/shining-text";
import { ToolCallsSection } from "@/components/ui/tool-calls-section";
import { agentSteps } from "@/lib/agent-steps";
import { useStore } from "@/lib/store";
import { MessageLoading } from "@/components/ui/message-loading";

interface Msg {
  role: "user" | "sawa";
  q?: string;
  text: string;
  sources?: { n: number; title: string; url: string; name: string }[];
  actions?: { id: string; label: string; href: string }[];
  mode?: string;
}

type Q = { en: string; ar: string };
const SUGGEST: Record<string, { topicEn: string; topicAr: string; icon: typeof CalendarDays; qs: Q[] }[]> = {
  parent: [
    { topicEn: "Documents", topicAr: "المستندات", icon: FileText, qs: [{ en: "ابنتي جددت الهوية، شو لازم أسوي؟", ar: "ابنتي جددت الهوية، شو لازم أسوي؟" }, { en: "What do I need for re-enrolment?", ar: "ما المطلوب لإعادة التسجيل؟" }] },
    { topicEn: "This week", topicAr: "هذا الأسبوع", icon: CalendarDays, qs: [{ en: "What does my child have due this week?", ar: "ماذا لدى ابنتي مستحق هذا الأسبوع؟" }] },
    { topicEn: "Schools", topicAr: "المدارس", icon: School, qs: [{ en: "How do I transfer to another school?", ar: "كيف أنقل ابنتي إلى مدرسة أخرى؟" }] },
  ],
  student: [
    { topicEn: "This week", topicAr: "هذا الأسبوع", icon: CalendarDays, qs: [{ en: "What do I have due this week?", ar: "ماذا لدي مستحق هذا الأسبوع؟" }] },
    { topicEn: "Opportunities", topicAr: "الفرص", icon: Trophy, qs: [{ en: "Can I join the robotics competition?", ar: "هل يمكنني الانضمام إلى مسابقة الروبوتات؟" }, { en: "Which hackathons can I enter at my age?", ar: "ما الهاكاثونات المتاحة لعمري؟" }] },
    { topicEn: "Privacy", topicAr: "الخصوصية", icon: ShieldCheck, qs: [{ en: "Who can see my data?", ar: "من يرى بياناتي؟" }] },
  ],
  teacher: [
    { topicEn: "Students", topicAr: "الطلاب", icon: School, qs: [{ en: "How do students under 16 sign in?", ar: "كيف يدخل الطلاب دون 16 سنة؟" }, { en: "Who can see student data?", ar: "من يرى بيانات الطلاب؟" }] },
    { topicEn: "Competitions", topicAr: "المسابقات", icon: Trophy, qs: [{ en: "Which hackathons are open to Grade 9 students?", ar: "ما الهاكاثونات المتاحة للصف التاسع؟" }] },
    { topicEn: "Services", topicAr: "الخدمات", icon: FileText, qs: [{ en: "How do school transport requests work?", ar: "كيف تعمل طلبات النقل المدرسي؟" }] },
  ],
};

function AskInner() {
  const { state, me, visibleNotices, logAi } = useStore();
  const ar = state.lang === "ar";
  const params = useSearchParams();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  const asked = useRef(false);

  async function ask(question: string) {
    if (!question.trim() || busy) return;
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setQ("");
    setBusy(true);
    try {
      const today = visibleNotices.filter((n) => n.status === "open").map((n) => ({ title: ar ? n.titleAr : n.titleEn, source: n.sourceSystem, due: n.dueAt, kind: n.kind }));
      const res = await fetch("/api/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question, lang: state.lang, role: me?.role, today }) });
      const j = await res.json();
      setMsgs((m) => [...m, { role: "sawa", q: question, text: j.answer, sources: j.sources, actions: j.actions, mode: j.mode }]);
      logAi(question, j.mode, j.flagged);
    } catch {
      setMsgs((m) => [...m, { role: "sawa", text: ar ? "تعذّر الوصول إلى المساعد، حاول مرة أخرى." : "Couldn't reach the assistant — please try again." }]);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const pre = params.get("q");
    if (pre && !asked.current) { asked.current = true; ask(pre); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, busy]);

  const groups = SUGGEST[me?.role ?? "parent"];
  const empty = msgs.length === 0;

  return (
    <div className="relative -mx-4 -mt-4 min-h-[calc(100dvh-7.5rem)] overflow-hidden rounded-b-[36px] px-4 pb-40 pt-6 text-white sm:mx-0 sm:mt-0 sm:rounded-[36px] sm:px-6"
      style={{ background: "#21173a" }}>
      {/* depth comes from layered surfaces and the mascot, not from glows */}
      <DotPattern width={24} height={24} cr={1} className="fill-white/[.06]" />

      <div className="relative">
        {empty ? (
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <MascotVideo mood="presenting" size={168} className="relative" />
            </div>
            <h1 className="mt-1 text-[34px] text-white">{ar ? "اسأل سوا" : "Ask Sawa"}</h1>
            <p className="mt-1 max-w-sm text-[15px] text-white/75">{ar ? "أجيب بالعربية والإنجليزية من مصادر رسمية فقط، مع ذكر المصدر، وأفتح لك الخدمة الصحيحة معبّأة مسبقاً." : "Answers in Arabic or English from official sources only, with the source shown, and the right service opened pre-filled."}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-1.5 text-[11px] font-semibold">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/12 px-2.5 py-1 ring-1 ring-white/15"><ShieldCheck size={12} /> {ar ? "تُحذف الأسماء والأرقام قبل الإرسال" : "Names & IDs stripped before sending"}</span>
              <span className="rounded-full bg-white/12 px-2.5 py-1 ring-1 ring-white/15">{ar ? "يرفض المواضيع غير الآمنة" : "Refuses unsafe topics"}</span>
            </div>
            <div className="mt-6 grid w-full gap-2.5 text-start sm:grid-cols-3">
              {groups.map((g) => (
                <section key={g.topicEn} className="rounded-[24px] bg-white/[.08] p-3 ring-1 ring-white/15 backdrop-blur-md">
                  <p className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-white/60"><g.icon size={13} /> {ar ? g.topicAr : g.topicEn}</p>
                  <div className="space-y-1.5">
                    {g.qs.map((x) => {
                      const text = ar ? x.ar : x.en;
                      return <button key={x.en} dir="auto" className="w-full rounded-[16px] bg-white/10 px-3 py-2.5 text-start text-sm font-medium transition hover:bg-white/20" onClick={() => ask(text)}>{text}</button>;
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-4 flex items-center gap-2">
            <MascotVideo mood={busy ? "thinking" : "idle"} size={64} decorative />
            <div><p className="font-bold">{ar ? "اسأل سوا" : "Ask Sawa"}</p><p className="text-xs text-white/65">{ar ? "من مصادر رسمية فقط" : "Official sources only"}</p></div>
          </div>
        )}

        <ul className="mt-4 space-y-3" aria-live="polite">
          {msgs.map((m, i) => (
            <li key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} pop`}>
              {m.role === "user" ? (
                <p className="max-w-[85%] rounded-[24px] rounded-ee-md bg-[#5c29bf] px-4 py-3 text-white" dir="auto">{m.text}</p>
              ) : (
                <div className="max-w-[92%] rounded-[24px] rounded-es-md bg-white/95 px-4 py-3 text-[#121217] shadow-[0_16px_34px_-18px_rgba(0,0,0,.6)]">
                  <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-[#5C29BF]"><Sparkles size={12} /> Sawa</p>
                  {m.q && m.mode !== "policy" && (() => {
                    const steps = agentSteps(m.q, me?.role, m.sources, visibleNotices.filter((n) => n.status === "open").length, ar);
                    return steps.length ? (
                      <div className="mb-2 border-b border-black/8 pb-1">
                        <ToolCallsSection iconSize={16} label={(n) => (ar ? `راجع سوا ${n} مصادر` : `Sawa checked ${n} source${n > 1 ? "s" : ""}`)}
                          toolCalls={steps.map((x) => ({ tool_name: x.name, tool_category: x.system, message: x.message, color: x.color, output: x.output }))} />
                      </div>
                    ) : null;
                  })()}
                  <p className="whitespace-pre-line" dir="auto">{m.text}</p>
                  {!!m.actions?.length && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.actions.map((a) => <Link key={a.id} href={a.href} className="btn-ink !min-h-9 text-sm">{a.label}</Link>)}
                    </div>
                  )}
                  {!!m.sources?.length && (
                    <div className="mt-3 border-t border-black/10 pt-2">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--muted)]">{ar ? "المصادر" : "Sources"}</p>
                      <ul className="mt-1 space-y-1">
                        {m.sources.map((s) => (
                          <li key={s.n} className="text-xs">
                            <a href={s.url} target={s.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="inline-flex items-center gap-1 underline">[{s.n}] {s.title} <ExternalLink size={11} /></a>
                            <span className="text-[var(--muted)]"> · {s.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {m.mode && <p className="mt-2 text-[10px] text-[var(--muted)]">{m.mode.startsWith("ai:") ? `AI · ${m.mode.slice(3)} · grounded` : m.mode === "policy" ? "safety policy" : "retrieval-only (demo mode)"}</p>}
                </div>
              )}
            </li>
          ))}
          {busy && (
            <li className="flex items-center gap-2 rounded-[22px] bg-white/10 px-4 py-3 ring-1 ring-white/15 w-fit">
              <MessageLoading className="text-white" label={ar ? "سوا يكتب" : "Sawa is typing"} />
              <ShiningText text={ar ? "يبحث في المصادر الرسمية…" : "Thinking · checking official sources…"} className="text-sm" />
            </li>
          )}
        </ul>
        <div ref={end} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="fixed inset-x-0 bottom-[104px] z-30 mx-auto w-[min(100%-24px,720px)]">
        <div className="flex items-center gap-2 rounded-full bg-white/95 p-1.5 ps-4 text-[#121217] shadow-[0_18px_40px_-16px_rgba(27,18,64,.8)] ring-1 ring-white">
          <Sparkles size={18} className="shrink-0 text-[#8C59F2]" aria-hidden />
          <input dir="auto" className="min-w-0 flex-1 bg-transparent py-2 outline-none" placeholder={ar ? "اكتب سؤالك…" : "Ask about a school, a deadline, a competition…"} value={q} onChange={(e) => setQ(e.target.value)} aria-label={ar ? "سؤالك" : "Your question"} />
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full opacity-40" title={ar ? "الإدخال الصوتي — قريباً" : "Voice input — coming next"} aria-label="Voice input (coming soon)" disabled><Mic size={18} /></button>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-[#5c29bf] text-white disabled:opacity-40" aria-label={ar ? "إرسال" : "Send"} disabled={busy || !q.trim()}><ArrowUp size={18} /></button>
        </div>
      </form>
    </div>
  );
}

export default function Ask() {
  return <Suspense><AskInner /></Suspense>;
}
