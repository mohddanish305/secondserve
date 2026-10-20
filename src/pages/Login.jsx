import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Noindex metadata
  useEffect(() => {
    document.title = 'Log In — Second Serve NGO';
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
      const searchParams = new URLSearchParams(location.search);
      const next = searchParams.get('next');
      if (next && next.startsWith('/') && !next.includes('//')) {
        navigate(next, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, location.search, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      const searchParams = new URLSearchParams(location.search);
      const next = searchParams.get('next');
      if (next && next.startsWith('/') && !next.includes('//')) {
        navigate(next, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.warn('Login attempt failed:', err?.message || err);
      const msg = (err?.message || '').toLowerCase();
      if (msg.includes('email not confirmed')) {
        setErrorMsg('Email address not confirmed. Please confirm your email in Supabase (or disable "Confirm email" in Supabase Auth -> Providers -> Email).');
      } else if (msg.includes('invalid login credentials')) {
        setErrorMsg('Incorrect email or password. Please verify your credentials or register an account.');
      } else {
        setErrorMsg(err.message || 'Incorrect email or password.');
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
        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>Welcome Back</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--ink-light)', marginBottom: '1.75rem' }}>
          Log in to track your food donations, manage volunteer shifts, or access administrative operations.
        </p>

        {errorMsg && (
          <div className="banner banner-error" style={{ textAlign: 'left', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }} role="alert">
            <AlertCircle size={20} strokeWidth={1.75} aria-hidden="true" style={{ flexShrink: 0 }} />
            <div>{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }} noValidate>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="login-email" className="form-label">
              Email Address <span className="req">*</span>
            </label>
            <input
              type="email"
              id="login-email"
              className="form-input"
              placeholder="e.g. yourname@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="login-password" className="form-label">
              Password <span className="req">*</span>
            </label>
            <input
              type="password"
              id="login-password"
              className="form-input"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-large btn-block"
            style={{ marginBottom: '1.25rem' }}
          >
            {submitting ? 'Authenticating…' : 'Log In'}
          </button>
        </form>

        <div style={{ fontSize: '0.9rem', color: 'var(--ink-light)', borderTop: '1px solid var(--border-warm)', paddingTop: '1.25rem' }}>
          Don't have an account yet? <Link to="/signup" style={{ fontWeight: 600 }}>Sign up here</Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--muted)', background: 'var(--cream)', padding: '0.65rem', borderRadius: 'var(--radius-sm)', textAlign: 'left' }}>
          <Info size={16} strokeWidth={1.75} color="var(--orange-600)" aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span><strong>Demo Accounts:</strong> Enter any email with <code>admin</code> (e.g. <code>admin@secondserve.org</code>) to test Admin access, or <code>volunteer@secondserve.org</code> for Volunteer mode.</span>
        </div>
      </div>
    </main>
  );
}
