import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ShieldCheck } from 'lucide-react';

export default function HowItWorks() {
  useEffect(() => {
    document.title = 'How It Works — Second Serve NGO';
  }, []);

  return (
    <main>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Logistics & Quality Chain</span>
          <h1>From Excess to Nourishment in 3 Hours</h1>
          <p>Food rescue is an urgent race against the clock. Here is our step-by-step cold-chain verified rescue protocol.</p>
        </div>
      </section>

      {/* The 3 Steps */}
      <section className="section section-cream">
        <div className="container">
          <div className="steps-grid">
            {/* Step 1 */}
            <article className="step-card">
              <img src="/images/how-step-1.jpg" alt="Banquet chef handing over trays of fresh surplus food" className="step-card-img" loading="lazy" />
              <div className="step-card-body">
                <span className="step-chip"><Clock size={16} strokeWidth={1.75} aria-hidden="true" /> Step Time: &lt; 15 Mins</span>
                <h3>Quick Surplus Notification</h3>
                <p>When a banquet, corporate cafeteria, or wedding reception finishes, the organizer submits our simple 60-second online form or dials our helpline. No registration or app download needed. Our operations desk immediately registers the pickup in our database with a unique tracking ID.</p>
              </div>
            </article>

            {/* Step 2 */}
            <article className="step-card">
              <img src="/images/how-step-2.jpg" alt="Volunteers packing food containers into an eco van" className="step-card-img" loading="lazy" />
              <div className="step-card-body">
                <span className="step-chip"><Clock size={16} strokeWidth={1.75} aria-hidden="true" /> Dispatch Time: 60–90 Mins</span>
                <h3>Food Safety Check & Collection</h3>
                <p>Certified volunteer Food Heroes arrive with food-grade stainless steel containers and digital infrared thermometers. Food must register above 65°C for hot items or below 5°C for chilled items. We check sensory smell, texture, and preparation time before sealing containers.</p>
              </div>
            </article>

            {/* Step 3 */}
            <article className="step-card">
              <img src="/images/how-step-3.jpg" alt="Dignified food serving at community shelter" className="step-card-img" loading="lazy" />
              <div className="step-card-body">
                <span className="step-chip"><Clock size={16} strokeWidth={1.75} aria-hidden="true" /> Delivery Time: Same Evening</span>
                <h3>Delivery & Dignified Service</h3>
                <p>Our fleet transports the sealed containers directly to vetted beneficiary sites: government night shelters (Rain Baseras), slum community kitchens, or child welfare shelters. Meals are served warm with dignity, ensuring zero good food is lost to municipal landfills.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Food Safety Standards Callout Box (TRD §4.2) */}
      <section className="section section-white">
        <div className="container">
          <div className="card" style={{ border: '2px solid var(--green-500)', backgroundColor: 'var(--green-50)', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
              <ShieldCheck size={36} strokeWidth={1.75} color="var(--green-600)" aria-hidden="true" style={{ flexShrink: 0, marginTop: '4px' }} />
              <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--green-600)' }}>Strict Hygiene & Food Safety Protocol</h2>
                <p style={{ marginBottom: '1rem', color: 'var(--ink)' }}>
                  Every pickup is temperature-checked and packed hygienically. We follow FSSAI (Food Safety and Standards Authority of India) surplus food regulations without compromise:
                </p>
                <ul style={{ paddingLeft: '1.25rem', color: 'var(--ink-light)', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem' }}>
                  <li><strong>Fresh & Untouched:</strong> We only collect untouched buffet surplus and kitchen batch food that has never been served onto individual diner plates.</li>
                  <li><strong>Temperature Integrity:</strong> Hot food must be received above 65°C and served within 4 hours; chilled items below 5°C.</li>
                  <li><strong>Segregated & Labelled:</strong> Strict segregation of vegetarian and non-vegetarian containers with tamper-evident seals.</li>
                  <li><strong>Traceability:</strong> Every batch logs donor venue, volunteer ID, pickup time, and destination shelter for radical accountability.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section section-cream-dark">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title">Ready to Save Meals in Your City?</h2>
          <p className="section-subtext" style={{ maxWidth: '600px', margin: '0 auto 2rem auto' }}>
            Whether you have surplus banquet food right now or want to join as a pickup volunteer, our network is ready to assist.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/report-food" className="btn btn-primary btn-large">Donate Surplus Food</Link>
            <Link to="/volunteer" className="btn btn-secondary btn-large">Become a Volunteer</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
