"use client";

// The /welcome gate: the pieces of school life — your school, you, your family,
// your teachers and the UAE — orbit, light up one by one and merge into Sawa.
// All marks are drawn for Sawa (100 × 100 boxes). The UAE tile is a plain
// four-band flag shape, not the federal emblem or any agency logo.
import OnyxGlyphPreloader, { type OnyxGlyph } from "@/components/ui/onyx-glyph-preloader";

const GLYPHS: OnyxGlyph[] = [
  {
    label: "Your school",
    // pediment roof over a building; windows and door punch through (even-odd)
    d: "M50 12 L86 32 V38 H14 V32 Z M19 43 H81 V84 H19 Z M44 62 H56 V84 H44 Z M27 51 H38 V62 H27 Z M62 51 H73 V62 H62 Z",
  },
  {
    label: "You",
    // mortarboard over a face with eyes and a smile
    d: "M50 10 L88 24 L50 38 L12 24 Z M50 42 A21 21 0 1 0 50.01 42 Z M40 58 A3.5 3.5 0 1 0 40.01 58 Z M60 58 A3.5 3.5 0 1 0 60.01 58 Z M39 69 Q50 79 61 69 Q50 74 39 69 Z",
  },
  {
    label: "UAE",
    d: "M14 22 H32 V80 H14 Z M37 22 H86 V39 H37 Z M37 43 H86 V59 H37 Z M37 63 H86 V80 H37 Z",
  },
  {
    label: "Family",
    d: "M38 18 A10 10 0 1 0 38.01 18 Z M22 84 V58 C22 48 29 43 38 43 C47 43 54 48 54 58 V84 Z M68 38 A8 8 0 1 0 68.01 38 Z M58 84 V68 C58 61 62 57 68 57 C74 57 78 61 78 68 V84 Z",
  },
  {
    label: "Teachers",
    // open book
    d: "M12 26 C27 22 39 24 47 31 V82 C39 76 27 74 12 78 Z M53 31 C61 24 73 22 88 26 V78 C73 74 61 76 53 82 Z",
  },
];

// Sawa (سوا, "together"): the logo's two figures — two heads, and two bodies
// that curl into each other — redrawn as one filled path.
const MARK: OnyxGlyph = {
  label: "Sawa",
  d: [
    "M29 23 A11 11 0 1 0 29.01 23 Z", // left head
    "M60 21 A14 14 0 1 0 60.01 21 Z", // right head
    "M10 40 C14 34 22 34 28 40 C34 46 40 50 46 51 C40 56 32 58 25 55 C16 52 10 47 10 40 Z", // left body, curling right
    "M48 64 C58 64 66 58 70 48 C80 50 90 58 90 70 C90 84 74 92 56 90 C42 88 30 82 22 74 C31 73 40 68 48 64 Z", // right body, the swoosh
  ].join(" "),
};

export function SawaPreloader({ onComplete }: { onComplete: () => void }) {
  return (
    <OnyxGlyphPreloader
      glyphs={GLYPHS}
      mark={MARK}
      word="Sawa"
      caption="School · family · you"
      durationMs={2600}
      timing={{ forge: 1500, hold: 1300, lift: 900 }}
      statusText={["Bringing it together", "Joining up", "Ready"]}
      glitter={0.9}
      depth={0.12}
      fontFamily='"Inter Variable", "Inter", system-ui, sans-serif'
      palette={{ stage: "#1b1814", metal: "#5a5046", shade: "#16130f", rim: "#bdb9b1", glitter: "#fff4e0", ink: "#f4efe5" }}
      height="100dvh"
      onComplete={onComplete}
    />
  );
}
