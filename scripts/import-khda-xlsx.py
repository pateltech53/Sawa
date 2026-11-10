"""Import the KHDA 'Private Schools Database' workbook into src/lib/schools.generated.json.
Usage: python3 scripts/import-khda-xlsx.py data/khda_private_schools.xlsx
Only fields present in the workbook are written. Dataset year is kept on every row."""
import json, re, sys, openpyxl

src = sys.argv[1] if len(sys.argv) > 1 else "data/khda_private_schools.xlsx"
wb = openpyxl.load_workbook(src, read_only=True, data_only=True)

def table(ws):
    rows = [list(r) for r in ws.iter_rows(values_only=True)]
    hi = next(i for i, r in enumerate(rows) if any(isinstance(c, str) and c.strip() == "School Name" for c in r))
    head = [(str(c).strip() if c is not None else "") for c in rows[hi]]
    out = []
    for r in rows[hi + 1:]:
        d = {}
        for i in range(min(len(head), len(r))):
            if head[i] and head[i] not in d: d[head[i]] = r[i]  # first column wins (sheet repeats "Type of School")
        if d.get("School Name"):
            # Arabic name sits in the unlabelled column right after "School Name"
            ni = head.index("School Name")
            d["_ar"] = r[ni + 1] if ni + 1 < len(r) else None
            out.append(d)
    return out

def norm(s): return re.sub(r"[^a-z]", "", re.sub(r"\b(private|school|pvt|the|for|llc)\b", "", str(s).lower()))

main = table(wb["Main information 2015-2016"])
fees = {norm(r["School Name"]): r for r in table(wb["Fees 2015-2016"])}

def clean(v): return str(v).strip() if v not in (None, "") else None

schools = []
for i, r in enumerate(main, 1):
    name = clean(r["School Name"])
    try: lat, lng = float(r.get("Latitude")), float(r.get("Longitude"))
    except (TypeError, ValueError): continue
    f = fees.get(norm(name))
    amounts = [float(v) for k, v in (f or {}).items() if k not in ("School Name", "_ar") and isinstance(v, (int, float)) and v > 500]
    row = {
        "id": f"khda-{i}", "name": name, "nameAr": clean(r.get("_ar")) or name, "area": (clean(r.get("Location")) or "").strip(),
        "lat": lat, "lng": lng, "curriculum": clean(r.get("Type of School")) or "",
        "source": "KHDA Private Schools Database (2015-16 workbook)", "sector": "Private",
    }
    if clean(r.get("DSIB 2014-2015 Rating")) not in (None, "N/A"): row["rating"] = clean(r["DSIB 2014-2015 Rating"]); row["ratingYear"] = "DSIB inspection 2014-15"
    if clean(r.get("Grades 2014-15")): row["grades"] = clean(r["Grades 2014-15"])
    if isinstance(r.get("Students 2014-15"), (int, float)): row["students"] = int(r["Students 2014-15"])
    if clean(r.get("Year Established in Dubai")): row["established"] = clean(r["Year Established in Dubai"]).split(".")[0]
    if clean(r.get("School Website")): row["website"] = clean(r["School Website"])
    if amounts: row["feeRange"] = f"AED {round(min(amounts)):,}-{round(max(amounts)):,} per year (2015-16)"
    schools.append(row)

json.dump(schools, open("src/lib/schools.generated.json", "w"), ensure_ascii=False, indent=1)
print(f"Wrote {len(schools)} schools, {sum('feeRange' in s for s in schools)} with fees, {sum('rating' in s for s in schools)} with ratings")
