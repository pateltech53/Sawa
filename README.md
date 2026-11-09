# Sawa · سوا — one front door to school life in the UAE

> *Sawa is one front door to school life in the UAE. Students, parents and teachers sign in once with national identity, never re-type the same information, and find every service, lesson and notice in one place, while AI joins the systems behind the scenes.*

UAE Hackathon 2026 · Rising Stars. Challenge statement:

> "How might we enable students, parents, and teachers to complete their educational journey smoothly and seamlessly … without the need to re-enter data or navigate between diverse educational systems, through a single, comprehensive, and integrated digital platform … using AI-powered digital integration and unified national standards for digital government, in alignment with We the UAE 2031 vision and the UAE Centennial 2071?"

**All data in this prototype is synthetic and labelled "sample". UAE PASS sign-in is simulated.**

## Run it

```bash
npm install
```

```bash
cp .env.example .env.local   # optional: add ANTHROPIC_API_KEY
```

```bash
npm run dev
```

Open http://localhost:3000. With no API key, Ask Sawa answers from its knowledge base (retrieval only) and the document reader uses the bundled sample card. Both still cite sources and work offline. `DEMO_MODE=1` forces that mode, as a backup for venue Wi-Fi.

Deploy: import the repo on Vercel and add `ANTHROPIC_API_KEY` as an environment variable. The key is only ever used server-side, in `src/app/api/*`.

## The 60-second demo (all three users, both "withouts")

1. **Parent** (`/` → Parent → *Sign in with UAE PASS*). Today opens with a **proactive alert**: "Sara's ID expires in 12 days". Tap *Why am I seeing this?* to show the rule.
2. Tap **Update now**. The form arrives **8 of 8 fields pre-filled**. Upload the **sample card**; **AI reads the fields**; confirm. Result: **0 fields re-typed, 2 systems updated**, then *Before / after*.
3. Open **Ask Sawa**: "ابنتي جددت الهوية، شو لازم أسوي؟". The answer comes back in Arabic with a **source** and a **Start this service** button.
4. **Teacher** (Profile → Switch role): **Post once** → the Grade 8 exam timetable reaches every student's and parent's Today, with "seen by" counts. Under **Office**, approve the parent's request; the parent's status timeline updates.
5. **Student**: Today combines LMS, Minhaji, Al Manhal and school items. **Explore** shows a robotics competition 5 km away, matched to her interests. She is under 15, so it goes to her guardian; the parent approves under **Approvals**.

Tip: open the parent in one window and the teacher in another. Posts and approvals sync live between tabs.

## What is built (Winning Plan §4)

| | Feature | Where |
|---|---|---|
| F1 | Guardian-verified sign-in and roles, age tier from birth year | `/signin`, `/onboarding`, `src/lib/store.tsx` |
| F2 | Today: unified inbox, source tags, filters, week strip, calendar | `/app/today`, `/app/calendar` |
| F3 | Service hub, plus the full "Update my child's school file" journey with a status timeline | `/app/services`, `/app/services/school-file`, `/app/requests/[id]` |
| F4 | Ask Sawa: bilingual, grounded, cited, PII stripped, unsafe topics refused, action chips | `/app/ask`, `src/app/api/ask/route.ts`, `src/lib/kb.ts` |
| F5 | Proactive nudges (rules table → task, with "why") | `evaluateNudges` in `src/lib/store.tsx` |
| F6 | Opportunities with AI interest matching, map, age-tiered communities, guardian approvals | `/app/explore`, `/app/approvals` |
| F7 | Open-data layer and Data sources screen | `/app/data`, `scripts/import-schools.mjs` |
| F8 | Teacher view: post once, reach everyone, seen-by counts | `/app/post`, `/app/office` |
| F9 | Tell us once: AI document reading, single family profile, "used by" | `/app/documents`, `src/app/api/extract/route.ts` |
| — | Arabic/English with full RTL, before/after metric | header toggle, `/app/impact` |

**National standards.** Built on the TDRA **UAE Design System** (`@aegov/design-system` 3.0.7, a Tailwind v4 plugin: aegold/aeblack tokens), with **UAE PASS** as the identity standard (simulated) and official open-data portals.

**Backend for the pilot.** `supabase/migrations/0001_sawa_schema.sql` holds every table from the plan, plus row-level security: guardians see only linked children, only staff change request status, and **under-15 accounts cannot post at the database level**. The prototype's in-browser store mirrors the same rules.

## Before the pitch — still to do with real data

- [ ] Download the KHDA schools CSV (Dubai Pulse) and run `npm run import:schools -- file.csv`, then set the status to "imported" in `src/app/app/data/page.tsx`.
- [ ] Add the MOE open-data and Bayanat figures to the Data sources screen, with their last-updated dates.
- [ ] Replace or extend `src/lib/kb.ts` with text from 15–30 public MOE / u.ae help pages, using their exact URLs.
- [ ] Replace the **"Before"** estimates in `src/app/app/impact/page.tsx` with counts from your interviews.
- [ ] Run the 20-question Ask Sawa test, and `npm run e2e` (with the app running) for screenshots in `e2e-screens/`.

## Responsible AI

- Model calls are made only from the server (`src/lib/ai.ts`). Names, ID numbers, phone numbers and emails are stripped before a question is sent.
- Answers come only from the retrieved sources and cite them. If there is no source, Sawa says "I'm not sure" rather than guessing. Unsafe topics get a refusal and a pointer to a trusted adult or the school counsellor.
- Document reading accepts PNG/JPG/WEBP up to 5 MB, **sample documents only**. Every extracted field shows its confidence and can be corrected before saving.
- Students under 15: no public posts, no DMs, and outside-school activities need a guardian's approval.
