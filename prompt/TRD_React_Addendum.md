# TRD Addendum — React + Vite Edition (v2.1)

**Attach this file together with PRD.md, TRD.md and schema.sql.**
**Rule:** where this addendum conflicts with TRD.md on STACK, FILE STRUCTURE, LOADING, ENV or DEPLOY, **this addendum wins.** Everything else in TRD.md (pages, forms, validation rules, database, RLS, RPC, security, testing) stays exactly as written.

---

## A1. Stack (replaces TRD §1 "vanilla JS, no framework, no build step")

| Layer | Technology |
|---|---|
| Frontend | **React 18 + Vite**, JavaScript (JSX), **React Router v6** (`BrowserRouter`) |
| Styling | Existing global `src/styles/styles.css` (keep current design tokens and classes). No Tailwind, no UI kit. |
| Icons | `lucide-react` only (no emoji anywhere) |
| 3D | `three` from **npm** (bundled, no CDN), loaded lazily |
| Backend + DB + Auth | Supabase via `@supabase/supabase-js` from **npm** (no CDN) |
| Hosting | Netlify or Vercel (build step: `npm run build`, output `dist`) |

Install: `npm i react-router-dom lucide-react three @supabase/supabase-js`

---

## A2. File structure (replaces TRD §3)

```
second-serve/
├── index.html
├── .env                    # local only, NEVER committed
├── .env.example            # committed, empty values
├── .gitignore              # includes .env, node_modules, dist
├── package.json
├── vite.config.js
├── public/
│   ├── _redirects          # Netlify: /*  /index.html  200
│   ├── images/             # hero-fallback, steps, team, stories, logo.svg, logo-light.svg, og-cover
│   └── favicon.svg
├── supabase/schema.sql
└── src/
    ├── main.jsx            # ReactDOM + BrowserRouter + AuthProvider
    ├── App.jsx             # routes (lazy-loaded pages)
    ├── styles/styles.css
    ├── lib/
    │   ├── supabase.js     # createClient from import.meta.env
    │   ├── api.js          # ALL database calls (function list = TRD §16.4)
    │   └── validators.js   # phone, email, quantity, future-date, lengths (shared by all forms)
    ├── context/AuthContext.jsx   # session + profile + role, signUp/signIn/signOut
    ├── hooks/
    │   ├── useCountUp.js         # IntersectionObserver count-up, once
    │   ├── useImpactStats.js     # getImpactStats() with baseline fallback
    │   ├── useDocumentMeta.js    # sets <title>, meta description, robots
    │   └── useInView.js
    ├── components/
    │   ├── Navbar.jsx  Footer.jsx  Layout.jsx
    │   ├── Hero.jsx  Hero3D.jsx  CounterStrip.jsx
    │   ├── FormField.jsx  StatusBadge.jsx  Timeline.jsx  Toast.jsx  Modal.jsx  Tabs.jsx
    │   ├── ProtectedRoute.jsx  AdminRoute.jsx
    │   └── Accordion.jsx  Carousel.jsx  RoleCard.jsx  StoryCard.jsx  TeamCard.jsx
    └── pages/
        ├── Home.jsx  HowItWorks.jsx  ReportFood.jsx  Volunteer.jsx  Impact.jsx
        ├── About.jsx  Contact.jsx  Login.jsx  Signup.jsx  Dashboard.jsx  Admin.jsx
        └── NotFound.jsx
```

---

## A3. Routes

| Path | Page | Guard |
|---|---|---|
| `/` | Home | public |
| `/how-it-works` | HowItWorks | public |
| `/report-food` | ReportFood (form + Track box) | public (guests allowed) |
| `/volunteer` | Volunteer | public |
| `/impact` | Impact | public |
| `/about` | About | public |
| `/contact` | Contact | public |
| `/login`, `/signup` | Login, Signup | redirect to `/dashboard` if already signed in |
| `/dashboard` | Dashboard | `ProtectedRoute` (login required) |
| `/admin` | Admin | `AdminRoute` (role = admin) |
| `*` | NotFound | public |

Wherever TRD says `report-food.html`, `volunteer.html` etc., use the route path (`/report-food`, `/volunteer`). Use `<Link>` / `<NavLink>` (active class automatic) — no full page reloads. All pages except Home are loaded with `React.lazy` + `Suspense` (route-level code splitting). Dashboard and Admin are separate chunks.

---

## A4. Environment variables and Supabase client (replaces TRD §16.3 and `config.js`)

`.env` (local) and the same two variables in the Netlify/Vercel dashboard:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-OR-PUBLISHABLE-KEY
```

`src/lib/supabase.js`:

```js
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const backendConfigured = Boolean(url && key);

export const supabase = backendConfigured
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })
  : null;
```

Rules:
- Variables starting with `VITE_` are embedded in the browser bundle, so they are **public**. Only the project URL and anon/publishable key may use them.
- **Never** use or mention a `service_role` / secret key / database password in `src`, `.env`, or any `VITE_` variable. If any file contains `service_role`, stop and tell the user.
- Commit `.env.example` with empty values; `.env` is in `.gitignore`.
- After changing env variables on Netlify/Vercel, **redeploy** (values are baked in at build time).
- If `supabase` is `null` (not configured) or a request fails: public pages still render with baseline values and forms show the friendly error banner (TRD §5). Never crash.

`api.js` imports `supabase` and implements exactly the function list in **TRD §16.4**. React components never call `supabase` directly except `AuthContext`.

---

## A5. Auth in React (replaces `auth.js` parts of TRD §4.10–4.12, §16.5)

- `AuthContext` holds `{ session, user, profile, role, loading }`, restores the session on startup via `supabase.auth.getSession()`, subscribes to `onAuthStateChange` (unsubscribe in effect cleanup), and loads `profiles` row for the role. Exposes `signUp`, `signIn`, `signOut`, `refreshProfile`.
- `ProtectedRoute`: while `loading` show a small spinner; no session → `<Navigate to="/login" state={{ from: location }} replace />`.
- `AdminRoute`: wraps ProtectedRoute; role ≠ admin → redirect to `/dashboard` with toast "Admins only".
- After login, redirect to `location.state.from` (internal paths only) else `/dashboard`.
- Navbar reads `useAuth()`: signed out → "Log in" + "Sign up"; signed in → "Dashboard" + "Log out" (+ "Admin" for admins). While `loading`, render the signed-out layout with reserved space (no layout jump).
- UI guards are UX only; real security is RLS and RPC checks in the database.

---

## A6. 3D hero in React (replaces TRD §4.9 loading section; all scene specs there still apply)

- `Hero.jsx` always renders the static hero (image + scrim + overlay text + CTAs) first.
- It decides whether to mount 3D: not `prefers-reduced-motion`, WebGL available (test with a throwaway canvas in try/catch), otherwise stay on the static image.
- `Hero3D` is loaded with `React.lazy(() => import("./Hero3D"))` inside `<Suspense fallback={null}>`, so Three.js is a separate chunk that never blocks the headline.
- `Hero3D.jsx` creates the renderer in `useEffect` and **cleans up fully** in the return function (required because React StrictMode runs effects twice in development): `cancelAnimationFrame`, disconnect `IntersectionObserver`, remove `visibilitychange`/`pointermove`/`resize` listeners, `dispose()` all geometries, materials, textures and the renderer, remove the canvas element.
- Use `import * as THREE from "three"` (npm). No CDN, no import map.
- If anything throws, catch it and show the static fallback image. Canvas: `aria-hidden="true"`, `pointer-events: none`.
- Pause rendering off-screen and when the tab is hidden; pixel ratio capped (2 desktop / 1.5 mobile); particle counts and parallax rules exactly as TRD §4.9.
- Hero text must remain real HTML in `Hero.jsx` (never inside the canvas).

---

## A7. React coding rules

- Function components + hooks only. No class components. No Redux (Context is enough).
- Forms: controlled inputs, validators from `lib/validators.js`, errors shown per field with `aria-invalid` and an `aria-live="polite"` summary region; submit button shows loading state; honeypot field `website` on all public forms (TRD §5).
- **Never use `dangerouslySetInnerHTML`.** Render user data as normal JSX text.
- Every `useEffect` that subscribes, observes or sets timers must return a cleanup function.
- Use `key` props with stable ids (database `id`, not array index) in lists.
- Counters: `useCountUp` (IntersectionObserver, runs once, easeOut ~1.5s, respects `prefers-reduced-motion`).
- Document meta: `useDocumentMeta({ title, description, noindex })` on every page (≤60-char titles, ≤155-char descriptions). `/login`, `/signup`, `/dashboard`, `/admin` use `noindex`. Keep static Open Graph tags in `index.html`.
- No emoji in code or copy; icons from `lucide-react` only, with the size/stroke rules from the polish prompt (stroke 1.75, `aria-hidden` for decorative icons).
- Keep the existing CSS class names and design tokens; do not rewrite the design system.

---

## A8. Build, deploy, SPA routing (replaces TRD §13-B)

1. `npm run build` must finish with zero errors; `npm run preview` to test the production build locally.
2. **Netlify:** build command `npm run build`, publish directory `dist`. Add `public/_redirects` containing `/*  /index.html  200` so refreshing `/dashboard` or `/admin` does not 404. **Vercel:** add `vercel.json` with a rewrite of all paths to `/index.html`.
3. Add the two `VITE_` variables in the hosting dashboard, then redeploy.
4. Supabase: Authentication → URL Configuration → Site URL = deployed URL; add it to Redirect URLs (also `http://localhost:5173` for local testing).
5. Everything in TRD §13-A and §13-C (Supabase project, schema, first admin) is unchanged.

---

## A9. Extra tests (add to TRD §15)

- [ ] `npm run build` succeeds; `npm run preview` shows no console errors
- [ ] Refreshing `/dashboard`, `/admin`, `/report-food` on the deployed URL works (no 404)
- [ ] In dev (StrictMode) the 3D canvas appears once, not twice; navigating away and back leaves no console warnings and GPU memory does not grow (cleanup works)
- [ ] 3D chunk is a separate network request; with reduced-motion or WebGL disabled it is never requested and the static hero shows
- [ ] Search `src/`, `.env`, `dist/` for `service_role`: no results; `.env` is not in git
- [ ] Logged-out user opening `/dashboard` is redirected to `/login` and returned after login
- [ ] Route-level lazy loading works: Admin code is not downloaded for normal visitors

---

## A10. Phased prompts for React (replace TRD §14 Phase 2 to 6; Phase 1 is already done)

Attach PRD.md, TRD.md, TRD_React_Addendum.md and schema.sql every time and add: *"PRD defines WHAT, TRD defines HOW; the React Addendum overrides TRD on stack, files, env and deploy. On any other conflict follow TRD."*

### Phase 2 — 3D hero

```
Add the real-time 3D hero to the existing React/Vite project per TRD §4.9 (scene, lighting, performance, fallback) and Addendum A6 (React integration). Install the "three" npm package. Create src/components/Hero3D.jsx (lazy-loaded with React.lazy inside Hero.jsx; the static hero image, scrim, overlay text and CTAs stay exactly as they are and always render first). Procedural low-poly steel thali + floating apple, roti, carrot and parcel box + warm particles; slow auto-rotate; mouse parallax on desktop only (pointer: fine); IntersectionObserver and visibilitychange pause; pixel-ratio cap; fewer particles on mobile. Do not mount 3D when prefers-reduced-motion is on or WebGL is unavailable. Clean up everything in the useEffect return (cancelAnimationFrame, observers, listeners, dispose geometries/materials/textures/renderer, remove canvas) so React StrictMode does not duplicate the scene. Wrap in try/catch and fall back to the static image on any error. Do not change anything else.
```

### Phase 3 — Remaining public pages (one prompt per page, one at a time)

```
Create src/pages/HowItWorks.jsx per TRD §4.2 and add the route /how-it-works in App.jsx (React.lazy). Reuse Layout, Navbar, Footer and existing CSS classes; do not regenerate them. Use lucide-react icons only. Set the page title and description with useDocumentMeta.
```
```
Create src/pages/ReportFood.jsx per TRD §4.3 and §5 (form UI with validators from src/lib/validators.js, success panel, and the Track-your-pickup card UI). Backend wiring comes in Phase 4, so leave a clearly marked TODO hook.
```
```
Create src/pages/Volunteer.jsx per TRD §4.4 and §5 (role cards pre-select the role dropdown and scroll to the form).
```
```
Create src/pages/Impact.jsx per TRD §4.5 (5 counters, div bar chart, SVG monthly chart, partner badges, 2 stories; use hard-coded fallback data for now).
```
```
Create src/pages/About.jsx per TRD §4.6 (mission, timeline, team, Transparency section) and src/pages/Contact.jsx per TRD §4.7 and §5 (form, info card, static styled map placeholder with no iframe, FAQ accordion). Add both routes.
```

**→ Commit and tag `static-safe`.**

### Phase 4 — Supabase wiring

```
Add the backend layer per TRD §16, schema.sql and Addendum A4. Install @supabase/supabase-js. Create src/lib/supabase.js exactly as in A4, .env.example (empty values), and make sure .env is in .gitignore. Create src/lib/api.js with the exact function list in TRD §16.4 (all database calls only here). Then wire WITHOUT changing layouts: Report form -> submitPickup (show the real reference ID), Track box -> trackPickup, Volunteer form -> submitVolunteerApplication, Contact form -> submitContact, footer newsletter -> subscribeNewsletter (duplicate = "already subscribed"), counters on Home and Impact -> useImpactStats / getImpactSeries with the current hard-coded values as fallback. Follow TRD §5 for value mapping, loading states, honeypot and error messages. Never show fake success on failure. Never use dangerouslySetInnerHTML. If any file contains "service_role", stop and tell me.
```

### Phase 5 — Auth + dashboard

```
Add authentication and the dashboard per TRD §4.10, §4.11, §16.5 and Addendum A5. Create src/context/AuthContext.jsx, src/components/ProtectedRoute.jsx, src/pages/Login.jsx, Signup.jsx and Dashboard.jsx, with routes /login, /signup, /dashboard. Update Navbar to show Log in / Sign up when signed out and Dashboard / Log out (plus Admin for admins) when signed in, without layout jump. Pre-fill name and phone on the Report and Volunteer forms when logged in. Dashboard: profile edit (name and phone only, never role), My pickup requests with status timeline, and for volunteers My assigned pickups with Mark collected / Mark delivered (destination picker in a modal) via volunteerUpdateStatus. Redirect back to the original page after login (internal paths only). noindex on these pages.
```

### Phase 6 — Admin

```
Build src/pages/Admin.jsx and src/components/AdminRoute.jsx per TRD §4.12 and §16.4 (admin functions), route /admin, lazy-loaded. Summary count cards, accessible tabs (Pickups, Volunteer applications, Messages, Subscribers), pickup filters + pagination (25 per page), assign volunteer, change status (delivered requires a destination), approve/reject applications via reviewApplication, mark messages read, subscribers CSV download. Update the UI only after the server confirms each action. Render all user text as plain JSX text. Non-admins are redirected to /dashboard.
```

---

*End of TRD Addendum v2.1 — React + Vite edition*
