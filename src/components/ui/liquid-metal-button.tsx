"use client";

// LiquidMetalButton (21st.dev), adapted for Sawa: width follows the label (or a
// `width` prop), real disabled/focus states, brighter label for contrast, and the
// shader stops moving when the person prefers reduced motion. If WebGL is not
// available the button still renders as a plain dark pill.
import { liquidMetalFragmentShader, ShaderMount } from "@paper-design/shaders";
import { Sparkles } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface LiquidMetalButtonProps {
  label?: string;
  onClick?: () => void;
  viewMode?: "text" | "icon";
  /** Outer width in px for text mode. Defaults to a width that fits the label. */
  width?: number;
  height?: number;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function LiquidMetalButton({ label = "Get Started", onClick, viewMode = "text", width, height = 52, icon, className, disabled }: LiquidMetalButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const shaderRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shaderMount = useRef<any>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleId = useRef(0);
  const still = useRef(false);

  const d = useMemo(() => {
    const h = height;
    const w = viewMode === "icon" ? h : (width ?? Math.max(142, Math.round(label.length * 9.2 + 64)));
    return { width: w, height: h, innerWidth: w - 4, innerHeight: h - 4 };
  }, [viewMode, width, height, label]);

  useEffect(() => {
    still.current = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const styleId = "lmb-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .lmb-shader canvas { width:100% !important; height:100% !important; display:block !important; position:absolute !important; top:0 !important; left:0 !important; border-radius:100px !important; }
        @keyframes lmb-ripple { 0% { transform:translate(-50%,-50%) scale(0); opacity:.6; } 100% { transform:translate(-50%,-50%) scale(4); opacity:0; } }
      `;
      document.head.appendChild(style);
    }
    try {
      if (shaderRef.current) {
        shaderMount.current?.destroy?.();
        shaderMount.current = new ShaderMount(
          shaderRef.current,
          liquidMetalFragmentShader,
          {
            u_colorBack: [0, 0, 0, 0],
            u_colorTint: [1, 1, 1, 1],
            u_repetition: 4,
            u_softness: 0.5,
            u_shiftRed: 0.3,
            u_shiftBlue: 0.3,
            u_distortion: 0,
            u_contour: 0,
            u_angle: 45,
            u_scale: 8,
            u_shape: 1,
            u_isImage: false,
            u_offsetX: 0.1,
            u_offsetY: -0.1,
          },
          undefined,
          still.current ? 0 : 0.6,
        );
      }
    } catch {
      /* no WebGL: the dark inner pill stands in */
    }
    return () => {
      shaderMount.current?.destroy?.();
      shaderMount.current = null;
    };
  }, []);

  const speed = (s: number) => { if (!still.current) shaderMount.current?.setSpeed?.(s); };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    speed(2.4);
    setTimeout(() => speed(isHovered ? 1 : 0.6), 300);
    if (buttonRef.current && !still.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const ripple = { x: e.clientX - rect.left, y: e.clientY - rect.top, id: rippleId.current++ };
      setRipples((prev) => [...prev, ripple]);
      setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== ripple.id)), 600);
    }
    onClick?.();
  };

  const ease = "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), width 0.4s ease, height 0.4s ease";
  const press = isPressed ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)";

  return (
    <div className={cn("relative inline-block", disabled && "pointer-events-none opacity-50", className)}>
      <div style={{ perspective: "1000px", perspectiveOrigin: "50% 50%" }}>
        <div style={{ position: "relative", width: d.width, height: d.height, transformStyle: "preserve-3d", transition: ease }}>
          <div aria-hidden style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transformStyle: "preserve-3d", transition: ease, transform: "translateZ(20px)", zIndex: 30, pointerEvents: "none" }}>
            {viewMode === "icon" ? (
              icon ?? <Sparkles size={18} style={{ color: "#e9e9ee", filter: "drop-shadow(0px 1px 2px rgba(0,0,0,.5))" }} />
            ) : (
              <>
                {icon}
                <span style={{ fontSize: 16, color: "#f4f4f6", fontWeight: 600, letterSpacing: "-0.01em", textShadow: "0px 1px 2px rgba(0,0,0,.6)", whiteSpace: "nowrap" }}>{label}</span>
              </>
            )}
          </div>

          <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transition: ease, transform: `translateZ(10px) ${press}`, zIndex: 20 }}>
            <div style={{ width: d.innerWidth, height: d.innerHeight, margin: 2, borderRadius: 100, background: "linear-gradient(180deg, #26262b 0%, #000000 100%)", boxShadow: isPressed ? "inset 0px 2px 4px rgba(0,0,0,.4), inset 0px 1px 2px rgba(0,0,0,.3)" : "none", transition: ease }} />
          </div>

          <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transition: ease, transform: `translateZ(0px) ${press}`, zIndex: 10 }}>
            <div style={{
              height: d.height, width: d.width, borderRadius: 100, background: "linear-gradient(135deg,#d9d9de,#6f6f78 45%,#e8e8ec 70%,#808089)",
              boxShadow: isPressed
                ? "0 0 0 1px rgba(0,0,0,.5), 0 1px 2px rgba(0,0,0,.3)"
                : isHovered
                  ? "0 0 0 1px rgba(0,0,0,.4), 0 12px 6px rgba(0,0,0,.05), 0 8px 5px rgba(0,0,0,.1), 0 4px 4px rgba(0,0,0,.15), 0 1px 2px rgba(0,0,0,.2)"
                  : "0 0 0 1px rgba(0,0,0,.3), 0 36px 14px rgba(0,0,0,.02), 0 20px 12px rgba(0,0,0,.08), 0 9px 9px rgba(0,0,0,.12), 0 2px 5px rgba(0,0,0,.15)",
              transition: ease,
            }}>
              <div ref={shaderRef} className="lmb-shader" style={{ borderRadius: 100, overflow: "hidden", position: "relative", width: d.width, maxWidth: d.width, height: d.height }} />
            </div>
          </div>

          <button
            ref={buttonRef}
            type="button"
            disabled={disabled}
            onClick={handleClick}
            onMouseEnter={() => { setIsHovered(true); speed(1); }}
            onMouseLeave={() => { setIsHovered(false); setIsPressed(false); speed(0.6); }}
            onPointerDown={() => setIsPressed(true)}
            onPointerUp={() => setIsPressed(false)}
            className="focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#5185de]"
            style={{ position: "absolute", inset: 0, width: d.width, height: d.height, background: "transparent", border: "none", cursor: "pointer", zIndex: 40, transformStyle: "preserve-3d", transform: "translateZ(25px)", overflow: "hidden", borderRadius: 100 }}
            aria-label={label}
          >
            {ripples.map((r) => (
              <span key={r.id} style={{ position: "absolute", left: r.x, top: r.y, width: 20, height: 20, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,.4) 0%, rgba(255,255,255,0) 70%)", pointerEvents: "none", animation: "lmb-ripple 0.6s ease-out" }} />
            ))}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LiquidMetalButton;
