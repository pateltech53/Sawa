"use client";

// Profile photo from the live camera (front camera, mirrored preview, round guide),
// with upload as a fallback. The photo is cropped square, shrunk to 320 px and kept on
// this device only. Students' photos are visible to their own school and guardian.
import { useEffect, useRef, useState } from "react";
import { Camera, ImageUp, RefreshCw, Trash2 } from "lucide-react";
import { Sheet, useToast } from "@/components/s/kit";
import { useStore } from "@/lib/store";

const SIZE = 320;

function squareFrom(source: CanvasImageSource, w: number, h: number, mirror: boolean) {
  const c = document.createElement("canvas");
  c.width = SIZE; c.height = SIZE;
  const ctx = c.getContext("2d")!;
  const side = Math.min(w, h);
  if (mirror) { ctx.translate(SIZE, 0); ctx.scale(-1, 1); }
  ctx.drawImage(source, (w - side) / 2, (h - side) / 2, side, side, 0, 0, SIZE, SIZE);
  return c.toDataURL("image/jpeg", 0.85);
}

export function CameraCapture({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, me, setPhoto } = useStore();
  const toast = useToast();
  const ar = state.lang === "ar";
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "starting" | "live" | "shot" | "denied" | "none">("idle");
  const [shot, setShot] = useState<string | null>(null);

  const stop = () => { stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null; };
  const start = async () => {
    setShot(null);
    if (!navigator.mediaDevices?.getUserMedia) { setStatus("none"); return; }
    setStatus("starting");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } }, audio: false });
      stream.current = s;
      if (video.current) { video.current.srcObject = s; await video.current.play().catch(() => {}); }
      setStatus("live");
    } catch (e) {
      setStatus((e as Error).name === "NotAllowedError" ? "denied" : "none");
    }
  };

  useEffect(() => {
    if (open) start(); else { stop(); setStatus("idle"); setShot(null); }
    return stop;
  }, [open]);

  if (!me) return null;
  const take = () => {
    const v = video.current; if (!v || !v.videoWidth) return;
    setShot(squareFrom(v, v.videoWidth, v.videoHeight, true));
    setStatus("shot"); stop();
  };
  const fromFile = (f: File) => {
    const img = new Image();
    img.onload = () => { setShot(squareFrom(img, img.naturalWidth, img.naturalHeight, false)); setStatus("shot"); stop(); URL.revokeObjectURL(img.src); };
    img.src = URL.createObjectURL(f);
  };

  return (
    <Sheet open={open} onClose={onClose} title={ar ? "صورة الملف الشخصي" : "Profile photo"}>
      <div className="space-y-4">
        <div className="relative mx-auto aspect-square w-full max-w-[300px] overflow-hidden rounded-full bg-[#121217]">
          {shot ? (
            <img src={shot} alt={ar ? "معاينة الصورة" : "Photo preview"} className="h-full w-full object-cover" />
          ) : (
            <video ref={video} playsInline muted className="h-full w-full -scale-x-100 object-cover" aria-label={ar ? "معاينة الكاميرا" : "Camera preview"} />
          )}
          {status !== "live" && status !== "shot" && (
            <div className="absolute inset-0 grid place-items-center p-8 text-center text-sm text-white/85">
              {status === "starting" ? (ar ? "جارٍ تشغيل الكاميرا…" : "Starting the camera…") : status === "denied" ? (ar ? "لم يُسمح بالكاميرا. فعّلها من إعدادات المتصفح، أو ارفع صورة." : "Camera access was blocked. Allow it in your browser settings, or upload a photo.") : status === "none" ? (ar ? "لا توجد كاميرا متاحة. ارفع صورة بدلاً منها." : "No camera available. Upload a photo instead.") : ""}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {status === "shot" ? (
            <>
              <button className="btn-ghost !bg-white" onClick={start}><RefreshCw size={16} /> {ar ? "أعد" : "Retake"}</button>
              <button className="btn-ink flex-1" onClick={() => { setPhoto(shot); toast(ar ? "تم تحديث الصورة" : "Photo updated"); onClose(); }}>{ar ? "استخدم هذه الصورة" : "Use this photo"}</button>
            </>
          ) : (
            <>
              <button className="btn-ghost !bg-white" onClick={() => file.current?.click()}><ImageUp size={16} /> {ar ? "رفع" : "Upload"}</button>
              <button className="btn-ink flex-1" disabled={status !== "live"} onClick={take}><Camera size={17} /> {ar ? "التقط" : "Take photo"}</button>
            </>
          )}
        </div>
        {state.photos?.[me.id] && status !== "shot" && (
          <button className="mx-auto flex items-center gap-1.5 text-sm font-semibold text-[#a3271f]" onClick={() => { setPhoto(null); toast(ar ? "أُزيلت الصورة" : "Photo removed"); onClose(); }}><Trash2 size={15} /> {ar ? "إزالة الصورة" : "Remove photo"}</button>
        )}
        <input ref={file} type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) fromFile(f); e.target.value = ""; }} />
        <p className="text-center text-xs text-[var(--muted)]">{me.role === "student" ? (ar ? "تبقى الصورة على هذا الجهاز ويراها ولي أمرك ومدرستك فقط." : "Kept on this device. Only your guardian and your school see it.") : ar ? "تبقى الصورة على هذا الجهاز." : "Kept on this device."}</p>
      </div>
    </Sheet>
  );
}
