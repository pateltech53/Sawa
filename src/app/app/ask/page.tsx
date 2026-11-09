"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowUp, ExternalLink, Loader2, Mic, ShieldCheck } from "lucide-react";
import { Mascot, Pill } from "@/components/ui";
import { useStore } from "@/lib/store";

interface Msg {
  role: "user" | "sawa";
  text: string;
  sources?: { n: number; title: string; url: string; name: string }[];
  actions?: { id: string; label: string; href: string }[];
  mode?: string;
}

const SUGGEST: Record<string, { en: string; ar: string }[]> = {
  parent: [
    { en: "ابنتي جددت الهوية، شو لازم أسوي؟", ar: "ابنتي جددت الهوية، شو لازم أسوي؟" },
    { en: "What do I need for re-enrolment?", ar: "ما المطلوب لإعادة التسجيل؟" },
    { en: "What does my child have due this week?", ar: "ماذا لدى ابنتي مستحق هذا الأسبوع؟" },
  ],
  student: [
    { en: "What do I have due this week?", ar: "ماذا لدي مستحق هذا الأسبوع؟" },
    { en: "Can I join the robotics competition?", ar: "هل يمكنني الانضمام إلى مسابقة الروبوتات؟" },
    { en: "Who can see my data?", ar: "من يرى بياناتي؟" },
  ],
  teacher: [
    { en: "How do students under 16 sign in?", ar: "كيف يدخل الطلاب دون 16 سنة؟" },
    { en: "How do school transport requests work?", ar: "كيف تعمل طلبات النقل المدرسي؟" },
    { en: "Who can see student data?", ar: "من يرى بيانات الطلاب؟" },
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
      setMsgs((m) => [...m, { role: "sawa", text: j.answer, sources: j.sources, actions: j.actions, mode: j.mode }]);
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

  const sugg = SUGGEST[me?.role ?? "parent"];

  return (
    <div className="flex min-h-[70dvh] flex-col">
      {msgs.length === 0 && (
        <div className="flex flex-col items-center pt-4 text-center rise">
          <Mascot size={150} wave />
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-extrabold">{ar ? "اسأل سوا" : "Ask Sawa"}</h1>
          <p className="mt-1 max-w-sm text-sm text-[var(--muted)]">{ar ? "أجيب بالعربية والإنجليزية من مصادر رسمية فقط، مع ذكر المصدر — وأفتح لك الخدمة الصحيحة معبّأة مسبقاً." : "I answer in Arabic or English from official sources only, show you where it came from — and open the right service, pre-filled."}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            <Pill><ShieldCheck size={12} /> {ar ? "تُحذف الأسماء والأرقام قبل الإرسال" : "Names & IDs stripped before sending"}</Pill>
            <Pill>{ar ? "يرفض المواضيع غير الآمنة" : "Refuses unsafe topics"}</Pill>
          </div>
          <div className="mt-6 flex w-full flex-col gap-2">
            {sugg.map((x) => {
              const text = ar ? x.ar : x.en;
              return <button key={x.en} dir="auto" className="glass rounded-2xl px-4 py-3 text-start text-sm font-semibold transition hover:bg-white/70" onClick={() => ask(text)}>{text}</button>;
            })}
          </div>
        </div>
      )}

      <ul className="flex-1 space-y-3" aria-live="polite">
        {msgs.map((m, i) => (
          <li key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} pop`}>
            {m.role === "user" ? (
              <p className="max-w-[85%] rounded-3xl rounded-ee-md bg-black px-4 py-3 text-white" dir="auto">{m.text}</p>
            ) : (
              <div className="glass glass-strong max-w-[92%] rounded-3xl rounded-es-md px-4 py-3">
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
                          <a href={s.url} target={s.url.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="inline-flex items-center gap-1 underline">
                            [{s.n}] {s.title} <ExternalLink size={11} />
                          </a>
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
        {busy && <li className="flex"><span className="glass flex items-center gap-2 rounded-3xl px-4 py-3 text-sm"><Loader2 size={16} className="animate-spin" /> {ar ? "يبحث في المصادر…" : "Checking sources…"}</span></li>}
      </ul>
      <div ref={end} />

      <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="sticky bottom-28 mt-4">
        <div className="glass glass-strong flex items-center gap-2 rounded-full p-1.5 ps-4">
          <input dir="auto" className="min-w-0 flex-1 bg-transparent py-2 outline-none" placeholder={ar ? "اكتب سؤالك…" : "Ask anything about school life…"} value={q} onChange={(e) => setQ(e.target.value)} aria-label={ar ? "سؤالك" : "Your question"} />
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full opacity-40" title={ar ? "الإدخال الصوتي — قريباً" : "Voice input — coming next"} aria-label="Voice input (coming soon)" disabled><Mic size={18} /></button>
          <button className="jelly h-10 w-10 rounded-full" aria-label={ar ? "إرسال" : "Send"} disabled={busy || !q.trim()}><ArrowUp size={18} /></button>
        </div>
      </form>
    </div>
  );
}

export default function Ask() {
  return <Suspense><AskInner /></Suspense>;
}
