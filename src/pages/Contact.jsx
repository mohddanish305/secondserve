import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, MapPin, Phone, Mail, Clock, Map } from 'lucide-react';
import { submitContact } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Contact() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    contact_name: '',
    contact_email: '',
    contact_subject: '',
    contact_message: '',
    website: '' // honeypot
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    document.title = 'Contact Us & FAQs — Second Serve NGO';
    if (user) {
      setFormData((prev) => ({
        ...prev,
        contact_name: prev.contact_name || user.full_name || '',
        contact_email: prev.contact_email || user.email || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.contact_name || formData.contact_name.trim().length < 2) {
      errs.contact_name = 'Please enter your name (min 2 characters).';
    }
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!formData.contact_email || !emailRegex.test(formData.contact_email.trim())) {
      errs.contact_email = 'Please enter a valid email address.';
    }
    if (!formData.contact_subject) {
      errs.contact_subject = 'Please select a subject.';
    }
    if (!formData.contact_message || formData.contact_message.trim().length < 20) {
      errs.contact_message = 'Please provide a message of at least 20 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccess(false);

    if (formData.website) {
      setSuccess(true);
      return;
    }

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await submitContact({
        full_name: formData.contact_name.trim(),
        email: formData.contact_email.trim(),
        subject: formData.contact_subject,
        message: formData.contact_message.trim()
      });
      setSuccess(true);
      setFormData({
        contact_name: user?.full_name || '',
        contact_email: user?.email || '',
        contact_subject: '',
        contact_message: '',
        website: ''
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Contact error:', err);
      setServerError('Could not submit message. Please try again or call our helpline at 1800-XXX-XXXX (demo).');
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'Who pays for food collection and transport?',
      a: 'Food pickup is 100% free of charge for donors. Our electric vehicles, food-grade storage containers, driver stipends, and testing equipment are financed entirely through transparent CSR grants and philanthropic donors.'
    },
    {
      q: 'What types of food can be donated?',
      a: 'We accept freshly cooked, untouched batch meals from banquets, hotel buffets, corporate dining halls, and catered events. We accept both vegetarian and non-vegetarian dishes (which are segregated into dedicated containers). We do not accept half-eaten plates or food stored without temperature control.'
    },
    {
      q: 'How quickly can a team arrive to collect surplus?',
      a: 'In our core city service zones, our volunteer vans arrive within 60 to 90 minutes of receiving your report. For late-night wedding receptions (11 PM – 2 AM), our on-call Event Food Heroes dispatch immediately upon phone confirmation.'
    },
    {
      q: 'Is my donation tax-deductible under 80G?',
      a: 'Yes! Financial contributions to support our transport logistics and thermal storage containers are 50% exempt under Section 80G of the Indian Income Tax Act. Registration order: AAKCS1234EF20261.'
    }
  ];

  return (
    <main>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Connect & Collaborate</span>
          <h1>Get in Touch with Second Serve</h1>
          <p>Whether you need emergency surplus collection, want to explore a corporate CSR grant, or run a night shelter, we are here to support you.</p>
        </div>
      </section>

      {/* Two-Column Contact Section */}
      <section className="section section-cream">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem', alignItems: 'start' }} className="contact-grid">
            {/* Left Column: Contact Form */}
            <div className="form-card" id="contact-form-card">
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Send Us a Message</h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--ink-light)', marginBottom: '1.75rem' }}>
                Fill in the form below and our team will get back to you within 24 hours.
              </p>

              {/* Success Panel */}
              {success && (
                <div className="banner banner-success" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }} role="alert">
                  <CheckCircle2 size={24} strokeWidth={1.75} style={{ color: 'var(--green-600)', flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
                  <div>
                    <strong>Thank you for contacting Second Serve!</strong>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                      Your message has been logged with our coordinator team. We will respond promptly via email.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Banner */}
              {serverError && (
                <div className="banner banner-error" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }} role="alert">
                  <AlertCircle size={20} strokeWidth={1.75} style={{ color: 'var(--red-600)', flexShrink: 0 }} aria-hidden="true" />
                  <div>{serverError}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <input
                  type="text"
                  name="website"
                  className="honeypot"
                  tabIndex="-1"
                  autoComplete="off"
                  aria-hidden="true"
                  value={formData.website}
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />

                <div className="form-grid">
                  {/* Name */}
                  <div className="form-group">
                    <label htmlFor="contact_name" className="form-label">
                      Full Name <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      id="contact_name"
                      name="contact_name"
                      className="form-input"
                      placeholder="e.g. Karan Singhania"
                      required
                      minLength={2}
                      maxLength={100}
                      value={formData.contact_name}
                      onChange={handleChange}
                      aria-invalid={errors.contact_name ? 'true' : 'false'}
                    />
                    {errors.contact_name && <span className="form-error-msg is-visible">{errors.contact_name}</span>}
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label htmlFor="contact_email" className="form-label">
                      Email Address <span className="req">*</span>
                    </label>
                    <input
                      type="email"
                      id="contact_email"
                      name="contact_email"
                      className="form-input"
                      placeholder="e.g. karan@company.com"
                      required
                      value={formData.contact_email}
                      onChange={handleChange}
                      aria-invalid={errors.contact_email ? 'true' : 'false'}
                    />
                    {errors.contact_email && <span className="form-error-msg is-visible">{errors.contact_email}</span>}
                  </div>

                  {/* Subject */}
                  <div className="form-group">
                    <label htmlFor="contact_subject" className="form-label">
                      Subject / Purpose <span className="req">*</span>
                    </label>
                    <select
                      id="contact_subject"
                      name="contact_subject"
                      className="form-select"
                      required
                      value={formData.contact_subject}
                      onChange={handleChange}
                      aria-invalid={errors.contact_subject ? 'true' : 'false'}
                    >
                      <option value="">Select an inquiry category</option>
                      <option value="partnership">Hospitality / Venue Partnership</option>
                      <option value="csr">Corporate CSR Grant</option>
                      <option value="media">Media / Press Inquiry</option>
                      <option value="general">Night Shelter Request / General Inquiry</option>
                    </select>
                    {errors.contact_subject && <span className="form-error-msg is-visible">{errors.contact_subject}</span>}
                  </div>

                  {/* Message */}
                  <div className="form-group">
                    <label htmlFor="contact_message" className="form-label">
                      Message <span className="req">*</span>
                    </label>
                    <textarea
                      id="contact_message"
                      name="contact_message"
                      className="form-textarea"
                      rows={4}
                      placeholder="How can we assist you? (Minimum 20 characters, maximum 2,000 characters)"
                      required
                      minLength={20}
                      maxLength={2000}
                      value={formData.contact_message}
                      onChange={handleChange}
                      aria-invalid={errors.contact_message ? 'true' : 'false'}
                    ></textarea>
                    <span className="form-helper">Between 20 and 2,000 characters.</span>
                    {errors.contact_message && <span className="form-error-msg is-visible">{errors.contact_message}</span>}
                  </div>
                </div>

                <div style={{ marginTop: '1.75rem' }}>
                  <button type="submit" disabled={submitting} className="btn btn-primary btn-large btn-block">
                    {submitting ? 'Sending message…' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Operations Info & Static Map Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="card" style={{ backgroundColor: 'var(--white)', borderColor: 'var(--border-warm)' }}>
                <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>Headquarters & Operations</h2>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', listStyle: 'none' }}>
                  <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <MapPin size={24} strokeWidth={1.75} style={{ color: 'var(--orange-600)', flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
                    <div>
                      <strong>National Coordination Centre</strong><br />
                      <span style={{ color: 'var(--ink-light)', fontSize: '0.95rem' }}>
                        14, Community Centre, Laxmi Nagar,<br />Delhi 110092, India
                      </span>
                    </div>
                  </li>
                  <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <Phone size={24} strokeWidth={1.75} style={{ color: 'var(--orange-600)', flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
                    <div>
                      <strong>Toll-Free Helpline (24/7)</strong><br />
                      <a href="tel:1800XXXXXXX" style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--orange-500)' }}>
                        1800-XXX-XXXX (demo)
                      </a>
                    </div>
                  </li>
                  <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <Mail size={24} strokeWidth={1.75} style={{ color: 'var(--orange-600)', flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
                    <div>
                      <strong>Direct Email</strong><br />
                      <a href="mailto:hello@secondserve.example" style={{ color: 'var(--ink-light)' }}>
                        hello@secondserve.example
                      </a>
                    </div>
                  </li>
                  <li style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <Clock size={24} strokeWidth={1.75} style={{ color: 'var(--green-600)', flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
                    <div>
                      <strong>Operating Hours</strong><br />
                      <span style={{ color: 'var(--ink-light)', fontSize: '0.9rem' }}>
                        Emergency Surplus Rescue: 24 Hours / 7 Days<br />
                        Administrative Office: Mon–Sat, 9:00 AM – 6:00 PM
                      </span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Static Map Card */}
              <div className="card" style={{ background: 'linear-gradient(135deg, #FFF4E6 0%, #FFF9F0 100%)', border: '1.5px dashed var(--orange-500)', textAlign: 'center', padding: '2rem 1.5rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--orange-100)', color: 'var(--orange-600)', margin: '0 auto 0.75rem auto' }} aria-hidden="true">
                  <Map size={28} strokeWidth={1.75} />
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.35rem' }}>Visit Our Laxmi Nagar Center</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--ink-light)', marginBottom: '1.25rem' }}>
                  Located near Laxmi Nagar Metro Station (Blue Line), East Delhi.
                </p>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Laxmi+Nagar+Community+Centre+Delhi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-small"
                >
                  Get Directions on Google Maps ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive FAQ Accordion */}
      <section className="section section-white" id="faq">
        <div className="container" style={{ maxWidth: '820px' }}>
          <div className="section-header">
            <span className="eyebrow">Clarity First</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtext">Common queries from food donors, CSR partners, and night shelters.</p>
          </div>

          <div className="accordion">
            {faqs.map((f, idx) => (
              <div key={idx} className="accordion-item">
                <h3 className="accordion-header">
                  <button
                    type="button"
                    className="accordion-trigger"
                    aria-expanded={openFaq === idx}
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  >
                    <span>{f.q}</span>
                    <span className="accordion-icon">{openFaq === idx ? '▴' : '▾'}</span>
                  </button>
                </h3>
                {openFaq === idx && (
                  <div className="accordion-content" style={{ display: 'block' }}>
                    <p>{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
