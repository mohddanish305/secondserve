# Second Serve — Food Waste Rescue NGO Web App (Full-Stack v2.0)

Second Serve is a full-stack web application designed for a modern food-rescue non-governmental organisation (NGO) in India. The platform collects surplus food from weddings, hotels, restaurants, and banquets and delivers it the same day to night shelters (Rain Baseras), slum kitchens, and community kitchens across 6 major Indian cities.

---

## 🌟 Key Features

1. **3D Interactive Hero (Home):** Built with Three.js (procedural low-poly steel thali, floating apple, roti, carrot, parcel box, and warm particle lighting) with desktop cursor parallax and graceful fallback to a high-resolution photorealistic hero image.
2. **Live Impact Counters:** Dynamically computed from database deliveries on top of illustrative baseline metrics (Meals Rescued, Food Waste Avoided in kg, Partner Venues, Volunteers, Cities Served).
3. **Frictionless Food Reporting:** Banquet managers and event hosts can report surplus food in under 60 seconds with **no login required**. Generates a unique, server-assigned tracking reference ID (`SS-2026-####`).
4. **Instant Pickup Tracking:** Reference ID + phone number status lookup with a 4-step visual timeline (`Reported → Assigned → Collected → Delivered`).
5. **Volunteer Recruitment & Roles:** 4 dedicated role cards (`Food Hero`, `Shelter Coordinator`, `Event Volunteer`, `Social Media Volunteer`) with 1-click role selection and application database persistence.
6. **User & Volunteer Dashboard:**
   - Donors track all their submitted pickups.
   - Volunteers access **"My Assigned Pickups"**, review donor contact numbers, and advance statuses (`Mark Collected`, `Mark Delivered` with destination facility selection).
7. **Admin Operations Center:**
   - Real-time metric cards (New Requests, In Progress, Delivered, Pending Volunteers, Unread Inquiries).
   - Filterable, paginated Food Pickups management with instant volunteer assignment.
   - Volunteer application approvals (promotes user account to Volunteer role).
   - Inquiries management and 1-click CSV download of newsletter subscribers.
8. **Radical Transparency:** Cost-per-meal financial breakdown (₹38 = 10 meals), verified 80G / 12A registration details, and downloadable audit reports.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** HTML5, CSS3 (Custom Design System with Poppins + Inter typography), Vanilla JavaScript (ES Modules, zero build step required).
- **3D Graphics:** Three.js r165 (dynamically imported with jsdelivr + unpkg CDN fallbacks).
- **Backend & Database:** PostgreSQL via Supabase (Row Level Security, Foreign Key constraints, Triggers, RPC Database Functions).
- **Authentication:** Supabase Auth (Email + Password with persistent sessions and client route guards).
- **Deployment:** Netlify / Vercel / GitHub Pages (South Asia / Mumbai region recommended for Supabase).

---

## 📁 File & Folder Structure

```
second-serve/
├── index.html              # Home page with 3D hero & live impact counters
├── how-it-works.html       # 3-step logistics explainer & food safety guidelines
├── report-food.html        # Surplus food reporting form + Track pickup box
├── volunteer.html          # Volunteer roles & application form
├── impact.html             # Verified impact dashboard, SVG trends, & destination breakdown
├── about.html              # Mission, timeline, team, and 80G transparency section
├── contact.html            # Contact form, static map card, & FAQ accordion
├── login.html              # Account login & session redirect
├── signup.html             # Account registration with client validations
├── dashboard.html          # User & Volunteer operational dashboard
├── admin.html              # Operations Admin Console
├── css/
│   └── styles.css          # Design system, CSS variables, components, & responsive styles
├── js/
│   ├── config.js           # Supabase Project URL & Anon Public Key
│   ├── supabase.js         # Lazy client loader with multi-CDN fallback
│   ├── api.js              # Complete database access layer & offline demo fallback
│   ├── auth.js             # Authentication, session manager, & route guards
│   ├── main.js             # Sticky navbar, count-up animations, carousel, FAQ, newsletter
│   ├── hero3d.js           # Procedural Three.js 3D hero with auto-rotation & parallax
│   ├── dashboard.js        # User & volunteer dashboard controller
│   └── admin.js            # Operations console, tables, status changes, CSV download
├── supabase/
│   └── schema.sql          # Full PostgreSQL schema, RLS policies, enums, triggers, & RPCs
├── images/
│   ├── logo.svg            # Vector brand logo (plate, sprout, Poppins wordmark)
│   ├── hero-fallback.jpg   # Photorealistic hero image for WebGL fallback
│   ├── how-step-1.jpg      # Step 1: Hotel banquet handover
│   ├── how-step-2.jpg      # Step 2: Insulated transport van loading
│   ├── how-step-3.jpg      # Step 3: Night shelter dining hall serving
│   ├── volunteer-team.jpg  # Community volunteer team
│   ├── story-meera.jpg     # Beneficiary story: Night shelter coordinator
│   ├── story-ravi.jpg      # Beneficiary story: Senior citizen recipient
│   └── og-cover.jpg        # Open Graph share card
└── README.md
```

---

## 🚀 Setup & Deployment

### 1. Supabase Backend Setup
1. Log in to [supabase.com](https://supabase.com) and create a new project (select Region: **South Asia (Mumbai)**).
2. Open the **SQL Editor**, open `supabase/schema.sql`, paste the full SQL content, and click **Run**.
3. Under **Authentication → Providers → Email**, turn **OFF "Confirm email"** (enables immediate testing without waiting for confirmation emails).
4. Go to **Project Settings → API** and copy your **Project URL** and the **anon / public key**.
5. Open `js/config.js` and paste your credentials:
   ```javascript
   export const SUPABASE_URL = "https://your-project-id.supabase.co";
   export const SUPABASE_ANON_KEY = "your-anon-key-here";
   ```

### 2. Creating Your First Administrator
1. Navigate to `signup.html` in your browser and register an account.
2. In the Supabase SQL Editor, execute:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'your-email@example.com';
   ```
3. Log out and log back in. The navbar and dashboard will now feature the **Admin Panel** shortcut.

### 3. Frontend Deployment (Netlify)
1. Drag and drop the `second-serve` folder onto [Netlify Drop](https://app.netlify.com/drop) or connect via GitHub repository.
2. In Supabase Dashboard under **Authentication → URL Configuration**, add your deployed Netlify URL to the **Site URL** and **Redirect URLs**.

---

## 🔒 Security Best Practices Implemented

- **Row Level Security (RLS):** Enforced on all tables (`profiles`, `pickup_requests`, `volunteer_applications`, `contact_messages`, `newsletter_subscribers`).
- **No Secret Keys in Frontend:** Only the anon / public key is configured.
- **XSS Prevention:** All user-submitted content in dashboards and tables is rendered using `textContent`.
- **Honeypot Anti-Spam:** Silent client-side traps on public forms without external tracking cookies.
