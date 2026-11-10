"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { Opportunity, School } from "@/lib/types";

/** Leaflet + CARTO light basemap (OpenStreetMap data; the OSM tile servers block many embedded/preview hosts). Schools come from the schools table (KHDA dataset format). */
export default function SchoolMap({ schools, opportunities, homeSchoolId, lang }: { schools: School[]; opportunities: Opportunity[]; homeSchoolId: string; lang: "en" | "ar" }) {
  const el = useRef<HTMLDivElement>(null);
  const [tilesFailed, setTilesFailed] = useState(false);
  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !el.current) return;
      map = L.map(el.current, { scrollWheelZoom: false }).setView([25.17, 55.28], 11);
      let errors = 0;
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap contributors © CARTO", maxZoom: 19, subdomains: "abcd",
      })
        .on("tileerror", () => { errors += 1; if (errors > 6) setTilesFailed(true); })
        .addTo(map);
      for (const s of schools) {
        const ops = opportunities.filter((o) => o.schoolId === s.id);
        const home = s.id === homeSchoolId;
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:${home ? 22 : 18}px;height:${home ? 22 : 18}px;border-radius:999px;background:${home ? "#b68a35" : "#0b0b0d"};border:3px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,.35)"></div>`,
          iconSize: [22, 22],
        });
        const list = ops.map((o) => `<li>${lang === "ar" ? o.titleAr : o.titleEn}</li>`).join("");
        L.marker([s.lat, s.lng], { icon, title: s.name })
          .addTo(map)
          .bindPopup(`<b>${lang === "ar" ? s.nameAr : s.name}</b><br/>${s.area} · ${s.curriculum}${list ? `<ul style="margin:6px 0 0;padding-inline-start:16px">${list}</ul>` : ""}<br/><small>${s.source}</small>`);
      }
    });
    return () => { cancelled = true; map?.remove(); };
  }, [schools, opportunities, homeSchoolId, lang]);
  return (
    <div className="relative">
      <div ref={el} className="h-[340px] w-full overflow-hidden rounded-3xl border border-white bg-[#e9e6df]" role="region" aria-label="Map of schools and opportunities" />
      {tilesFailed && (
        <p className="absolute inset-x-3 bottom-3 z-[500] rounded-2xl bg-white/90 px-3 py-2 text-xs text-[var(--muted)] shadow">
          {lang === "ar" ? "تعذّر تحميل خريطة الخلفية على هذه الشبكة. المواقع ما زالت ظاهرة، والقائمة أدناه كاملة." : "The background map couldn't load on this network. School pins still work, and the list below is complete."}
        </p>
      )}
    </div>
  );
}
