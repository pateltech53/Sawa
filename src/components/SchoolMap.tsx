"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Opportunity, School } from "@/lib/types";

/** Leaflet + OpenStreetMap tiles (free, no key). Schools come from the schools table (KHDA dataset format). */
export default function SchoolMap({ schools, opportunities, homeSchoolId, lang }: { schools: School[]; opportunities: Opportunity[]; homeSchoolId: string; lang: "en" | "ar" }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    import("leaflet").then((L) => {
      if (cancelled || !el.current) return;
      map = L.map(el.current, { scrollWheelZoom: false }).setView([25.17, 55.28], 11);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors", maxZoom: 18 }).addTo(map);
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
  return <div ref={el} className="h-[340px] w-full overflow-hidden rounded-3xl border border-white" role="region" aria-label="Map of schools and opportunities" />;
}
