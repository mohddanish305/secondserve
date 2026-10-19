/**
 * Second Serve — User & Volunteer Dashboard Controller (TRD §4.11)
 */

import { requireAuth } from "./auth.js";
import { updateProfile, myPickups, myAssignedPickups, myApplications, volunteerUpdateStatus } from "./api.js";
import { showToast } from "./main.js";

let currentUser = null;

async function initDashboard() {
  currentUser = await requireAuth();
  if (!currentUser) return;

  // 1. Populate Header
  const firstName = currentUser.full_name ? currentUser.full_name.split(' ')[0] : 'Friend';
  document.getElementById('user-greeting-name').textContent = firstName;
  document.getElementById('user-email-display').textContent = currentUser.email;

  const roleBadge = document.getElementById('user-role-badge');
  roleBadge.textContent = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
  if (currentUser.role === 'admin') {
    roleBadge.style.backgroundColor = 'var(--red-100)';
    roleBadge.style.color = 'var(--red-600)';

    // Add Admin button
    const headerActions = document.getElementById('header-action-buttons');
    const adminBtn = document.createElement('a');
    adminBtn.href = 'admin.html';
    adminBtn.className = 'btn btn-outline btn-small';
    adminBtn.textContent = '⚙️ Open Admin Dashboard';
    headerActions.prepend(adminBtn);
  } else if (currentUser.role === 'volunteer') {
    roleBadge.style.backgroundColor = 'var(--green-100)';
    roleBadge.style.color = 'var(--green-600)';
  }

  // 2. Profile Form
  document.getElementById('prof-name').value = currentUser.full_name || '';
  document.getElementById('prof-phone').value = currentUser.phone || '';
  document.getElementById('prof-email').value = currentUser.email || '';

  const profileForm = document.getElementById('profile-edit-form');
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = document.getElementById('prof-save-btn');
    const name = document.getElementById('prof-name').value.trim();
    const phone = document.getElementById('prof-phone').value.trim();

    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';

    try {
      await updateProfile(currentUser.id, { full_name: name, phone: phone || null });
      currentUser.full_name = name;
      currentUser.phone = phone;
      document.getElementById('user-greeting-name').textContent = name.split(' ')[0] || 'Friend';
      showToast("Profile updated successfully!", "success");
    } catch (err) {
      console.error("Profile update error", err);
      showToast("Could not update profile.", "error");
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Profile';
    }
  });

  // 3. Render Sections based on role
  if (currentUser.role === 'volunteer' || currentUser.role === 'admin') {
    document.getElementById('assigned-pickups-section').style.display = 'block';
    await renderAssignedPickups();
  } else {
    document.getElementById('volunteer-status-card').style.display = 'block';
    await renderVolunteerStatusCard();
  }

  await renderUserPickups();
  setupDeliveryModal();
}

// Render User's Reported Pickups
async function renderUserPickups() {
  const container = document.getElementById('user-pickups-list');
  container.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--muted);">Loading your requests…</div>`;

  try {
    const pickups = await myPickups(currentUser.id);
    if (!pickups || pickups.length === 0) {
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 3rem 2rem;">
          <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🍲</div>
          <h3 style="font-size: 1.25rem; margin-bottom: 0.5rem;">No Surplus Food Reported Yet</h3>
          <p style="font-size: 0.95rem; color: var(--ink-light); margin-bottom: 1.5rem;">
            When you report surplus banquet or event food, it will be tracked here in real time.
          </p>
          <a href="report-food.html" class="btn btn-primary">Report Surplus Food Now</a>
        </div>
      `;
      return;
    }

    const steps = ['reported', 'assigned', 'collected', 'delivered'];

    container.innerHTML = pickups.map(p => {
      const isCancelled = p.status === 'cancelled';
      const currentIndex = steps.indexOf(p.status);

      let timelineHtml = '';
      if (!isCancelled) {
        timelineHtml = `
          <div class="timeline" style="margin: 1.25rem 0 0.5rem 0;">
            ${steps.map((st, i) => {
              let cls = '';
              if (i < currentIndex) cls = 'is-complete';
              else if (i === currentIndex) cls = 'is-active';
              return `
                <div class="timeline-step ${cls}">
                  <div class="timeline-dot">${i < currentIndex ? '✓' : (i + 1)}</div>
                  <div class="timeline-label">${st.charAt(0).toUpperCase() + st.slice(1)}</div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }

      return `
        <article class="pickup-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;">
            <div>
              <span style="font-family: var(--font-head); font-weight: 700; font-size: 1.15rem; color: var(--orange-500);">${p.reference_id}</span>
              <h3 style="font-size: 1.1rem; margin: 0.25rem 0 0 0;">${p.organisation}</h3>
            </div>
            <span class="status-badge status-badge--${p.status}">${p.status}</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.5rem; font-size: 0.875rem; color: var(--ink-light); margin-bottom: 0.5rem;">
            <div>📍 <strong>City:</strong> ${p.city}</div>
            <div>👥 <strong>Quantity:</strong> Serves ~${p.quantity_people} people</div>
            <div>⏰ <strong>Pickup Time:</strong> ${new Date(p.pickup_time).toLocaleString('en-IN')}</div>
            <div>🥗 <strong>Food:</strong> ${p.food_type.toUpperCase()}</div>
          </div>

          ${p.notes ? `<div style="font-size: 0.85rem; color: var(--muted); font-style: italic; background: var(--cream); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); margin-top: 0.5rem;">Note: ${p.notes}</div>` : ''}
          ${timelineHtml}
        </article>
      `;
    }).join('');

  } catch (err) {
    console.error("Error loading pickups:", err);
    container.innerHTML = `<div class="banner banner-error">Could not load pickup requests.</div>`;
  }
}

// Render Volunteer's Assigned Pickups
async function renderAssignedPickups() {
  const container = document.getElementById('assigned-pickups-list');
  container.innerHTML = `<div style="text-align: center; padding: 1.5rem; color: var(--muted);">Loading assigned pickups…</div>`;

  try {
    const assigned = await myAssignedPickups(currentUser.id);
    if (!assigned || assigned.length === 0) {
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 2rem;">
          <p style="color: var(--muted); margin: 0;">No pickups currently assigned to you. Stand by for coordinator dispatch.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = assigned.map(p => {
      let actionButtons = '';
      if (p.status === 'assigned') {
        actionButtons = `
          <button class="btn btn-primary btn-small btn-mark-collected" data-id="${p.id}">
            ✓ Mark Collected
          </button>
        `;
      } else if (p.status === 'collected') {
        actionButtons = `
          <button class="btn btn-secondary btn-small btn-mark-delivered" data-id="${p.id}">
            ❤️ Mark Delivered
          </button>
        `;
      } else if (p.status === 'delivered') {
        actionButtons = `
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--green-600);">
            ✓ Delivered to ${p.delivered_to ? p.delivered_to.replace('_', ' ') : 'Shelter'}
          </span>
        `;
      }

      return `
        <article class="pickup-card" style="border-left: 4px solid var(--orange-500);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
            <div>
              <span style="font-weight: 700; color: var(--orange-500); font-size: 1.1rem;">${p.reference_id}</span>
              <h3 style="font-size: 1.1rem; margin: 0.2rem 0;">${p.organisation}</h3>
            </div>
            <span class="status-badge status-badge--${p.status}">${p.status}</span>
          </div>

          <div style="font-size: 0.9rem; color: var(--ink); margin-bottom: 0.5rem;">
            📍 <strong>Address:</strong> ${p.pickup_address}, ${p.city}
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.5rem; font-size: 0.85rem; color: var(--ink-light); margin-bottom: 1rem;">
            <div>👤 <strong>Contact:</strong> ${p.contact_name} (<a href="tel:${p.phone}">${p.phone}</a>)</div>
            <div>⏰ <strong>Pickup Time:</strong> ${new Date(p.pickup_time).toLocaleString('en-IN')}</div>
            <div>🍲 <strong>Quantity:</strong> ${p.quantity_people} meals (${p.food_type})</div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
            ${actionButtons}
          </div>
        </article>
      `;
    }).join('');

    // Attach event listeners to buttons
    container.querySelectorAll('.btn-mark-collected').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        btn.disabled = true;
        btn.textContent = 'Updating…';
        try {
          await volunteerUpdateStatus(id, 'collected');
          showToast("Status updated to Collected!", "success");
          await renderAssignedPickups();
          await renderUserPickups();
        } catch (err) {
          console.error("Error updating status", err);
          showToast("Failed updating status", "error");
          btn.disabled = false;
          btn.textContent = '✓ Mark Collected';
        }
      });
    });

    container.querySelectorAll('.btn-mark-delivered').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openDeliveryModal(id);
      });
    });

  } catch (err) {
    console.error("Error loading assigned pickups", err);
    container.innerHTML = `<div class="banner banner-error">Could not load assigned pickups.</div>`;
  }
}

// Modal management for destination delivery
function setupDeliveryModal() {
  const modal = document.getElementById('delivery-modal');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const form = document.getElementById('delivery-destination-form');

  cancelBtn.addEventListener('click', () => {
    modal.classList.remove('is-open');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('modal-pickup-id').value;
    const dest = document.getElementById('destination-select').value;
    if (!dest) {
      alert("Please select a destination");
      return;
    }

    const confirmBtn = document.getElementById('modal-confirm-btn');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Saving…';

    try {
      await volunteerUpdateStatus(id, 'delivered', dest);
      modal.classList.remove('is-open');
      showToast("Pickup confirmed Delivered! Impact count updated.", "success");
      await renderAssignedPickups();
      await renderUserPickups();
    } catch (err) {
      console.error("Delivery status error", err);
      showToast("Could not record delivery.", "error");
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Confirm Delivery';
    }
  });
}

function openDeliveryModal(pickupId) {
  const modal = document.getElementById('delivery-modal');
  document.getElementById('modal-pickup-id').value = pickupId;
  document.getElementById('destination-select').value = '';
  modal.classList.add('is-open');
}

// Volunteer application card for standard users
async function renderVolunteerStatusCard() {
  const container = document.getElementById('volunteer-status-content');
  try {
    const apps = await myApplications(currentUser.id, currentUser.email);
    if (!apps || apps.length === 0) {
      container.innerHTML = `
        <p style="font-size: 0.9rem; color: var(--ink-light); margin-bottom: 1rem;">
          Become a verified Food Hero and help rescue surplus banquet meals in your city.
        </p>
        <a href="volunteer.html" class="btn btn-secondary btn-small btn-block">Apply to Volunteer →</a>
      `;
    } else {
      const app = apps[0];
      const statusBadges = {
        pending: 'status-badge--assigned',
        approved: 'status-badge--delivered',
        rejected: 'status-badge--cancelled'
      };
      container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <span style="font-size: 0.85rem; font-weight: 600;">Status:</span>
          <span class="status-badge ${statusBadges[app.status] || ''}">${app.status}</span>
        </div>
        <p style="font-size: 0.85rem; color: var(--ink-light); margin-bottom: 0.5rem;">
          <strong>Role:</strong> ${app.preferred_role.replace('_', ' ').toUpperCase()} (${app.city})
        </p>
        <p style="font-size: 0.8rem; color: var(--muted); margin: 0;">
          Applied on ${new Date(app.created_at).toLocaleDateString('en-IN')}
        </p>
      `;
    }
  } catch (err) {
    console.warn("Could not load volunteer applications", err);
  }
}

// Auto-run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}
