import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Clock, FileText, HeartHandshake, Truck, Home, PartyPopper, Smartphone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { submitVolunteerApplication } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Volunteer() {
  const { user } = useAuth();
  const formRef = useRef(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    city: '',
    preferred_role: '',
    availability: ['weekends'],
    motivation: '',
    website: '' // honeypot
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    document.title = 'Volunteer — Second Serve NGO';
    if (user) {
      setFormData((prev) => ({
        ...prev,
        full_name: prev.full_name || user.full_name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  const selectRoleAndScroll = (roleKey) => {
    setFormData((prev) => ({ ...prev, preferred_role: roleKey }));
    if (errors.preferred_role) {
      setErrors((prev) => ({ ...prev, preferred_role: null }));
    }
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleAvailabilityToggle = (slot) => {
    setFormData((prev) => {
      const exists = prev.availability.includes(slot);
      const next = exists
        ? prev.availability.filter((s) => s !== slot)
        : [...prev.availability, slot];
      return { ...prev, availability: next };
    });
    if (errors.availability) {
      setErrors((prev) => ({ ...prev, availability: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.full_name || formData.full_name.trim().length < 2) {
      errs.full_name = 'Please enter your name.';
    }
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!formData.email || !emailRegex.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone.trim())) {
      errs.phone = 'Enter a valid 10-digit mobile starting 6–9.';
    }
    if (!formData.city) {
      errs.city = 'Please select your city.';
    }
    if (!formData.preferred_role) {
      errs.preferred_role = 'Please choose a preferred role.';
    }
    if (!formData.availability || formData.availability.length === 0) {
      errs.availability = 'Please select at least one availability slot.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (formData.website) {
      setSubmitted(true);
      return;
    }

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await submitVolunteerApplication({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        city: formData.city,
        preferred_role: formData.preferred_role,
        availability: formData.availability,
        motivation: formData.motivation.trim()
      });
      setSubmitted(true);
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Volunteer submission error:', err);
      setServerError('Could not submit your application right now. Please check your network or call 1800-XXX-XXXX (demo).');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFaq = (idx) => {
    setOpenFaq((prev) => (prev === idx ? null : idx));
  };

  return (
    <main>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Join 850+ Changemakers</span>
          <h1>Become a Second Serve Volunteer</h1>
          <p>Over 93% of people want to volunteer but don’t know where to start. We provide structured training, flexible weekend slots, and verified impact hours.</p>
        </div>
      </section>

      {/* Why Volunteer 3 Pillars */}
      <section className="section section-cream">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <div className="step-icon-circle orange-tint">
                  <Clock size={28} strokeWidth={1.75} color="var(--orange-600)" aria-hidden="true" />
                </div>
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Zero Guesswork</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--ink-light)' }}>Clear 2–3 hour weekend shifts with assigned routes, vans, and emergency supervisor support.</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <div className="step-icon-circle green-tint">
                  <FileText size={28} strokeWidth={1.75} color="var(--green-600)" aria-hidden="true" />
                </div>
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Certified Impact</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--ink-light)' }}>Verified volunteer certificates, LinkedIn recommendations, and leadership opportunities for college students.</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <div className="step-icon-circle green-tint">
                  <HeartHandshake size={28} strokeWidth={1.75} color="var(--green-600)" aria-hidden="true" />
                </div>
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Empowered Community</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--ink-light)' }}>Join monthly city chapter meetups, food security workshops, and collaborate with passionate peers.</p>
            </div>
          </div>

          {/* 4 Role Cards */}
          <div className="section-header">
            <span className="eyebrow">Find Your Fit</span>
            <h2 className="section-title">Explore Volunteer Roles</h2>
            <p className="section-subtext">Choose the role that matches your schedule, skills, and comfort level.</p>
          </div>

          <div className="role-grid">
            {/* Role 1 */}
            <article className="role-card">
              <div className="role-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Truck size={28} strokeWidth={1.75} color="var(--orange-600)" aria-hidden="true" />
              </div>
              <span className="role-commitment">3–4 hrs / week</span>
              <h3>Food Hero</h3>
              <p>Accompany our electric vans to hotels and banquets, assist in temperature checks, pack containers, and hand over meals to night shelters.</p>
              <button type="button" className="btn btn-secondary btn-small" onClick={() => selectRoleAndScroll('food_hero')}>
                Choose this role ↓
              </button>
            </article>

            {/* Role 2 */}
            <article className="role-card">
              <div className="role-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Home size={28} strokeWidth={1.75} color="var(--green-600)" aria-hidden="true" />
              </div>
              <span className="role-commitment">2–3 hrs / week</span>
              <h3>Shelter Coordinator</h3>
              <p>Work directly with community kitchen managers, coordinate headcounts, and assist in dignified plate distribution during dinner services.</p>
              <button type="button" className="btn btn-secondary btn-small" onClick={() => selectRoleAndScroll('shelter_coordinator')}>
                Choose this role ↓
              </button>
            </article>

            {/* Role 3 */}
            <article className="role-card">
              <div className="role-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PartyPopper size={28} strokeWidth={1.75} color="var(--orange-600)" aria-hidden="true" />
              </div>
              <span className="role-commitment">4–5 hrs / event</span>
              <h3>Event Volunteer</h3>
              <p>On-call champion for late-night wedding receptions and grand banquets. Coordinate on-site surplus packaging after midnight.</p>
              <button type="button" className="btn btn-secondary btn-small" onClick={() => selectRoleAndScroll('event_volunteer')}>
                Choose this role ↓
              </button>
            </article>

            {/* Role 4 */}
            <article className="role-card">
              <div className="role-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Smartphone size={28} strokeWidth={1.75} color="var(--green-600)" aria-hidden="true" />
              </div>
              <span className="role-commitment">2 hrs / week (Remote)</span>
              <h3>Social Media Volunteer</h3>
              <p>Help document volunteer stories, craft educational posts about India's food waste challenge, and mobilize local college chapters.</p>
              <button type="button" className="btn btn-secondary btn-small" onClick={() => selectRoleAndScroll('social_media')}>
                Choose this role ↓
              </button>
            </article>
          </div>
        </div>
      </section>

      {/* Volunteer Team Image Banner */}
      <div className="container" style={{ marginTop: '1rem', marginBottom: '3rem' }}>
        <img
          src="/images/volunteer-team.jpg"
          alt="Second Serve smiling young volunteer team in orange shirts"
          style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)' }}
          loading="lazy"
        />
      </div>

      {/* Application Form Section */}
      <section className="section section-white" id="volunteer-form" ref={formRef} aria-labelledby="form-heading">
        <div className="container">
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            {submitted ? (
              <div id="volunteer-success-panel" className="card" style={{ borderColor: 'var(--green-500)', textAlign: 'center', padding: '3rem 2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                  <CheckCircle2 size={48} strokeWidth={1.75} color="var(--green-600)" aria-hidden="true" />
                </div>
                <h2 style={{ fontSize: '1.75rem', color: 'var(--green-600)', marginBottom: '0.5rem' }}>Welcome Aboard!</h2>
                <p style={{ fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '1.5rem' }}>
                  Your application has been received. Our city volunteer coordinator will review your profile and invite you to our next online orientation session within 48 hours.
                </p>
                <Link to="/impact" className="btn btn-secondary">
                  Explore Community Impact
                </Link>
              </div>
            ) : (
              <>
                {serverError && (
                  <div className="banner banner-error" role="alert" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={20} strokeWidth={1.75} aria-hidden="true" style={{ flexShrink: 0 }} />
                    <div>{serverError}</div>
                  </div>
                )}

                <div className="form-card" id="volunteer-form-card">
                  <h2 id="form-heading" className="section-title" style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>Volunteer Application</h2>
                  <p className="section-subtext" style={{ fontSize: '1rem', marginBottom: '2rem' }}>
                    Takes 2 minutes. Fill in your details below to join our city team.
                  </p>

                  <form onSubmit={handleSubmit} noValidate>
                    <input
                      type="text"
                      name="website"
                      className="honeypot"
                      tabIndex="-1"
                      autoComplete="off"
                      aria-hidden="true"
                      value={formData.website}
                      onChange={handleTextChange}
                      style={{ display: 'none' }}
                    />

                    <div className="form-grid form-grid-2">
                      {/* Name */}
                      <div className="form-group">
                        <label htmlFor="full_name" className="form-label">
                          Full Name <span className="req">*</span>
                        </label>
                        <input
                          type="text"
                          id="full_name"
                          name="full_name"
                          className="form-input"
                          placeholder="e.g. Priya Sharma"
                          required
                          minLength={2}
                          maxLength={100}
                          value={formData.full_name}
                          onChange={handleTextChange}
                          aria-invalid={errors.full_name ? 'true' : 'false'}
                        />
                        {errors.full_name && <span className="form-error-msg is-visible">{errors.full_name}</span>}
                      </div>

                      {/* Email */}
                      <div className="form-group">
                        <label htmlFor="email" className="form-label">
                          Email Address <span className="req">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          className="form-input"
                          placeholder="e.g. priya@example.com"
                          required
                          value={formData.email}
                          onChange={handleTextChange}
                          aria-invalid={errors.email ? 'true' : 'false'}
                        />
                        {errors.email && <span className="form-error-msg is-visible">{errors.email}</span>}
                      </div>

                      {/* Phone */}
                      <div className="form-group">
                        <label htmlFor="phone" className="form-label">
                          Mobile Number (WhatsApp) <span className="req">*</span>
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          className="form-input"
                          placeholder="10-digit mobile"
                          required
                          value={formData.phone}
                          onChange={handleTextChange}
                          aria-invalid={errors.phone ? 'true' : 'false'}
                        />
                        {errors.phone && <span className="form-error-msg is-visible">{errors.phone}</span>}
                      </div>

                      {/* City */}
                      <div className="form-group">
                        <label htmlFor="city" className="form-label">
                          Your City <span className="req">*</span>
                        </label>
                        <select
                          id="city"
                          name="city"
                          className="form-select"
                          required
                          value={formData.city}
                          onChange={handleTextChange}
                          aria-invalid={errors.city ? 'true' : 'false'}
                        >
                          <option value="">Select your city</option>
                          <option value="Delhi NCR">Delhi NCR</option>
                          <option value="Mumbai">Mumbai</option>
                          <option value="Bengaluru">Bengaluru</option>
                          <option value="Jaipur">Jaipur</option>
                          <option value="Lucknow">Lucknow</option>
                          <option value="Patna">Patna</option>
                        </select>
                        {errors.city && <span className="form-error-msg is-visible">{errors.city}</span>}
                      </div>

                      {/* Preferred Role */}
                      <div className="form-group full-width">
                        <label htmlFor="preferred_role" className="form-label">
                          Preferred Role <span className="req">*</span>
                        </label>
                        <select
                          id="preferred_role"
                          name="preferred_role"
                          className="form-select"
                          required
                          value={formData.preferred_role}
                          onChange={handleTextChange}
                          aria-invalid={errors.preferred_role ? 'true' : 'false'}
                        >
                          <option value="">Choose your primary volunteer role</option>
                          <option value="food_hero">Food Hero (Pickup & Inspection Logistics)</option>
                          <option value="shelter_coordinator">Shelter Coordinator (Serving & Community Coordination)</option>
                          <option value="event_volunteer">Event Volunteer (Late Night Weddings & Banquets)</option>
                          <option value="social_media">Social Media & Storytelling Volunteer (Remote)</option>
                        </select>
                        {errors.preferred_role && <span className="form-error-msg is-visible">{errors.preferred_role}</span>}
                      </div>

                      {/* Availability (Checkboxes) */}
                      <div className="form-group full-width">
                        <label className="form-label">When are you available? (Select at least one) <span className="req">*</span></label>
                        <div className="checkbox-options">
                          <label className="checkbox-chip">
                            <input
                              type="checkbox"
                              name="availability"
                              value="weekdays"
                              checked={formData.availability.includes('weekdays')}
                              onChange={() => handleAvailabilityToggle('weekdays')}
                            />{' '}
                            Weekday Mornings/Afternoons
                          </label>
                          <label className="checkbox-chip">
                            <input
                              type="checkbox"
                              name="availability"
                              value="weekends"
                              checked={formData.availability.includes('weekends')}
                              onChange={() => handleAvailabilityToggle('weekends')}
                            />{' '}
                            Weekends (Sat/Sun)
                          </label>
                          <label className="checkbox-chip">
                            <input
                              type="checkbox"
                              name="availability"
                              value="evenings"
                              checked={formData.availability.includes('evenings')}
                              onChange={() => handleAvailabilityToggle('evenings')}
                            />{' '}
                            Evenings (7 PM – 11 PM)
                          </label>
                        </div>
                        {errors.availability && <span className="form-error-msg is-visible">{errors.availability}</span>}
                      </div>

                      {/* Motivation */}
                      <div className="form-group full-width">
                        <label htmlFor="motivation" className="form-label">
                          Why would you like to volunteer with Second Serve? (Optional)
                        </label>
                        <textarea
                          id="motivation"
                          name="motivation"
                          className="form-textarea"
                          rows={3}
                          placeholder="Share what drives you to fight food waste in your community (max 500 characters)."
                          maxLength={500}
                          value={formData.motivation}
                          onChange={handleTextChange}
                        ></textarea>
                        <span className="form-helper">Max 500 characters.</span>
                      </div>
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                      <button type="submit" disabled={submitting} className="btn btn-primary btn-large btn-block">
                        {submitting ? 'Submitting application…' : 'Submit Volunteer Application'}
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Mini FAQ */}
      <section className="section section-cream-dark">
        <div className="container" style={{ maxWidth: '760px' }}>
          <div className="section-header">
            <span className="eyebrow">Questions Answered</span>
            <h2 className="section-title">Volunteering FAQs</h2>
          </div>

          <div className="accordion">
            <div className="accordion-item">
              <h3 className="accordion-header">
                <button
                  type="button"
                  className="accordion-trigger"
                  aria-expanded={openFaq === 0}
                  onClick={() => toggleFaq(0)}
                >
                  <span>Do I need prior food handling or logistics experience?</span>
                  <span className="accordion-icon">{openFaq === 0 ? '▴' : '▾'}</span>
                </button>
              </h3>
              {openFaq === 0 && (
                <div className="accordion-content" style={{ display: 'block' }}>
                  <p>No prior experience is necessary! We provide a comprehensive 45-minute digital orientation covering hygiene standards, digital thermometer testing, temperature safety windows, and compassionate community interaction.</p>
                </div>
              )}
            </div>

            <div className="accordion-item">
              <h3 className="accordion-header">
                <button
                  type="button"
                  className="accordion-trigger"
                  aria-expanded={openFaq === 1}
                  onClick={() => toggleFaq(1)}
                >
                  <span>Can I volunteer occasionally when my schedule allows?</span>
                  <span className="accordion-icon">{openFaq === 1 ? '▴' : '▾'}</span>
                </button>
              </h3>
              {openFaq === 1 && (
                <div className="accordion-content" style={{ display: 'block' }}>
                  <p>Yes. Once approved, you gain access to our volunteer roster where you can pick up weekend shifts or late-night wedding rescue calls as your calendar permits.</p>
                </div>
              )}
            </div>

            <div className="accordion-item">
              <h3 className="accordion-header">
                <button
                  type="button"
                  className="accordion-trigger"
                  aria-expanded={openFaq === 2}
                  onClick={() => toggleFaq(2)}
                >
                  <span>Do students receive certificates for college requirements?</span>
                  <span className="accordion-icon">{openFaq === 2 ? '▴' : '▾'}</span>
                </button>
              </h3>
              {openFaq === 2 && (
                <div className="accordion-content" style={{ display: 'block' }}>
                  <p>Absolutely. We issue official Second Serve Volunteer Certificates documenting your verified rescue hours and meal distribution counts, recognized by universities and CSR programs.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
