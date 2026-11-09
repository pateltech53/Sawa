import { NextResponse } from "next/server";
import { complete, parseJsonObject, MODEL } from "@/lib/ai";

export const runtime = "nodejs";

const ALLOWED = ["image/png", "image/jpeg", "image/webp"] as const;
type Media = (typeof ALLOWED)[number];
const MAX_BYTES = 5 * 1024 * 1024;

interface Extracted {
  doc_type?: string;
  fields: Record<string, { value: string; confidence: number }>;
}

const SYSTEM = `You read identity documents for a school records form. Extract only these fields if visible:
full_name, eid_number, eid_expiry (YYYY-MM-DD), nationality, date_of_birth (YYYY-MM-DD).
Return ONLY JSON: {"doc_type": string, "fields": {"<field>": {"value": string, "confidence": number 0..1}}}.
Omit fields you cannot read. Never guess values.`;

/** Known values for the bundled sample card, used when no AI key is configured (DEMO_MODE). */
function sampleFields(): Extracted {
  const y = new Date().getFullYear();
  return {
    doc_type: "Identity card (SAMPLE)",
    fields: {
      full_name: { value: "Sara Khalid (sample)", confidence: 0.98 },
      eid_number: { value: "784-0000-0000000-2 (sample)", confidence: 0.97 },
      eid_expiry: { value: `${y + 5}-11-08`, confidence: 0.96 },
      nationality: { value: "United Arab Emirates", confidence: 0.95 },
      date_of_birth: { value: `${y - 14}-03-14`, confidence: 0.95 },
    },
  };
}

export async function POST(req: Request) {
  const { image, isSample } = (await req.json()) as { image?: string; isSample?: boolean };
  const m = image?.match(/^data:(image\/[a-z]+);base64,(.+)$/);
  if (!m) return NextResponse.json({ error: "Please upload a PNG, JPG or WEBP image." }, { status: 400 });
  const media = m[1] as Media;
  if (!ALLOWED.includes(media)) return NextResponse.json({ error: "Only PNG, JPG or WEBP images are accepted." }, { status: 415 });
  if ((m[2].length * 3) / 4 > MAX_BYTES) return NextResponse.json({ error: "File is larger than 5 MB." }, { status: 413 });

  const text = await complete({
    system: SYSTEM,
    content: [
      { type: "image", source: { type: "base64", media_type: media, data: m[2] } },
      { type: "text", text: "Extract the fields as JSON." },
    ],
    maxTokens: 1000,
    timeoutMs: 15000,
  });
  const parsed = parseJsonObject<Extracted>(text);
  if (parsed?.fields && Object.keys(parsed.fields).length) {
    return NextResponse.json({ ...parsed, mode: `ai:${MODEL}` });
  }
  if (isSample) return NextResponse.json({ ...sampleFields(), mode: "demo-sample" });
  return NextResponse.json(
    { error: "Couldn't read this document automatically. You can type the fields instead.", fields: {}, mode: "none" },
    { status: 200 },
  );
}
