# Second Serve — Food Waste Rescue NGO Web App

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Lucide](https://img.shields.io/badge/Icons-Lucide%20React-F56565)](https://lucide.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Second Serve** is a modern full-stack web application built for a food-rescue non-governmental organisation (NGO) in India. The platform bridges the gap between surplus food generators (weddings, banquets, hotels, corporate cafeterias, and restaurants) and hunger relief centers (night shelters / Rain Baseras, slum community kitchens, and orphanages) across 6 major Indian metropolitan cities.

---

## 🌟 Key Features

### 🍽️ 1. Frictionless Food Reporting (Under 60 Seconds)
- **No Login Required for Donors:** Event hosts and banquet managers can submit surplus food without friction.
- **Auto-Generated Tracking ID:** Assigns a server-validated reference ID (`SS-YYYY-####`).
- **Live Status Timeline:** Real-time visual tracking from `Reported → Assigned → Collected → Delivered`.

### 🛡️ 2. Modern Accessible Navigation
- Responsive navbar with a **1280px max-width container** and flexible layout.
- Quick **"Report Surplus Food"** brand CTA.
- **Account Dropdown Menu:** 40px avatar circle showing user initials, role badges (`Admin`, `Volunteer`, `User`), direct links to Dashboard, Admin Panel (admin only), and secure logout.
- Keyboard accessible (Tab navigation, Escape dismissal, auto-close on outside click and route changes).
- Mobile drawer navigation below 1180px with full touch support.

### 📊 3. Live Verified Impact Metrics
- Dynamically calculated meals rescued, kilograms of food waste avoided, CO₂ emission reductions, partner venues, and active volunteers.
- Radial transparency and cost-per-meal breakdown (₹38 rescues 10 nutritious meals).

### 🤝 4. Volunteer Portal & Chapters
- 4 specialized volunteer roles:
  - **Food Hero (Field Logistics)**
  - **Shelter Coordinator (Quality & Distribution)**
  - **Event Volunteer (Banquets & Drives)**
  - **Digital Advocate (Awareness & Outreach)**
- Chapter selection across Delhi NCR, Mumbai MMR, Bengaluru, Hyderabad, Kolkata, and Chennai.

### 📱 5. User & Volunteer Dashboard
- **Donors:** View all past pickup requests, reference IDs, and fulfillment status.
- **Volunteers:** Access assigned pickups, contact details, navigation, and one-click actions to advance status (`Mark Collected`, `Mark Delivered`).

### ⚙️ 6. Operations Admin Panel
- Live database control and dispatch center.
- Instant volunteer assignment to incoming food pickups.
- Volunteer application review and approval (updates role permissions).
- Inquiries inbox and newsletter subscriber management (with 1-click CSV export).

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18 (Vite SPA) |
| **Routing** | React Router v6 (`BrowserRouter`) |
| **Styling** | Custom Vanilla CSS Design System (Warm Cream & Sprout Palette) |
| **Icons** | Lucide React |
| **Backend & Database** | PostgreSQL via Supabase |
| **Authentication** | Supabase Auth (`@supabase/supabase-js`) |
| **Deployment** | Vercel / Netlify (`_redirects` & `vercel.json` SPA rewrite) |

---

## 📁 Project Structure

```
second-serve/
├── index.html              # Vite SPA single entry point
├── .env.example            # Environment variables template (safe for VCS)
├── .gitignore              # Ignores .env, node_modules, dist
├── package.json            # Scripts & npm dependencies
├── vite.config.js          # Vite build configuration
├── vercel.json             # Vercel SPA routing rewrites
├── public/
│   ├── _redirects          # Netlify SPA redirect rules
│   ├── favicon.svg         # SVG Favicon
│   └── images/             # Brand logos & web assets
├── supabase/
│   └── schema.sql          # PostgreSQL DDL, RLS policies, enums, triggers & RPCs
└── src/
    ├── main.jsx            # React root, Router & AuthProvider
    ├── App.jsx             # Main router setup & layout
    ├── styles.css          # Core design tokens & master stylesheet
    ├── footer.css          # Footer styles
    ├── components/         # Navbar, Footer, Hero, Route Guards
    ├── context/            # AuthContext (state, role, session management)
    ├── lib/                # Supabase client & API services
    └── pages/              # Home, HowItWorks, Impact, Volunteer, About, Contact, ReportFood, Dashboard, Admin, Login, Signup
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A free [Supabase](https://supabase.com/) account

### 1. Clone the Repository
```bash
git clone https://github.com/mohddanish305/secondserve.git
cd secondserve
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy the `.env.example` template to `.env`:
```bash
cp .env.example .env
```
Open `.env` and fill in your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

### 4. Database Setup
1. Log into your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor**.
3. Copy the contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
4. In **Authentication → Providers → Email**, turn **OFF "Confirm email"** for testing.

### 5. Run the Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🚢 Deployment

### Deploy to Vercel
1. Import your GitHub repository into Vercel.
2. Select Framework Preset: **Vite**.
3. Set the Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**. SPA routing is automatically handled by `vercel.json`.

### Deploy to Netlify
1. Connect your repository to Netlify.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Configure environment variables in Netlify Site Settings.
5. SPA routing is automatically handled by `public/_redirects`.

---

## 🔒 Security & Privacy

- **Row Level Security (RLS):** Strict policies ensure users only access their own data, and only admins have dispatch authority.
- **No Secrets in Client:** Only the Supabase `anon` public key is bundled in frontend builds.
- **Anti-Spam Protection:** Silent honeypot traps on public forms prevent bot submissions without annoying captchas.
- **Protected Environment:** `.env` and sensitive configurations are strictly excluded by `.gitignore`.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
