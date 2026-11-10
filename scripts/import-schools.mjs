#!/usr/bin/env node
// Convert the KHDA "Dubai private schools" CSV (download from Dubai Pulse) into
// src/lib/schools.generated.json for the map and school picker.
// Usage: npm run import:schools -- path/to/khda_schools.csv
// Column names vary between dataset versions; adjust COLS below after opening the CSV.
import fs from "node:fs";

const COLS = { name: ["school_name", "name_en", "School Name"], nameAr: ["name_ar", "school_name_ar"], area: ["area", "location", "Area"], lat: ["latitude", "lat"], lng: ["longitude", "lng", "long"], curriculum: ["curriculum", "Curriculum"],
  rating: ["rating", "khda_rating", "overall_rating", "Rating"], ratingYear: ["rating_year", "inspection_year", "year"], grades: ["grades", "grade_range", "Grades"],
  gender: ["gender", "Gender"], feeRange: ["fees", "fee_range", "Fees"], established: ["established", "year_established", "founded"], website: ["website", "url", "Website"] };

const file = process.argv[2];
if (!file) { console.error("Usage: npm run import:schools -- path/to/file.csv"); process.exit(1); }

function parseCsv(text) {
  const rows = []; let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some(Boolean));
}

const [header, ...data] = parseCsv(fs.readFileSync(file, "utf8"));
const idx = (keys) => header.findIndex((h) => keys.some((k) => h.trim().toLowerCase() === k.toLowerCase()));
const I = Object.fromEntries(Object.entries(COLS).map(([k, v]) => [k, idx(v)]));
if (I.name < 0) { console.error("Could not find a school-name column. Header:", header); process.exit(1); }

const schools = data.map((r, n) => ({
  id: `khda-${n + 1}`,
  name: r[I.name]?.trim(),
  nameAr: I.nameAr >= 0 ? r[I.nameAr]?.trim() : r[I.name]?.trim(),
  area: I.area >= 0 ? r[I.area]?.trim() : "",
  lat: I.lat >= 0 ? Number(r[I.lat]) : NaN,
  lng: I.lng >= 0 ? Number(r[I.lng]) : NaN,
  curriculum: I.curriculum >= 0 ? r[I.curriculum]?.trim() : "",
  // optional fields: only written when the CSV has the column, so SAWA AI never shows a value the dataset doesn't contain
  ...Object.fromEntries(["rating", "ratingYear", "grades", "gender", "feeRange", "established", "website"].filter((k) => I[k] >= 0 && r[I[k]]?.trim()).map((k) => [k, r[I[k]].trim()])),
  sector: "Private",
  source: `KHDA via Dubai Pulse (imported ${new Date().toISOString().slice(0, 10)})`,
})).filter((s) => s.name && Number.isFinite(s.lat) && Number.isFinite(s.lng));

fs.writeFileSync("src/lib/schools.generated.json", JSON.stringify(schools, null, 1));
console.log(`Wrote ${schools.length} schools to src/lib/schools.generated.json`);
