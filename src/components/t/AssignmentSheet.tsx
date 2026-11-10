"use client";

import { useState } from "react";
import { ClipboardPlus } from "lucide-react";
import { Sheet, useToast } from "@/components/s/kit";
import { CLASSES } from "@/lib/seed-teacher";
import { useStore } from "@/lib/store";
import type { TAssignment } from "@/lib/types";
import { KIND_LABEL } from "@/lib/teacher";

export function AssignmentSheet({ open, onClose, classId }: { open: boolean; onClose: () => void; classId?: string }) {
  const { state, createAssignment } = useStore();
  const toast = useToast();
  const ar = state.lang === "ar";
  const [cls, setCls] = useState(classId ?? CLASSES[0].id);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<TAssignment["kind"]>("homework");
  const [points, setPoints] = useState(20);
  const [due, setDue] = useState(() => new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10));
  const target = classId ?? cls;
  const c = CLASSES.find((x) => x.id === target)!;
  const valid = title.trim().length > 2 && points > 0 && due;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    createAssignment({ classId: target, title: title.trim(), kind, points, dueAt: new Date(due + "T20:00:00").toISOString() });
    toast(ar ? `نُشر الواجب في ${c.nameAr}` : `Published to ${c.name} · ${c.source} (simulated)`);
    setTitle("");
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={ar ? "واجب جديد" : "New assignment"}>
      <form className="space-y-3" onSubmit={submit}>
        {!classId && (
          <fieldset>
            <legend className="mb-1 text-sm font-semibold">{ar ? "الصف" : "Class"}</legend>
            <div className="flex flex-wrap gap-1.5">
              {CLASSES.map((x) => <button type="button" key={x.id} className="chip" aria-pressed={cls === x.id} onClick={() => setCls(x.id)}>{ar ? x.nameAr : x.name}</button>)}
            </div>
          </fieldset>
        )}
        <label className="block text-sm font-semibold">{ar ? "العنوان" : "Title"}
          <input autoFocus className="input mt-1 !bg-white" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={90} placeholder={ar ? "مثال: ورقة عمل الدوائر الكهربائية" : "e.g. Electric circuits worksheet"} />
        </label>
        <fieldset>
          <legend className="mb-1 text-sm font-semibold">{ar ? "النوع" : "Type"}</legend>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(KIND_LABEL) as TAssignment["kind"][]).map((k) => <button type="button" key={k} className="chip" aria-pressed={kind === k} onClick={() => setKind(k)}>{KIND_LABEL[k][ar ? 1 : 0]}</button>)}
          </div>
        </fieldset>
        <div className="grid grid-cols-2 gap-2">
          <label className="block text-sm font-semibold">{ar ? "تاريخ التسليم" : "Due"}
            <input type="date" className="input mt-1 !bg-white" value={due} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDue(e.target.value)} />
          </label>
          <label className="block text-sm font-semibold">{ar ? "الدرجة الكاملة" : "Points"}
            <input type="number" min={1} max={200} className="input mt-1 !bg-white" value={points} onChange={(e) => setPoints(Math.max(0, +e.target.value))} />
          </label>
        </div>
        <p className="rounded-2xl bg-white/80 px-3 py-2 text-[13px] text-grey">
          {ar ? `سيظهر في «اليوم» لـ ${c.studentIds.length} طلاب ويُرسل إلى ${c.source} (محاكاة).` : `Shows in ${c.studentIds.length} students' Today and syncs to ${c.source} (simulated). You only set it once.`}
        </p>
        <button className="btn-ink w-full" disabled={!valid}><ClipboardPlus size={17} aria-hidden /> {ar ? "انشر الواجب" : "Publish assignment"}</button>
      </form>
    </Sheet>
  );
}
