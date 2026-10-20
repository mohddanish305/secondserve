import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Utensils, Users, Mail, Inbox, RefreshCw, Check, Circle, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  adminCounts,
  adminListPickups,
  adminListVolunteers,
  adminAssignPickup,
  adminSetPickupStatus,
  adminListApplications,
  adminReviewApplication,
  adminListMessages,
  adminMarkMessageRead,
  adminListSubscribers
} from '../lib/api.js';

export default function Admin() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // Active tab state
  const [activeTab, setActiveTab] = useState('pickups'); // 'pickups' | 'volunteers' | 'messages' | 'subscribers'

  // Summary counts
  const [counts, setCounts] = useState({
    new_requests: 0,
    in_progress: 0,
    delivered: 0,
    pending_apps: 0,
    unread_messages: 0
  });

  // Approved volunteers for assignment
  const [approvedVolunteers, setApprovedVolunteers] = useState([]);

  // Tab 1: Pickups state
  const [pickups, setPickups] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [pickupsLoading, setPickupsLoading] = useState(false);

  // Tab 2: Applications state
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);

  // Tab 3: Messages state
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Tab 4: Subscribers state
  const [subscribers, setSubscribers] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);

  // Admin Delivery Destination Modal
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [selectedPickupId, setSelectedPickupId] = useState(null);
  const [adminDestination, setAdminDestination] = useState('');
  const [modalSaving, setModalSaving] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Noindex metadata
  useEffect(() => {
    document.title = 'Operations Admin Panel — Second Serve NGO';
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

  const loadCounts = async () => {
    try {
      const c = await adminCounts();
      if (c) setCounts(c);
    } catch (e) {
      console.warn('Could not load counts', e);
    }
  };

  const loadVolunteersList = async () => {
    try {
      const vols = await adminListVolunteers();
      setApprovedVolunteers(vols || []);
    } catch (e) {
      console.warn('Could not load volunteers', e);
    }
  };

  const loadPickupsData = async (page = currentPage) => {
    setPickupsLoading(true);
    try {
      const res = await adminListPickups({
        status: filterStatus,
        city: filterCity,
        page
      });
      setPickups(res || []);
    } catch (e) {
      console.error('Error loading pickups', e);
      showToast('Error loading pickups from server.', 'error');
    } finally {
      setPickupsLoading(false);
    }
  };

  const loadApplicationsData = async () => {
    setAppsLoading(true);
    try {
      const res = await adminListApplications();
      setApplications(res || []);
    } catch (e) {
      console.error('Error loading applications', e);
      showToast('Error loading applications.', 'error');
    } finally {
      setAppsLoading(false);
    }
  };

  const loadMessagesData = async () => {
    setMessagesLoading(true);
    try {
      const res = await adminListMessages();
      setMessages(res || []);
    } catch (e) {
      console.error('Error loading messages', e);
      showToast('Error loading messages.', 'error');
    } finally {
      setMessagesLoading(false);
    }
  };

  const loadSubscribersData = async () => {
    setSubsLoading(true);
    try {
      const res = await adminListSubscribers();
      setSubscribers(res || []);
    } catch (e) {
      console.error('Error loading subscribers', e);
      showToast('Error loading subscribers.', 'error');
    } finally {
      setSubsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadCounts();
    loadVolunteersList();
    loadPickupsData(0);
  }, []);

  // When filters or page changes for pickups
  useEffect(() => {
    loadPickupsData(currentPage);
  }, [filterStatus, filterCity, currentPage]);

  // Tab switching effect
  useEffect(() => {
    if (activeTab === 'volunteers') loadApplicationsData();
    else if (activeTab === 'messages') loadMessagesData();
    else if (activeTab === 'subscribers') loadSubscribersData();
    else if (activeTab === 'pickups') loadPickupsData(currentPage);
  }, [activeTab]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleAssignVolunteer = async (pickupId, refId, volunteerId) => {
    if (!volunteerId) return;
    try {
      await adminAssignPickup(pickupId, volunteerId);
      showToast(`Assigned ${refId} to volunteer!`, 'success');
      await loadCounts();
      await loadPickupsData(currentPage);
    } catch (err) {
      console.error('Assignment error', err);
      showToast('Failed to assign volunteer.', 'error');
    }
  };

  const handleStatusChange = async (pickupId, newStatus) => {
    if (newStatus === 'delivered') {
      setSelectedPickupId(pickupId);
      setAdminDestination('');
      setAdminModalOpen(true);
      return;
    }
    try {
      await adminSetPickupStatus(pickupId, newStatus);
      showToast(`Status updated to ${newStatus}`, 'success');
      await loadCounts();
      await loadPickupsData(currentPage);
    } catch (err) {
      console.error('Status update error', err);
      showToast('Could not update status.', 'error');
    }
  };

  const handleConfirmAdminDelivery = async (e) => {
    e.preventDefault();
    if (!adminDestination) {
      alert('Please choose a destination facility.');
      return;
    }
    setModalSaving(true);
    try {
      await adminSetPickupStatus(selectedPickupId, 'delivered', adminDestination);
      setAdminModalOpen(false);
      showToast('Pickup confirmed delivered!', 'success');
      await loadCounts();
      await loadPickupsData(currentPage);
    } catch (err) {
      console.error('Delivery status error', err);
      showToast('Could not update pickup status.', 'error');
    } finally {
      setModalSaving(false);
    }
  };

  const handleReviewApp = async (appId, approve, name) => {
    try {
      await adminReviewApplication(appId, approve);
      showToast(approve ? `Approved ${name} as Volunteer!` : 'Application rejected.', approve ? 'success' : 'info');
      await loadVolunteersList();
      await loadCounts();
      await loadApplicationsData();
    } catch (err) {
      console.error('Review error', err);
      showToast('Failed to review application.', 'error');
    }
  };

  const handleMarkRead = async (msgId) => {
    try {
      await adminMarkMessageRead(msgId);
      showToast('Message marked as read', 'success');
      await loadCounts();
      await loadMessagesData();
    } catch (err) {
      console.error('Mark read error', err);
      showToast('Could not mark message read.', 'error');
    }
  };

  const handleDownloadCSV = () => {
    if (!subscribers || subscribers.length === 0) {
      alert('No subscriber rows to download.');
      return;
    }
    let csvContent = 'data:text/csv;charset=utf-8,Email,Subscribed At\n';
    subscribers.forEach((row) => {
      csvContent += `"${row.email}","${row.created_at}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `second_serve_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ backgroundColor: 'var(--cream)', minHeight: '100vh' }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            zIndex: 9999,
            backgroundColor: toast.type === 'success' ? '#2b8a3e' : toast.type === 'error' ? '#e03131' : '#1971c2',
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

      {/* Admin Top Bar Header */}
      <header className="admin-header" role="banner" style={{ background: '#1A130F', color: '#FFF9F0', padding: '2rem 0', borderBottom: '2px solid var(--orange-500)' }}>
        <div className="container admin-top-bar" style={{ maxWidth: '1440px', paddingLeft: '1.5rem', paddingRight: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/" aria-label="Second Serve Home">
              <img src="/images/logo-light.svg" alt="Second Serve" width="160" height="40" />
            </Link>
            <div style={{ borderLeft: '1px solid #44352B', paddingLeft: '1rem' }}>
              <h1 style={{ color: '#FFF9F0', fontSize: '1.85rem', margin: 0 }}>Operations Admin Panel</h1>
              <div style={{ fontSize: '0.8rem', color: '#D3CDC6' }}>Live Database Control & Dispatch</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="status-badge" style={{ backgroundColor: 'var(--orange-500)', color: 'var(--white)', fontWeight: 700 }}>
              Admin Mode
            </span>
            <Link to="/dashboard" className="btn btn-outline-white btn-small">
              User Dashboard
            </Link>
            <button type="button" onClick={handleLogout} className="btn btn-outline-white btn-small">
              Log out
            </button>
          </div>
        </div>
      </header>

      <main style={{ padding: '2.5rem 0 5rem 0' }}>
        <div className="container">
          {/* Summary Metrics Row (TRD §4.12) */}
          <div className="summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div className="summary-card" style={{ borderTop: '4px solid var(--ink)', background: 'var(--white)', padding: '1.25rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="summary-label" style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>New Requests</div>
              <div className="summary-number" style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-head)' }}>{counts.new_requests || 0}</div>
            </div>
            <div className="summary-card" style={{ borderTop: '4px solid var(--amber-600)', background: 'var(--white)', padding: '1.25rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="summary-label" style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>In Progress</div>
              <div className="summary-number" style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-head)', color: 'var(--amber-600)' }}>{counts.in_progress || 0}</div>
            </div>
            <div className="summary-card" style={{ borderTop: '4px solid var(--green-600)', background: 'var(--white)', padding: '1.25rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="summary-label" style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Delivered</div>
              <div className="summary-number" style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-head)', color: 'var(--green-600)' }}>{counts.delivered || 0}</div>
            </div>
            <div className="summary-card" style={{ borderTop: '4px solid var(--orange-500)', background: 'var(--white)', padding: '1.25rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="summary-label" style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Pending Volunteers</div>
              <div className="summary-number" style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-head)', color: 'var(--orange-500)' }}>{counts.pending_apps || 0}</div>
            </div>
            <div className="summary-card" style={{ borderTop: '4px solid #1D4ED8', background: 'var(--white)', padding: '1.25rem', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-sm)' }}>
              <div className="summary-label" style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600 }}>Unread Inquiries</div>
              <div className="summary-number" style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-head)', color: '#1D4ED8' }}>{counts.unread_messages || 0}</div>
            </div>
          </div>

          {/* Accessible Tabs Navigation */}
          <div className="tabs-nav" role="tablist" aria-label="Admin Operations Tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-warm)' }}>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'pickups' ? 'is-active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'pickups'}
              onClick={() => setActiveTab('pickups')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Utensils size={16} strokeWidth={1.75} aria-hidden="true" /> Food Pickups
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'volunteers' ? 'is-active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'volunteers'}
              onClick={() => setActiveTab('volunteers')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Users size={16} strokeWidth={1.75} aria-hidden="true" /> Volunteer Applications
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'messages' ? 'is-active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'messages'}
              onClick={() => setActiveTab('messages')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Mail size={16} strokeWidth={1.75} aria-hidden="true" /> Inquiries & Messages
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'subscribers' ? 'is-active' : ''}`}
              role="tab"
              aria-selected={activeTab === 'subscribers'}
              onClick={() => setActiveTab('subscribers')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Inbox size={16} strokeWidth={1.75} aria-hidden="true" /> Newsletter Subscribers
            </button>
          </div>

          {/* Tab 1: Pickups */}
          {activeTab === 'pickups' && (
            <div className="tab-panel is-active" role="tabpanel">
              <div className="table-filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="table-filters" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div>
                    <label htmlFor="filter-status" className="sr-only">Filter by Status</label>
                    <select
                      id="filter-status"
                      className="form-select"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setCurrentPage(0);
                      }}
                    >
                      <option value="all">All Statuses</option>
                      <option value="reported">Reported (New)</option>
                      <option value="assigned">Assigned</option>
                      <option value="collected">Collected</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="filter-city" className="sr-only">Filter by City</label>
                    <select
                      id="filter-city"
                      className="form-select"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                      value={filterCity}
                      onChange={(e) => {
                        setFilterCity(e.target.value);
                        setCurrentPage(0);
                      }}
                    >
                      <option value="all">All Cities</option>
                      <option value="Delhi NCR">Delhi NCR</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Jaipur">Jaipur</option>
                      <option value="Lucknow">Lucknow</option>
                      <option value="Patna">Patna</option>
                    </select>
                  </div>
                </div>
                <button type="button" onClick={() => loadPickupsData(currentPage)} className="btn btn-outline btn-small" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={14} strokeWidth={1.75} aria-hidden="true" /> Refresh
                </button>
              </div>

              <div className="table-wrap">
                <table className="table" aria-label="Surplus Food Pickups">
                  <thead>
                    <tr>
                      <th>Reference ID</th>
                      <th>Created</th>
                      <th>Organisation / Venue</th>
                      <th>Contact Person</th>
                      <th>City</th>
                      <th>Meals</th>
                      <th>Pickup Time</th>
                      <th>Status</th>
                      <th>Assigned Volunteer</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pickupsLoading ? (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>Loading pickups from database…</td>
                      </tr>
                    ) : pickups.length === 0 ? (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>No pickups matching criteria.</td>
                      </tr>
                    ) : (
                      pickups.map((p) => (
                        <tr key={p.id}>
                          <td className="bold" style={{ color: 'var(--orange-500)' }}>{p.reference_id}</td>
                          <td>{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                          <td className="bold">{p.organisation}</td>
                          <td>{p.contact_name} ({p.phone})</td>
                          <td>{p.city}</td>
                          <td>{p.quantity_people} ({p.food_type})</td>
                          <td>
                            {new Date(p.pickup_time).toLocaleString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td>
                            <span className={`status-badge status-badge--${p.status}`}>{p.status}</span>
                          </td>
                          <td>
                            <select
                              className="form-select"
                              style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                              value={p.assigned_volunteer || ''}
                              onChange={(e) => handleAssignVolunteer(p.id, p.reference_id, e.target.value)}
                            >
                              <option value="">Unassigned</option>
                              {approvedVolunteers.map((v) => (
                                <option key={v.id} value={v.id}>{v.full_name}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <select
                              className="form-select"
                              style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                              value={p.status}
                              onChange={(e) => handleStatusChange(p.id, e.target.value)}
                            >
                              <option value="reported">Reported</option>
                              <option value="assigned">Assigned</option>
                              <option value="collected">Collected</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-small"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                >
                  « Previous
                </button>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Page {currentPage + 1}</span>
                <button
                  type="button"
                  className="btn btn-outline btn-small"
                  disabled={pickups.length < 25}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next »
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Volunteer Applications */}
          {activeTab === 'volunteers' && (
            <div className="tab-panel is-active" role="tabpanel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Volunteer Candidate Applications</h2>
                <button type="button" onClick={loadApplicationsData} className="btn btn-outline btn-small" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={14} strokeWidth={1.75} aria-hidden="true" /> Refresh
                </button>
              </div>

              <div className="table-wrap">
                <table className="table" aria-label="Volunteer Applications">
                  <thead>
                    <tr>
                      <th>Applicant Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>City</th>
                      <th>Preferred Role</th>
                      <th>Availability</th>
                      <th>Motivation</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Review Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appsLoading ? (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', padding: '2rem' }}>Loading applications…</td>
                      </tr>
                    ) : applications.length === 0 ? (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>No volunteer applications found.</td>
                      </tr>
                    ) : (
                      applications.map((a) => {
                        const badgeClass =
                          a.status === 'approved'
                            ? 'status-badge--delivered'
                            : a.status === 'rejected'
                            ? 'status-badge--cancelled'
                            : 'status-badge--assigned';

                        return (
                          <tr key={a.id}>
                            <td className="bold">{a.full_name}</td>
                            <td>{a.email}</td>
                            <td>{a.phone}</td>
                            <td>{a.city}</td>
                            <td>{a.preferred_role ? a.preferred_role.replace('_', ' ') : '—'}</td>
                            <td>{Array.isArray(a.availability) ? a.availability.join(', ') : a.availability}</td>
                            <td style={{ maxWidth: '200px', fontSize: '0.8rem' }}>{a.motivation || '—'}</td>
                            <td>{new Date(a.created_at).toLocaleDateString('en-IN')}</td>
                            <td>
                              <span className={`status-badge ${badgeClass}`}>{a.status}</span>
                            </td>
                            <td>
                              {a.status === 'pending' ? (
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                  <button
                                    type="button"
                                    className="btn btn-primary btn-small"
                                    onClick={() => handleReviewApp(a.id, true, a.full_name)}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-outline btn-small"
                                    onClick={() => handleReviewApp(a.id, false, a.full_name)}
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>Reviewed</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Messages */}
          {activeTab === 'messages' && (
            <div className="tab-panel is-active" role="tabpanel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Contact Form Messages</h2>
                <button type="button" onClick={loadMessagesData} className="btn btn-outline btn-small" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={14} strokeWidth={1.75} aria-hidden="true" /> Refresh
                </button>
              </div>

              <div className="table-wrap">
                <table className="table" aria-label="Contact Messages">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Sender</th>
                      <th>Email</th>
                      <th>Category</th>
                      <th>Date</th>
                      <th>Message Content</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messagesLoading ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>Loading messages…</td>
                      </tr>
                    ) : messages.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>No messages found.</td>
                      </tr>
                    ) : (
                      messages.map((m) => (
                        <tr key={m.id} style={{ backgroundColor: !m.is_read ? 'var(--cream)' : 'transparent' }}>
                          <td style={{ fontWeight: m.is_read ? 'normal' : 'bold', color: m.is_read ? 'var(--muted)' : 'var(--orange-600)' }}>
                            {m.is_read ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Check size={14} strokeWidth={2.5} color="var(--green-600)" aria-hidden="true" /> Read
                              </span>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--orange-600)', fontWeight: 'bold' }}>
                                <Circle size={8} fill="currentColor" aria-hidden="true" /> Unread
                              </span>
                            )}
                          </td>
                          <td className={!m.is_read ? 'bold' : ''}>{m.full_name}</td>
                          <td>{m.email}</td>
                          <td className="bold">{m.subject?.toUpperCase()}</td>
                          <td>{new Date(m.created_at).toLocaleDateString('en-IN')}</td>
                          <td style={{ maxWidth: '320px' }}>{m.message}</td>
                          <td>
                            {!m.is_read ? (
                              <button
                                type="button"
                                className="btn btn-outline btn-small"
                                onClick={() => handleMarkRead(m.id)}
                              >
                                Mark Read
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: Subscribers */}
          {activeTab === 'subscribers' && (
            <div className="tab-panel is-active" role="tabpanel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Newsletter Audience</h2>
                  <p style={{ fontSize: '0.9rem', color: 'var(--muted)', margin: '0.2rem 0 0 0' }}>
                    Total verified subscribers: <strong>{subscribers.length}</strong>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={handleDownloadCSV} className="btn btn-primary btn-small" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Download size={14} strokeWidth={1.75} aria-hidden="true" /> Download CSV
                  </button>
                  <button type="button" onClick={loadSubscribersData} className="btn btn-outline btn-small" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <RefreshCw size={14} strokeWidth={1.75} aria-hidden="true" /> Refresh
                  </button>
                </div>
              </div>

              <div className="table-wrap">
                <table className="table" aria-label="Newsletter Subscribers">
                  <thead>
                    <tr>
                      <th>Subscriber Email</th>
                      <th>Subscribed On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subsLoading ? (
                      <tr>
                        <td colSpan="2" style={{ textAlign: 'center', padding: '2rem' }}>Loading subscribers…</td>
                      </tr>
                    ) : subscribers.length === 0 ? (
                      <tr>
                        <td colSpan="2" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>No subscribers yet.</td>
                      </tr>
                    ) : (
                      subscribers.map((s, idx) => (
                        <tr key={idx}>
                          <td className="bold">{s.email}</td>
                          <td>{new Date(s.created_at).toLocaleString('en-IN')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Admin Delivery Destination Modal */}
      {adminModalOpen && (
        <div className="modal-backdrop is-open" role="dialog" aria-modal="true" aria-labelledby="admin-dest-title">
          <div className="modal-dialog">
            <h3 id="admin-dest-title" style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Select Delivery Facility</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--ink-light)', marginBottom: '1.25rem' }}>
              Delivering a pickup requires logging the destination shelter or community kitchen.
            </p>

            <form onSubmit={handleConfirmAdminDelivery}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="admin-destination-select" className="form-label">
                  Destination Facility <span className="req">*</span>
                </label>
                <select
                  id="admin-destination-select"
                  className="form-select"
                  required
                  value={adminDestination}
                  onChange={(e) => setAdminDestination(e.target.value)}
                >
                  <option value="">Choose receiving facility</option>
                  <option value="night_shelter">Night Shelter (Rain Basera)</option>
                  <option value="community_kitchen">Community Kitchen</option>
                  <option value="slum_kitchen">Slum Community Kitchen</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-outline btn-small" onClick={() => setAdminModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={modalSaving} className="btn btn-primary btn-small">
                  {modalSaving ? 'Saving…' : 'Confirm & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
