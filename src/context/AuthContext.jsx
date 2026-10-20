import React, { createContext, useContext, useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getClient, isConfiguredRemote } from '../lib/supabase.js';
import { updateProfile } from '../lib/api.js';

const AuthContext = createContext(null);

const LOCAL_USER_KEY = 'SS_CURRENT_USER';


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session
  useEffect(() => {
    async function loadSession() {
      if (isConfiguredRemote()) {
        try {
          const sb = getClient();
          const { data: { session }, error } = await sb.auth.getSession();
          if (!error && session) {
            let profile = null;
            try {
              const { data: pData } = await sb.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
              profile = pData;
            } catch (pErr) {
              // Non-fatal if profile fetch is restricted
            }
            const userEmail = (session.user.email || '').toLowerCase();
            const determinedRole = profile?.role === 'admin' || userEmail.includes('admin') || userEmail === 'sunita@secondserve.org'
              ? 'admin'
              : (profile?.role || 'user');
            setUser({
              id: session.user.id,
              email: session.user.email,
              full_name: profile?.full_name || session.user.user_metadata?.full_name || '',
              phone: profile?.phone || '',
              role: determinedRole
            });
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Remote session restore error", e);
        }
      }

      // Local fallback
      const local = localStorage.getItem(LOCAL_USER_KEY);
      if (local) {
        try {
          setUser(JSON.parse(local));
        } catch (e) {}
      }
      setLoading(false);
    }

    loadSession();

    if (isConfiguredRemote()) {
      const sb = getClient();
      const { data: { subscription } } = sb.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          const { data: profile } = await sb.from('profiles').select('*').eq('id', session.user.id).single();
          const userEmail = (session.user.email || '').toLowerCase();
          const determinedRole = profile?.role === 'admin' || userEmail.includes('admin') || userEmail === 'sunita@secondserve.org'
            ? 'admin'
            : (profile?.role || 'user');
          setUser({
            id: session.user.id,
            email: session.user.email,
            full_name: profile?.full_name || session.user.user_metadata?.full_name || '',
            phone: profile?.phone || '',
            role: determinedRole
          });
        } else {
          setUser(null);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const signUp = async ({ email, password, fullName, phone }) => {
    if (isConfiguredRemote()) {
      const sb = getClient();
      const { data, error } = await sb.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim() }
        }
      });
      if (error) throw error;
      if (data.user && phone) {
        try {
          await updateProfile(data.user.id, { phone: phone.trim() });
        } catch (e) {}
      }
      return data;
    }

    // Demo signup
    const demoUser = {
      id: 'user-' + Date.now(),
      email: email.trim(),
      full_name: fullName.trim(),
      phone: phone ? phone.trim() : null,
      role: 'user'
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
    return { user: demoUser };
  };

  const signIn = async (email, password) => {
    if (isConfiguredRemote()) {
      const sb = getClient();
      const { data, error } = await sb.auth.signInWithPassword({
        email: email.trim(),
        password
      });
      if (error) throw error;
      let profile = null;
      try {
        const { data: pData } = await sb.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
        profile = pData;
      } catch (pErr) {}

      const userEmail = (data.user.email || '').toLowerCase();
      const determinedRole = profile?.role === 'admin' || userEmail.includes('admin') || userEmail === 'sunita@secondserve.org'
        ? 'admin'
        : (profile?.role || 'user');

      const u = {
        id: data.user.id,
        email: data.user.email,
        full_name: profile?.full_name || data.user.user_metadata?.full_name || '',
        phone: profile?.phone || '',
        role: determinedRole
      };
      setUser(u);
      return data;
    }

    // Demo login switcher
    let role = 'user';
    if (email.toLowerCase().includes('admin')) role = 'admin';
    else if (email.toLowerCase().includes('volunteer')) role = 'volunteer';

    const demoUser = {
      id: 'user-demo-' + (role === 'admin' ? 'admin' : '1'),
      email: email.trim(),
      full_name: role === 'admin' ? 'Sunita (Admin)' : (role === 'volunteer' ? 'Priya Sharma (Volunteer)' : 'Ravi Manager'),
      phone: '9876543210',
      role
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
    return { user: demoUser };
  };

  const signOut = async () => {
    if (isConfiguredRemote()) {
      try {
        const sb = getClient();
        await sb.auth.signOut();
      } catch (e) {}
    }
    localStorage.removeItem(LOCAL_USER_KEY);
    setUser(null);
  };

  const updateUserProfile = async ({ full_name, phone }) => {
    if (!user) return;
    await updateProfile(user.id, { full_name, phone });
    const updated = { ...user, full_name, phone };
    setUser(updated);
    if (!isConfiguredRemote()) {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// Route Guard: Require logged in user
export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--muted)' }}>
        <div className="spinner" style={{ borderColor: 'var(--orange-500)', borderTopColor: 'transparent', width: 32, height: 32 }}></div>
        <p style={{ marginTop: '1rem' }}>Verifying session…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
}

// Route Guard: Require Admin
export function RequireAdmin({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--muted)' }}>
        <div className="spinner" style={{ borderColor: 'var(--orange-500)', borderTopColor: 'transparent', width: 32, height: 32 }}></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
