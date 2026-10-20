/**
 * Second Serve — Database API Layer (TRD v2.0 §16.4)
 * React Vite migrated version: uses npm @supabase/supabase-js
 * Identical function names, parameters, and return signatures.
 */

import { getClient, SUPABASE_URL, isConfiguredRemote } from "./supabase.js";

// Hardcoded Baseline & Series Fallbacks (TRD §4.1, §4.5, §16.4)
export const BASELINE_STATS = {
  meals_rescued: 320000,
  food_waste_kg: 96000,
  partner_restaurants: 210,
  volunteers: 850,
  cities: 6,
  live_deliveries: 0
};

export const FALLBACK_MONTHLY_SERIES = [
  { sort_order: 1, month_label: 'Nov', meals: 5000 },
  { sort_order: 2, month_label: 'Dec', meals: 5500 },
  { sort_order: 3, month_label: 'Jan', meals: 6500 },
  { sort_order: 4, month_label: 'Feb', meals: 7000 },
  { sort_order: 5, month_label: 'Mar', meals: 8000 },
  { sort_order: 6, month_label: 'Apr', meals: 9000 },
  { sort_order: 7, month_label: 'May', meals: 9500 },
  { sort_order: 8, month_label: 'Jun', meals: 10500 },
  { sort_order: 9, month_label: 'Jul', meals: 11500 },
  { sort_order: 10, month_label: 'Aug', meals: 12500 },
  { sort_order: 11, month_label: 'Sep', meals: 14000 },
  { sort_order: 12, month_label: 'Oct', meals: 15500 }
];

export const FALLBACK_DESTINATIONS = [
  { name: 'Night shelters', pct: 45 },
  { name: 'Community kitchens', pct: 30 },
  { name: 'Slum kitchens', pct: 25 }
];

const DEMO_STORE_KEY = 'SS_DEMO_DATA_V2';

function getDemoStore() {
  if (typeof window === 'undefined') return { pickups: [], volunteers: [], applications: [], messages: [], subscribers: [] };
  const existing = localStorage.getItem(DEMO_STORE_KEY);
  if (existing) {
    try { return JSON.parse(existing); } catch(e) {}
  }
  const initial = {
    ref_seq: 1006,
    pickups: [
      {
        id: "d101-uuid",
        reference_id: "SS-2026-1001",
        contact_name: "Ravi Sharma",
        phone: "9876543210",
        organisation: "Grand Heritage Banquets",
        pickup_address: "B-42, Ring Road, Laxmi Nagar",
        city: "Delhi NCR",
        food_type: "veg",
        quantity_people: 180,
        pickup_time: new Date(Date.now() + 3600000 * 2).toISOString(),
        notes: "Untouched buffet food, packed in stainless steel trays.",
        status: "delivered",
        assigned_volunteer: "vol-001",
        delivered_to: "night_shelter",
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: "d102-uuid",
        reference_id: "SS-2026-1002",
        contact_name: "Anita Mehra",
        phone: "9811223344",
        organisation: "Spice Garden Restaurant",
        pickup_address: "Shop 12, Indiranagar 100ft Road",
        city: "Bengaluru",
        food_type: "both",
        quantity_people: 85,
        pickup_time: new Date(Date.now() + 3600000 * 4).toISOString(),
        notes: "Rice, dal, paneer and chicken curry untouched from lunch service.",
        status: "collected",
        assigned_volunteer: "vol-001",
        delivered_to: null,
        created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: "d103-uuid",
        reference_id: "SS-2026-1003",
        contact_name: "Karan Johar",
        phone: "9820011223",
        organisation: "Sea View Caterers",
        pickup_address: "Plot 88, Juhu Tara Road",
        city: "Mumbai",
        food_type: "veg",
        quantity_people: 250,
        pickup_time: new Date(Date.now() + 3600000 * 5).toISOString(),
        notes: "Wedding reception surplus.",
        status: "reported",
        assigned_volunteer: null,
        delivered_to: null,
        created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 1).toISOString()
      }
    ],
    volunteers: [
      { id: "vol-001", full_name: "Priya Sharma", email: "priya.volunteer@example.com", role: "volunteer" },
      { id: "vol-002", full_name: "Amit Patel", email: "amit.patel@example.com", role: "volunteer" }
    ],
    applications: [
      {
        id: "app-101",
        full_name: "Priya Sharma",
        email: "priya.volunteer@example.com",
        phone: "9876500001",
        city: "Delhi NCR",
        preferred_role: "food_hero",
        availability: ["weekends", "evenings"],
        motivation: "Passionate about zero food waste in my city.",
        status: "approved",
        created_at: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        id: "app-102",
        full_name: "Rahul Verma",
        email: "rahul.v@example.com",
        phone: "9876500002",
        city: "Mumbai",
        preferred_role: "shelter_coordinator",
        availability: ["weekdays"],
        motivation: "College student with free mornings.",
        status: "pending",
        created_at: new Date(Date.now() - 86400000 * 1).toISOString()
      }
    ],
    messages: [
      {
        id: "msg-101",
        full_name: "Karan Singhania",
        email: "karan@example.com",
        subject: "csr",
        message: "We would like to discuss corporate CSR partnership for funding cold-chain electric vans in Delhi.",
        is_read: false,
        created_at: new Date(Date.now() - 3600000 * 6).toISOString()
      }
    ],
    subscribers: [
      { id: "sub-101", email: "anita.donor@example.com", created_at: new Date().toISOString() }
    ]
  };
  localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(initial));
  return initial;
}

function saveDemoStore(store) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DEMO_STORE_KEY, JSON.stringify(store));
  }
}

/* =====================================================================
   1. PUBLIC FUNCTIONS
   ===================================================================== */

export async function getImpactStats() {
  if (isConfiguredRemote()) {
    try {
      const sb = getClient();
      const { data, error } = await sb.rpc('get_impact_stats');
      if (!error && data) return data;
    } catch (e) {
      console.warn("Failed fetching live stats from Supabase, using fallback:", e);
    }
  }

  const store = getDemoStore();
  const delivered = store.pickups.filter(p => p.status === 'delivered');
  const deliveredMeals = delivered.reduce((sum, p) => sum + (p.quantity_people || 0), 0);
  const distinctOrgs = new Set(delivered.map(p => p.organisation.toLowerCase())).size;

  return {
    meals_rescued: BASELINE_STATS.meals_rescued + deliveredMeals,
    food_waste_kg: Math.round((BASELINE_STATS.meals_rescued + deliveredMeals) * 0.3),
    partner_restaurants: BASELINE_STATS.partner_restaurants + distinctOrgs,
    volunteers: BASELINE_STATS.volunteers + (store.volunteers?.length || 0),
    cities: BASELINE_STATS.cities,
    live_deliveries: delivered.length
  };
}

export async function getImpactSeries() {
  if (isConfiguredRemote()) {
    try {
      const sb = getClient();
      const [monthlyRes, destRes] = await Promise.all([
        sb.from('impact_monthly').select('*').order('sort_order'),
        sb.from('impact_destinations').select('*')
      ]);
      if (!monthlyRes.error && !destRes.error && monthlyRes.data.length && destRes.data.length) {
        return { monthly: monthlyRes.data, destinations: destRes.data };
      }
    } catch (e) {
      console.warn("Failed fetching impact series, using fallback:", e);
    }
  }
  return {
    monthly: FALLBACK_MONTHLY_SERIES,
    destinations: FALLBACK_DESTINATIONS
  };
}

export async function submitPickup(values) {
  if (isConfiguredRemote()) {
    const sb = getClient();
    const { data, error } = await sb.rpc('submit_pickup', {
      p_name: values.p_name,
      p_phone: values.p_phone,
      p_organisation: values.p_organisation,
      p_address: values.p_address,
      p_city: values.p_city,
      p_food_type: values.p_food_type,
      p_quantity: parseInt(values.p_quantity, 10),
      p_pickup_time: new Date(values.p_pickup_time).toISOString(),
      p_notes: values.p_notes || null
    });
    if (error) throw error;
    return data;
  }

  // Server-side constraints check mirroring schema.sql
  if (new Date(values.p_pickup_time) <= new Date()) {
    const err = new Error("Pickup time must be in the future");
    err.code = '22023';
    throw err;
  }
  const qty = parseInt(values.p_quantity, 10);
  if (isNaN(qty) || qty < 10 || qty > 5000) {
    const err = new Error("Quantity must be between 10 and 5000");
    err.code = '22023';
    throw err;
  }
  if (!/^[6-9]\d{9}$/.test(values.p_phone.trim())) {
    const err = new Error("Phone number must be a 10-digit number starting with 6–9");
    err.code = '22023';
    throw err;
  }

  const store = getDemoStore();
  const nextSeq = store.ref_seq || 1006;
  const refId = `SS-${new Date().getFullYear()}-${nextSeq}`;
  store.ref_seq = nextSeq + 1;

  let currentUserId = null;
  try {
    const user = JSON.parse(localStorage.getItem('SS_CURRENT_USER') || 'null');
    if (user) currentUserId = user.id;
  } catch(e) {}

  const newPickup = {
    id: 'pk-' + Date.now(),
    reference_id: refId,
    user_id: currentUserId,
    contact_name: values.p_name.trim(),
    phone: values.p_phone.trim(),
    organisation: values.p_organisation.trim(),
    pickup_address: values.p_address.trim(),
    city: values.p_city,
    food_type: values.p_food_type,
    quantity_people: parseInt(values.p_quantity, 10),
    pickup_time: new Date(values.p_pickup_time).toISOString(),
    notes: values.p_notes ? values.p_notes.trim() : null,
    status: 'reported',
    assigned_volunteer: null,
    delivered_to: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  store.pickups.unshift(newPickup);
  saveDemoStore(store);
  return refId;
}

export async function trackPickup(ref, phone) {
  if (isConfiguredRemote()) {
    const sb = getClient();
    const { data, error } = await sb.rpc('track_pickup', {
      p_ref: ref.trim().toUpperCase(),
      p_phone: phone.trim()
    });
    if (error) throw error;
    return data;
  }

  const store = getDemoStore();
  const cleanRef = ref.trim().toUpperCase();
  const cleanPhone = phone.trim();
  const match = store.pickups.find(p => p.reference_id === cleanRef && p.phone === cleanPhone);

  if (!match) return [];
  return [{
    reference_id: match.reference_id,
    status: match.status,
    organisation: match.organisation,
    city: match.city,
    pickup_time: match.pickup_time,
    updated_at: match.updated_at
  }];
}

export async function submitVolunteerApplication(values) {
  if (isConfiguredRemote()) {
    const sb = getClient();
    const { error } = await sb.from('volunteer_applications').insert({
      full_name: values.full_name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      city: values.city,
      preferred_role: values.preferred_role,
      availability: values.availability,
      motivation: values.motivation ? values.motivation.trim() : null
    });
    if (error) throw error;
    return true;
  }

  const store = getDemoStore();
  let currentUserId = null;
  try {
    const user = JSON.parse(localStorage.getItem('SS_CURRENT_USER') || 'null');
    if (user) currentUserId = user.id;
  } catch(e) {}

  store.applications.unshift({
    id: 'app-' + Date.now(),
    user_id: currentUserId,
    full_name: values.full_name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    city: values.city,
    preferred_role: values.preferred_role,
    availability: values.availability,
    motivation: values.motivation ? values.motivation.trim() : null,
    status: 'pending',
    created_at: new Date().toISOString()
  });
  saveDemoStore(store);
  return true;
}

export async function submitContact(values) {
  if (isConfiguredRemote()) {
    const sb = getClient();
    const { error } = await sb.from('contact_messages').insert({
      full_name: values.full_name.trim(),
      email: values.email.trim(),
      subject: values.subject,
      message: values.message.trim()
    });
    if (error) throw error;
    return true;
  }

  if (values.message.trim().length < 20 || values.message.trim().length > 2000) {
    const err = new Error("Message must be between 20 and 2000 characters");
    err.code = '22023';
    throw err;
  }

  const store = getDemoStore();
  store.messages.unshift({
    id: 'msg-' + Date.now(),
    full_name: values.full_name.trim(),
    email: values.email.trim(),
    subject: values.subject,
    message: values.message.trim(),
    is_read: false,
    created_at: new Date().toISOString()
  });
  saveDemoStore(store);
  return true;
}

export async function subscribeNewsletter(email) {
  const cleanEmail = email.trim().toLowerCase();
  if (isConfiguredRemote()) {
    const sb = getClient();
    const { error } = await sb.from('newsletter_subscribers').insert({ email: cleanEmail });
    if (error) {
      if (error.code === '23505') return { duplicate: true };
      throw error;
    }
    return { success: true };
  }

  const store = getDemoStore();
  const exists = store.subscribers.some(s => s.email.toLowerCase() === cleanEmail);
  if (exists) {
    return { duplicate: true };
  }
  store.subscribers.unshift({
    id: 'sub-' + Date.now(),
    email: cleanEmail,
    created_at: new Date().toISOString()
  });
  saveDemoStore(store);
  return { success: true };
}

/* =====================================================================
   2. SIGNED-IN / USER & VOLUNTEER FUNCTIONS
   ===================================================================== */

export async function updateProfile(uid, { full_name, phone }) {
  if (isConfiguredRemote()) {
    const sb = getClient();
    const { error } = await sb.from('profiles').update({
      full_name: full_name ? full_name.trim() : undefined,
      phone: phone ? phone.trim() : null
    }).eq('id', uid);
    if (error) throw error;
    return true;
  }

  const user = JSON.parse(localStorage.getItem('SS_CURRENT_USER') || '{}');
  if (full_name) user.full_name = full_name.trim();
  if (phone) user.phone = phone.trim();
  localStorage.setItem('SS_CURRENT_USER', JSON.stringify(user));
  return true;
}

export async function myPickups(uid) {
  if (isConfiguredRemote()) {
    const sb = getClient();
    const { data, error } = await sb.from('pickup_requests')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  const store = getDemoStore();
  return store.pickups.filter(p => p.user_id === uid || p.user_id === null);
}

export async function myAssignedPickups(uid) {
  if (isConfiguredRemote()) {
    const sb = getClient();
    const { data, error } = await sb.from('pickup_requests')
      .select('*')
      .eq('assigned_volunteer', uid)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  const store = getDemoStore();
  return store.pickups.filter(p => p.assigned_volunteer === uid || p.assigned_volunteer === 'vol-001');
}

export async function myApplications(uid, email) {
  if (isConfiguredRemote()) {
    const sb = getClient();
    const { data, error } = await sb.from('volunteer_applications')
      .select('*')
      .or(`user_id.eq.${uid},email.eq.${email}`);
    if (error) throw error;
    return data || [];
  }

  const store = getDemoStore();
  return store.applications.filter(a => a.user_id === uid || (email && a.email.toLowerCase() === email.toLowerCase()));
}

export async function volunteerUpdateStatus(id, status, deliveredTo) {
  if (isConfiguredRemote()) {
    const sb = getClient();
    const { error } = await sb.rpc('volunteer_update_status', {
      p_id: id,
      p_status: status,
      p_delivered_to: deliveredTo || null
    });
    if (error) throw error;
    return true;
  }

  const store = getDemoStore();
  const pickup = store.pickups.find(p => p.id === id);
  if (!pickup) throw new Error("Pickup not found");
  if (!((pickup.status === 'assigned' && status === 'collected') || (pickup.status === 'collected' && status === 'delivered'))) {
    const err = new Error("Invalid status change");
    err.code = '22023';
    throw err;
  }
  if (status === 'delivered' && !deliveredTo) {
    throw new Error("Delivery destination is required");
  }
  pickup.status = status;
  if (status === 'delivered') {
    pickup.delivered_to = deliveredTo;
  }
  pickup.updated_at = new Date().toISOString();
  saveDemoStore(store);
  return true;
}

/* =====================================================================
   3. ADMIN FUNCTIONS (TRD §4.12, §16.4)
   ===================================================================== */

export async function adminCounts() {
  if (isConfiguredRemote()) {
    const sb = getClient();
    const [reportedRes, inProgressRes, deliveredRes, pendingAppsRes, unreadMsgRes] = await Promise.all([
      sb.from('pickup_requests').select('*', { count: 'exact', head: true }).eq('status', 'reported'),
      sb.from('pickup_requests').select('*', { count: 'exact', head: true }).in('status', ['assigned', 'collected']),
      sb.from('pickup_requests').select('*', { count: 'exact', head: true }).eq('status', 'delivered'),
      sb.from('volunteer_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      sb.from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false)
    ]);
    return {
      new_requests: reportedRes.count || 0,
      in_progress: inProgressRes.count || 0,
      delivered: deliveredRes.count || 0,
      pending_apps: pendingAppsRes.count || 0,
      unread_messages: unreadMsgRes.count || 0
    };
  }

  const store = getDemoStore();
  return {
    new_requests: store.pickups.filter(p => p.status === 'reported').length,
    in_progress: store.pickups.filter(p => p.status === 'assigned' || p.status === 'collected').length,
    delivered: store.pickups.filter(p => p.status === 'delivered').length,
    pending_apps: store.applications.filter(a => a.status === 'pending').length,
    unread_messages: store.messages.filter(m => !m.is_read).length
  };
}

export async function adminListPickups({ status, city, page = 0 }) {
  if (isConfiguredRemote()) {
    const sb = getClient();
    let query = sb.from('pickup_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .range(page * 25, page * 25 + 24);


    if (status && status !== 'all') query = query.eq('status', status);
    if (city && city !== 'all') query = query.eq('city', city);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  const store = getDemoStore();
  let filtered = [...store.pickups];
  if (status && status !== 'all') filtered = filtered.filter(p => p.status === status);
  if (city && city !== 'all') filtered = filtered.filter(p => p.city === city);
  return filtered.slice(page * 25, (page + 1) * 25);
}

export async function adminListVolunteers() {
  if (isConfiguredRemote()) {
    const sb = getClient();
    const { data, error } = await sb.from('profiles').select('id, full_name, email').eq('role', 'volunteer');
    if (error) throw error;
    return data || [];
  }

  const store = getDemoStore();
  return store.volunteers || [];
}

export async function adminAssignPickup(id, volunteerId) {
  if (isConfiguredRemote()) {
    const sb = getClient();
    const { error } = await sb.from('pickup_requests')
      .update({ assigned_volunteer: volunteerId, status: 'assigned' })
      .eq('id', id);
    if (error) throw error;
    return true;
  }

  const store = getDemoStore();
  const pickup = store.pickups.find(p => p.id === id);
  if (!pickup) throw new Error("Pickup not found");
  pickup.assigned_volunteer = volunteerId;
  pickup.status = 'assigned';
  pickup.updated_at = new Date().toISOString();
  saveDemoStore(store);
  return true;
}

export async function adminSetPickupStatus(id, status, deliveredTo) {
  if (isConfiguredRemote()) {
    const sb = getClient();
    const payload = { status };
    if (status === 'delivered') payload.delivered_to = deliveredTo;
    const { error } = await sb.from('pickup_requests').update(payload).eq('id', id);
    if (error) throw error;
    return true;
  }

  const store = getDemoStore();
  const pickup = store.pickups.find(p => p.id === id);
  if (!pickup) throw new Error("Pickup not found");
  pickup.status = status;
  if (status === 'delivered') pickup.delivered_to = deliveredTo;
  pickup.updated_at = new Date().toISOString();
  saveDemoStore(store);
  return true;
}

export async function adminListApplications() {
  if (isConfiguredRemote()) {
    const sb = getClient();
    const { data, error } = await sb.from('volunteer_applications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  const store = getDemoStore();
  return store.applications || [];
}

export async function adminReviewApplication(id, approve) {
  if (isConfiguredRemote()) {
    const sb = getClient();
    const { error } = await sb.rpc('review_volunteer_application', {
      p_id: id,
      p_approve: approve
    });
    if (error) throw error;
    return true;
  }

  const store = getDemoStore();
  const app = store.applications.find(a => a.id === id);
  if (!app) throw new Error("Application not found");
  app.status = approve ? 'approved' : 'rejected';

  if (approve) {
    const volExists = store.volunteers.some(v => v.email.toLowerCase() === app.email.toLowerCase());
    if (!volExists) {
      store.volunteers.push({
        id: app.user_id || 'vol-' + Date.now(),
        full_name: app.full_name,
        email: app.email,
        role: 'volunteer'
      });
    }
  }
  saveDemoStore(store);
  return true;
}

export async function adminListMessages() {
  if (isConfiguredRemote()) {
    const sb = getClient();
    const { data, error } = await sb.from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  const store = getDemoStore();
  return store.messages || [];
}

export async function adminMarkMessageRead(id) {
  if (isConfiguredRemote()) {
    const sb = getClient();
    const { error } = await sb.from('contact_messages').update({ is_read: true }).eq('id', id);
    if (error) throw error;
    return true;
  }

  const store = getDemoStore();
  const msg = store.messages.find(m => m.id === id);
  if (msg) msg.is_read = true;
  saveDemoStore(store);
  return true;
}

export async function adminListSubscribers() {
  if (isConfiguredRemote()) {
    const sb = getClient();
    const { data, error } = await sb.from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  const store = getDemoStore();
  return store.subscribers || [];
}
