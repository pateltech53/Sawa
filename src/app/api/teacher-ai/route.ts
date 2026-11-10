import { NextResponse } from "next/server";
import { aiEnabled, complete, MODEL, parseJsonObject } from "@/lib/ai";
import { isArabic, isUnsafe, stripPii } from "@/lib/kb";
import { retrieveForTeacher, TEACHER_SYSTEM } from "@/lib/teacher-ai";
import type { TeacherAiAnswer } from "@/lib/types";

export const runtime = "nodejs";

interface Body {
  question: string;
  lang?: "en" | "ar";
  /** Role is checked again here: this endpoint only serves teachers. */
  role?: string;
  teacher?: { name?: string; subjects?: string[]; grades?: string; years?: number; school?: string };
  history?: { role: "user" | "sawa"; text: string }[];
}

export async function POST(req: Request) {
  let body: Body;
  try { body = (await req.json()) as Body; } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }
  if (body.role !== "teacher") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const question = stripPii(String(body.question || "").slice(0, 800));
  if (!question.trim()) return NextResponse.json({ error: "empty" }, { status: 400 });
  const ar = body.lang === "ar" || isArabic(question);

  if (isUnsafe(question)) {
    const res: TeacherAiAnswer = {
      answer: ar ? "لا أستطيع المساعدة في هذا هنا. إذا كان طالب في خطر، اتبع إجراءات حماية الطفل في مدرستك فوراً." : "I can't help with that here. If a student may be at risk, follow your school's child-protection procedure straight away.",
      verified: [], advice: [], missing: [], records: [], sources: [], actions: [], mode: "policy", tools: [], flagged: true,
    };
    return NextResponse.json(res);
  }

  const t = body.teacher ?? {};
  const teacher = { name: String(t.name ?? "Your teacher").slice(0, 40), subjects: (t.subjects ?? ["Science"]).slice(0, 4), grades: String(t.grades ?? "8-9"), years: Number(t.years ?? 5), school: t.school };
  const r = retrieveForTeacher(question, teacher);

  const history = (body.history ?? []).slice(-4).map((h) => `${h.role === "user" ? "Teacher" : "SAWA AI"}: ${stripPii(h.text).slice(0, 400)}`).join("\n");
  const llm = await complete({
    system: TEACHER_SYSTEM,
    content: [{ type: "text", text: `RECORDS:\n${r.context}\n\nVERIFIED FACTS ALREADY SHOWN TO THE TEACHER:\n${r.verified.map((v) => `- ${v.label}: ${v.value}`).join("\n") || "(none)"}\n\nNOT IN SAWA DATA:\n${r.missing.join("\n") || "(nothing flagged)"}\n\n${history ? `RECENT CONVERSATION:\n${history}\n\n` : ""}QUESTION: ${question}` }],
    maxTokens: 1400,
    timeoutMs: 15_000,
  });
  const parsed = parseJsonObject<{ answer?: string; advice?: string[]; questions?: string[]; draft?: { title: string; body: string } | null }>(llm);

  const draft = parsed?.draft && r.templ.draft ? parsed.draft : r.templ.draft;
  const actions = r.actions.map((a) => (a.href.startsWith("/app/post?") && draft ? { ...a, href: `/app/post?title=${encodeURIComponent(draft.title)}&body=${encodeURIComponent(draft.body)}` } : a));

  const res: TeacherAiAnswer = {
    answer: parsed?.answer || r.templ.answer,
    verified: r.verified,
    advice: (parsed?.advice?.length ? parsed.advice : r.templ.advice).slice(0, 6),
    questions: (parsed?.questions?.length ? parsed.questions : r.templ.questions)?.slice(0, 6),
    missing: r.missing,
    records: r.records.slice(0, 8),
    sources: r.sources,
    actions,
    draft,
    mode: parsed ? `ai:${MODEL}` : aiEnabled() ? "retrieval-fallback" : "retrieval",
    tools: r.tools,
  };
  return NextResponse.json(res);
}
