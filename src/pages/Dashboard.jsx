import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Truck, MapPin, User, Clock, Utensils, CheckCircle, Heart, Check, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { myPickups, myAssignedPickups, myApplications, volunteerUpdateStatus } from '../lib/api.js';

export default function Dashboard() {
  const { user, updateUserProfile } = useAuth();

  // Profile Form state
  const [profName, setProfName] = useState('');
  const [profPhone, setProfPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  // Pickups & Volunteer state
  const [userPickupsList, setUserPickupsList] = useState([]);
  const [assignedPickupsList, setAssignedPickupsList] = useState([]);
  const [volApplications, setVolApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delivery Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPickupId, setModalPickupId] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  // Toast / feedback message
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Noindex metadata
  useEffect(() => {
    document.title = 'User & Volunteer Dashboard — Second Serve NGO';
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'robots';
      document.head.appendChild(meta);
    }
    meta.content = 'noindex, nofollow';
    return () => {
      meta.content = 'index, follow';
    };
  }, []);

  useEffect(() => {
    if (user) {
      setProfName(user.full_name || '');
      setProfPhone(user.phone || '');
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. User pickups
      const myP = await myPickups(user.id);
      setUserPickupsList(myP || []);

      // 2. Assigned pickups if volunteer/admin
      if (user.role === 'volunteer' || user.role === 'admin') {
        const assignedP = await myAssignedPickups(user.id);
        setAssignedPickupsList(assignedP || []);
      } else {
        // Volunteer application status
        const apps = await myApplications(user.id, user.email);
        setVolApplications(apps || []);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profName.trim()) {
      setProfileMsg({ type: 'error', text: 'Please enter your name.' });
      return;
    }
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await updateUserProfile({ full_name: profName.trim(), phone: profPhone.trim() || null });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      console.error('Profile update error:', err);
      setProfileMsg({ type: 'error', text: 'Could not update profile.' });
      showToast('Could not update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleMarkCollected = async (pickupId) => {
    try {
      await volunteerUpdateStatus(pickupId, 'collected');
      showToast('Status updated to Collected!', 'success');
      await loadDashboardData();
    } catch (err) {
      console.error('Error marking collected:', err);
      showToast('Failed to update status.', 'error');
    }
  };

  const openDeliveryModal = (pickupId) => {
    setModalPickupId(pickupId);
    setSelectedDestination('');
    setModalOpen(true);
  };

  const handleConfirmDelivery = async (e) => {
    e.preventDefault();
    if (!selectedDestination) {
      alert('Please select a destination facility.');
      return;
    }
    setModalSubmitting(true);
    try {
      await volunteerUpdateStatus(modalPickupId, 'delivered', selectedDestination);
      setModalOpen(false);
      showToast('Pickup confirmed Delivered! Impact count updated.', 'success');
      await loadDashboardData();
    } catch (err) {
      console.error('Delivery status error:', err);
      showToast('Could not record delivery.', 'error');
    } finally {
      setModalSubmitting(false);
    }
  };

  const firstName = user?.full_name ? user.full_name.split(' ')[0] : 'Friend';
  const roleName = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User';
  const steps = ['reported', 'assigned', 'collected', 'delivered'];

  return (
    <main>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            zIndex: 9999,
            backgroundColor: toast.type === 'success' ? '#2b8a3e' : '#e03131',
            color: '#fff',
            padding: '0.85rem 1.5rem',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-md)',
            fontWeight: 600
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Dashboard Header */}
      <section className="dash-header" style={{ background: 'var(--white)', borderBottom: '1px solid var(--border-warm)', padding: '2rem 0' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignContent: 'center', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '2rem', margin: 0 }}>Hello, {firstName}</h1>
              <span
                className="status-badge"
                style={{
                  backgroundColor: user?.role === 'admin' ? 'var(--red-100)' : user?.role === 'volunteer' ? 'var(--green-100)' : 'var(--orange-100)',
                  color: user?.role === 'admin' ? 'var(--red-600)' : user?.role === 'volunteer' ? 'var(--green-600)' : 'var(--orange-600)'
                }}
              >
                {roleName}
              </span>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--ink-light)', margin: '0.25rem 0 0 0' }}>
              {user?.email}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {user?.role === 'admin' && (
              <Link to="/admin" className="btn btn-outline btn-small" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Settings size={16} strokeWidth={1.75} aria-hidden="true" /> Open Admin Dashboard
              </Link>
            )}
            <Link to="/report-food" className="btn btn-primary btn-small">
              + Donate Surplus Food
            </Link>
          </div>
        </div>
      </section>

      {/* Main Dashboard Workspace */}
      <section className="section section-cream" style={{ paddingTop: '2.5rem' }}>
        <div className="container">
          <div className="dash-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
              
              {/* Left Column: Profile Card & Volunteer Status */}
              <div>
                {/* Profile Edit Card */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Personal Profile</h2>
                  {profileMsg && (
                    <div
                      style={{
                        marginBottom: '1rem',
                        fontSize: '0.85rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '4px',
                        backgroundColor: profileMsg.type === 'success' ? '#ebfbee' : '#fff5f5',
                        color: profileMsg.type === 'success' ? '#2b8a3e' : '#e03131'
                      }}
                    >
                      {profileMsg.text}
                    </div>
                  )}
                  <form onSubmit={handleProfileSave}>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label htmlFor="prof-name" className="form-label">Full Name</label>
                      <input
                        type="text"
                        id="prof-name"
                        className="form-input"
                        required
                        value={profName}
                        onChange={(e) => setProfName(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label htmlFor="prof-phone" className="form-label">Mobile Number</label>
                      <input
                        type="tel"
                        id="prof-phone"
                        className="form-input"
                        placeholder="10-digit mobile"
                        value={profPhone}
                        onChange={(e) => setProfPhone(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                      <label className="form-label">Email (Read-only)</label>
                      <input
                        type="email"
                        className="form-input"
                        disabled
                        value={user?.email || ''}
                        style={{ background: '#E9ECEF', color: 'var(--muted)' }}
                      />
                    </div>
                    <button type="submit" disabled={savingProfile} className="btn btn-secondary btn-small btn-block">
                      {savingProfile ? 'Saving…' : 'Save Profile'}
                    </button>
                  </form>
                </div>

                {/* Volunteer Status Card (For standard users) */}
                {user?.role !== 'volunteer' && user?.role !== 'admin' && (
                  <div className="card" style={{ background: 'var(--white)' }}>
                    <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Volunteer Status</h3>
                    {volApplications.length === 0 ? (
                      <div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--ink-light)', marginBottom: '1rem' }}>
                          Become a verified Food Hero and help rescue surplus banquet meals in your city.
                        </p>
                        <Link to="/volunteer" className="btn btn-secondary btn-small btn-block">
                          Apply to Volunteer →
                        </Link>
                      </div>
                    ) : (
                      <div>
                        {volApplications.map((app) => {
                          const badgeClass =
                            app.status === 'approved'
                              ? 'status-badge--delivered'
                              : app.status === 'rejected'
                              ? 'status-badge--cancelled'
                              : 'status-badge--assigned';
                          return (
                            <div key={app.id}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Status:</span>
                                <span className={`status-badge ${badgeClass}`}>{app.status}</span>
                              </div>
                              <p style={{ fontSize: '0.85rem', color: 'var(--ink-light)', marginBottom: '0.5rem' }}>
                                <strong>Role:</strong> {app.preferred_role.replace('_', ' ').toUpperCase()} ({app.city})
                              </p>
                              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: 0 }}>
                                Applied on {new Date(app.created_at).toLocaleDateString('en-IN')}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Pickups Workspace */}
              <div>
                {/* Volunteer Assigned Pickups Section */}
                {(user?.role === 'volunteer' || user?.role === 'admin') && (
                  <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div>
                        <h2 style={{ fontSize: '1.4rem', color: 'var(--green-600)', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <Truck size={22} strokeWidth={1.75} aria-hidden="true" /> My Assigned Pickups
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '0.15rem 0 0 0' }}>
                          Food rescue dispatches assigned to you.
                        </p>
                      </div>
                      <span className="status-badge" style={{ backgroundColor: 'var(--green-100)', color: 'var(--green-600)' }}>
                        Volunteer Active
                      </span>
                    </div>

                    {loading ? (
                      <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--muted)' }}>Loading assigned pickups…</div>
                    ) : assignedPickupsList.length === 0 ? (
                      <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                        <p style={{ color: 'var(--muted)', margin: 0 }}>No pickups currently assigned to you. Stand by for coordinator dispatch.</p>
                      </div>
                    ) : (
                      assignedPickupsList.map((p) => (
                        <article key={p.id} className="pickup-card" style={{ borderLeft: '4px solid var(--orange-500)', background: 'var(--white)', borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <div>
                              <span style={{ fontWeight: 700, color: 'var(--orange-500)', fontSize: '1.1rem' }}>{p.reference_id}</span>
                              <h3 style={{ fontSize: '1.1rem', margin: '0.2rem 0' }}>{p.organisation}</h3>
                            </div>
                            <span className={`status-badge status-badge--${p.status}`}>{p.status}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.9rem', color: 'var(--ink)', marginBottom: '0.5rem' }}>
                            <MapPin size={16} strokeWidth={1.75} color="var(--orange-600)" aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span><strong>Address:</strong> {p.pickup_address}, {p.city}</span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--ink-light)', marginBottom: '1rem' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <User size={15} strokeWidth={1.75} color="var(--orange-600)" aria-hidden="true" />
                              <span><strong>Contact:</strong> {p.contact_name} (<a href={`tel:${p.phone}`}>{p.phone}</a>)</span>
                            </div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <Clock size={15} strokeWidth={1.75} color="var(--orange-600)" aria-hidden="true" />
                              <span><strong>Pickup Time:</strong> {new Date(p.pickup_time).toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <Utensils size={15} strokeWidth={1.75} color="var(--orange-600)" aria-hidden="true" />
                              <span><strong>Quantity:</strong> {p.quantity_people} meals ({p.food_type})</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            {p.status === 'assigned' && (
                              <button type="button" className="btn btn-primary btn-small" onClick={() => handleMarkCollected(p.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <CheckCircle size={15} strokeWidth={1.75} aria-hidden="true" /> Mark Collected
                              </button>
                            )}
                            {p.status === 'collected' && (
                              <button type="button" className="btn btn-secondary btn-small" onClick={() => openDeliveryModal(p.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <Heart size={15} strokeWidth={1.75} aria-hidden="true" /> Mark Delivered
                              </button>
                            )}
                            {p.status === 'delivered' && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--green-600)' }}>
                                <Check size={16} strokeWidth={2.5} aria-hidden="true" /> Delivered to {p.delivered_to ? p.delivered_to.replace('_', ' ') : 'Shelter'}
                              </span>
                            )}
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                )}

                {/* User's Reported Pickups Section */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.4rem', margin: 0, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <Utensils size={22} strokeWidth={1.75} color="var(--orange-600)" aria-hidden="true" /> My Food Donations
                      </h2>
                      <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '0.15rem 0 0 0' }}>
                        Track status from dispatch to shelter delivery.
                      </p>
                    </div>
                    <Link to="/report-food" className="btn btn-outline btn-small">
                      + New Donation
                    </Link>
                  </div>

                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>Loading your requests…</div>
                  ) : userPickupsList.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
                        <Utensils size={40} strokeWidth={1.75} color="var(--muted)" aria-hidden="true" />
                      </div>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Surplus Food Donated Yet</h3>
                      <p style={{ fontSize: '0.95rem', color: 'var(--ink-light)', marginBottom: '1.5rem' }}>
                        When you donate surplus banquet or event food, it will be tracked here in real time.
                      </p>
                      <Link to="/report-food" className="btn btn-primary">
                        Donate Surplus Food Now
                      </Link>
                    </div>
                  ) : (
                    userPickupsList.map((p) => {
                      const isCancelled = p.status === 'cancelled';
                      const currentIndex = steps.indexOf(p.status);

                      return (
                        <article key={p.id} className="pickup-card" style={{ background: 'var(--white)', borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '1.25rem', border: '1px solid var(--border-warm)', boxShadow: 'var(--shadow-sm)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <div>
                              <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--orange-500)' }}>
                                {p.reference_id}
                              </span>
                              <h3 style={{ fontSize: '1.1rem', margin: '0.25rem 0 0 0' }}>{p.organisation}</h3>
                            </div>
                            <span className={`status-badge status-badge--${p.status}`}>{p.status}</span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--ink-light)', marginBottom: '0.5rem' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><MapPin size={15} strokeWidth={1.75} color="var(--orange-600)" aria-hidden="true" /> <span><strong>City:</strong> {p.city}</span></div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Users size={15} strokeWidth={1.75} color="var(--orange-600)" aria-hidden="true" /> <span><strong>Quantity:</strong> Serves ~{p.quantity_people} people</span></div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Clock size={15} strokeWidth={1.75} color="var(--orange-600)" aria-hidden="true" /> <span><strong>Pickup Time:</strong> {new Date(p.pickup_time).toLocaleString('en-IN')}</span></div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Utensils size={15} strokeWidth={1.75} color="var(--orange-600)" aria-hidden="true" /> <span><strong>Food:</strong> {p.food_type.toUpperCase()}</span></div>
                          </div>

                          {p.notes && (
                            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontStyle: 'italic', background: 'var(--cream)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem' }}>
                              Note: {p.notes}
                            </div>
                          )}

                          {!isCancelled && (
                            <div className="timeline" style={{ margin: '1.25rem 0 0.5rem 0' }}>
                              {steps.map((st, i) => {
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
                        </article>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Destination Picker Modal for Delivering Food */}
      {modalOpen && (
        <div className="modal-backdrop is-open" role="dialog" aria-modal="true" aria-labelledby="modal-dest-title">
          <div className="modal-dialog">
            <h3 id="modal-dest-title" style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Confirm Delivery Destination</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-light)', marginBottom: '1.25rem' }}>
              Please select where this rescued food was delivered to complete the live impact log.
            </p>

            <form onSubmit={handleConfirmDelivery}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="destination-select" className="form-label">
                  Delivered To <span className="req">*</span>
                </label>
                <select
                  id="destination-select"
                  className="form-select"
                  required
                  value={selectedDestination}
                  onChange={(e) => setSelectedDestination(e.target.value)}
                >
                  <option value="">Select destination facility</option>
                  <option value="night_shelter">Night Shelter (Rain Basera)</option>
                  <option value="community_kitchen">Community Kitchen</option>
                  <option value="slum_kitchen">Slum Community Kitchen</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline btn-small" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={modalSubmitting} className="btn btn-primary btn-small">
                  {modalSubmitting ? 'Saving…' : 'Confirm Delivery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
