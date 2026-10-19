/**
 * Second Serve — Authentication & Session Management (TRD v2.0 §4.10, §16.5)
 */

import { getClient } from "./supabase.js";
import { SUPABASE_URL } from "./config.js";
import { updateProfile } from "./api.js";

function isConfiguredRemote() {
  return SUPABASE_URL && !SUPABASE_URL.includes("second-serve-demo.supabase.co") && !SUPABASE_URL.includes("YOUR-PROJECT-REF");
}

const LOCAL_USER_KEY = 'SS_CURRENT_USER';

/**
 * Sign up with email, password, full name, and optional phone
 */
export async function signUp({ email, password, fullName, phone }) {
  if (isConfiguredRemote()) {
    const sb = await getClient();
    const { data, error } = await sb.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          full_name: fullName.trim()
        }
      }
    });
    if (error) throw error;

    if (data.user && phone) {
      try {
        await updateProfile(data.user.id, { phone: phone.trim() });
      } catch (e) {
        console.warn("Could not save profile phone during signup", e);
      }
    }
    return data;
  }

  // Local demo fallback
  const user = {
    id: 'user-' + Date.now(),
    email: email.trim(),
    full_name: fullName.trim(),
    phone: phone ? phone.trim() : null,
    role: 'user'
  };
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent('auth-changed', { detail: user }));
  return { user, session: { user } };
}

/**
 * Sign in with email and password
 */
export async function signIn(email, password) {
  if (isConfiguredRemote()) {
    const sb = await getClient();
    const { data, error } = await sb.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });
    if (error) throw error;
    return data;
  }

  // Demo fallback: if email has 'admin', role='admin'; if 'volunteer', role='volunteer'; else 'user'
  let role = 'user';
  if (email.toLowerCase().includes('admin')) role = 'admin';
  else if (email.toLowerCase().includes('volunteer')) role = 'volunteer';

  const user = {
    id: 'user-demo-' + (role === 'admin' ? 'admin' : '1'),
    email: email.trim(),
    full_name: role === 'admin' ? 'Sunita (Admin)' : (role === 'volunteer' ? 'Priya Sharma (Volunteer)' : 'Ravi Manager'),
    phone: '9876543210',
    role: role
  };
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new CustomEvent('auth-changed', { detail: user }));
  return { user, session: { user } };
}

/**
 * Sign out
 */
export async function signOut() {
  if (isConfiguredRemote()) {
    try {
      const sb = await getClient();
      await sb.auth.signOut();
    } catch(e) {}
  }
  localStorage.removeItem(LOCAL_USER_KEY);
  window.dispatchEvent(new CustomEvent('auth-changed', { detail: null }));
  window.location.href = 'index.html';
}

/**
 * Get current session and profile
 */
export async function getSession() {
  if (isConfiguredRemote()) {
    try {
      const sb = await getClient();
      const { data: { session }, error } = await sb.auth.getSession();
      if (error || !session) return null;

      const { data: profile } = await sb.from('profiles').select('*').eq('id', session.user.id).single();
      return {
        user: {
          id: session.user.id,
          email: session.user.email,
          full_name: profile?.full_name || session.user.user_metadata?.full_name || '',
          phone: profile?.phone || '',
          role: profile?.role || 'user'
        }
      };
    } catch (e) {
      console.warn("Error getting remote session", e);
    }
  }

  const localUser = localStorage.getItem(LOCAL_USER_KEY);
  if (localUser) {
    try {
      return { user: JSON.parse(localUser) };
    } catch(e) {}
  }
  return null;
}

/**
 * Listen for auth state changes
 */
export async function onAuthChange(callback) {
  if (isConfiguredRemote()) {
    try {
      const sb = await getClient();
      sb.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          const profile = await getSession();
          callback(profile ? profile.user : null);
        } else {
          callback(null);
        }
      });
      return;
    } catch (e) {}
  }

  window.addEventListener('auth-changed', (e) => {
    callback(e.detail);
  });
}

/**
 * Guard for protected pages (dashboard)
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session || !session.user) {
    const current = encodeURIComponent(window.location.pathname.split('/').pop() || 'dashboard.html');
    window.location.href = `login.html?next=${current}`;
    return null;
  }
  return session.user;
}

/**
 * Guard for admin-only pages
 */
export async function requireAdmin() {
  const user = await requireAuth();
  if (!user) return null;
  if (user.role !== 'admin') {
    alert("Admins only. Redirecting to your dashboard.");
    window.location.href = 'dashboard.html';
    return null;
  }
  return user;
}

/**
 * Update navbar auth area dynamically
 */
export async function updateNavbarAuth() {
  const authContainers = document.querySelectorAll('.nav-auth, .mobile-nav-actions');
  const session = await getSession();
  const user = session?.user;

  authContainers.forEach(container => {
    container.innerHTML = '';
    if (user) {
      if (user.role === 'admin') {
        const adminLink = document.createElement('a');
        adminLink.href = 'admin.html';
        adminLink.className = 'btn btn-outline btn-small';
        adminLink.textContent = 'Admin Panel';
        container.appendChild(adminLink);
      }

      const dashLink = document.createElement('a');
      dashLink.href = 'dashboard.html';
      dashLink.className = 'btn btn-secondary btn-small';
      dashLink.textContent = 'Dashboard';
      container.appendChild(dashLink);

      const logoutBtn = document.createElement('button');
      logoutBtn.className = 'btn btn-outline btn-small';
      logoutBtn.textContent = 'Log out';
      logoutBtn.onclick = () => signOut();
      container.appendChild(logoutBtn);
    } else {
      const loginLink = document.createElement('a');
      loginLink.href = 'login.html';
      loginLink.className = 'nav-auth-link';
      loginLink.textContent = 'Log in';

      const signupLink = document.createElement('a');
      signupLink.href = 'signup.html';
      signupLink.className = 'btn btn-secondary btn-small';
      signupLink.textContent = 'Sign up';

      container.appendChild(loginLink);
      container.appendChild(signupLink);
    }
  });
}

// Auto-init navbar auth on import
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateNavbarAuth);
  } else {
    updateNavbarAuth();
  }
}
