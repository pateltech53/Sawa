"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, FileImage, Loader2, Sparkles, TriangleAlert } from "lucide-react";
import { Pill } from "@/components/ui";
import { FIELD_LABELS } from "@/lib/seed";
import { useStore } from "@/lib/store";

export interface ReadResult {
  fields: Record<string, { value: string; confidence: number }>;
  docType?: string;
  mode: string;
  preview: string;
}

/** F9 — upload a document; AI reads the fields; the user checks and can correct each one. */
export function DocumentReader({ onRead }: { onRead: (r: ReadResult) => void }) {
  const { state } = useStore();
  const ar = state.lang === "ar";
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function send(dataUrl: string, isSample: boolean) {
    setBusy(true); setErr(null);
    try {
      const res = await fetch("/api/extract", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ image: dataUrl, isSample }) });
      const j = await res.json();
      if (j.error && !Object.keys(j.fields ?? {}).length) throw new Error(j.error);
      onRead({ fields: j.fields, docType: j.doc_type, mode: j.mode, preview: dataUrl });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function useSample() {
    const blob = await (await fetch("/samples/id-card-sample.png")).blob();
    const reader = new FileReader();
    reader.onload = () => send(String(reader.result), true);
    reader.readAsDataURL(blob);
  }

  function onFile(f?: File) {
    if (!f) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(f.type)) return setErr(ar ? "يُقبل PNG أو JPG أو WEBP فقط." : "Only PNG, JPG or WEBP images.");
    if (f.size > 5 * 1024 * 1024) return setErr(ar ? "الحد الأقصى 5 ميغابايت." : "Max 5 MB.");
    const reader = new FileReader();
    reader.onload = () => send(String(reader.result), false);
    reader.readAsDataURL(f);
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <button disabled={busy} onClick={useSample} className="glass flex items-center gap-3 rounded-3xl p-3 text-start transition hover:bg-white/70">
          <Image src="/samples/id-card-sample.png" alt="" width={96} height={60} className="rounded-xl" />
          <span>
            <span className="block font-semibold">{ar ? "استخدم البطاقة التجريبية" : "Use the sample card"}</span>
            <span className="block text-xs text-[var(--muted)]">{ar ? "وثيقة تجريبية — ليست حقيقية" : "Demo document — not real"}</span>
          </span>
        </button>
        <button disabled={busy} onClick={() => input.current?.click()} className="glass flex items-center gap-3 rounded-3xl p-3 text-start transition hover:bg-white/70">
          <span className="jelly h-[60px] w-[60px] rounded-2xl"><Camera /></span>
          <span>
            <span className="block font-semibold">{ar ? "صوّر أو ارفع صورة" : "Snap or upload a photo"}</span>
            <span className="block text-xs text-[var(--muted)]">PNG / JPG · ≤ 5 MB · {ar ? "وثائق تجريبية فقط" : "sample documents only"}</span>
          </span>
        </button>
        <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" capture="environment" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      {busy && (
        <div className="flex items-center gap-3 rounded-2xl bg-white/70 p-4 text-sm font-semibold pop">
          <Loader2 className="animate-spin" /> <Sparkles size={16} /> {ar ? "يقرأ سوا الوثيقة…" : "Sawa is reading the document…"}
        </div>
      )}
      {err && <p className="flex items-center gap-2 rounded-2xl bg-aered-50 p-3 text-sm text-aered-800"><TriangleAlert size={16} /> {err}</p>}
    </div>
  );
}

export function ExtractedFields({ result, values, setValues, current }: {
  result: ReadResult;
  values: Record<string, string>;
  setValues: (v: Record<string, string>) => void;
  current: Record<string, string>;
}) {
  const { state } = useStore();
  const ar = state.lang === "ar";
  return (
    <div className="grid gap-4 md:grid-cols-[220px_1fr]">
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={result.preview} alt={ar ? "الوثيقة المرفوعة" : "Uploaded document"} className="w-full rounded-2xl border border-white shadow" />
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Pill tone="gold"><FileImage size={12} /> {result.docType ?? (ar ? "وثيقة" : "Document")}</Pill>
          <Pill>{result.mode.startsWith("ai:") ? (ar ? "قراءة بالذكاء الاصطناعي" : "Read by AI") : ar ? "وضع العرض" : "Demo mode"}</Pill>
        </div>
      </div>
      <ul className="space-y-2">
        {Object.entries(values).map(([field, v]) => {
          const conf = result.fields[field]?.confidence ?? 1;
          const changed = current[field] !== undefined && current[field] !== v;
          return (
            <li key={field} className="rounded-2xl bg-white/70 p-3">
              <label className="flex items-center justify-between text-xs font-semibold text-[var(--muted)]">
                {ar ? FIELD_LABELS[field]?.ar : FIELD_LABELS[field]?.en ?? field}
                <span className="flex gap-1">
                  {changed && <Pill tone="gold">{ar ? "تغيّر" : "Changed"}</Pill>}
                  <Pill tone={conf > 0.9 ? "green" : "red"}>{Math.round(conf * 100)}%</Pill>
                </span>
              </label>
              <input className="input mt-1 !min-h-10 !py-2 font-semibold" value={v} onChange={(e) => setValues({ ...values, [field]: e.target.value })} />
              {changed && <p className="mt-1 text-xs text-[var(--muted)]">{ar ? "السابق" : "Was"}: {current[field]}</p>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
