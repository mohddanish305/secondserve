import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import { RequireAuth, RequireAdmin } from './context/AuthContext.jsx';

import Home from './pages/Home.jsx';

// Route-level code splitting per TRD Addendum A3
const HowItWorks = lazy(() => import('./pages/HowItWorks.jsx'));
const ReportFood = lazy(() => import('./pages/ReportFood.jsx'));
const Volunteer = lazy(() => import('./pages/Volunteer.jsx'));
const Impact = lazy(() => import('./pages/Impact.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Signup = lazy(() => import('./pages/Signup.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PageLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <div className="spinner" style={{ width: '32px', height: '32px', borderTopColor: 'var(--orange-500)', borderRightColor: 'transparent', borderBottomColor: 'var(--orange-500)', borderLeftColor: 'transparent' }} aria-label="Loading page…"></div>
    </div>
  );
}

export default function App() {
  return (
    <div className="site-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <ScrollToTop />
      <Navbar />
      <div style={{ flex: '1 0 auto' }}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/index.html" element={<Home />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/how-it-works.html" element={<HowItWorks />} />
            <Route path="/report-food" element={<ReportFood />} />
            <Route path="/report-food.html" element={<ReportFood />} />
            <Route path="/volunteer" element={<Volunteer />} />
            <Route path="/volunteer.html" element={<Volunteer />} />
            <Route path="/impact" element={<Impact />} />
            <Route path="/impact.html" element={<Impact />} />
            <Route path="/about" element={<About />} />
            <Route path="/about.html" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/contact.html" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login.html" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signup.html" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <Admin />
                </RequireAdmin>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
