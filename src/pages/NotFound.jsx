import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  useEffect(() => {
    document.title = '404 - Page Not Found — Second Serve NGO';
  }, []);

  return (
    <main>
      <section className="section section-cream" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '640px' }}>
          <span className="eyebrow" style={{ marginBottom: '1.25rem' }}>404 Error</span>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--ink)' }}>
            Page Not Found
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--ink-light)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            The page you are looking for doesn't exist, may have been relocated, or is temporarily unavailable.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/" className="btn btn-primary btn-large">
              <Home size={18} strokeWidth={1.75} aria-hidden="true" /> Back to Home
            </Link>
            <Link to="/contact" className="btn btn-outline btn-large">
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
