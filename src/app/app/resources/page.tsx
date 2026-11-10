"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  Bookmark, BookmarkCheck, ClipboardList, Download, FileQuestion, FileText, FolderOpen, Globe2, GraduationCap, Layers, Link2, Lock, PlayCircle,
  Presentation, School, Search, Share2, Sparkles, Trash2, UploadCloud,
} from "lucide-react";
import { Sheet, useToast } from "@/components/s/kit";
import { FilterBar, applyFilters, type Filter, type FilterFieldDef } from "@/components/ui/filter-token-bar";
import { EmptyState, PageHead, Tabs, useConfirm } from "@/components/t/kit";
import { CLASSES } from "@/lib/seed-teacher";
import { fmtDate } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { Resource, ResourceKind, Subject } from "@/lib/types";

const KIND: Record<ResourceKind, { icon: typeof FileText; en: string; ar: string; tint: string }> = {
  worksheet: { icon: FileText, en: "Worksheet", ar: "ورقة عمل", tint: "#dde7ff" },
  slides: { icon: Presentation, en: "Slides", ar: "عرض", tint: "#ffe1f6" },
  lesson_plan: { icon: ClipboardList, en: "Lesson plan", ar: "خطة درس", tint: "#ece4fd" },
  assessment: { icon: FileQuestion, en: "Assessment", ar: "تقييم", tint: "#fde9c9" },
  video: { icon: PlayCircle, en: "Video", ar: "فيديو", tint: "#d1fae5" },
  link: { icon: Link2, en: "Link", ar: "رابط", tint: "#e4e4e7" },
};
const SUBJECTS: Subject[] = ["Science", "Maths", "English", "Arabic", "Computing", "Art", "Social Studies", "Islamic Studies"];
const GRADES = ["6", "7", "8", "9", "10", "11", "12"];
const ALLOWED = [".pdf", ".docx", ".pptx", ".xlsx", ".png", ".jpg", ".jpeg", ".zip", ".txt", ".mp4"];
const MAX_MB = 25;

type Tab = "mine" | "school" | "network" | "saved";

const fields: FilterFieldDef[] = [
  { id: "subject", label: "Subject", icon: <GraduationCap size={13} />, operators: [{ value: "is_any", label: "is any of", multi: true }, { value: "is_not", label: "is not", multi: true }], options: SUBJECTS.map((s) => ({ value: s, label: s })) },
  { id: "grade", label: "Grade", icon: <Layers size={13} />, operators: [{ value: "is_any", label: "includes", multi: true }], options: GRADES.map((g) => ({ value: g, label: `Grade ${g}` })) },
  { id: "kind", label: "Type", icon: <FileText size={13} />, operators: [{ value: "is_any", label: "is any of", multi: true }, { value: "is_not", label: "is not", multi: true }], options: (Object.keys(KIND) as ResourceKind[]).map((k) => ({ value: k, label: KIND[k].en })) },
];

function ResourcesInner() {
  const { state, me, toggleSaveResource } = useStore();
  const params = useSearchParams();
  const router = useRouter();
  const ar = state.lang === "ar";
  const [tab, setTab] = useState<Tab>("mine");
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<Filter[]>([]);
  const [upload, setUpload] = useState(params.get("upload") === "1");
  const [openId, setOpenId] = useState<string | null>(params.get("open"));
  const toast = useToast();

  const all = state.tResources;
  const scoped = useMemo(() => {
    const base = tab === "saved" ? all.filter((r) => state.tSavedRes.includes(r.id)) : all.filter((r) => (tab === "mine" ? r.ownerId === me?.id : r.scope === tab && r.ownerId !== me?.id));
    const needle = q.trim().toLowerCase();
    const searched = needle ? base.filter((r) => `${r.title} ${r.owner} ${r.tags.join(" ")} ${r.summary ?? ""}`.toLowerCase().includes(needle)) : base;
    return applyFilters(searched, filters, (r, f) => (f === "subject" ? r.subject : f === "grade" ? r.grades : f === "kind" ? r.kind : undefined));
  }, [all, tab, q, filters, me?.id, state.tSavedRes]);

  if (!me) return null;
  if (me.role !== "teacher") return <p>{ar ? "للمعلمين فقط." : "Teachers only."}</p>;

  const counts = {
    mine: all.filter((r) => r.ownerId === me.id).length,
    school: all.filter((r) => r.scope === "school" && r.ownerId !== me.id).length,
    network: all.filter((r) => r.scope === "network" && r.ownerId !== me.id).length,
    saved: state.tSavedRes.length,
  };

  return (
    <div className="space-y-4">
      <PageHead
        title={ar ? "الموارد" : "Resources"}
        sub={ar ? "ملفاتك وملفات قسمك وأفضل ما يشاركه معلمون في الإمارات، منظمة حسب المادة والصف." : "Your files, your department's, and the best of what teachers across the UAE share, organised by subject and grade."}
        right={<button className="btn-ink !min-h-11" onClick={() => setUpload(true)}><UploadCloud size={17} aria-hidden /> {ar ? "رفع ملف" : "Upload"}</button>}
      />

      <Tabs<Tab> label={ar ? "مكتبات" : "Libraries"} value={tab} onChange={setTab} tabs={[
        { id: "mine", label: ar ? "ملفاتي" : "My files", count: counts.mine },
        { id: "school", label: ar ? "مدرستي" : "My school", count: counts.school },
        { id: "network", label: ar ? "شبكة المعلمين" : "Teacher network", count: counts.network },
        { id: "saved", label: ar ? "المحفوظة" : "Saved", count: counts.saved },
      ]} />

      <div className="t-card flex flex-col gap-2.5 rounded-[22px] p-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-grey" aria-hidden />
          <input className="input !min-h-10 !rounded-xl !bg-white/80 ps-9" placeholder={ar ? "ابحث بالعنوان أو الوسم أو المعلم" : "Search titles, tags or teachers"} value={q} onChange={(e) => setQ(e.target.value)} aria-label={ar ? "بحث في الموارد" : "Search resources"} />
        </label>
        <FilterBar fields={fields} value={filters} onChange={setFilters} aria-label={ar ? "تصفية الموارد" : "Filter resources"} emptyLabel={ar ? "تصفية" : "Filter"} addLabel={ar ? "تصفية" : "Filter"} clearLabel={ar ? "مسح" : "Clear"} />
      </div>

      {scoped.length === 0 ? (
        <EmptyState
          icon={tab === "saved" ? Bookmark : FolderOpen}
          title={q || filters.length ? (ar ? "لا نتائج مطابقة" : "No resources match") : tab === "saved" ? (ar ? "لم تحفظ شيئاً بعد" : "Nothing saved yet") : (ar ? "لا ملفات هنا بعد" : "No files here yet")}
          text={q || filters.length ? (ar ? "جرّب كلمات أخرى أو امسح المرشحات." : "Try other words or clear the filters.") : tab === "saved" ? (ar ? "احفظ موارد من شبكة المعلمين للعودة إليها." : "Save resources from the teacher network to find them here.") : undefined}
          action={q || filters.length ? <button className="btn-ghost" onClick={() => { setQ(""); setFilters([]); }}>{ar ? "مسح" : "Clear search"}</button> : tab === "mine" ? <button className="btn-ink" onClick={() => setUpload(true)}>{ar ? "ارفع أول ملف" : "Upload your first file"}</button> : undefined}
        />
      ) : (
        <motion.ul layout className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false}>
            {scoped.map((r) => {
              const K = KIND[r.kind];
              const saved = state.tSavedRes.includes(r.id);
              return (
                <motion.li key={r.id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}>
                  <div className="t-card group flex h-full flex-col p-4 lg-lift">
                    <button className="flex flex-1 flex-col items-stretch text-start" onClick={() => setOpenId(r.id)}>
                      <div className="flex items-start gap-3">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: K.tint }}><K.icon size={20} aria-hidden /></span>
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-2 font-semibold leading-snug">{ar && r.titleAr ? r.titleAr : r.title}</span>
                          <span className="mt-0.5 block text-[12px] text-grey">{ar ? K.ar : K.en} · {r.subject} · {ar ? "الصف" : "Gr"} {r.grades.join(", ")}</span>
                        </span>
                      </div>
                      {r.summary && <p className="mt-2 line-clamp-2 text-[13px] text-[var(--ink-2)]">{r.summary}</p>}
                    </button>
                    <div className="mt-3 flex items-center justify-between gap-2 text-[12px] text-grey">
                      <span className="flex min-w-0 items-center gap-1 truncate">
                        {r.scope === "mine" ? <Lock size={12} aria-hidden /> : r.scope === "school" ? <School size={12} aria-hidden /> : <Globe2 size={12} aria-hidden />}
                        <span className="truncate">{r.ownerId === me.id ? (ar ? "أنت" : "You") : r.owner}{r.sharedWith?.length ? ` · ${ar ? "مشارك مع" : "shared with"} ${r.sharedWith.length}` : ""}</span>
                      </span>
                      {r.ownerId !== me.id && (
                        <button onClick={() => { toggleSaveResource(r.id); toast(saved ? (ar ? "أُزيل من المحفوظات" : "Removed from saved") : (ar ? "حُفظ" : "Saved to your library")); }} aria-pressed={saved} aria-label={saved ? (ar ? "إلغاء الحفظ" : "Unsave") : (ar ? "حفظ" : "Save")} className="flex items-center gap-1 rounded-full px-2 py-1 font-semibold text-ink">
                          {saved ? <BookmarkCheck size={15} className="text-sawa" aria-hidden /> : <Bookmark size={15} aria-hidden />} {r.saves}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      )}

      <UploadSheet open={upload} onClose={() => { setUpload(false); if (params.get("upload")) router.replace("/app/resources"); setTab("mine"); }} />
      <DetailSheet id={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}

function UploadSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, addResource, shareResource } = useStore();
  const toast = useToast();
  const ar = state.lang === "ar";
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<ResourceKind>("worksheet");
  const [subject, setSubject] = useState<Subject>("Science");
  const [grades, setGrades] = useState<string[]>(["8"]);
  const [scope, setScope] = useState<Resource["scope"]>("mine");
  const [share, setShare] = useState<string[]>([]);
  const [progress, setProgress] = useState<number | null>(null);

  const reset = () => { setFile(null); setTitle(""); setError(""); setShare([]); setProgress(null); setScope("mine"); };
  const pick = (f: File | undefined) => {
    if (!f) return;
    const ext = "." + (f.name.split(".").pop() ?? "").toLowerCase();
    if (!ALLOWED.includes(ext)) return setError(ar ? `نوع الملف غير مدعوم (${ext}).` : `That file type isn't supported (${ext}). Try PDF, Office, image, ZIP or MP4.`);
    if (f.size > MAX_MB * 1024 * 1024) return setError(ar ? `الملف أكبر من ${MAX_MB} ميغابايت.` : `That file is over ${MAX_MB} MB.`);
    setError("");
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
    if (/\.(pptx)$/i.test(f.name)) setKind("slides");
    if (/\.(mp4)$/i.test(f.name)) setKind("video");
    if (/\.(xlsx)$/i.test(f.name)) setKind("assessment");
  };
  const save = () => {
    if (!file || !title.trim() || !grades.length) return;
    setProgress(0);
    const t0 = Date.now();
    const tick = () => {
      const p = Math.min(100, ((Date.now() - t0) / 900) * 100);
      setProgress(p);
      if (p < 100) return requestAnimationFrame(tick);
      const id = addResource({ title: title.trim(), kind, subject, grades, scope, sizeKb: Math.round(file.size / 1024), fileName: file.name, tags: [], summary: undefined });
      if (share.length) shareResource(id, share);
      toast(share.length ? (ar ? "رُفع وشورك مع الصفوف" : "Uploaded and shared with your classes") : (ar ? "رُفع الملف" : "File uploaded"));
      reset();
      onClose();
    };
    requestAnimationFrame(tick);
  };

  return (
    <Sheet open={open} onClose={() => { reset(); onClose(); }} title={ar ? "رفع ملف" : "Upload a file"}>
      <div className="space-y-3">
        <div
          role="button" tabIndex={0}
          onClick={() => input.current?.click()} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
          className={`flex cursor-pointer flex-col items-center rounded-[22px] border-2 border-dashed px-4 py-7 text-center transition ${drag ? "border-sawa bg-sawa/12" : file ? "border-aegreen-500 bg-aegreen-50" : "border-black/15 bg-white hover:border-sawa"}`}
        >
          <UploadCloud size={28} className={file ? "text-aegreen-700" : "text-sawa"} aria-hidden />
          <p className="mt-2 font-semibold">{file ? file.name : ar ? "اسحب ملفاً هنا أو اضغط للاختيار" : "Drop a file here, or tap to choose"}</p>
          <p className="text-[12px] text-grey">{file ? `${Math.round(file.size / 1024)} KB` : `PDF, Office, images, ZIP, MP4 · ${ar ? "حتى" : "up to"} ${MAX_MB} MB`}</p>
          <input ref={input} type="file" className="sr-only" accept={ALLOWED.join(",")} onChange={(e) => pick(e.target.files?.[0])} aria-label={ar ? "اختر ملفاً" : "Choose a file"} />
        </div>
        {error && <p role="alert" className="rounded-xl bg-aered-50 px-3 py-2 text-sm text-aered-700">{error}</p>}
        {file && (
          <>
            <label className="block text-sm font-semibold">{ar ? "العنوان" : "Title"}<input className="input mt-1 !bg-white" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} /></label>
            <fieldset><legend className="mb-1 text-sm font-semibold">{ar ? "النوع" : "Type"}</legend>
              <div className="flex flex-wrap gap-1.5">{(Object.keys(KIND) as ResourceKind[]).map((k) => <button type="button" key={k} className="chip" aria-pressed={kind === k} onClick={() => setKind(k)}>{ar ? KIND[k].ar : KIND[k].en}</button>)}</div>
            </fieldset>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-semibold">{ar ? "المادة" : "Subject"}
                <select className="input mt-1 !bg-white" value={subject} onChange={(e) => setSubject(e.target.value as Subject)}>{SUBJECTS.map((s) => <option key={s}>{s}</option>)}</select>
              </label>
              <fieldset><legend className="mb-1 text-sm font-semibold">{ar ? "الصفوف" : "Grades"}</legend>
                <div className="flex flex-wrap gap-1">{GRADES.map((g) => <button type="button" key={g} className="chip !px-2.5" aria-pressed={grades.includes(g)} onClick={() => setGrades(grades.includes(g) ? grades.filter((x) => x !== g) : [...grades, g])}>{g}</button>)}</div>
              </fieldset>
            </div>
            <fieldset><legend className="mb-1 text-sm font-semibold">{ar ? "من يمكنه رؤيته" : "Who can see it"}</legend>
              <div className="grid gap-1.5 sm:grid-cols-3">
                {([["mine", Lock, "Only me", "أنا فقط"], ["school", School, "My school", "مدرستي"], ["network", Globe2, "Teacher network", "شبكة المعلمين"]] as const).map(([v, I, en, arl]) => (
                  <button type="button" key={v} aria-pressed={scope === v} onClick={() => setScope(v)} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${scope === v ? "border-sawa bg-sawa/12 text-sawa" : "border-black/10 bg-white"}`}><I size={15} aria-hidden /> {ar ? arl : en}</button>
                ))}
              </div>
              {scope === "network" && <p className="mt-1.5 text-[12px] text-grey">{ar ? "لا ترفع ملفات تحتوي على بيانات طلاب." : "Never share files that contain student names or data."}</p>}
            </fieldset>
            <fieldset><legend className="mb-1 text-sm font-semibold">{ar ? "شاركه مع صفوف (اختياري)" : "Share with classes (optional)"}</legend>
              <div className="flex flex-wrap gap-1.5">{CLASSES.map((c) => <button type="button" key={c.id} className="chip" aria-pressed={share.includes(c.id)} onClick={() => setShare(share.includes(c.id) ? share.filter((x) => x !== c.id) : [...share, c.id])}>{ar ? c.nameAr : c.name}</button>)}</div>
            </fieldset>
            {progress !== null && <div className="h-2 overflow-hidden rounded-full bg-black/10" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-ink" style={{ width: `${progress}%` }} /></div>}
            <button className="btn-ink w-full" onClick={save} disabled={!title.trim() || !grades.length || progress !== null}><UploadCloud size={17} aria-hidden /> {progress !== null ? (ar ? "جارٍ الرفع..." : "Uploading...") : ar ? "ارفع" : "Upload"}</button>
            <p className="text-center text-[11px] text-grey">{ar ? "في النموذج، يبقى الملف على هذا الجهاز ولا يُرسل إلى أي خادم." : "Prototype: only the file's name and size are kept, on this device. Nothing is sent to a server."}</p>
          </>
        )}
      </div>
    </Sheet>
  );
}

function DetailSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { state, me, shareResource, toggleSaveResource, deleteResource, updateResource } = useStore();
  const toast = useToast();
  const { ask, ui } = useConfirm();
  const ar = state.lang === "ar";
  const L = state.lang;
  const r = state.tResources.find((x) => x.id === id);
  const [share, setShare] = useState<string[]>([]);
  if (!r || !me) return <Sheet open={false} onClose={onClose}>{null}</Sheet>;
  const K = KIND[r.kind];
  const mine = r.ownerId === me.id;
  const saved = state.tSavedRes.includes(r.id);
  const students = [...new Set(share.flatMap((c) => CLASSES.find((x) => x.id === c)?.studentIds ?? []))].length;
  return (
    <>
      <Sheet open={!!id} onClose={() => { setShare([]); onClose(); }} title={ar && r.titleAr ? r.titleAr : r.title}>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-[13px]">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold" style={{ background: K.tint }}><K.icon size={14} aria-hidden /> {ar ? K.ar : K.en}</span>
            <span className="chip">{r.subject}</span>
            <span className="chip">{ar ? "الصف" : "Grade"} {r.grades.join(", ")}</span>
            {r.sizeKb && <span className="text-grey">{r.sizeKb > 1024 ? `${(r.sizeKb / 1024).toFixed(1)} MB` : `${r.sizeKb} KB`}</span>}
          </div>
          {r.summary && <p className="text-[15px]">{r.summary}</p>}
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl bg-white px-3 py-2"><dt className="text-[11px] text-grey">{ar ? "المالك" : "Owner"}</dt><dd className="font-semibold">{mine ? (ar ? "أنت" : "You") : r.owner}</dd></div>
            <div className="rounded-xl bg-white px-3 py-2"><dt className="text-[11px] text-grey">{ar ? "المدرسة" : "School"}</dt><dd className="truncate font-semibold">{r.school}</dd></div>
            <div className="rounded-xl bg-white px-3 py-2"><dt className="text-[11px] text-grey">{ar ? "أُضيف" : "Added"}</dt><dd className="font-semibold">{fmtDate(r.createdAt, L)}</dd></div>
            <div className="rounded-xl bg-white px-3 py-2"><dt className="text-[11px] text-grey">{ar ? "محفوظ لدى" : "Saved by"}</dt><dd className="font-semibold">{r.saves} {ar ? "معلمين" : "teachers"}</dd></div>
          </dl>

          <div className="rounded-2xl bg-white p-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold"><Share2 size={15} aria-hidden /> {ar ? "شارك مع صفوفك" : "Share with your classes"}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {CLASSES.map((c) => {
                const already = r.sharedWith?.includes(c.id);
                return <button key={c.id} className="chip" disabled={already} aria-pressed={share.includes(c.id) || already} onClick={() => setShare(share.includes(c.id) ? share.filter((x) => x !== c.id) : [...share, c.id])}>{ar ? c.nameAr : c.name}{already && " ✓"}</button>;
              })}
            </div>
            <button className="btn-ink mt-3 w-full !min-h-10 text-sm" disabled={!share.length} onClick={() => ask({
              title: ar ? "مشاركة مع الطلاب؟" : "Share with students?",
              body: ar ? `سيظهر في «اليوم» لـ ${students} طلاب.` : `It appears in ${students} students' Today and in ${CLASSES.filter((c) => share.includes(c.id)).map((c) => c.source).filter((v, i, a) => a.indexOf(v) === i).join(" and ")} (simulated).`,
              confirm: ar ? "شارك" : "Share",
              run: () => { shareResource(r.id, share); setShare([]); toast(ar ? "شورك مع الطلاب" : "Shared with students"); },
            })}>{ar ? "شارك" : "Share"}{share.length ? ` · ${students} ${ar ? "طلاب" : "students"}` : ""}</button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="btn-ghost !bg-white flex-1" onClick={() => toast(ar ? "التنزيل غير متاح في النموذج" : "Downloads are disabled in the prototype")}><Download size={16} aria-hidden /> {ar ? "تنزيل" : "Download"}</button>
            {!mine && <button className="btn-ghost !bg-white flex-1" aria-pressed={saved} onClick={() => toggleSaveResource(r.id)}>{saved ? <BookmarkCheck size={16} className="text-sawa" aria-hidden /> : <Bookmark size={16} aria-hidden />} {saved ? (ar ? "محفوظ" : "Saved") : ar ? "حفظ" : "Save"}</button>}
            <a className="btn-ghost !bg-white flex-1" href={`/app/ask?q=${encodeURIComponent(`Suggest how to adapt "${r.title}" for Grade ${r.grades[0]} students who need extra support`)}`}><Sparkles size={16} className="text-sawa" aria-hidden /> {ar ? "اقترح تكييفاً" : "Adapt with AI"}</a>
          </div>
          {mine && (
            <div className="flex flex-wrap items-center gap-2 border-t border-black/10 pt-3">
              <label className="flex flex-1 items-center gap-2 text-sm font-semibold">{ar ? "الظهور" : "Visibility"}
                <select className="input !min-h-10 !bg-white" value={r.scope} onChange={(e) => { updateResource(r.id, { scope: e.target.value as Resource["scope"] }); toast(ar ? "حُدّث" : "Visibility updated"); }}>
                  <option value="mine">{ar ? "أنا فقط" : "Only me"}</option><option value="school">{ar ? "مدرستي" : "My school"}</option><option value="network">{ar ? "شبكة المعلمين" : "Teacher network"}</option>
                </select>
              </label>
              <button className="btn-ghost !min-h-10 !bg-white text-aered-700" onClick={() => ask({ title: ar ? "حذف الملف؟" : "Delete this file?", body: ar ? "لا يمكن التراجع." : "This can't be undone. Students who already received it keep their notice.", confirm: ar ? "احذف" : "Delete", run: () => { deleteResource(r.id); onClose(); toast(ar ? "حُذف" : "Deleted"); } })}>
                <Trash2 size={15} aria-hidden /> {ar ? "حذف" : "Delete"}
              </button>
            </div>
          )}
        </div>
      </Sheet>
      {ui}
    </>
  );
}

export default function Resources() {
  return <Suspense><ResourcesInner /></Suspense>;
}
