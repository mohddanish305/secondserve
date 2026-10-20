import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Search, XCircle, Check, Phone } from 'lucide-react';
import { submitPickup, trackPickup } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ReportFood() {
  const { user } = useAuth();

  // Helper for 2 hours in future ISO slice
  const getDefaultPickupTime = () => {
    const d = new Date();
    d.setHours(d.getHours() + 2);
    d.setMinutes(0);
    // YYYY-MM-DDTHH:mm
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    contact_name: '',
    phone: '',
    organisation: '',
    city: '',
    pickup_address: '',
    food_type: 'veg',
    quantity_people: '',
    pickup_time: getDefaultPickupTime(),
    notes: '',
    website: '' // honeypot
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [submittedRefId, setSubmittedRefId] = useState(null);

  // Tracking state
  const [trackRef, setTrackRef] = useState('');
  const [trackPhone, setTrackPhone] = useState('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackResult, setTrackResult] = useState(null);
  const [trackSearched, setTrackSearched] = useState(false);

  useEffect(() => {
    document.title = 'Donate Surplus Food — Second Serve NGO';
    if (user) {
      setFormData((prev) => ({
        ...prev,
        contact_name: prev.contact_name || user.full_name || '',
        phone: prev.phone || user.phone || ''
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

  const validateForm = () => {
    const errs = {};
    if (!formData.contact_name || formData.contact_name.trim().length < 2) {
      errs.contact_name = 'Please enter your name (at least 2 letters).';
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone.trim())) {
      errs.phone = 'Enter a valid 10-digit Indian mobile number starting with 6–9.';
    }
    if (!formData.organisation || formData.organisation.trim().length < 2) {
      errs.organisation = 'Please enter your venue or event name.';
    }
    if (!formData.city) {
      errs.city = 'Please select a city from our service areas.';
    }
    if (!formData.pickup_address || formData.pickup_address.trim().length < 5) {
      errs.pickup_address = 'Please enter full pickup address (min 5 characters).';
    }
    const qty = parseInt(formData.quantity_people, 10);
    if (isNaN(qty) || qty < 10 || qty > 5000) {
      errs.quantity_people = 'Please enter estimated people served (between 10 and 5000).';
    }
    const pickupDate = new Date(formData.pickup_time);
    if (isNaN(pickupDate.getTime()) || pickupDate <= new Date()) {
      errs.pickup_time = 'Pickup time must be in the future.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Honeypot check
    if (formData.website) {
      setSubmittedRefId('SS-2026-1004');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const refId = await submitPickup({
        p_name: formData.contact_name.trim(),
        p_phone: formData.phone.trim(),
        p_organisation: formData.organisation.trim(),
        p_address: formData.pickup_address.trim(),
        p_city: formData.city,
        p_food_type: formData.food_type,
        p_quantity: parseInt(formData.quantity_people, 10),
        p_pickup_time: new Date(formData.pickup_time).toISOString(),
        p_notes: formData.notes.trim()
      });
      setSubmittedRefId(refId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Submission error:', err);
      if (err.message && err.message.includes('future')) {
        setServerError('Pickup time must be in the future.');
      } else {
        setServerError("We couldn't reach the server. Please try again, or call our toll-free helpline at 1800-XXX-XXXX (demo).");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportAnother = () => {
    setSubmittedRefId(null);
    setFormData({
      contact_name: user?.full_name || '',
      phone: user?.phone || '',
      organisation: '',
      city: '',
      pickup_address: '',
      food_type: 'veg',
      quantity_people: '',
      pickup_time: getDefaultPickupTime(),
      notes: '',
      website: ''
    });
    setErrors({});
    setServerError('');
  };

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!trackRef.trim() || !trackPhone.trim()) {
      alert('Please enter both Reference ID and Phone number.');
      return;
    }

    setTrackingLoading(true);
    setTrackSearched(true);
    setTrackResult(null);

    try {
      const records = await trackPickup(trackRef.trim(), trackPhone.trim());
      setTrackResult(records && records.length > 0 ? records[0] : false);
    } catch (err) {
      console.error('Tracking error:', err);
      setTrackResult('error');
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <main>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Zero Waste Supply Line</span>
          <h1>Donate Surplus Food</h1>
          <p>Takes 60 seconds. Free pickup. Same-day delivery. No account required.</p>
        </div>
      </section>

      <section className="section section-cream">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem', alignItems: 'start' }} className="report-layout">
            {/* Left Column: Donation Form & Success Panel */}
            <div>
              {submittedRefId ? (
                /* Success Panel */
                <div id="report-success-panel" className="card" style={{ borderColor: 'var(--green-500)', backgroundColor: 'var(--white)', marginBottom: '2rem' }}>
                  <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                      <CheckCircle2 size={48} strokeWidth={1.75} color="var(--green-600)" aria-hidden="true" />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', color: 'var(--green-600)', marginBottom: '0.5rem' }}>Surplus Donation Received!</h2>
                    <p style={{ fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '1.25rem' }}>
                      Thank you! Our operations coordinator will call you within <strong>15 minutes</strong> to confirm collection details.
                    </p>
                    <div style={{ backgroundColor: 'var(--cream)', border: '2px dashed var(--orange-500)', borderRadius: 'var(--radius)', padding: '1.25rem', maxWidth: '380px', margin: '0 auto 1.5rem auto' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Your Reference Tracking ID</div>
                      <div style={{ fontFamily: 'var(--font-head)', fontSize: '1.85rem', fontWeight: 800, color: 'var(--orange-500)', margin: '0.25rem 0' }}>{submittedRefId}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--ink-light)' }}>Save this ID or your phone number to track live delivery status below.</div>
                    </div>
                    <button type="button" onClick={handleReportAnother} className="btn btn-secondary">
                      Donate Another Pickup
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {serverError && (
                    <div className="banner banner-error" role="alert" aria-live="assertive" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={20} strokeWidth={1.75} aria-hidden="true" style={{ flexShrink: 0 }} />
                      <div>{serverError}</div>
                    </div>
                  )}

                  <div className="form-card" id="report-form-card">
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Food Donation Details</h2>
                    <p style={{ fontSize: '0.95rem', color: 'var(--ink-light)', marginBottom: '1.75rem' }}>
                      Please provide accurate details so our nearby volunteer van can dispatch appropriate containers.
                    </p>

                    <form onSubmit={handleSubmit} noValidate>
                      {/* Honeypot */}
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

                      <div className="form-grid form-grid-2">
                        {/* Contact Name */}
                        <div className="form-group">
                          <label htmlFor="contact_name" className="form-label">
                            Your Name <span className="req">*</span>
                          </label>
                          <input
                            type="text"
                            id="contact_name"
                            name="contact_name"
                            className="form-input"
                            placeholder="e.g. Ravi Sharma"
                            required
                            minLength={2}
                            maxLength={100}
                            value={formData.contact_name}
                            onChange={handleChange}
                            aria-invalid={errors.contact_name ? 'true' : 'false'}
                          />
                          {errors.contact_name && <span className="form-error-msg is-visible">{errors.contact_name}</span>}
                        </div>

                        {/* Contact Phone */}
                        <div className="form-group">
                          <label htmlFor="phone" className="form-label">
                            Mobile Number <span className="req">*</span>
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            className="form-input"
                            placeholder="10-digit mobile (e.g. 9876543210)"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            aria-invalid={errors.phone ? 'true' : 'false'}
                          />
                          {errors.phone && <span className="form-error-msg is-visible">{errors.phone}</span>}
                        </div>

                        {/* Organisation */}
                        <div className="form-group">
                          <label htmlFor="organisation" className="form-label">
                            Organisation / Event Name <span className="req">*</span>
                          </label>
                          <input
                            type="text"
                            id="organisation"
                            name="organisation"
                            className="form-input"
                            placeholder="e.g. Grand Heritage Banquets / Kapoor Wedding"
                            required
                            minLength={2}
                            maxLength={150}
                            value={formData.organisation}
                            onChange={handleChange}
                            aria-invalid={errors.organisation ? 'true' : 'false'}
                          />
                          {errors.organisation && <span className="form-error-msg is-visible">{errors.organisation}</span>}
                        </div>

                        {/* City */}
                        <div className="form-group">
                          <label htmlFor="city" className="form-label">
                            City <span className="req">*</span>
                          </label>
                          <select
                            id="city"
                            name="city"
                            className="form-select"
                            required
                            value={formData.city}
                            onChange={handleChange}
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

                        {/* Pickup Address */}
                        <div className="form-group full-width">
                          <label htmlFor="pickup_address" className="form-label">
                            Complete Pickup Address <span className="req">*</span>
                          </label>
                          <textarea
                            id="pickup_address"
                            name="pickup_address"
                            className="form-textarea"
                            rows={2}
                            placeholder="Full street address, gate number, nearest landmark"
                            required
                            minLength={5}
                            maxLength={300}
                            value={formData.pickup_address}
                            onChange={handleChange}
                            aria-invalid={errors.pickup_address ? 'true' : 'false'}
                          ></textarea>
                          {errors.pickup_address && <span className="form-error-msg is-visible">{errors.pickup_address}</span>}
                        </div>

                        {/* Food Type */}
                        <div className="form-group">
                          <label className="form-label">
                            Food Type <span className="req">*</span>
                          </label>
                          <div className="radio-options">
                            <label className="radio-chip">
                              <input
                                type="radio"
                                name="food_type"
                                value="veg"
                                checked={formData.food_type === 'veg'}
                                onChange={handleChange}
                              />{' '}
                              Pure Veg
                            </label>
                            <label className="radio-chip">
                              <input
                                type="radio"
                                name="food_type"
                                value="non_veg"
                                checked={formData.food_type === 'non_veg'}
                                onChange={handleChange}
                              />{' '}
                              Non-Veg
                            </label>
                            <label className="radio-chip">
                              <input
                                type="radio"
                                name="food_type"
                                value="both"
                                checked={formData.food_type === 'both'}
                                onChange={handleChange}
                              />{' '}
                              Both (Segregated)
                            </label>
                          </div>
                        </div>

                        {/* Approx Quantity People */}
                        <div className="form-group">
                          <label htmlFor="quantity_people" className="form-label">
                            Approx Quantity (serves ~people) <span className="req">*</span>
                          </label>
                          <input
                            type="number"
                            id="quantity_people"
                            name="quantity_people"
                            className="form-input"
                            placeholder="e.g. 150"
                            min="10"
                            max="5000"
                            required
                            value={formData.quantity_people}
                            onChange={handleChange}
                            aria-invalid={errors.quantity_people ? 'true' : 'false'}
                          />
                          <span className="form-helper">Estimated meals (min 10, max 5,000 people).</span>
                          {errors.quantity_people && <span className="form-error-msg is-visible">{errors.quantity_people}</span>}
                        </div>

                        {/* Pickup Time */}
                        <div className="form-group">
                          <label htmlFor="pickup_time" className="form-label">
                            Preferred Pickup Date & Time <span className="req">*</span>
                          </label>
                          <input
                            type="datetime-local"
                            id="pickup_time"
                            name="pickup_time"
                            className="form-input"
                            required
                            min={new Date().toISOString().slice(0, 16)}
                            value={formData.pickup_time}
                            onChange={handleChange}
                            aria-invalid={errors.pickup_time ? 'true' : 'false'}
                          />
                          {errors.pickup_time && <span className="form-error-msg is-visible">{errors.pickup_time}</span>}
                        </div>

                        {/* Notes */}
                        <div className="form-group full-width">
                          <label htmlFor="notes" className="form-label">Special Handling Notes (Optional)</label>
                          <textarea
                            id="notes"
                            name="notes"
                            className="form-textarea"
                            rows={2}
                            placeholder="e.g. Trays already packed; enter via Gate 3 loading dock; contains dairy."
                            maxLength={500}
                            value={formData.notes}
                            onChange={handleChange}
                          ></textarea>
                          <span className="form-helper">Max 500 characters.</span>
                        </div>
                      </div>

                      <div style={{ marginTop: '2rem' }}>
                        <button type="submit" disabled={submitting} className="btn btn-primary btn-large btn-block">
                          {submitting ? 'Submitting donation to dispatch…' : 'Submit Food Donation'}
                        </button>
                      </div>
                    </form>
                  </div>
                </>
              )}
            </div>

            {/* Right Column: Track Pickup Card & Urgent Helpline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Track Your Pickup Card */}
              <div className="card" style={{ border: '2px solid var(--orange-100)', backgroundColor: 'var(--white)' }}>
                <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Search size={20} strokeWidth={1.75} color="var(--orange-600)" aria-hidden="true" /> Track Your Pickup
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--ink-light)', marginBottom: '1.25rem' }}>
                  Enter your reference ID and registered phone number to verify real-time status.
                </p>

                <form onSubmit={handleTrackSubmit} noValidate>
                  <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                    <label htmlFor="track_ref" className="form-label">
                      Reference ID <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      id="track_ref"
                      className="form-input"
                      placeholder="e.g. SS-2026-1001"
                      required
                      value={trackRef}
                      onChange={(e) => setTrackRef(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label htmlFor="track_phone" className="form-label">
                      Phone Number <span className="req">*</span>
                    </label>
                    <input
                      type="tel"
                      id="track_phone"
                      className="form-input"
                      placeholder="10-digit mobile"
                      required
                      value={trackPhone}
                      onChange={(e) => setTrackPhone(e.target.value)}
                    />
                  </div>
                  <button type="submit" disabled={trackingLoading} className="btn btn-secondary btn-block">
                    {trackingLoading ? 'Checking status…' : 'Track Status'}
                  </button>
                </form>

                {/* Track Result Display */}
                {trackSearched && (
                  <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-warm)', paddingTop: '1.25rem' }}>
                    {trackResult === false && (
                      <div className="banner banner-error" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <XCircle size={20} strokeWidth={1.75} aria-hidden="true" style={{ flexShrink: 0 }} />
                        <div>No pickup found matching <strong>{trackRef}</strong> and phone <strong>{trackPhone}</strong>. Please check your credentials.</div>
                      </div>
                    )}
                    {trackResult === 'error' && (
                      <div className="banner banner-error" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={20} strokeWidth={1.75} aria-hidden="true" style={{ flexShrink: 0 }} />
                        <div>Unable to track status at this moment. Please call 1800-890-4422.</div>
                      </div>
                    )}
                    {trackResult && typeof trackResult === 'object' && (
                      <div style={{ backgroundColor: 'var(--cream)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-warm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontWeight: 700, fontFamily: 'var(--font-head)', fontSize: '1.1rem', color: 'var(--orange-500)' }}>
                            {trackResult.reference_id}
                          </span>
                          <span className={`status-badge status-badge--${trackResult.status}`}>{trackResult.status}</span>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--ink)', marginBottom: '0.25rem' }}>
                          <strong>Venue:</strong> {trackResult.organisation} ({trackResult.city})
                        </div>
                        <div style={{ fontSize: '0.825rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>
                          <strong>Pickup Window:</strong> {new Date(trackResult.pickup_time).toLocaleString('en-IN')}
                        </div>

                        {trackResult.status === 'cancelled' ? (
                          <div className="banner banner-error" style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertCircle size={20} strokeWidth={1.75} aria-hidden="true" style={{ flexShrink: 0 }} />
                            <div>This pickup request has been <strong>Cancelled</strong> by dispatch.</div>
                          </div>
                        ) : (
                          <div className="timeline">
                            {['reported', 'assigned', 'collected', 'delivered'].map((st, i) => {
                              const steps = ['reported', 'assigned', 'collected', 'delivered'];
                              const currentIndex = steps.indexOf(trackResult.status);
                              let cls = '';
                              if (i < currentIndex) cls = 'is-complete';
                              else if (i === currentIndex) cls = 'is-active';
                              return (
                                <div key={st} className={`timeline-step ${cls}`}>
                                  <div className="timeline-dot">{i < currentIndex ? <Check size={14} strokeWidth={2.5} aria-hidden="true" /> : i + 1}</div>
                                  <div className="timeline-label">{st.charAt(0).toUpperCase() + st.slice(1)}</div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Help & Assurance Card */}
              <div className="card" style={{ backgroundColor: 'var(--cream-dark)' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={18} strokeWidth={1.75} color="var(--orange-600)" aria-hidden="true" /> Urgent Assistance?
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--ink-light)', marginBottom: '1rem' }}>
                  Wedding or event ending right now? If you need immediate dispatch within 30 minutes, dial our 24/7 volunteer desk directly:
                </p>
                <a href="tel:1800XXXXXXX" className="btn btn-outline btn-block" style={{ background: 'var(--white)', fontWeight: 700, marginBottom: '1rem' }}>
                  Call 1800-XXX-XXXX (demo)
                </a>
                <hr style={{ border: 0, borderTop: '1px solid var(--border-warm)', margin: '1rem 0' }} />
                <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>What happens next?</h4>
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--ink-light)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <li>Coordinator calls within 15 mins to confirm quantity.</li>
                  <li>Volunteer van dispatched with food-grade tiffin crates.</li>
                  <li>Temperature & sensory check performed before loading.</li>
                  <li>Delivered same evening to local night shelter.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
