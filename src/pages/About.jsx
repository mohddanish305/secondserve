import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Clock, Search, User, FileText, BarChart2, Truck, Box, ShieldCheck } from 'lucide-react';

export default function About() {
  useEffect(() => {
    document.title = 'About Us & Transparency — Second Serve NGO';
  }, []);

  return (
    <main>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Our Mission & Ethics</span>
          <h1>About Second Serve</h1>
          <p>Bridging the divide between India’s wedding banquet surplus and urban community hunger with dignity, transparency, and cold-chain speed.</p>
        </div>
      </section>

      {/* Founding Story & Vision */}
      <section className="section section-cream">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', alignItems: 'center' }} className="story-grid">
            <div>
              <span className="eyebrow eyebrow-green">Founded in 2021, East Delhi</span>
              <h2 className="section-title">Born from a Simple, Heartbreaking Contrast</h2>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--ink-light)', marginBottom: '1.25rem' }}>
                On a chilly November night in 2021 in East Delhi, our founder attended a cousin's wedding where over 200 portions of untouched paneer dishes, dal makhani, and freshly made naan were being carried to commercial dumpsters. Just 800 metres away beneath the flyover, families in an unorganised settlement were going to bed on empty stomachs.
              </p>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: 'var(--ink-light)', marginBottom: '1.5rem' }}>
                The food was delicious, freshly prepared, and completely wholesome. The only missing element was a reliable, temperature-safe bridge between the two. That night, two volunteers packed the food into steel pots and delivered it directly to a local shelter. Within 24 hours, Second Serve was born.
              </p>
              <div style={{ borderLeft: '4px solid var(--orange-500)', paddingLeft: '1.25rem', fontStyle: 'italic', color: 'var(--ink)' }}>
                “India doesn't suffer from a lack of food; it suffers from a lack of rapid, compassionate redistribution.”
              </div>
            </div>
            <div>
              <div className="card" style={{ backgroundColor: 'var(--white)', borderColor: 'var(--border-warm)', boxShadow: 'var(--shadow-md)' }}>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem', color: 'var(--orange-500)' }}>Our Core Convictions</h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none' }}>
                  <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <Sparkles size={20} strokeWidth={1.75} style={{ color: 'var(--orange-500)', flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
                    <div>
                      <strong>Dignified Nourishment:</strong> Food rescue is not charity scraps; it is distributing fresh, high-grade banquet food with unconditional respect.
                    </div>
                  </li>
                  <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <Clock size={20} strokeWidth={1.75} style={{ color: 'var(--green-600)', flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
                    <div>
                      <strong>Speed Over Bureaucracy:</strong> Donors request in 60 seconds; our vans dispatch within 90 minutes.
                    </div>
                  </li>
                  <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <Search size={20} strokeWidth={1.75} style={{ color: 'var(--orange-500)', flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
                    <div>
                      <strong>Radical Openness:</strong> Every meal counter connects to real database deliveries. We welcome scrutiny from every donor and volunteer.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Growth Timeline */}
      <section className="section section-white">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Milestones</span>
            <h2 className="section-title">Our Journey of Impact</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
            <div className="card" style={{ borderTop: '4px solid var(--orange-500)' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-head)', color: 'var(--orange-500)', marginBottom: '0.25rem' }}>2021</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>The First 1,000 Meals</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-light)' }}>Founded in Laxmi Nagar, Delhi. Personal cars and borrowed stainless steel milk cans deployed for night rescues.</p>
            </div>
            <div className="card" style={{ borderTop: '4px solid var(--green-500)' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-head)', color: 'var(--green-600)', marginBottom: '0.25rem' }}>2023</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Multi-City Expansion</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-light)' }}>Launched city chapters in Mumbai and Bengaluru, partnering with 75 hotel banquets and university volunteers.</p>
            </div>
            <div className="card" style={{ borderTop: '4px solid var(--orange-500)' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-head)', color: 'var(--orange-500)', marginBottom: '0.25rem' }}>2024</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Cold-Chain Fleet</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-light)' }}>Introduced custom electric vans equipped with temperature-logging sensors and food-grade insulated storage crates.</p>
            </div>
            <div className="card" style={{ borderTop: '4px solid var(--green-500)' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-head)', color: 'var(--green-600)', marginBottom: '0.25rem' }}>2026</div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>3.2 Lakh Meals</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-light)' }}>Operating across 6 cities with 850 volunteers, real-time database tracking, and radical cost transparency.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="section section-cream-dark">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Dedicated Leadership</span>
            <h2 className="section-title">The People Driving Second Serve</h2>
            <p className="section-subtext">Combining operational discipline, public health science, and community empathy.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {/* Member 1 */}
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--orange-100)', color: 'var(--orange-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <User size={36} strokeWidth={1.75} aria-hidden="true" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>Sunita Verma</h3>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--orange-500)', marginBottom: '0.75rem' }}>Co-Founder & Operations Head</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-light)' }}>Former supply chain lead with 8 years in cold-chain logistics. Oversees city chapter dispatches and volunteer safety.</p>
            </div>

            {/* Member 2 */}
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--green-100)', color: 'var(--green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <User size={36} strokeWidth={1.75} aria-hidden="true" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>Dr. Rajesh Gupta</h3>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--green-600)', marginBottom: '0.75rem' }}>Food Safety & Quality Advisor</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-light)' }}>Food technologist and hygiene auditor. Formulated Second Serve's strict FSSAI compliance and temperature testing protocols.</p>
            </div>

            {/* Member 3 */}
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--orange-100)', color: 'var(--orange-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <User size={36} strokeWidth={1.75} aria-hidden="true" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>Ananya Sen</h3>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--orange-500)', marginBottom: '0.75rem' }}>Volunteer Community Lead</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-light)' }}>Leads campus outreach, volunteer onboarding workshops, and student leadership chapter programs across 18 universities.</p>
            </div>

            {/* Member 4 */}
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--green-100)', color: 'var(--green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <User size={36} strokeWidth={1.75} aria-hidden="true" />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>Vikram Malhotra</h3>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--green-600)', marginBottom: '0.75rem' }}>Fleet & Dispatch Manager</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--ink-light)' }}>Coordinates real-time electric van routing, driver scheduling, and night shelter delivery logistics across NCR.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Radical Transparency & Compliance Section */}
      <section className="section section-white" id="transparency">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow eyebrow-green">Radical Transparency</span>
            <h2 className="section-title">Government Registrations & Financial Clarity</h2>
            <p className="section-subtext">
              Donors deserve full proof of legitimacy. We maintain open compliance records and a strict cost-per-meal model.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }} className="story-grid">
            {/* Compliance Details */}
            <div className="card" style={{ border: '2px solid var(--border-warm)' }}>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', color: 'var(--ink)' }}>Verified Statutory Credentials</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none' }}>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-warm)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>80G Tax Exemption Order:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--orange-600)' }}>AAKCS1234EF20261</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-warm)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>12A Non-Profit Registration:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--orange-600)' }}>AAKCS1234EE20214</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-warm)', paddingBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>NITI Aayog NGO Darpan:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--orange-600)' }}>DL/2021/0284910</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>FCRA Compliance Status:</span>
                  <span style={{ color: 'var(--green-600)', fontWeight: 600 }}>Registered Indian Trust</span>
                </li>
              </ul>

              <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button type="button" className="btn btn-outline btn-small" onClick={() => alert('Demo: Audited FY25 Annual Impact Report PDF download')}>
                  <FileText size={16} strokeWidth={1.75} aria-hidden="true" /> FY25 Annual Impact Report (PDF)
                </button>
                <button type="button" className="btn btn-outline btn-small" onClick={() => alert('Demo: Independent Auditor Financial Statement PDF download')}>
                  <BarChart2 size={16} strokeWidth={1.75} aria-hidden="true" /> Audited Financial Statements (PDF)
                </button>
              </div>
            </div>

            {/* Cost Breakdown Card */}
            <div className="card" style={{ backgroundColor: 'var(--cream)', borderColor: 'var(--orange-100)' }}>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: 'var(--orange-500)' }}>₹38 Rescues 10 Wholesome Meals</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--ink-light)', marginBottom: '1.25rem' }}>
                Because hotels donate the food entirely free of cost, every rupee of operational funding directly fuels logistics:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 1rem', background: 'var(--white)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-warm)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><Truck size={18} strokeWidth={1.75} style={{ color: 'var(--orange-600)' }} aria-hidden="true" /> <strong>₹20</strong> — Fuel, EV charging & vehicle maintenance</span>
                  <span style={{ fontWeight: 700, color: 'var(--orange-600)' }}>52.6%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 1rem', background: 'var(--white)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-warm)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><Box size={18} strokeWidth={1.75} style={{ color: 'var(--green-600)' }} aria-hidden="true" /> <strong>₹10</strong> — Sanitised stainless steel boxes & sealers</span>
                  <span style={{ fontWeight: 700, color: 'var(--green-600)' }}>26.3%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 1rem', background: 'var(--white)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-warm)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={18} strokeWidth={1.75} style={{ color: 'var(--ink)' }} aria-hidden="true" /> <strong>₹8</strong> — Thermometers, gloves, aprons & dispatch</span>
                  <span style={{ fontWeight: 700, color: 'var(--ink)' }}>21.1%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section section-cream" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 className="section-title">Want to Partner with Second Serve?</h2>
          <p className="section-subtext" style={{ maxWidth: '600px', margin: '0 auto 2rem auto' }}>
            Whether you represent a corporate CSR program, an event venue, or a local night shelter, we welcome your partnership.
          </p>
          <Link to="/contact" className="btn btn-primary btn-large">
            Get in Touch with Our Team
          </Link>
        </div>
      </section>
    </main>
  );
}
