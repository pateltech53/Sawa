"use client";

// AI loader (21st.dev "Generating" ring), adapted: any word, any size, scoped class
// names, and the ring colours drawn from Sawa's verification/AI accent.
const loaderStyles = `
.ail-wrap { color:#fff; user-select:none; border-radius:50%; justify-content:center; align-items:center; font-family:inherit; font-weight:400; display:flex; position:relative; isolation:isolate; }
.ail-wrap::before { content:""; position:absolute; inset:0; border-radius:50%; background:#121217; z-index:-1; }
.ail-ring { aspect-ratio:1; z-index:0; border-radius:50%; width:100%; animation:2s linear infinite ail-rotate; position:absolute; top:0; left:0; }
@keyframes ail-rotate {
  0%   { transform:rotate(90deg);  box-shadow: inset 0 10px 20px #fff, inset 0 20px 30px #c48bff, inset 0 60px 60px #734df2; }
  50%  { transform:rotate(270deg); box-shadow: inset 0 10px 20px #fff, inset 0 20px 10px #f280d9, inset 0 40px 60px #3d2a8f; }
  to   { transform:rotate(450deg); box-shadow: inset 0 10px 20px #fff, inset 0 20px 30px #c48bff, inset 0 60px 60px #734df2; }
}
.ail-letter { opacity:.4; z-index:1; display:inline-block; animation:2s infinite ail-letter; }
@keyframes ail-letter { 0%,to { opacity:.4; transform:translateY(0); } 20% { opacity:1; transform:scale(1.15); } 40% { opacity:.7; transform:translateY(0); } }
@media (prefers-reduced-motion: reduce) { .ail-ring, .ail-letter { animation:none; opacity:1; } .ail-ring { box-shadow: inset 0 10px 20px #fff, inset 0 20px 30px #c48bff, inset 0 60px 60px #734df2; } }
`;

export function AiLoader({ text = "Generating", size = 180, className = "" }: { text?: string; size?: number; className?: string }) {
  return (
    <>
      <style>{loaderStyles}</style>
      <div className={"ail-wrap " + className} style={{ width: size, height: size, fontSize: Math.max(12, size / 9) }} role="status" aria-label={text}>
        {[...text].map((ch, i) => (
          <span key={i} aria-hidden className="ail-letter" style={{ animationDelay: `${i * 0.1}s` }}>{ch === " " ? " " : ch}</span>
        ))}
        <div className="ail-ring" aria-hidden />
      </div>
    </>
  );
}

export const Component = () => <AiLoader />;
export default AiLoader;
