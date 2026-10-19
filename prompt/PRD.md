# PRD — Second Serve: Food Waste Rescue NGO (Full-Stack Web App)

**Version:** 2.0 (upgraded from static site to full stack: database + backend logic + authentication + admin panel)
**Date:** 19 October 2026
**Prepared for:** Task 3 — AI Website Generation (submission deadline: 21 Oct 2026, 7:00 PM)
**Build method:** AI website generator
**Companion docs:** TRD.md v2.0 (how to build) and schema.sql (database)

> PRD defines WHAT to build, TRD defines HOW — on any technical conflict, follow TRD.

---

## 1. Product Overview

**One-liner:** Second Serve is a food-rescue NGO that collects surplus food from weddings, hotels, restaurants and events — and delivers it the same day to night shelters, slum kitchens and community kitchens.

**Vision:** No good food goes to waste while someone nearby goes hungry.

**What this web app must do (its 5 jobs):**
1. Let restaurants/hotels report surplus food, **store it in a database**, and track the pickup to delivery.
2. Recruit volunteers and let the NGO **review, approve and assign** them to pickups.
3. Build donor trust through radical transparency (registrations, reports, cost-per-meal).
4. Present impact credibly — counters are **computed live from the database** on top of a clearly illustrative baseline.
5. Give the NGO team an **admin dashboard** to run daily operations.

> Second Serve is a fictional-but-realistic NGO created for this assignment. All stats about the problem are real; the NGO's own baseline impact numbers are clearly illustrative.

---

## 2. Problem Statement (Real-World, Researched)

| # | Real problem | Evidence |
|---|---|---|
| 1 | India wastes ~6.87 crore tonnes of food every year, while hunger persists — India ranked 105/127 on the 2024 Global Hunger Index. | National food-waste estimates; Global Hunger Index 2024 |
| 2 | Food-rescue NGOs run entirely on volunteer logistics, but 93.5% of non-volunteers don't volunteer because they don't know how to start; 74.2% choose organisations that frequently communicate volunteering opportunities. | iVolunteer "Volunteering in India" research |
| 3 | Small grassroots NGOs are digitally invisible (avg. digital maturity 4.4/10; only 67.8% can accept donations online), so CSR funds (₹22,563 crore in FY25) flow only to big, visible NGOs. | Digital for Nonprofits study 2026; Bharat NGO Report 2025 |
| 4 | Donor trust deficit: CBDT unearthed a ₹5,500 crore bogus-donation racket in 2025 (fake receipts, shell NGOs). Donors now demand proof of impact. | CBDT/ET reporting, Dec 2025 |
| 5 | Only 25% of donors donate more than once in 12 months; nearly half of nonprofits lack structured donor-retention strategies. | Give platform data; UDARTA "Everyday Giving" Report 2025 |
| 6 | Food rescue is time-critical: surplus food spoils within hours, so NGOs need a system that records, assigns and tracks pickups — spreadsheets and WhatsApp groups lose requests. | Operational insight (food-safety windows) |

**Conclusion:** The website is the NGO's operating system for supply (surplus food reports), workforce (volunteers) and funding (donor trust) — backed by a real database, user accounts and an admin dashboard.

---

## 3. Target Users (Personas)

| Persona | Who | Goal on the site | Success = |
|---|---|---|---|
| Ravi, Restaurant Manager (34) | Banquet hall manager; wedding just ended with 200 untouched plates | Report surplus food in under 60 seconds (no account needed); track it afterwards | Gets reference ID instantly; sees status move to "Collected" |
| Priya, Student Volunteer (21) | College student, free on weekends | Apply, get approved, see assigned pickups | Applied in <2 min; after approval sees pickups in her dashboard |
| Anita, Donor (32) | Working professional, donates ₹500–2,000 occasionally | Verify the NGO is legit; see where money goes | Finds 80G info, cost-per-meal, live impact numbers |
| Karan, CSR Manager (40) | Corporate CSR head | Check compliance docs; contact partnerships | Downloads report; sends a partnership message |
| Shelter Coordinator | Runs a night shelter for 80 people | Request regular food supply | Submits message via Contact |
| Sunita, NGO Operations Admin (29) | Coordinates pickups daily | See all requests, assign volunteers, update status, read messages | Handles a new request end-to-end in under 1 minute |

---

## 4. Product Goals & Success Metrics

| Goal | Metric |
|---|---|
| G1. Instant clarity | Any visitor understands what Second Serve does within 10 seconds |
| G2. Frictionless food reporting | Form completable in ≤60 seconds **without creating an account**; data saved to DB; reference ID shown |
| G3. Volunteer conversion | Application completable in ≤2 minutes |
| G4. Trust at one click | 80G/12A, reports and cost-per-meal reachable from every page |
| G5. Professional finish | Mobile-responsive; loads <3s; no broken links; SEO tags present |
| G6. Real data flow | Submitting a form creates a database row visible in the admin dashboard within seconds |
| G7. Secure by design | Every table protected by Row Level Security; users can only see their own data; only admins can manage others' data |

---

## 5. Scope

### In Scope
- **11 pages:** Home, How It Works, Report Surplus Food, Volunteer, Impact, About Us (+Transparency), Contact, **Login, Sign Up, Dashboard, Admin**
- **Database (PostgreSQL via Supabase):** profiles, pickup_requests, volunteer_applications, contact_messages, newsletter_subscribers, impact data
- **Authentication:** email + password signup/login/logout, persistent sessions, role-based access (user / volunteer / admin)
- **Backend logic:** database functions (RPC) + Row Level Security policies (reference-ID generation, status transitions, volunteer approval, live impact stats)
- 4 public forms that **persist to the database**: Report Surplus Food, Volunteer Application, Contact, Newsletter
- Pickup tracking by reference ID + phone (no login needed) and by account (dashboard)
- Admin dashboard: pickups, volunteer applications, messages, subscribers
- Animated impact counters on Home and Impact (live from DB)
- Mobile-first responsive design, SEO basics, accessibility basics, English content

### Out of Scope (explicitly not built)
- Real payment gateway / real donations (donate section is informational: UPI ID placeholder + 80G note)
- Real-time GPS tracking
- Email/SMS notifications (P2 future enhancement)
- Hindi/multilingual version
- Native mobile app

---

## 6. Sitemap

```
Home
├── How It Works
├── Report Surplus Food (form + "Track your pickup" box — the #1 conversion page)
├── Volunteer (roles + application form)
├── Impact (dashboard: live counters, charts, partner list)
├── About Us
│   └── Transparency (section)
├── Contact
├── Login
├── Sign Up
├── Dashboard   (login required: My pickups / My assigned pickups / Profile)
└── Admin       (admin role required)
```

Global elements: sticky navbar (logo, links, **"Report Surplus Food"** CTA, and **Log in / Sign up** — or **Dashboard / Log out** when signed in, plus **Admin** for admins), footer (quick links, registration numbers, contact, newsletter, social icons).

---

## 7. Features (Prioritized)

### P0 — Must-have

**F-01 | 3D interactive hero (Home) — signature feature**
- Real-time Three.js scene: stylized steel thali with low-poly floating food (apple, roti, carrot, parcel box) and warm light particles; slow auto-rotation + mouse parallax on desktop; gentle float only on mobile.
- Overlay (real HTML): headline "Good food shouldn't go to waste.", sub-headline "India wastes ~6.87 crore tonnes of food every year. We rescue it.", CTAs "Report Surplus Food" (primary) + "Become a Volunteer" (secondary).
- Fallback to static hero image if WebGL is unavailable, the CDN fails, or prefers-reduced-motion is on.
- Style: low-poly, soft studio lighting, warm palette — playful like a Pixar short, NOT dark/sci-fi.
- **Acceptance:** 3D visible within 2.5s after first paint on 4G; ≥50fps on mid-range phone; fallback auto-appears; headline readable (scrim); rendering pauses off-screen.

**F-02 | Impact counters — live from database (Home + Impact)**
- Home: 4 counters — Meals Rescued, Food Waste Avoided (kg), Partner Restaurants, Volunteers. Impact page: all 5, larger, adding Cities Served.
- Values come from `get_impact_stats()` = illustrative baseline (3,20,000 meals / 96,000 kg / 210 partners / 850 volunteers / 6 cities) **plus real deliveries and approved volunteers from the database**.
- If the request fails, show the baseline numbers (never blank).
- **Acceptance:** counters animate once on scroll; when a pickup is marked delivered, the meal count increases after refresh; footer note says baseline is illustrative.

**F-03 | "How It Works" 3-step explainer** — Call/Report → Collect (within 2 hours, food safety checked) → Serve (same day). Each step: icon, title, 2-line description, illustration. **Acceptance:** a first-time visitor can explain the model.

**F-04 | Report Surplus Food form — saved to database**
- Fields: Name*, Phone* (10-digit, starts 6–9), Organisation*, Pickup address*, City* (Delhi NCR, Mumbai, Bengaluru, Jaipur, Lucknow, Patna), Food type* (Veg / Non-veg / Both), Approx. quantity* (serves ~__ people, 10–5000), Pickup time* (future), Notes (optional).
- Works for **guests and logged-in users**; logged-in users get name/phone pre-filled and the request is linked to their account.
- On submit: row saved in `pickup_requests`; success screen: "Thank you! Our team will call you within 15 minutes." + **server-generated reference ID** (SS-2026-1001, 1002, …). If saving fails, show a clear error and the helpline — never a fake success.
- Helpline displayed as alternative: 1800-XXX-XXXX (placeholder).
- **Acceptance:** empty submit shows errors; valid submit creates a DB row and shows its real reference ID; the row appears in the admin dashboard.

**F-05 | Volunteer page — applications saved to database**
- 4 role cards: Food Hero (pickup & delivery), Shelter Coordinator, Event Volunteer (weddings), Social Media Volunteer — each with time commitment.
- Form: Name*, Email*, Phone*, City*, Preferred role*, Availability* (≥1 of Weekdays/Weekends/Evenings), Motivation (optional, ≤500 chars). Saved to `volunteer_applications` with status "pending".
- Success: "Welcome aboard! We'll invite you to the orientation."
- **Acceptance:** addresses "don't know how to start" with clear roles; application visible to admin.

**F-06 | Impact page** — live counters (F-02), "Where the food goes" (Night shelters 45%, Community kitchens 30%, Slum kitchens 25% — from `impact_destinations`), 12-month meals trend (from `impact_monthly`), partner strip (fictional names, marked illustrative), 2 beneficiary stories. **Acceptance:** page answers "does this NGO actually do anything?" with numbers + stories.

**F-07 | About Us + Transparency** — mission, vision, founding story (2021, Delhi), 4 fictional team members, 80G & 12A numbers (placeholder format), "₹38 rescues 10 meals" breakdown, report links (placeholders), FCRA note. **Acceptance:** donor can verify legitimacy signals in one scroll.

**F-08 | Contact page — messages saved to database**
- Form: Name*, Email*, Subject* (Partnership / CSR / Media / General), Message* (20–2000 chars) → saved to `contact_messages`; success state.
- Info block: email, helpline, address ("14, Community Centre, Laxmi Nagar, Delhi"); static styled map placeholder; FAQ accordion (5–6 Q&As).
- **Acceptance:** message visible in admin Messages tab.

**F-09 | Sticky navbar + footer (global) + newsletter**
- Navbar reflects login state. Footer newsletter saves email to `newsletter_subscribers`; duplicate email shows "You're already subscribed!".
- **Acceptance:** identical on all pages; mobile menu works.

**F-10 | Authentication & roles**
- Sign Up: name, email, password (min 8 chars), optional phone. Login with email + password. Logout. Session persists across refresh.
- Three roles: **user** (default), **volunteer** (granted when admin approves an application matching their account/email), **admin** (set manually in the database).
- Protected pages: Dashboard requires login; Admin requires admin role; others redirect to Login with a return link.
- **Acceptance:** new account can log in; user cannot open Admin; user cannot change their own role (blocked by the database, not just the UI).

**F-11 | Pickup tracking**
- "Track your pickup" box on the Report page: enter reference ID + phone → shows status timeline (Reported → Assigned → Collected → Delivered) without login.
- **Acceptance:** wrong phone returns "No pickup found"; correct pair shows current status.

**F-12 | User & Volunteer Dashboard**
- All users: profile (edit name/phone), **My pickup requests** with status timeline.
- Volunteers additionally: **My assigned pickups** (organisation, address, phone, time, quantity) with buttons "Mark collected" and "Mark delivered" (choose destination: Night shelter / Community kitchen / Slum kitchen). Allowed transitions only Assigned → Collected → Delivered.
- Admins see a link to the Admin page.
- **Acceptance:** volunteer can finish an assigned pickup; delivering increases the live meal counter.

**F-13 | Admin Dashboard**
- Summary cards: new requests, in progress, delivered, pending volunteer applications, unread messages.
- **Pickups tab:** table with filters (status, city), paginated (25/page); per row: assign a volunteer (dropdown of approved volunteers → status becomes Assigned), change status, cancel.
- **Volunteer applications tab:** approve / reject (approval promotes the account to volunteer role).
- **Messages tab:** read, mark as read.
- **Subscribers tab:** list + count + "Download CSV".
- **Acceptance:** an admin can take a new request from Reported to Assigned in under 1 minute; non-admins cannot read any admin data (verified by testing).

### P1 — Should-have
- F-14: Testimonials carousel on Home
- F-15: "Donate" info section (UPI ID placeholder, 80G explainer, monthly-giving pitch for the 25% retention stat)
- F-16: Stories teaser on Home
- F-17: Floating "Report Surplus Food" quick button on mobile
- F-18: Forgot-password flow (email reset link)
- F-19: "Continue with Google" login

### P2 — Nice-to-have
- F-20: Photo gallery; F-21: Hindi toggle; F-22: Food Safety Guidelines PDF; F-23: Email/SMS notification when pickup status changes (Edge Function)

---

## 8. Content Requirements

- English, warm and simple (Grade 8). Hopeful, action-oriented tone ("Join 850 volunteers").
- Real stats: 6.87 crore tonnes wasted yearly; 105/127 hunger index; "₹38 = 10 meals".
- **Stat format rule:** always "6.87 crore tonnes" — never "68.7 million".
- **CTA label rule:** always "Report Surplus Food" — never "Report Food".
- **Honesty rule:** baseline impact numbers are illustrative; footer note: "Demo website created for academic purposes; NGO and baseline impact figures are illustrative."
- Realistic form placeholders (phone "98765 43210").
- Clear, human error messages (e.g. "Please enter a 10-digit mobile number starting with 6–9").

---

## 9. Design Requirements

- Brand: warm, trustworthy, energetic — "community kitchen", not "corporate charity".
- Palette: orange #E8590C, green #2F9E44, cream #FFF9F0, charcoal #343A40. No cold blues.
- Typography: Poppins (headings) + Inter (body).
- Imagery: realistic Indian food, volunteers, community kitchens (AI-generated, warm).
- 3D: low-poly, soft studio lighting, playful, never dark/neon.
- Mobile-first: tap targets ≥44px; forms single-column on mobile.
- Dashboard/Admin: clean cards and tables; tables scroll horizontally inside their container on mobile; status shown as badges with text labels (Reported = grey, Assigned = amber, Collected = orange, Delivered = green, Cancelled = red) — never colour alone.

---

## 10. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Performance | Pages load <3s on 4G; images WebP; 3D visible <2.5s; database calls show loading states |
| Responsive | Works at 360px, 768px, 1280px+; no horizontal page scroll |
| SEO | Unique title + description per page; semantic HTML; Open Graph; login/dashboard/admin pages use `noindex` |
| Accessibility | Alt text; labels; contrast ≥4.5:1; keyboard-navigable; errors in aria-live region |
| Security | RLS on every table; no secret keys in frontend; server-side constraints mirror client validation; no `innerHTML` with user data |
| Reliability | Network/database errors show friendly messages; public pages still render if the database is unreachable |
| Browser | Latest Chrome, Edge, Firefox, mobile Safari |

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Scope grew with only 2 days left | **Layered delivery:** (1) static site + 3D complete first and tagged as a working fallback; (2) backend forms next; (3) auth + dashboard; (4) admin. **Cutoff: if admin isn't working by 21 Oct 2 PM, submit without it.** |
| AI generator produces broken forms/auth | Build in small phases; test each form manually; keep code in simple vanilla JS modules |
| Database security mistakes (data leaks) | RLS on all tables; run the RLS test list in TRD §15; never ship the service_role key |
| Supabase free project pauses after inactivity | Open the project dashboard on 20 and 21 Oct; confirm it is "Active" before submitting |
| Spam on public forms | Honeypot field + database CHECK constraints (optional Turnstile later) |
| Email confirmation blocks demo signups | Disable "Confirm email" in Supabase Auth settings for the demo |
| 3D hero heavy on low-end phones | Pixel-ratio cap, fewer particles, pause off-screen, static fallback |
| Three.js CDN down | Dynamic import with jsdelivr → unpkg fallback → static hero image |
| Images look fake/generic | Specific AI image prompts (TRD §12) |

---

## 12. Milestones

| Date | Milestone |
|---|---|
| 19 Oct (today) | PRD + TRD + schema.sql finalised; Supabase project created; schema run |
| 20 Oct (day) | Static site (7 pages) + 3D hero complete → **git tag "static-safe"** |
| 20 Oct (evening) | Backend wired: 4 forms save to DB, live counters, tracking |
| 21 Oct (morning) | Auth pages + Dashboard + Admin; RLS tests; Lighthouse; deploy |
| 21 Oct, 2 PM | **Feature freeze** — only bug fixes after this |
| 21 Oct, 7 PM | Submission |

---

*End of PRD v2.0 — pairs with TRD.md v2.0 and schema.sql*
