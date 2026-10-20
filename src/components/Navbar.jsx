import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

function getInitials(user) {
  if (!user) return 'U';
  const name = (user.full_name || '').trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const first = parts[0].replace(/[^a-zA-Z0-9]/g, '');
      const second = parts[1].replace(/[^a-zA-Z0-9]/g, '');
      if (first && second) {
        return (first[0] + second[0]).toUpperCase();
      }
      if (first) return first[0].toUpperCase();
    }
    const clean = parts[0].replace(/[^a-zA-Z0-9]/g, '');
    if (clean) return clean.slice(0, 2).toUpperCase();
  }
  if (user.email) {
    return user.email.trim()[0].toUpperCase();
  }
  return 'U';
}

function getRoleLabel(role) {
  if (role === 'admin') return 'Admin';
  if (role === 'volunteer') return 'Volunteer';
  return 'User';
}

export default function Navbar() {
  const { user, loading, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const accountBtnRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  // Handle outside click for account dropdown
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        accountBtnRef.current &&
        !accountBtnRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Handle keyboard Escape for dropdown and mobile drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (dropdownOpen) {
          setDropdownOpen(false);
          accountBtnRef.current?.focus();
        }
        if (mobileOpen) {
          setMobileOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dropdownOpen, mobileOpen]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMobileOpen(false);
    await signOut();
    navigate('/');
  };

  const closeMobile = () => {
    setMobileOpen(false);
  };

  const initials = getInitials(user);
  const role = user?.role || 'user';
  const roleLabel = getRoleLabel(role);
  const displayName = user?.full_name?.trim() || user?.email || 'User';

  return (
    <header className={`navbar ${isScrolled ? 'is-scrolled' : ''}`} role="banner">
      <div className="nav-container">
        <Link to="/" className="nav-brand" aria-label="Second Serve Home" onClick={closeMobile}>
          <img src="/images/logo.svg" alt="Second Serve Logo" width="180" height="40" />
        </Link>

        {/* Main Desktop Links */}
        <nav aria-label="Main Navigation">
          <ul className="nav-links">
            <li>
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`} end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/how-it-works" className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>
                How It Works
              </NavLink>
            </li>
            <li>
              <NavLink to="/impact" className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>
                Impact
              </NavLink>
            </li>
            <li>
              <NavLink to="/volunteer" className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>
                Volunteer
              </NavLink>
            </li>
            <li>
              <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>
                About Us
              </NavLink>
            </li>
            <li>
              <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>
                Contact
              </NavLink>
            </li>
          </ul>
        </nav>

        {/* Right Desktop Group: CTA + Auth */}
        <div className="nav-actions">
          <Link to="/report-food" className="btn-cta-report">
            Report Surplus Food
          </Link>

          <div className="nav-auth">
            {loading ? (
              <div className="nav-auth-loading-placeholder" aria-hidden="true" />
            ) : user ? (
              <div className="nav-account-container">
                <button
                  ref={accountBtnRef}
                  type="button"
                  className="nav-account-btn"
                  aria-label="Account menu"
                  aria-haspopup="menu"
                  aria-expanded={dropdownOpen}
                  onClick={() => setDropdownOpen(prev => !prev)}
                >
                  {initials}
                </button>

                {dropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="nav-account-dropdown"
                    role="menu"
                    aria-label="Account menu"
                  >
                    <div className="nav-dropdown-header">
                      <div className="nav-dropdown-name" title={displayName}>
                        {displayName}
                      </div>
                      <span className={`nav-dropdown-role-badge nav-dropdown-role-${role}`}>
                        {roleLabel}
                      </span>
                    </div>

                    <div className="nav-dropdown-menu">
                      <Link
                        to="/dashboard"
                        className="nav-dropdown-item"
                        role="menuitem"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <LayoutDashboard size={18} strokeWidth={1.75} aria-hidden="true" />
                        <span>Dashboard</span>
                      </Link>

                      {role === 'admin' && (
                        <Link
                          to="/admin"
                          className="nav-dropdown-item"
                          role="menuitem"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <ShieldCheck size={18} strokeWidth={1.75} aria-hidden="true" />
                          <span>Admin Panel</span>
                        </Link>
                      )}

                      <div className="nav-dropdown-divider" role="separator" />

                      <button
                        type="button"
                        className="nav-dropdown-item nav-dropdown-item-logout"
                        role="menuitem"
                        onClick={handleLogout}
                      >
                        <LogOut size={18} strokeWidth={1.75} aria-hidden="true" />
                        <span>Log out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="nav-logged-out-actions">
                <Link to="/login" className="nav-auth-login-link">
                  Log in
                </Link>
                <Link to="/signup" className="nav-auth-signup-btn">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="nav-toggle"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X size={24} strokeWidth={1.75} aria-hidden="true" />
          ) : (
            <Menu size={24} strokeWidth={1.75} aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      <div
        className={`mobile-nav ${mobileOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
        hidden={!mobileOpen}
      >
        <ul className="mobile-nav-links">
          <li>
            <NavLink to="/" className={({ isActive }) => `mobile-nav-link ${isActive ? 'is-active' : ''}`} onClick={closeMobile} end>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/how-it-works" className={({ isActive }) => `mobile-nav-link ${isActive ? 'is-active' : ''}`} onClick={closeMobile}>
              How It Works
            </NavLink>
          </li>
          <li>
            <NavLink to="/impact" className={({ isActive }) => `mobile-nav-link ${isActive ? 'is-active' : ''}`} onClick={closeMobile}>
              Impact
            </NavLink>
          </li>
          <li>
            <NavLink to="/volunteer" className={({ isActive }) => `mobile-nav-link ${isActive ? 'is-active' : ''}`} onClick={closeMobile}>
              Volunteer
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" className={({ isActive }) => `mobile-nav-link ${isActive ? 'is-active' : ''}`} onClick={closeMobile}>
              About Us
            </NavLink>
          </li>
          <li>
            <NavLink to="/contact" className={({ isActive }) => `mobile-nav-link ${isActive ? 'is-active' : ''}`} onClick={closeMobile}>
              Contact
            </NavLink>
          </li>
        </ul>

        <div className="mobile-nav-actions">
          <Link
            to="/report-food"
            className="btn-cta-report mobile-cta-btn"
            onClick={closeMobile}
          >
            Report Surplus Food
          </Link>

          {loading ? (
            <div className="mobile-auth-loading" aria-hidden="true" />
          ) : user ? (
            <div className="mobile-user-section">
              <div className="mobile-user-card">
                <div className="mobile-user-avatar">{initials}</div>
                <div className="mobile-user-meta">
                  <div className="mobile-user-name">{displayName}</div>
                  <span className={`nav-dropdown-role-badge nav-dropdown-role-${role}`}>
                    {roleLabel}
                  </span>
                </div>
              </div>

              <div className="mobile-user-links">
                <Link
                  to="/dashboard"
                  className="mobile-account-row"
                  onClick={closeMobile}
                >
                  <LayoutDashboard size={18} strokeWidth={1.75} aria-hidden="true" />
                  <span>Dashboard</span>
                </Link>

                {role === 'admin' && (
                  <Link
                    to="/admin"
                    className="mobile-account-row"
                    onClick={closeMobile}
                  >
                    <ShieldCheck size={18} strokeWidth={1.75} aria-hidden="true" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <button
                  type="button"
                  className="mobile-account-row mobile-account-row-logout"
                  onClick={handleLogout}
                >
                  <LogOut size={18} strokeWidth={1.75} aria-hidden="true" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mobile-auth-guest">
              <Link
                to="/login"
                className="btn btn-outline mobile-guest-btn"
                onClick={closeMobile}
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="nav-auth-signup-btn mobile-guest-btn"
                onClick={closeMobile}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
