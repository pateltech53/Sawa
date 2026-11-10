# Sawa — whole-app redesign brief (v3)

Enhanced from the team's voice notes, the deep-research report, the teacher UI reference ("liquid glass" screens), the parent whiteboard sketch and the five mascot animations. This is the working spec: every item below is either built in this pass or listed under "Not in this pass".

**Rule zero: adjust, don't rebuild.** Sawa already has working student, parent and teacher flows, a store, matching, Ask Sawa, documents and approvals. Each change below reshapes an existing screen or component. No parallel "v2" screens.

---

## 1. One design language for all three roles

The app currently reads as three different products, and the web view is a stretched phone. Fix both.

| Token | Value | Use |
|---|---|---|
| Surface | Silk background + soft pink/blue aurora | Every page, every role |
| Glass card | `.glass` (white 40%, blur 24px, 1px white line, soft shadow), radius 24–28px | All cards |
| Ink | `#121217` | Primary buttons, active nav |
| Brand | Pink `#F280D9` → iris `#8C59F2` → blue `#4073FF` | Highlights, links, focus |
| AI | Iris/violet (`#8C59F2`, `#5C29BF`) | **Only** Ask Sawa, matching and verification moments |
| Government marks | aegold (TDRA design system) | UAE PASS and official sources only |

**Shared shell.** One shell used by all roles:
- **Top toolbar** (from the teacher reference): logo pill on the left. On the right, a dark **Ask Sawa** sparkle button, search, notifications with a count, profile and language.
- **Bottom nav:** a glass pill with icon and label for each tab, with the active tab filled. There is no "+" button in the middle; that slot becomes **Ask Sawa** (the sparkle) for every role.
- **Desktop (≥1024px)** is a real layout, not a long phone scroll: the content width grows to 1200px, the toolbar spans the full width, and dashboards switch to 2–3 column grids. Phone stays single-column. No page scrolls horizontally at any width.

**Alignment rules** (de-slop checklist, after uxdesign.cc "How to de-slopify your designs"):
- One spacing scale (4/8/12/16/24).
- One card radius per level.
- Every row aligns to a shared left edge.
- Section headers are always title + one action on the right.
- No decorative element (circles, blobs) overlaps content.
- At most one accent colour per card.
- Real nouns in every label ("Fees due 3 Dec", not "Upcoming item").

**Imagery:**
- Clubs, events, communities and opportunities use **real photographs** (Unsplash, credited in code), not the same 3D object repeated.
- 3D Figma objects stay for the interest picker and the nav icons only.
- No photos of identifiable minors; group or activity shots only.

**Mascot:** use the five animations, keyed to transparent WebM (no white box, no sound), with an MP4 fallback that blends on light surfaces.

| Animation | Where it plays |
|---|---|
| idle | Home greeting |
| waving | Welcome and sign-in screens |
| thinking | Ask Sawa while it answers |
| celebrate | Verified, onboarding done, and approvals done |
| presenting | Empty states and "here's what we found" |

With reduced motion, show the poster frame instead.

---

## 2. Student (`/welcome`, `/app/*`)

1. **Home.** Remove the overlapping interest circles from the greeting. The layout becomes:
   - greeting with the mascot (idle)
   - a **"This week"** card: a 7-day strip whose dots are aligned to dates, then a list of today's items
   - **"Needs you"** as clickable task cards in a grid (2 columns on desktop), each with source, due date and a check button
   - **"Matched for you"**
   - Desktop: two columns (week + tasks on the left, matches + communities on the right).
2. **Onboarding matching.**
   - The matching screen no longer auto-advances.
   - Each match card opens a sheet: why it matched, the date, the place, and eligibility.
   - The student continues with a button.
3. **Opportunities.** Replace the plain scrolling list with a **Discover** mode: a swipeable photo card stack (skip / save / open), plus the existing list and map as a toggle.
   - Filters stay. Real photos.
   - A **"Sources"** strip under the list says where listings come from (see §5).
4. **Communities are cross-school.** Seed communities are emirate- or UAE-wide groups ("UAE Young Roboticists", "Dubai Student Photographers", "UAE Youth MUN Circle"), with members from many schools. Copy says "students from 14 schools".
   - Each community gets a **Chat** tab, a moderated group chat. 15+ can post; under 15 can read and react, and see why.
5. **Ask Sawa**, opened from the centre nav button:
   - purple depth background: an iris gradient, a dot pattern and a glow
   - the mascot thinking while it answers
   - shining "Thinking…" text
   - suggestion cards grouped by topic
   - answers in glass bubbles with sources
6. **Profile:** shorter, with tabs (Projects / Saved / Communities) and achievements collapsed into one row.

## 3. Parent

1. **Sign-in:** the same Figma-style UAE PASS flow as the student (a glass card with the aegold mark, simulated), followed by a **"Finding your children"** animation. The child cards are matched through the family book (sample) and verified with a tick.
2. **Set-up:**
   - **parental controls**: who can message my child, outside-school activities need my approval, screen-time window for the feed
   - **connect accounts**: link to the child's school account, school apps
   - then **done** with the mascot (celebrate)
3. **Home, "What would you like to do today?"** (from the whiteboard):
   - a large child photo/avatar
   - two stats: age and grade, and **days until the next fee**
   - two quick-action pills: Pay fee / Re-enrol
   - one large card with **upcoming deadlines**: tests, fees, re-enrolment, forms
   - a "done this term" list
   - "Switch school / ask about transferring"
   - the Ask Sawa button at the bottom
   - **No random question prompts on Home.**
   - A child switcher appears if there is more than one child.
4. **Services:** a horizontally scrolling **card carousel** (like the interest picker), not a flat menu. Each card shows a photo or illustration tint, the service name, the time it takes, and "pre-filled".
5. **Approvals:** seeded with realistic pending items (a trip consent form, an external robotics competition, a fee instalment plan), each with approve and decline actions.
6. **Before/after** moves out of the parent nav into the Profile → "About this prototype" area. It's a pitch tool, not a parent feature.

## 4. Teacher (keep the reference UI, align it)

1. **Sign-in:** the same Figma UAE PASS flow, then **school set-up**: school name, upload or pick a logo, **choose a colour palette** (4 presets plus a custom accent), and invite students by class code or link. The chosen accent tints the teacher's (and their school's) headers.
2. **Navigation:** Today · Classes · Ask (centre) · Students · Career.
3. **Today:** greeting card with stats (to grade / registers due / parent requests), today's timetable with a Now marker, "Needs you", and quick actions.
4. **Events:** host an event, **invite students** (class picker), and **ask the school to sponsor** it (request status timeline).
5. **Career:** KHDA school directory, jobs and professional development. Map with a list fallback.
6. **Fix the blocked map.** The tile server is replaced, and the map is wrapped in a fallback: if tiles fail to load, show the list and a static notice instead of a blocked panel.

## 5. Sourced listings (no API calls, clearly attributed)

Opportunity and competition cards carry a **"Sourced from"** line, and a Sources panel links out to:
- MyMUN (UAE MUN conferences)
- CloudHub / 1i1.ae (UAE hackathons)
- Eventbrite UAE
- dev.events (Dubai)
- UAE Hackathon (TDRA)
- Bayanat
- Dubai Pulse

Prototype copy: "Listings are samples modelled on these sources. Sawa would sync them in the pilot." Nothing is fetched at runtime.

## 6. Onboarding tool connection (all roles)

A **Connect your tools** step uses an expandable tool-call list (21st.dev ToolCallsSection pattern). It shows each integration being connected:
- **Google Classroom, school LMS and e-books** for students and teachers
- **school fees portal and UAE PASS** for parents

Each one has a status (connecting / connected / needs school approval). It is simulated and labelled.

## 7. 21st.dev components — where each one goes

| Component | Use |
|---|---|
| ShiningText | Ask Sawa "Thinking…" |
| DotPattern | Ask Sawa background depth |
| ToolCallsSection | Connect-your-tools step (all roles) |
| ImageSwiper | Opportunities Discover |
| GlassCalendar | Parent deadlines strip |
| 3D tilt card | Opportunity detail hero |
| Card fan carousel | Parent services (GSAP) |
| SiriWave | Ask Sawa voice input while listening |
| ThinkingOrb, IconCloud, Smiley, TeamShowcase | Not used: they duplicate the mascot or add dependencies without a job |

Already in from the last pass: OnyxGlyphPreloader, LiquidMetalButton, FlowButton, AI loader, MessageLoading, LogoCarousel and Avatar.

## 8. Compliance (unchanged, still enforced)

- TDRA design system base, AA contrast, RTL, keyboard and focus states, reduced motion.
- Every simulated thing is labelled. Sample data only. No real minors' photos.
- Under-15: no posting or DMs, and outside-school activities need guardian approval.
- Ask Sawa is server-side, strips PII and cites sources.

## Not in this pass

- Live fetching from MyMUN / Eventbrite / dev.events (no public APIs; attribution only).
- Real fee payments and real school-transfer submission (prototype flows).
- Real-time chat backend (the chat is local and syncs between tabs like the rest of the demo).
