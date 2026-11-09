import { NextResponse } from "next/server";
import { aiEnabled, complete, MODEL } from "@/lib/ai";
import { isArabic, isUnsafe, retrieve, stripPii } from "@/lib/kb";
import { SERVICES } from "@/lib/seed";

export const runtime = "nodejs";

interface AskBody {
  question: string;
  lang?: "en" | "ar";
  role?: "student" | "parent" | "teacher";
  /** Items from the user's own Today (already scoped to this user by the client/store). */
  today?: { title: string; source: string; due?: string; kind: string }[];
}

const PERSONAL_RE = /(due|this week|deadline|missed|overlooked|what do i have|my child have|homework|assignments?|announcement|مستحق|هذا الأسبوع|واجب|واجبات|فاتني|إعلانات|ماذا لدي|موعد)/i;

const SYSTEM = `You are "Ask Sawa", the assistant inside Sawa, a unified school platform for students, parents and teachers in the UAE.
Rules:
- Answer ONLY from the numbered SOURCES provided. If the sources do not answer the question, say you are not sure and suggest contacting the school or the Ministry of Education. Never invent requirements, fees, dates or links.
- Reply in the same language as the question (Arabic or English). Keep it short: 2–5 sentences or a short list.
- Cite sources inline as [1], [2] matching the numbers given.
- Use a friendly, age-appropriate tone; the reader may be a 12-year-old student.
- Never ask for or repeat personal data (names, ID numbers, phone numbers).`;

export async function POST(req: Request) {
  const body = (await req.json()) as AskBody;
  const question = stripPii(String(body.question || "").slice(0, 600));
  const ar = body.lang === "ar" || isArabic(question);

  if (!question.trim()) return NextResponse.json({ error: "empty" }, { status: 400 });

  if (isUnsafe(question)) {
    return NextResponse.json({
      answer: ar
        ? "لا أستطيع المساعدة في هذا الموضوع هنا. إذا كنت قلقاً أو تحتاج إلى دعم، تحدّث مع شخص بالغ تثق به أو مع المرشد في مدرستك."
        : "I can't help with that here. If you're worried or need support, please talk to a trusted adult or your school counsellor.",
      sources: [],
      actions: [],
      flagged: true,
      mode: "policy",
    });
  }

  const hits = retrieve(question);
  const personal = PERSONAL_RE.test(question) && (body.today?.length ?? 0) > 0;

  const sources: { n: number; title: string; url: string; name: string; text: string }[] = hits.map((h, i) => ({
    n: i + 1,
    title: ar ? h.doc.titleAr : h.doc.titleEn,
    url: h.doc.sourceUrl,
    name: h.doc.sourceName,
    text: ar ? h.doc.textAr : h.doc.textEn,
  }));
  if (personal) {
    const items = body.today!.slice(0, 12).map((t) => `- ${t.title} (${t.source}${t.due ? `, due ${t.due.slice(0, 10)}` : ""})`).join("\n");
    sources.push({ n: sources.length + 1, title: ar ? "قائمة اليوم في سوا" : "Your Today in Sawa", url: "/app/today", name: "Sawa · connected systems (sample data)", text: items });
  }

  const actions = hits
    .map((h) => SERVICES.find((s) => s.id === h.doc.serviceId))
    .filter((s): s is (typeof SERVICES)[number] => Boolean(s))
    .map((s) => ({ id: s.id, label: ar ? `ابدأ: ${s.nameAr}` : `Start: ${s.nameEn}`, href: s.href ?? `/app/services?open=${s.id}` }));

  if (sources.length === 0) {
    return NextResponse.json({
      answer: ar
        ? "لست متأكداً من الإجابة، ولا أريد أن أخمّن. يمكنك سؤال مدرستك أو مراجعة الموقع الرسمي لوزارة التربية والتعليم."
        : "I'm not sure, and I don't want to guess. Please ask your school, or check the Ministry of Education's official website.",
      sources: [{ n: 1, title: ar ? "وزارة التربية والتعليم" : "Ministry of Education", url: "https://www.moe.gov.ae", name: "moe.gov.ae" }],
      actions: [],
      mode: "no-source",
    });
  }

  const srcBlock = sources.map((s) => `[${s.n}] ${s.title} — ${s.name}\n${s.text}`).join("\n\n");
  const llm = await complete({
    system: SYSTEM,
    content: [{ type: "text", text: `SOURCES:\n${srcBlock}\n\nUser role: ${body.role ?? "unknown"}\nQUESTION: ${question}` }],
    maxTokens: 1200,
    timeoutMs: 8000,
  });

  // Retrieval-only fallback (DEMO_MODE, no key, timeout): quote the best source directly.
  const fallback = personal && hits.length === 0
    ? (ar ? "هذه العناصر المفتوحة في قائمتك:\n" : "Here's what's open in your Today:\n") + sources[sources.length - 1].text + ` [${sources.length}]`
    : `${sources[0].text} [1]`;

  return NextResponse.json({
    answer: llm ?? fallback,
    sources: sources.map(({ n, title, url, name }) => ({ n, title, url, name })),
    actions,
    mode: llm ? `ai:${MODEL}` : aiEnabled() ? "retrieval-fallback" : "retrieval",
  });
}
