"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { X } from "lucide-react";

export const EASE = [0.22, 1, 0.36, 1] as const;
export const spring = { type: "spring", stiffness: 380, damping: 32 } as const;

/* ── 3D jelly icons exported from the Figma file ── */
export type Icon3DName = "home" | "journey" | "plus" | "people" | "profile" | "planet" | "wand" | "logo3d";
export function Icon3D({ name, size = 32, className = "", alt = "" }: { name: Icon3DName; size?: number; className?: string; alt?: string }) {
   
  return <img src={`/figma/icons/${name}.png`} alt={alt} width={size} height={size} className={`object-contain select-none ${className}`} style={{ width: size, height: size }} draggable={false} />;
}

/* ── Curved serif label (the Figma "Typewrap" letters on interest cards) ── */
export function CurvedLabel({ text, width = 220, size = 40, curve = 26, color = "#14140F" }: { text: string; width?: number; size?: number; curve?: number; color?: string }) {
  const id = useId().replace(/:/g, "");
  const h = size + curve + 8;
  return (
    <svg width={width} height={h} viewBox={`0 0 ${width} ${h}`} aria-hidden className="overflow-visible">
      <defs>
        <path id={`arc-${id}`} d={`M 8 ${size} Q ${width / 2} ${size + curve * 2} ${width - 8} ${size}`} />
      </defs>
      <text fill={color} style={{ fontFamily: "Oranienbaum, Georgia, serif", fontSize: size, filter: "drop-shadow(0 3px 4px rgba(0,0,0,.18))" }}>
        <textPath href={`#arc-${id}`} startOffset="50%" textAnchor="middle">{text}</textPath>
      </text>
    </svg>
  );
}

/* ── The mascot as a character: squash-and-stretch entrance, breathing idle,
      gaze that follows the pointer, and a hop when tapped. Respects reduced motion. ── */
export function MascotLive({ size = 200, src = "/brand/mascot.png", delay = 0, interactive = true, className = "", label = "Sawa's mascot" }: {
  size?: number; src?: string; delay?: number; interactive?: boolean; className?: string; label?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const tilt = useSpring(useTransform(px, [-1, 1], [-6, 6]), { stiffness: 120, damping: 14 });
  const shift = useSpring(useTransform(px, [-1, 1], [-6, 6]), { stiffness: 120, damping: 14 });
  const [hop, setHop] = useState(0);

  useEffect(() => {
    if (!interactive || reduce) return;
    const onMove = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      px.set(Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2))));
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [interactive, reduce, px]);

  return (
    <div ref={ref} className={`relative select-none ${className}`} style={{ width: size, height: size * 1.06 }}>
      {/* contact shadow breathes with the body */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 rounded-[50%] bg-black/25 blur-md"
        style={{ width: size * 0.5, height: size * 0.07, bottom: 0, x: "-50%" }}
        initial={{ opacity: 0, scale: 0.4 }}
        animate={reduce ? { opacity: 0.6, scale: 1 } : { opacity: [0.55, 0.35, 0.55], scale: [1, 0.86, 1] }}
        transition={reduce ? { duration: 0 } : { delay: delay + 0.5, duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.button
        type="button"
        aria-label={label}
        tabIndex={interactive ? 0 : -1}
        onClick={() => interactive && setHop((h) => h + 1)}
        className="absolute inset-x-0 top-0 mx-auto block cursor-pointer"
        style={{ width: size, rotate: tilt, x: shift, transformOrigin: "50% 90%" }}
        initial={reduce ? false : { y: -60, opacity: 0, scaleY: 1.15, scaleX: 0.9 }}
        animate={{ y: 0, opacity: 1, scaleY: 1, scaleX: 1 }}
        transition={{ delay, type: "spring", stiffness: 260, damping: 14, mass: 0.9 }}
      >
        <motion.div
          key={hop}
          animate={reduce ? {} : hop ? { y: [0, -26, 0, -6, 0], scaleY: [1, 1.06, 0.92, 1.02, 1], scaleX: [1, 0.95, 1.06, 0.99, 1] } : { y: [0, -7, 0], scaleY: [1, 1.012, 1] }}
          transition={hop ? { duration: 0.75, ease: EASE } : { duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: delay + 0.6 }}
          style={{ transformOrigin: "50% 100%" }}
        >
          { }
          <img src={src} alt="" draggable={false} className="w-full drop-shadow-[0_18px_22px_rgba(40,30,20,.22)]" />
        </motion.div>
      </motion.button>
    </div>
  );
}

/* ── Bottom sheet (modal) ── */
export function Sheet({ open, onClose, title, children, tone = "light" }: { open: boolean; onClose: () => void; title?: string; children: React.ReactNode; tone?: "light" | "violet" }) {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button aria-label="Close" className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            role="dialog" aria-modal="true" aria-label={title}
            className={`relative max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-[32px] px-5 pb-8 pt-3 shadow-2xl ${tone === "violet" ? "text-white" : "bg-[#f3f1ee]"}`}
            style={tone === "violet" ? { background: "radial-gradient(120% 60% at 20% 100%, #d77ad9 0%, transparent 55%), linear-gradient(180deg, #e7dbff 0%, #a463f0 45%, #7a6af4 75%, #6d4fe0 100%)" } : undefined}
            initial={reduce ? { opacity: 0 } : { y: "100%" }} animate={reduce ? { opacity: 1 } : { y: 0 }} exit={reduce ? { opacity: 0 } : { y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            drag={reduce ? false : "y"} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, i) => { if (i.offset.y > 120 || i.velocity.y > 600) onClose(); }}
          >
            <div className={`mx-auto mb-3 h-1.5 w-12 rounded-full ${tone === "violet" ? "bg-white/70" : "bg-black/15"}`} />
            <div className="mb-3 flex items-start justify-between gap-3">
              {title && <h2 className="text-2xl font-bold tracking-tight">{title}</h2>}
              <button onClick={onClose} aria-label="Close" className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${tone === "violet" ? "border border-white/50 bg-white/15" : "bg-black/5"}`}><X size={18} /></button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Toasts ── */
const ToastCtx = createContext<(msg: string) => void>(() => {});
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<{ id: number; msg: string }[]>([]);
  const push = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setItems((x) => [...x, { id, msg }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 2800);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[70] flex flex-col items-center gap-2" role="status" aria-live="polite">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.3, ease: EASE }}
              className="rounded-full bg-[#121217] px-5 py-3 text-sm font-semibold text-white shadow-xl">{t.msg}</motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

/* ── Avatar (initials — Sawa never shows real student photos in demo data) ── */
export function Avatar({ name, size = 44, ring = false, verified = false }: { name: string; size?: number; ring?: boolean; verified?: boolean }) {
  const initials = name.replace(/\(.*?\)/g, "").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <span className="relative inline-grid shrink-0 place-items-center rounded-full" style={{ width: size, height: size, padding: ring ? 3 : 0, background: ring ? "linear-gradient(90deg,#5185DE,#A673F2)" : undefined }}>
      <span className="grid h-full w-full place-items-center rounded-full border-2 border-white font-bold text-[#121217]" style={{ background: `hsl(${hue} 30% 86%)`, fontSize: size * 0.34 }}>{initials}</span>
      {verified && <span className="absolute -bottom-0.5 -end-0.5 grid place-items-center rounded-full border-[2.5px] border-white bg-[#5185DE] text-white" style={{ width: size * 0.28, height: size * 0.28, fontSize: size * 0.15 }} aria-label="Verified">✓</span>}
    </span>
  );
}

/* ── Figma "IDENTITY CARD" — always shows masked sample data ── */
export function IdCard({ name = "Sample Name", number = "784-XXXX-XXXXXXX-X", expiry = "XX/XX/XXXX", skew = false, verified = false, scanning = false, small = false }: {
  name?: string; number?: string; expiry?: string; skew?: boolean; verified?: boolean; scanning?: boolean; small?: boolean;
}) {
  const reduce = useReducedMotion();
  const s = small ? 0.42 : 1;
  return (
    <div className="relative" style={{ width: 300 * s, height: 190 * s, transform: skew ? "perspective(900px) rotateX(10deg) rotateY(-12deg) rotateZ(4deg)" : undefined, transition: "transform .8s cubic-bezier(.22,1,.36,1)" }}>
      <div className="absolute inset-0 overflow-hidden border border-white/60" style={{ borderRadius: 18 * s, background: "linear-gradient(126.87deg, #F4EFE5 0%, #BDB9B1 42.86%, #7B6A59 71.43%)", boxShadow: scanning || verified ? "0 20px 40px rgba(115,51,204,.38)" : "0 20px 40px rgba(93,71,48,.4)" }}>
        {!reduce && <motion.div aria-hidden className="absolute -top-1/3 h-[170%] w-[40%] rotate-[30deg]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,.4), transparent)" }} initial={{ x: "-180%" }} animate={{ x: "380%" }} transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.4, ease: "easeInOut" }} />}
        <div style={{ transform: `scale(${s})`, transformOrigin: "0 0", width: 300, height: 190 }} className="relative">
          <p className="absolute left-[18px] top-4 text-[11px] font-bold tracking-[1.5px] text-white/90">IDENTITY CARD · SAMPLE</p>
          <div className="absolute left-[248px] top-[14px] h-[26px] w-[34px] rounded-[5px]" style={{ background: "linear-gradient(90deg,#FFE08C,#D9A64D)" }} />
          <div className="absolute left-[18px] top-[52px] h-[86px] w-[70px] overflow-hidden rounded-[10px] bg-white/30">
            <div className="absolute left-5 top-4 h-[30px] w-[30px] rounded-full bg-white/85" />
            <div className="absolute left-[7px] top-[52px] h-[50px] w-[56px] rounded-full bg-white/85" />
          </div>
          <div className="absolute left-[104px] top-[54px] text-white">
            <p className="text-[9px] font-medium text-white/70">NAME</p>
            <p className="text-[15px] font-semibold leading-tight">{name}</p>
            <p className="mt-2.5 text-[9px] font-medium text-white/70">ID NUMBER</p>
            <p className="text-[13px] font-semibold">{number}</p>
            <p className="mt-1.5 text-[9px] font-medium text-white/70">EXPIRY</p>
            <p className="text-[12px] font-semibold">{expiry}</p>
          </div>
          {[264, 160, 120].map((w, i) => <div key={i} className="absolute left-[18px] h-1 rounded-sm bg-white/25" style={{ top: 158 + i * 8, width: w }} />)}
          {verified && <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, ...spring }} className="absolute bottom-3 right-3 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#8C59F2]">✓ Verified (demo)</motion.span>}
        </div>
      </div>
    </div>
  );
}

/* ── Step bars (Figma: three 5px bars) ── */
export function StepBars({ total = 3, done }: { total?: number; done: number }) {
  return (
    <div className="flex gap-5" aria-label={`Step ${Math.min(done + 1, total)} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="h-[5px] flex-1 overflow-hidden rounded-full bg-black/12">
          <motion.div className="h-full rounded-full bg-[#8C59F2]" initial={false} animate={{ width: i < done ? "100%" : "0%" }} transition={{ duration: 0.6, ease: EASE }} />
        </div>
      ))}
    </div>
  );
}

export function SectionHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-2.5 mt-1 flex items-center justify-between px-1">
      <h2 className="section-title">{title}</h2>
      {action}
    </div>
  );
}

export function Progress({ value, color = "#5185DE" }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/70" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8, ease: EASE }} />
    </div>
  );
}
