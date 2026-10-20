import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Utensils } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [newsletterMsg, setNewsletterMsg] = useState(null);
  const currentYear = new Date().getFullYear();

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (honeypot) return; // Silent bot prevention

    const emailTrimmed = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailTrimmed || !emailPattern.test(emailTrimmed)) {
      setNewsletterMsg({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    // Client-side simulation: no backend call yet
    setNewsletterMsg({ type: 'success', text: "You're subscribed!" });
    setEmail('');
  };

  return (
    <>
      <footer className="footer" role="contentinfo">
        <div className="container">
          <div className="footer-grid">
            {/* Column 1: Brand & Mission */}
            <div className="footer-col">
              <div className="footer-brand-wrap">
                <img
                  src="/images/logo-light.svg"
                  alt="Second Serve Logo"
                  width="180"
                  height="44"
                />
              </div>
              <p className="footer-desc">
                Second Serve is a dedicated food-rescue NGO collecting fresh surplus meals from weddings, hotels, and events to nourish night shelters and community kitchens across India.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/how-it-works">How It Works</Link></li>
                <li><Link to="/report-food">Donate Surplus Food</Link></li>
                <li><Link to="/volunteer">Volunteer Roles</Link></li>
                <li><Link to="/impact">Impact Reports</Link></li>
                <li><Link to="/about">About &amp; Transparency</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
              </ul>
            </div>

            {/* Column 3: Contact (Left-aligned flex rows with Lucide icons) */}
            <div className="footer-col">
              <h4>Contact</h4>
              <ul className="footer-links">
                <li className="footer-contact-item">
                  <MapPin size={18} width={18} height={18} strokeWidth={1.75} className="footer-contact-icon" aria-hidden="true" style={{ width: 18, height: 18, minWidth: 18, minHeight: 18, flexShrink: 0 }} />
                  <span className="footer-contact-text">14, Community Centre, Laxmi Nagar, Delhi 110092</span>
                </li>
                <li className="footer-contact-item">
                  <Phone size={18} width={18} height={18} strokeWidth={1.75} className="footer-contact-icon" aria-hidden="true" style={{ width: 18, height: 18, minWidth: 18, minHeight: 18, flexShrink: 0 }} />
                  <span className="footer-contact-text">
                    <a href="tel:1800XXXXXXX">1800-XXX-XXXX (demo)</a>
                  </span>
                </li>
                <li className="footer-contact-item">
                  <Mail size={18} width={18} height={18} strokeWidth={1.75} className="footer-contact-icon" aria-hidden="true" style={{ width: 18, height: 18, minWidth: 18, minHeight: 18, flexShrink: 0 }} />
                  <span className="footer-contact-text">
                    <a href="mailto:hello@secondserve.example">hello@secondserve.example</a>
                  </span>
                </li>
              </ul>
            </div>

            {/* Column 4: Monthly Impact Digest / Newsletter */}
            <div className="footer-col">
              <h4>Monthly Impact Digest</h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#D3CDC6', textAlign: 'left' }}>
                Receive our audited monthly meal rescue reports and volunteer stories.
              </p>
              <form className="footer-newsletter-form" onSubmit={handleNewsletterSubmit} noValidate>
                <input
                  type="text"
                  name="website"
                  className="honeypot"
                  tabIndex="-1"
                  autoComplete="off"
                  aria-hidden="true"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  style={{ display: 'none' }}
                />
                <input
                  type="email"
                  className="footer-newsletter-input"
                  placeholder="Enter your email address"
                  required
                  aria-label="Email address for newsletter"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (newsletterMsg) setNewsletterMsg(null);
                  }}
                />
                <button type="submit" className="btn btn-primary btn-block btn-small">
                  Subscribe
                </button>
              </form>
              <p className="newsletter-helper">Audited impact reports sent once a month.</p>
              <div
                id="newsletter-msg"
                aria-live="polite"
                className={`newsletter-msg ${newsletterMsg ? newsletterMsg.type : ''}`}
                style={{ display: newsletterMsg ? 'block' : 'none' }}
              >
                {newsletterMsg?.text}
              </div>
            </div>
          </div>

          {/* Legal Block: Row 1 left, Row 2 right on 768px+ */}
          <div className="footer-legal">
            <div className="footer-legal-content">
              <p className="footer-legal-row1">
                80G Order: AAKCS1234EF20261 · 12A Reg: AAKCS1234EE20214 (placeholder numbers)
              </p>
              <p className="footer-legal-row2">
                © <span id="footer-year">{currentYear}</span> Second Serve. Demo website created for academic purposes; NGO and baseline impact figures are illustrative.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Mobile Quick Action (P1) */}
      <Link to="/report-food" className="floating-cta" aria-label="Donate Surplus Food">
        <Utensils size={18} width={18} height={18} strokeWidth={1.75} aria-hidden="true" style={{ width: 18, height: 18, minWidth: 18, minHeight: 18, flexShrink: 0 }} /> Donate Surplus Food
      </Link>
    </>
  );
}
