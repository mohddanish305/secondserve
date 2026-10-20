import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Noindex metadata
  useEffect(() => {
    document.title = 'Create Your Account — Second Serve NGO';
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

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (name.trim().length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (phone.trim()) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(phone.trim())) {
        setErrorMsg('Phone number must be a 10-digit number starting with 6–9.');
        return;
      }
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirm) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await signUp({
        email: email.trim(),
        password,
        fullName: name.trim(),
        phone: phone.trim() || null
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Signup error:', err);
      if (err.message && err.message.toLowerCase().includes('already registered')) {
        setErrorMsg('This email is already registered. Try logging in.');
      } else {
        setErrorMsg(err.message || 'Could not complete signup. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      className="auth-page"
      style={{
        minHeight: 'calc(100vh - var(--nav-height))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.25rem',
        background: 'linear-gradient(180deg, var(--cream-dark) 0%, var(--cream) 100%)'
      }}
    >
      <div
        className="auth-box"
        style={{
          maxWidth: '440px',
          width: '100%',
          background: 'var(--white)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-warm)',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center'
        }}
      >
        <img
          src="/images/logo.svg"
          alt="Second Serve Logo"
          width="160"
          height="40"
          style={{ margin: '0 auto 1.5rem auto' }}
        />
        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Create Your Account</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--ink-light)', marginBottom: '1.75rem' }}>
          Join our food rescue network to track donor pickups, coordinate volunteer shifts, and monitor community impact.
        </p>

        {errorMsg && (
          <div className="banner banner-error" style={{ textAlign: 'left', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }} role="alert">
            <AlertCircle size={20} strokeWidth={1.75} aria-hidden="true" style={{ flexShrink: 0 }} />
            <div>{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }} noValidate>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="signup-name" className="form-label">
              Full Name <span className="req">*</span>
            </label>
            <input
              type="text"
              id="signup-name"
              className="form-input"
              placeholder="e.g. Ravi Sharma"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="signup-email" className="form-label">
              Email Address <span className="req">*</span>
            </label>
            <input
              type="email"
              id="signup-email"
              className="form-input"
              placeholder="e.g. ravi@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="signup-phone" className="form-label">
              Mobile Number (Optional)
            </label>
            <input
              type="tel"
              id="signup-phone"
              className="form-input"
              placeholder="10-digit mobile (e.g. 9876543210)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="signup-password" className="form-label">
              Password (Min 8 Characters) <span className="req">*</span>
            </label>
            <input
              type="password"
              id="signup-password"
              className="form-input"
              placeholder="At least 8 characters"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="signup-confirm" className="form-label">
              Confirm Password <span className="req">*</span>
            </label>
            <input
              type="password"
              id="signup-confirm"
              className="form-input"
              placeholder="Re-type password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-large btn-block"
            style={{ marginBottom: '1.25rem' }}
          >
            {submitting ? 'Creating account…' : 'Create Free Account'}
          </button>
        </form>

        <div style={{ fontSize: '0.9rem', color: 'var(--ink-light)', borderTop: '1px solid var(--border-warm)', paddingTop: '1.25rem' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Log in here</Link>
        </div>
      </div>
    </main>
  );
}
