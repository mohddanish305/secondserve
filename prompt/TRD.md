# TRD — Second Serve: Food Waste Rescue NGO (Full-Stack Web App)

**Version:** 2.0 (full stack: Supabase Postgres database + Auth + RLS + RPC backend; admin panel; layered build phases)
**Date:** 19 October 2026
**Companion docs:** PRD.md v2.0 (requirements) and schema.sql (database — run it as-is)
**Build method:** AI website generator
**Deadline:** 21 Oct 2026, 7:00 PM

> PRD defines WHAT to build, TRD defines HOW to build. On any technical conflict, follow TRD.

---

## 1. Technical Approach

**Decision:** multi-page web app. Frontend = HTML5 + CSS3 + vanilla JavaScript (ES modules, no framework, no build step). Backend = **Supabase** (managed PostgreSQL + Auth + Row Level Security + database functions).

| Layer | Technology | Why |
|---|---|---|
| Frontend | Static HTML/CSS/vanilla JS modules | Debuggable in 2 days; free deploy on Netlify/Vercel |
| Database | PostgreSQL (Supabase) | Real relational DB, constraints, enums, indexes |
| Auth | Supabase Auth (email + password, JWT sessions) | Secure, no custom password handling |
| Backend logic | Postgres functions (RPC) + RLS policies | Server-side rules the browser cannot bypass |
| Hosting | Netlify (frontend) + Supabase cloud, region **South Asia (Mumbai)** | Free tiers, low latency in India |

**Why not a custom Node/Express server?** Same capabilities (DB, auth, authorization, business rules) with far less deployment risk in 2 days. Business rules live in the database (constraints, RLS, RPC), which is the more secure place for them anyway. A custom server is listed in §17 as a future option.

**Layered delivery (critical for the deadline):** the static site (Phases 1–3) must work fully on its own. Backend (Phase 4), auth/dashboard (Phase 5) and admin (Phase 6) are added as layers. Public pages must still render if the database is unreachable.

---

## 2. Architecture

```
┌──────────────────────┐   HTTPS    ┌──────────────────────────────────────────┐
│ Browser              │───────────▶│ Supabase                                  │
│ HTML + CSS + JS (ESM)│  supabase- │  Auth (JWT)                               │
│  main.js  auth.js    │  js client │  PostgREST API ──▶ PostgreSQL             │
│  api.js   admin.js   │◀───────────│     ▲ RLS policies on every table         │
│  dashboard.js hero3d │            │     └ RPC functions: submit_pickup,       │
└──────────────────────┘            │       track_pickup, get_impact_stats,     │
        ▲                           │       volunteer_update_status,            │
        │ static files              │       review_volunteer_application        │
┌───────┴──────────┐                └──────────────────────────────────────────┘
│ Netlify / Vercel │
└──────────────────┘
```

Data flow example: guest submits Report form → `api.submitPickup()` → RPC `submit_pickup` (security definer) → row inserted with server-generated `SS-2026-####` → reference ID returned → success panel → admin sees row (RLS allows admin select).

---

## 3. File & Folder Structure

```
second-serve/
├── index.html              # Home
├── how-it-works.html
├── report-food.html        # Report form + Track box
├── volunteer.html
├── impact.html
├── about.html
├── contact.html
├── login.html
├── signup.html
├── dashboard.html          # login required
├── admin.html              # admin role required
├── css/
│   └── styles.css          # single stylesheet
├── js/
│   ├── main.js             # nav, counters, FAQ, form UI handlers, newsletter, carousel
│   ├── hero3d.js           # Three.js hero (independent of everything else)
│   ├── config.js           # SUPABASE_URL + SUPABASE_ANON_KEY (public keys only)
│   ├── supabase.js         # lazy client loader with CDN fallback
│   ├── api.js              # ALL database calls (single place)
│   ├── auth.js             # signup/login/logout, session, route guards, navbar state
│   ├── dashboard.js        # user + volunteer dashboard
│   └── admin.js            # admin dashboard
├── supabase/
│   └── schema.sql          # the provided database schema
├── images/
│   ├── hero-fallback.jpg
│   ├── how-step-1.jpg / step-2 / step-3
│   ├── volunteer-team.jpg
│   ├── story-meera.jpg / story-ravi.jpg
│   ├── logo.svg
│   └── og-cover.jpg
└── README.md               # setup + deploy steps
```

All scripts are `<script type="module">` (deferred by default). `main.js` imports `api.js`/`auth.js` lazily so pages still work if the backend fails.

---

## 4. Page-by-Page Technical Specification

### 4.1 index.html — Home

| Section | Components | Behaviour |
|---|---|---|
| Navbar | Logo, links, "Report Surplus Food" CTA, Log in / Sign up (or Dashboard / Log out), hamburger | Sticky; shadow on scroll; hamburger <768px; auth state per §4.8 |
| 3D Hero | Full-viewport Three.js canvas + scrim + HTML overlay (H1, sub-headline, 2 CTAs) | Per §4.9; static fallback image |
| Impact strip | 4 counters with `data-stat` = `meals_rescued`, `food_waste_kg`, `partner_restaurants`, `volunteers` | Values from `get_impact_stats()`; baseline defaults in HTML if fetch fails; count-up once on scroll |
| How-it-works teaser | 3 cards | Link "See how it works →" |
| Featured story | Image + quote + CTA to impact.html | Static |
| Testimonials (P1) | 3-quote carousel | Auto-rotate 6s + dots |
| CTA banner | "Have surplus food right now?" + button + helpline | Static |
| Footer | Per §4.8 | Newsletter form saves to DB |

### 4.2 how-it-works.html
- Page hero; 3 detailed steps (number badge, illustration, title, 3–4 lines, "time taken" chip)
- Food-safety note box: "Every pickup is temperature-checked and packed hygienically."
- CTA banner → report-food.html

### 4.3 report-food.html — the #1 conversion page
- Explainer strip: "Takes 60 seconds. Free pickup. Same-day delivery. No account needed."
- Form (§5) → on submit calls `api.submitPickup()`; button shows "Submitting…" and is disabled while waiting; on success shows panel with the **real reference ID returned by the database**; on failure shows an error banner + helpline (never fake success).
- If logged in: pre-fill name and phone from profile.
- **Track your pickup** card: inputs Reference ID + Phone → `api.trackPickup()` → status timeline (Reported → Assigned → Collected → Delivered; Cancelled shown separately) or "No pickup found. Check your reference ID and phone number."
- Aside card: helpline, "what happens next" 3 bullets. Mobile: single column, big submit button, `tel:` link.

### 4.4 volunteer.html
- Hero + "Why volunteer" 3 bullets; 4 role cards ("Choose this role" pre-selects dropdown + scrolls to form); application form (§5) → `api.submitVolunteerApplication()`; FAQ mini (3 Q&As).
- If logged in, pre-fill name/email/phone.

### 4.5 impact.html
- 5 large counters (adds `cities`) from `get_impact_stats()`
- "Where the food goes": horizontal div bars from `impact_destinations`
- 12-month trend: SVG bar chart from `impact_monthly`
- Both charts have hard-coded fallback arrays (same values as seed) if fetch fails
- Partner strip (6 fictional names, "illustrative" label); 2 beneficiary stories; CTA Donate + Volunteer

### 4.6 about.html
- Mission/vision/timeline (2021 → 2026); 4 team cards; Transparency section (80G/12A placeholder "AAKCS1234EF20261", cost-per-meal box "₹38 = 10 meals: ₹20 logistics, ₹10 packaging, ₹8 coordination", sample report links `href="#"`, FCRA note); CTA → contact.html

### 4.7 contact.html
- Two-column: form (left) + info card (right: email, helpline, address, hours)
- Form → `api.submitContact()`
- Map: static styled placeholder card + "Get Directions" button (Google Maps search URL). **No live iframe** (extra requests, cookies, performance budget).
- FAQ accordion (6 Q&As, one open at a time)

### 4.8 Global: navbar & footer
- Links: Home, How It Works, Impact, Volunteer, About, Contact + CTA **"Report Surplus Food"** (same label everywhere).
- **Auth area (right side):** signed out → "Log in" (text link) + "Sign up" (secondary button). Signed in → "Dashboard" + "Log out"; role `admin` also sees "Admin". State set by `auth.js` after `getSession()`; until it resolves, render the signed-out state (no flicker of wrong links — reserve the space).
- Active-page link highlighted via `location.pathname`.
- Footer: 4 columns (About / Quick links / Contact / Newsletter), registration numbers line, social icons (SVG), "Illustrative demo website built for academic purposes." + AI disclosure + "NGO and baseline impact figures are illustrative."
- Newsletter form → `api.subscribeNewsletter()`; success "You're subscribed!"; duplicate → "You're already subscribed!".

### 4.9 3D Hero — Technical Specification (Three.js)

**Library loading (dynamic import with CDN fallback — no import map)**

```html
<!-- index.html, end of body -->
<script type="module" src="js/hero3d.js"></script>
```

```js
// js/hero3d.js
const THREE_URLS = [
  "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.min.js",
  "https://unpkg.com/three@0.165.0/build/three.module.min.js"
];

async function loadThree() {
  for (const url of THREE_URLS) {
    try { return await import(url); } catch (e) { /* try next CDN */ }
  }
  throw new Error("Three.js CDN unavailable");
}

async function initHero() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return showFallback();
  try {
    const THREE = await loadThree();
    // create renderer (try/catch for WebGL), build scene, start loop
  } catch (err) {
    showFallback();   // CDN failed or WebGL unavailable → static hero image
  }
}
initHero();
```

- Loads after first paint; ~150 KB gzipped; never blocks the headline (LCP).
- `hero3d.js` has NO dependency on `main.js`, `api.js` or `auth.js`, and vice versa.
- No OrbitControls, no post-processing.

**Scene contents (100% procedural low-poly, no .glb files)**

| Object | Geometry | Material | Budget |
|---|---|---|---|
| Thali (centerpiece) | Flattened cylinder + torus rim | MeshStandardMaterial, metalness 0.9, roughness 0.35 | ~2k tris |
| Apple | Squashed sphere + cylinder stem + plane leaf | Standard, red / green | <1k tris |
| Roti | Flattened cylinder | Standard, tan `#E8C07D`, roughness 0.9 | <1k tris |
| Carrot | Cone + 3 small green cones | Standard, orange / green | <1k tris |
| Parcel box | Box + thin tape-stripe box | Standard, kraft brown | <1k tris |
| Particles | `THREE.Points`, 60–80 sprites (radial-gradient canvas texture) | Additive blending, warm white | — |
| Ground shadow | Circle geometry + ShadowMaterial (opacity 0.18) | — | — |

**Lighting & camera:** HemisphereLight (sky `#FFF2DF` / ground `#8A5A33`, 0.9) + DirectionalLight (warm white, 1.6, castShadow, 1024 map) + orange PointLight rim (`#FF9F43`, 0.6). PerspectiveCamera fov 40 at (0, 2.2, 7.5) looking at the thali. Food group auto-rotates 0.15 rad/s; items bob on sine waves with phase offsets. Desktop-only parallax (`matchMedia('(pointer:fine)')`): camera x/y lerp ±0.6 toward cursor. Mobile: gentle float only.

**Performance guards:** `setPixelRatio(Math.min(devicePixelRatio, 2))` desktop / 1.5 mobile; scene <15k triangles; IntersectionObserver cancels `requestAnimationFrame` when hero is off-screen; `visibilitychange` pauses when tab hidden; mobile particles halved (30–40).

**Fallback & accessibility:** fallback on WebGL failure, both CDNs failing, or `prefers-reduced-motion` → hide `<canvas>`, show `hero-fallback.jpg` with identical overlay. Canvas has `aria-hidden="true"` and `pointer-events: none`; headline + CTAs are real HTML.

### 4.10 login.html and signup.html
- **Shared layout:** centred card on cream background, logo on top, `noindex` meta, no footer newsletter noise needed (footer still present).
- **signup.html:** Full name*, Email*, Phone (optional, same phone rule), Password* (min 8 chars, show/hide toggle), Confirm password*. On success → `auth.signUp()` → redirect to `dashboard.html`. Messages: "This email is already registered. Try logging in." / "Password must be at least 8 characters."
- **login.html:** Email*, Password*, "Sign up instead" link. On success → redirect to `?next=` param if it is a same-site relative path, else `dashboard.html`. Wrong credentials → "Incorrect email or password." (never reveal which one).
- If already logged in, both pages redirect to `dashboard.html`.
- P1: "Forgot password?" → `resetPasswordForEmail`; "Continue with Google".

### 4.11 dashboard.html (login required)
- Guard: `auth.requireAuth()` → redirect to `login.html?next=dashboard.html` if no session. Meta `noindex`.
- Header: "Hello, {first name}" + role badge (User / Volunteer / Admin) + "Log out".
- **Profile card:** edit full name + phone → `api.updateProfile()` (email read-only).
- **My pickup requests:** cards for rows where `user_id = me`, newest first: reference ID, organisation, city, quantity, pickup time, status badge + 4-step timeline. Empty state: "You haven't reported any surplus food yet" + CTA.
- **My assigned pickups (role = volunteer or admin):** cards for rows where `assigned_volunteer = me`: organisation, address, contact name, phone (`tel:` link), pickup time, quantity, status. Buttons: "Mark collected" (status Assigned) and "Mark delivered" (status Collected → opens small select: Night shelter / Community kitchen / Slum kitchen → confirm). Calls `api.volunteerUpdateStatus()`; refresh card on success; show server error message on failure. Empty state: "No pickups assigned yet."
- **Role = user:** show a "Become a volunteer" card linking to volunteer.html and, if they applied, their application status (pending/approved/rejected) from `volunteer_applications` (own rows).
- **Role = admin:** prominent "Open Admin Dashboard" button.

### 4.12 admin.html (admin only)
- Guard: `auth.requireAdmin()` — checks profile role; non-admins are redirected to `dashboard.html` with a toast "Admins only". Meta `noindex`. (UI guard is for UX; real security is RLS.)
- **Summary cards** (via count queries): New requests (`reported`), In progress (`assigned` + `collected`), Delivered, Pending applications, Unread messages.
- **Tabs** (accessible tablist): Pickups · Volunteer applications · Messages · Subscribers.
- **Pickups tab:** filters (status, city), 25 rows/page with Prev/Next; columns: Ref, Created, Organisation, Contact (name + phone), City, Qty, Pickup time, Status badge, Assigned to, Actions. Actions: **Assign** (select of volunteers from `profiles` where role = volunteer → sets `assigned_volunteer` + status `assigned`), **Status** dropdown (collected / delivered / cancelled; delivering requires choosing destination), **Cancel**. Optimistic UI is not allowed — update the row only after the server confirms.
- **Volunteer applications tab:** table (name, email, phone, city, role, availability, motivation, status, date); buttons Approve / Reject → `api.reviewApplication()`; rows already reviewed are read-only.
- **Messages tab:** list newest first; unread in bold; "Mark as read".
- **Subscribers tab:** count + list + "Download CSV" (generated client-side from fetched rows).
- All user-supplied text rendered with `textContent` (never `innerHTML`) to prevent XSS.
- Tables sit inside `overflow-x: auto` containers; on mobile show key columns first.

---

## 5. Forms Specification

**Common behaviour:** on submit → `preventDefault()` → client validation → if errors: inline messages, focus first error, `aria-invalid`, errors announced in an `aria-live="polite"` region → if valid: disable button + show "Submitting…" → call `api.js` → success panel or **error banner** (never fake success).

**Anti-spam:** every public form includes a hidden honeypot input named `website` (visually hidden, `tabindex="-1"`, `autocomplete="off"`). If it has a value, silently show the success panel without calling the backend.

**Server errors → messages:** network/unreachable → "We couldn't reach the server. Please try again, or call our helpline." · Postgres `22023` → show the server's message (e.g. "Pickup time must be in the future") · `23505` (duplicate) → friendly "already exists" message · `42501` → "You don't have permission to do that." · anything else → generic message + helpline.

| Form | Fields (*required) | Client validation | Saved via |
|---|---|---|---|
| Report Surplus Food | Name*, Phone* (10-digit, starts 6–9), Organisation*, Pickup address*, City* (Delhi NCR, Mumbai, Bengaluru, Jaipur, Lucknow, Patna), Food type* (radio Veg / Non-veg / Both), Quantity* (10–5000), Pickup datetime* (future), Notes (≤500) | Phone `^[6-9]\d{9}$`; datetime > now; quantity range | RPC `submit_pickup` |
| Track pickup | Reference ID*, Phone* | ID format `SS-YYYY-####`; phone rule | RPC `track_pickup` |
| Volunteer application | Name*, Email*, Phone*, City*, Preferred role* (Food Hero / Shelter Coordinator / Event Volunteer / Social Media), Availability* (≥1 of Weekdays/Weekends/Evenings), Motivation (≤500) | Email regex; ≥1 availability | INSERT `volunteer_applications` |
| Contact | Name*, Email*, Subject* (Partnership / CSR / Media / General), Message* (20–2000) | Length | INSERT `contact_messages` |
| Newsletter (footer) | Email* | Email regex | INSERT `newsletter_subscribers` |
| Sign up | Name*, Email*, Phone (optional), Password* (≥8), Confirm* | Match + length | `auth.signUp` |
| Log in | Email*, Password* | Required | `auth.signInWithPassword` |
| Profile (dashboard) | Name*, Phone | Phone rule | UPDATE `profiles` (name, phone only) |

**Value mapping (UI label → database value):** Veg→`veg`, Non-veg→`non_veg`, Both→`both`; Food Hero→`food_hero`, Shelter Coordinator→`shelter_coordinator`, Event Volunteer→`event_volunteer`, Social Media Volunteer→`social_media`; Weekdays/Weekends/Evenings→`weekdays`/`weekends`/`evenings`; Partnership/CSR/Media/General→`partnership`/`csr`/`media`/`general`. Datetime sent as ISO string (`new Date(value).toISOString()`).

Client validation is for UX only; the database CHECK constraints and triggers enforce the same rules server-side.

---

## 6. Component Library (reusable)

- `btn` / `btn-primary` (orange) / `btn-secondary` (green outline) / `btn-large` / `btn-danger` / `btn-small`; `.is-loading` state
- `card`, `section-title` (eyebrow + H2 + subtext)
- `counter` (`data-stat`, `data-target`, `data-suffix`)
- `form-group` (label + input + error slot), `.error`, `.banner-error`, `.banner-success`
- `badge` / `chip`; `status-badge` (`--reported`, `--assigned`, `--collected`, `--delivered`, `--cancelled`; always include text label)
- `timeline` (4-step status tracker)
- `accordion` (FAQ), `tabs` (admin), `table-wrap` (scrollable table container), `pagination`
- `toast` (aria-live), `modal-small` (confirm delivery destination)
- `stat-bar`, `role-card`, `story-card`, `team-card`, `auth-card`

---

## 7. Styling System

```css
:root {
  --orange-600: #D9480F; --orange-500: #E8590C; /* primary CTA */
  --green-600: #2B8A3E;  --green-500: #2F9E44;  /* secondary */
  --cream: #FFF9F0;      /* page background */
  --ink: #343A40;        /* body text */
  --muted: #868E96;
  --radius: 14px;
  --font-head: 'Poppins', sans-serif;
  --font-body: 'Inter', sans-serif;
}
```

- Breakpoints: 360px (base) → 768px (tablet) → 1024px (desktop)
- Spacing scale: 8px base (8/16/24/48/80)
- Buttons: pill radius, min-height 48px, bold
- Contrast: body on cream ≥7:1; white on orange-600 ≥4.5:1
- Fonts: Google Fonts (Poppins 600/700 + Inter 400/500/600), `display=swap`, system fallback

**Hero scrim (lighter, keeps the 3D scene warm):**

```css
.hero-scrim {
  position: absolute; inset: 0;
  background: linear-gradient(180deg,
    rgba(24,14,7,0.40) 0%,
    rgba(24,14,7,0.15) 45%,
    rgba(24,14,7,0.45) 100%);
}
.hero h1, .hero .hero-sub { color: #fff; text-shadow: 0 2px 12px rgba(0,0,0,0.35); }
```

Layered between canvas/fallback image and the HTML overlay. After Phase 2, if the headline looks weak, raise top/bottom opacity slightly (0.40 → 0.50).

---

## 8. Interactive Behaviours (JS)

1. Sticky navbar shadow; hamburger (<768px); active link; auth-aware links
2. Counters: IntersectionObserver, easeOut ~1.5s, once; values from `get_impact_stats()` with baseline fallback
3. Smooth scroll for anchors with sticky-nav offset
4. FAQ accordion (one open at a time)
5. Role-card "Choose this role" → sets form select + scroll
6. Form handling per §5 (validation, loading state, success/error)
7. Testimonial carousel (P1)
8. Footer year auto-update
9. 3D hero lifecycle per §4.9
10. Auth: session restore on every page; `onAuthStateChange` updates navbar; route guards (§4.11–4.12)
11. Dashboard/Admin: fetch with loading skeleton, empty states, error states with "Retry" button
12. Toasts for success/failure of actions

---

## 9. SEO & Meta (per page)

- Unique `<title>` (≤60 chars) + meta description (≤155 chars)
- One H1 per page; semantic HTML5 landmarks
- Open Graph + Twitter card tags with `og-cover.jpg`
- alt text on every image; descriptive link text
- `login`, `signup`, `dashboard`, `admin`: `<meta name="robots" content="noindex">`
- robots allow for public pages; canonical URL after deployment

---

## 10. Accessibility

- All inputs have `<label>`; errors in `aria-live="polite"`; `aria-invalid` on bad fields
- Contrast ≥4.5:1; status never conveyed by colour alone
- Focus-visible outlines; full keyboard operability (nav, accordion, tabs with arrow keys, modal focus trap, carousel dots)
- `prefers-reduced-motion`: disable counter animation & smooth scroll; 3D shows static fallback
- Tap targets ≥44px

---

## 11. Performance Budget

- Page weight <800 KB excluding third-party CDN libraries (Three.js, supabase-js)
- `supabase-js` is loaded lazily (dynamic import) only when a page needs it (form submit, counters, auth); public static content never waits for it
- Scripts are modules (deferred); no render-blocking JS
- Fonts: `display=swap`; max 2 families, 4 weights
- Images: WebP via `<picture>` with JPG fallback; explicit `width`/`height`; `loading="lazy"` except hero fallback (eager + `fetchpriority="high"`)
- Targets: Lighthouse mobile Performance ≥90, Accessibility ≥95; first paint <1.5s; 3D visible <2.5s on 4G
- Admin tables paginated at 25 rows; never fetch unbounded lists

---

## 12. Assets — AI Image Prompts (for the generator)

Warm photorealistic style, square/16:9 as needed:

1. **Hero fallback:** "Warm photorealistic photo, Indian volunteers in orange t-shirts packing fresh vegetarian food into steel containers at a community kitchen, morning light, joyful, shallow depth of field"
2. **How-it-works:** (1) "Indian banquet staff handing over trays of untouched food to volunteers, hotel kitchen background"; (2) "Volunteers loading sealed food containers into a van, Delhi street"; (3) "Happy children and elderly receiving food plates at a night shelter dining hall"
3. **Volunteer team:** "Diverse group of young Indian volunteers smiling, community service, outdoor"
4. **Impact stories:** "Indian woman cooking in a small community kitchen, steam rising, warm light"; "Elderly man receiving a food parcel, grateful"
5. **Team portraits (4):** "Professional headshot, Indian [man/woman] in 30s, warm smile, plain warm background" ×4
6. **Logo (SVG):** flat mark — plate with a leaf/heart; orange + green; text "Second Serve" in Poppins 700

---

## 13. Deployment & Supabase Setup

**A. Create the backend (≈20 min, do today)**
1. supabase.com → New project → Region **South Asia (Mumbai)** → set a strong database password (save it).
2. SQL Editor → paste all of `schema.sql` → Run. Confirm tables appear under Table Editor and each shows RLS enabled.
3. Authentication → Providers → Email: turn **off "Confirm email"** (demo only, so signups log in instantly).
4. Project Settings → API: copy **Project URL** and the **anon / publishable key**. Put them in `js/config.js`. **Never** use or paste the `service_role` / secret key anywhere in the frontend.
5. After deploying (step B), Authentication → URL Configuration: set **Site URL** to the Netlify URL and add it to Redirect URLs.

**B. Deploy the frontend**
1. Push folder to GitHub → connect to Netlify (or drag-drop the folder into Netlify Drop).
2. Verify all 11 pages load, forms save, login works, no console errors, mobile check at 360px.

**C. Create the first admin**
1. Sign up on the live site with your email.
2. Supabase → SQL Editor: `update public.profiles set role = 'admin' where email = 'your-email@example.com';`
3. Log out and in; the navbar now shows **Admin**.

**D. Before submitting:** open the Supabase dashboard on 20 and 21 Oct (free projects pause after ~1 week of inactivity); confirm status is Active. Submit the live URL + repo/zip. Keep `PRD_v1.3_static.md` / `TRD_v1.3_static.md` only for reference.

---

## 14. Build Prompts for AI Tools (PHASED — never everything in one prompt)

Attach PRD.md, TRD.md and schema.sql every time, and add: **"PRD defines WHAT to build, TRD defines HOW — on any technical conflict, follow TRD."** After Phase 3, commit and tag `static-safe`.

### Phase 0 — Backend setup (manual, follow §13-A). Not an AI prompt.

### Phase 1 — Foundation (design system + shell + Home with STATIC hero)

```
Build the foundation for "Second Serve", a fictional Indian food-rescue NGO web app, per attached PRD.md and TRD.md. Phase 1 ONLY: css/styles.css (complete design system per TRD §6 and §7, including .hero-scrim and status-badge/timeline/tabs/table/toast components), js/main.js as an ES module (navbar, counters with data-stat attributes and hard-coded baseline fallback values, FAQ accordion, form validation and UI states per TRD §5 and §8 — backend calls come later, so leave clearly marked hooks), the shared navbar + footer (TRD §4.8, including the Log in / Sign up area), and index.html Home with a STATIC hero (hero-fallback.jpg + scrim + text overlay + 2 CTAs; the 3D scene comes in Phase 2). Mobile-first (360/768/1024). Palette: orange #E8590C, green #2F9E44, cream #FFF9F0; Poppins + Inter. Primary CTA label is always "Report Surplus Food". Use "6.87 crore tonnes" for the food-waste stat. Follow TRD file structure, image rules (TRD §11) and SEO tags exactly. Use descriptive placeholder images with alt text.
```

### Phase 2 — 3D hero upgrade (§4.9 only)

```
Now upgrade the index.html hero to the real-time 3D scene per TRD §4.9 ONLY — nothing else changes. Create js/hero3d.js: load Three.js r165 using dynamic import() inside try/catch (jsdelivr first, unpkg second — NO import map). Procedural low-poly steel thali + floating apple/roti/carrot/parcel box, slow auto-rotate + mouse parallax on desktop (pointer:fine only), IntersectionObserver and visibilitychange pause. If both CDNs fail, WebGL fails, or prefers-reduced-motion is on, hide the canvas and show hero-fallback.jpg. Keep the existing HTML overlay, scrim and CTAs untouched. hero3d.js must not depend on any other script.
```

### Phase 3 — Remaining 6 public pages, ONE prompt per page (send one at a time)

```
Now build how-it-works.html exactly per TRD §4.2, reusing styles.css, main.js, navbar and footer from Phase 1 — do not regenerate them.
```
```
Now build report-food.html exactly per TRD §4.3 and §5 (form UI + validation + Track box UI; backend wiring comes in Phase 4).
```
```
Now build volunteer.html exactly per TRD §4.4 and §5.
```
```
Now build impact.html exactly per TRD §4.5 (use the hard-coded fallback arrays for now).
```
```
Now build about.html exactly per TRD §4.6.
```
```
Now build contact.html exactly per TRD §4.7 and §5 (static styled map placeholder — no iframe).
```

**→ Commit and tag `static-safe`.**

### Phase 4 — Backend wiring

```
Now add the backend layer per TRD §16 and the attached schema.sql. Create js/config.js (placeholders for SUPABASE_URL and SUPABASE_ANON_KEY), js/supabase.js (lazy client with CDN fallback exactly as in TRD §16.3) and js/api.js (the exact function list in TRD §16.4 — all database calls live only in api.js). Then wire, WITHOUT changing layouts: (1) Report form → submitPickup, showing the real reference ID; (2) Track box → trackPickup; (3) Volunteer form → submitVolunteerApplication; (4) Contact form → submitContact; (5) footer newsletter → subscribeNewsletter (duplicate = "already subscribed"); (6) counters on Home and Impact → getImpactStats, and Impact charts → getImpactSeries; keep the hard-coded values as fallback if a call fails. Follow TRD §5 for loading states, honeypot, value mapping and error messages. Never show a fake success on failure. Never use innerHTML with user data.
```

### Phase 5 — Auth + dashboard

```
Now add authentication and the user dashboard per TRD §4.10, §4.11 and §16.5. Create login.html, signup.html, dashboard.html, js/auth.js and js/dashboard.js (add the auth functions to js/api.js if needed). Update the navbar on every page so it shows Log in / Sign up when signed out and Dashboard / Log out (plus Admin for admins) when signed in. Pre-fill name/phone on the Report and Volunteer forms when logged in. Implement route guard requireAuth(), safe ?next= redirect (relative same-site paths only), profile edit (name and phone only), My pickup requests with status timeline, and the volunteer "My assigned pickups" with Mark collected / Mark delivered (destination picker) via volunteerUpdateStatus. Add noindex meta on these pages.
```

### Phase 6 — Admin dashboard

```
Now build admin.html and js/admin.js exactly per TRD §4.12 and §16.4 (admin functions). Summary cards via count queries, tabs (Pickups, Volunteer applications, Messages, Subscribers), pickup filters + pagination (25/page), assign volunteer, change status (delivered requires a destination), approve/reject applications via reviewApplication, mark messages read, subscribers CSV download. Render all user text with textContent only. Guard with requireAdmin(). Update the UI only after the server confirms each action.
```

---

## 15. Testing Checklist (run 21 Oct morning)

### Functional
- [ ] All 11 pages open with no 404s; nav active states and auth-aware links correct
- [ ] Every form: empty submit → errors; invalid phone/email → errors; valid → success
- [ ] Report form creates a row in `pickup_requests`; reference ID shown matches the DB (`SS-2026-1001`, `1002`, …)
- [ ] Past pickup time is rejected (client AND server)
- [ ] Track box: correct ref + phone → status; wrong phone → "No pickup found"
- [ ] Volunteer, Contact and Newsletter submissions appear in the admin tabs; duplicate newsletter email → "already subscribed"
- [ ] Sign up → auto-login → Dashboard; logout; login again; refresh keeps the session
- [ ] **End-to-end:** guest submits pickup → admin assigns an approved volunteer → volunteer marks collected → delivered (with destination) → Home/Impact meal counter increases after refresh
- [ ] Volunteer application approved by admin → that account becomes a volunteer and sees "My assigned pickups"
- [ ] Counters animate once; charts render on impact.html; fallback values appear if backend is blocked
- [ ] Mobile 360px: no horizontal page scroll; hamburger works; admin tables scroll inside their container
- [ ] No console errors; images have alt text; titles/meta unique per page

### Security / RLS (use the browser console with the supabase client, or two test accounts)
- [ ] Logged-out: `select` on `pickup_requests`, `profiles`, `volunteer_applications`, `contact_messages`, `newsletter_subscribers` returns no rows
- [ ] User A cannot read User B's pickups or applications
- [ ] A normal user running `update profiles set role = 'admin'` on themselves fails
- [ ] A non-admin calling `review_volunteer_application` gets "Admins only"
- [ ] A non-admin cannot update a pickup's status directly (0 rows changed)
- [ ] A volunteer cannot change a pickup that is not assigned to them; invalid jumps (Assigned → Delivered) are rejected
- [ ] DB rejects bad data even if the UI is bypassed: phone `1234567890`, quantity 5, message under 20 characters
- [ ] `admin.html` opened by a normal user redirects away and shows no data
- [ ] Searching the project for `service_role` finds nothing in frontend files; only the anon/publishable key is used

### Performance & 3D
- [ ] Lighthouse mobile: Performance ≥90, Accessibility ≥95
- [ ] 3D hero ≥50fps on desktop Chrome + Android Chrome; static fallback with WebGL disabled **and** with the Three.js CDN blocked (DevTools → Network request blocking)
- [ ] 3D rendering pauses when scrolled out of view
- [ ] All images lazy-load except hero fallback; no layout shift
- [ ] Deployed URL works in incognito (no localhost links); Supabase project status is Active
- [ ] "6.87 crore tonnes" used everywhere; CTA label always "Report Surplus Food"

---

## 16. Backend Specification (Supabase)

### 16.1 Data model (see schema.sql for the full definition)

| Table | Purpose | Who can read | Who can write |
|---|---|---|---|
| `profiles` | One row per user: name, email, phone, **role** | Own row; admin reads all | User edits own `full_name`/`phone` only (column privileges); role changed only by admin SQL or `review_volunteer_application` |
| `pickup_requests` | Surplus food reports + lifecycle | Owner; assigned volunteer; admin | Created only via RPC `submit_pickup`; admin updates; assigned volunteer via RPC `volunteer_update_status` |
| `volunteer_applications` | Volunteer signups | Applicant (own); admin | Anyone inserts (status forced to `pending`); admin updates |
| `contact_messages` | Contact form | Admin | Anyone inserts; admin marks read |
| `newsletter_subscribers` | Footer signups | Admin | Anyone inserts (unique email) |
| `impact_baseline`, `impact_monthly`, `impact_destinations` | Illustrative baseline + chart data | Everyone | Admin via SQL only |

Pickup lifecycle: `reported → assigned → collected → delivered` (or `cancelled` by admin). Reference IDs come from a database sequence (`SS-<year>-<number>`), so they are unique and cannot be guessed-by-collision from the client.

### 16.2 RPC functions (backend business logic)

| Function | Caller | What it does |
|---|---|---|
| `submit_pickup(...)` → text | anon, authenticated | Inserts a pickup (links `user_id` if logged in), returns reference ID |
| `track_pickup(ref, phone)` | anon, authenticated | Returns limited status info only if both match |
| `get_impact_stats()` → json | anon, authenticated | Baseline + live delivered meals/partners + approved volunteers |
| `volunteer_update_status(id, status, delivered_to)` | authenticated | Assigned volunteer moves Assigned→Collected→Delivered; destination required on delivery |
| `review_volunteer_application(id, approve)` | authenticated (admin enforced inside) | Approves/rejects; approval sets the matching profile role to `volunteer` |
| `is_admin()` | authenticated | Used inside RLS policies |

### 16.3 `js/supabase.js` (lazy client with CDN fallback)

```js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

const CDNS = [
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm",
  "https://esm.sh/@supabase/supabase-js@2.45.4"
];

let clientPromise;
export function getClient() {
  if (!clientPromise) {
    clientPromise = (async () => {
      for (const url of CDNS) {
        try {
          const { createClient } = await import(url);
          return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: { persistSession: true, autoRefreshToken: true }
          });
        } catch (e) { /* try next CDN */ }
      }
      throw new Error("BACKEND_UNAVAILABLE");
    })();
  }
  return clientPromise;
}
```

```js
// js/config.js — PUBLIC values only. RLS (not secrecy) protects the data.
export const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
export const SUPABASE_ANON_KEY = "YOUR-ANON-OR-PUBLISHABLE-KEY";
// NEVER put the service_role / secret key here.
```

### 16.4 `js/api.js` — required function list (the ONLY file that talks to the database)

Every function: `const sb = await getClient();` → call → if `error` throw it (callers map codes per §5) → return data.

**Public**
- `getImpactStats()` → `sb.rpc('get_impact_stats')`; on failure return baseline `{meals_rescued:320000, food_waste_kg:96000, partner_restaurants:210, volunteers:850, cities:6}`
- `getImpactSeries()` → `{ monthly: from('impact_monthly').select().order('sort_order'), destinations: from('impact_destinations').select() }`, with hard-coded fallback
- `submitPickup(values)` → `sb.rpc('submit_pickup', { p_name, p_phone, p_organisation, p_address, p_city, p_food_type, p_quantity, p_pickup_time, p_notes })` → returns reference ID string
- `trackPickup(ref, phone)` → `sb.rpc('track_pickup', { p_ref, p_phone })` → array (empty = not found)
- `submitVolunteerApplication(values)` → `from('volunteer_applications').insert({ user_id: session?.user?.id ?? null, full_name, email, phone, city, preferred_role, availability, motivation })` (no `.select()` — guests cannot read rows back)
- `submitContact(values)` → `from('contact_messages').insert({ user_id, full_name, email, subject, message })`
- `subscribeNewsletter(email)` → `from('newsletter_subscribers').insert({ email })`; error code `23505` → return `{ duplicate: true }`

**Auth (in `auth.js`, using the same client)**
- `signUp({ email, password, fullName, phone })` → `sb.auth.signUp({ email, password, options: { data: { full_name: fullName } } })`; then if phone given and session exists → `updateProfile({ phone })`
- `signIn(email, password)` → `sb.auth.signInWithPassword`
- `signOut()` → `sb.auth.signOut()`
- `getSession()`, `onAuthChange(cb)` → `sb.auth.getSession()` / `onAuthStateChange`
- `getMyProfile()` → `from('profiles').select().eq('id', uid).single()`
- `requireAuth()`, `requireAdmin()` → redirect helpers (UX only)

**Signed-in**
- `updateProfile({ full_name, phone })` → `from('profiles').update({...}).eq('id', uid)` (never send `role`)
- `myPickups()` → `from('pickup_requests').select().eq('user_id', uid).order('created_at', { ascending: false })`
- `myAssignedPickups()` → same with `.eq('assigned_volunteer', uid)`
- `myApplications()` → `from('volunteer_applications').select().eq('user_id', uid)`
- `volunteerUpdateStatus(id, status, deliveredTo)` → `sb.rpc('volunteer_update_status', { p_id, p_status, p_delivered_to })`

**Admin (RLS enforces admin; UI also guards)**
- `adminCounts()` → head-count queries (`select('*', { count: 'exact', head: true })`) for: reported, assigned+collected, delivered, pending applications, unread messages
- `adminListPickups({ status, city, page })` → select with `.range(page*25, page*25+24)` + order by `created_at desc` (+ optional `.eq` filters)
- `adminListVolunteers()` → `from('profiles').select('id, full_name, email').eq('role', 'volunteer')`
- `adminAssignPickup(id, volunteerId)` → `update({ assigned_volunteer: volunteerId, status: 'assigned' }).eq('id', id)`
- `adminSetPickupStatus(id, status, deliveredTo)` → update (`delivered_to` required when status is `delivered`)
- `adminListApplications()`, `adminReviewApplication(id, approve)` → `sb.rpc('review_volunteer_application', { p_id, p_approve })`
- `adminListMessages()`, `adminMarkMessageRead(id)`
- `adminListSubscribers()`

### 16.5 Auth flow rules
- Session stored by supabase-js (localStorage); restored on every page load via `getSession()`.
- Role is read from `profiles.role` after login (never from user-editable metadata).
- Safe redirect: `?next=` accepted only if it starts with `/` or is a known relative page name, never a full external URL.
- Logout clears the session and returns to Home.
- UI guards (`requireAuth`, `requireAdmin`) are convenience only; **all real authorization is enforced by RLS and RPC checks in the database.**

### 16.6 Security rules (non-negotiable)
1. RLS enabled on every table (schema.sql does this); never disable it to "make it work".
2. Only the anon/publishable key in the frontend; **never** the service_role/secret key.
3. Render user-supplied text with `textContent`, not `innerHTML`.
4. Don't trust the client: all rules (phone format, quantity range, future time, status transitions, role changes) are also enforced in the database.
5. Don't leak existence: login errors are generic; tracking requires both reference ID and phone.
6. Public forms use the honeypot; database constraints cap field lengths.

---

## 17. Future Enhancements (out of scope; for viva)

- Email/SMS notifications on status change (Supabase Edge Function + SMS/email API)
- Razorpay/UPI donations with 80G receipt generation
- Live volunteer location / route optimisation
- Custom Node.js/Express API (if business logic outgrows database functions)
- Hindi version; PWA for volunteers in the field
- Turnstile/reCAPTCHA on public forms; audit log table for admin actions

---

*End of TRD v2.0 — pairs with PRD.md v2.0 and schema.sql*
