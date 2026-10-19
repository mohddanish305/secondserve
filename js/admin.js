/**
 * Second Serve — Admin Operations Console Controller (TRD §4.12)
 * Full database management for Pickups, Applications, Messages, and Subscribers.
 * Uses textContent exclusively for user data to prevent XSS attacks.
 */

import { requireAdmin, signOut } from "./auth.js";
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
} from "./api.js";
import { showToast } from "./main.js";

let currentPage = 0;
let approvedVolunteers = [];

async function initAdmin() {
  const admin = await requireAdmin();
  if (!admin) return;

  // Logout button
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => signOut());

  // Setup Tabs
  setupTabs();

  // Load Initial Counts & Volunteers
  await loadCounts();
  try {
    approvedVolunteers = await adminListVolunteers();
  } catch(e) {
    console.warn("Could not load volunteers", e);
  }

  // Load Pickups tab by default
  await loadPickups();

  // Setup Filters & Pagination
  document.getElementById('filter-status').addEventListener('change', () => {
    currentPage = 0;
    loadPickups();
  });
  document.getElementById('filter-city').addEventListener('change', () => {
    currentPage = 0;
    loadPickups();
  });
  document.getElementById('refresh-pickups-btn').addEventListener('click', () => loadPickups());

  document.getElementById('prev-page-btn').addEventListener('click', () => {
    if (currentPage > 0) {
      currentPage--;
      loadPickups();
    }
  });
  document.getElementById('next-page-btn').addEventListener('click', () => {
    currentPage++;
    loadPickups();
  });

  // Setup Tab Refresh Buttons
  document.getElementById('refresh-volunteers-btn').addEventListener('click', () => loadApplications());
  document.getElementById('refresh-messages-btn').addEventListener('click', () => loadMessages());
  document.getElementById('refresh-subscribers-btn').addEventListener('click', () => loadSubscribers());

  // Setup CSV download
  document.getElementById('download-csv-btn').addEventListener('click', downloadSubscribersCSV);

  // Setup Modal
  setupAdminModal();
}

// 1. Load Metric Counts
async function loadCounts() {
  try {
    const counts = await adminCounts();
    document.getElementById('count-reported').textContent = counts.new_requests || 0;
    document.getElementById('count-in-progress').textContent = counts.in_progress || 0;
    document.getElementById('count-delivered').textContent = counts.delivered || 0;
    document.getElementById('count-pending-volunteers').textContent = counts.pending_apps || 0;
    document.getElementById('count-unread-messages').textContent = counts.unread_messages || 0;
  } catch (err) {
    console.warn("Could not load admin counts", err);
  }
}

// 2. Setup Tabs
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => p.classList.remove('is-active'));

      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');
      const targetId = btn.getAttribute('aria-controls');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) targetPanel.classList.add('is-active');

      if (targetId === 'panel-volunteers') loadApplications();
      else if (targetId === 'panel-messages') loadMessages();
      else if (targetId === 'panel-subscribers') loadSubscribers();
      else if (targetId === 'panel-pickups') loadPickups();
    });
  });
}

// 3. Load & Render Pickups Table
async function loadPickups() {
  const tbody = document.getElementById('pickups-table-body');
  tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 2rem;">Loading pickups…</td></tr>`;

  const status = document.getElementById('filter-status').value;
  const city = document.getElementById('filter-city').value;

  try {
    const pickups = await adminListPickups({ status, city, page: currentPage });
    tbody.innerHTML = '';

    if (!pickups || pickups.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 2rem; color: var(--muted);">No pickups matching criteria.</td></tr>`;
      document.getElementById('next-page-btn').disabled = true;
      return;
    }

    document.getElementById('prev-page-btn').disabled = (currentPage === 0);
    document.getElementById('next-page-btn').disabled = (pickups.length < 25);
    document.getElementById('page-indicator').textContent = `Page ${currentPage + 1}`;

    pickups.forEach(p => {
      const tr = document.createElement('tr');

      // Reference ID
      const tdRef = document.createElement('td');
      tdRef.className = 'bold';
      tdRef.style.color = 'var(--orange-500)';
      tdRef.textContent = p.reference_id;
      tr.appendChild(tdRef);

      // Created
      const tdDate = document.createElement('td');
      tdDate.textContent = new Date(p.created_at).toLocaleDateString('en-IN');
      tr.appendChild(tdDate);

      // Org
      const tdOrg = document.createElement('td');
      tdOrg.className = 'bold';
      tdOrg.textContent = p.organisation;
      tr.appendChild(tdOrg);

      // Contact
      const tdContact = document.createElement('td');
      tdContact.textContent = `${p.contact_name} (${p.phone})`;
      tr.appendChild(tdContact);

      // City
      const tdCity = document.createElement('td');
      tdCity.textContent = p.city;
      tr.appendChild(tdCity);

      // Qty
      const tdQty = document.createElement('td');
      tdQty.textContent = `${p.quantity_people} (${p.food_type})`;
      tr.appendChild(tdQty);

      // Time
      const tdTime = document.createElement('td');
      tdTime.textContent = new Date(p.pickup_time).toLocaleString('en-IN', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      tr.appendChild(tdTime);

      // Status Badge
      const tdStatus = document.createElement('td');
      const badge = document.createElement('span');
      badge.className = `status-badge status-badge--${p.status}`;
      badge.textContent = p.status;
      tdStatus.appendChild(badge);
      tr.appendChild(tdStatus);

      // Assigned Volunteer Dropdown
      const tdAssigned = document.createElement('td');
      const volSelect = document.createElement('select');
      volSelect.className = 'form-select';
      volSelect.style.padding = '0.3rem 0.5rem';
      volSelect.style.fontSize = '0.8rem';

      const optDefault = document.createElement('option');
      optDefault.value = '';
      optDefault.textContent = 'Unassigned';
      volSelect.appendChild(optDefault);

      approvedVolunteers.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.id;
        opt.textContent = v.full_name;
        if (p.assigned_volunteer === v.id) opt.selected = true;
        volSelect.appendChild(opt);
      });

      volSelect.addEventListener('change', async () => {
        const volId = volSelect.value;
        if (!volId) return;
        volSelect.disabled = true;
        try {
          await adminAssignPickup(p.id, volId);
          showToast(`Assigned ${p.reference_id} to volunteer!`, "success");
          await loadCounts();
          await loadPickups();
        } catch(err) {
          console.error("Assignment error", err);
          showToast("Failed to assign volunteer", "error");
          volSelect.disabled = false;
        }
      });
      tdAssigned.appendChild(volSelect);
      tr.appendChild(tdAssigned);

      // Actions Column
      const tdActions = document.createElement('td');
      const actionsWrap = document.createElement('div');
      actionsWrap.style.display = 'flex';
      actionsWrap.style.gap = '0.35rem';

      // Status selector
      const statusSelect = document.createElement('select');
      statusSelect.className = 'form-select';
      statusSelect.style.padding = '0.3rem 0.5rem';
      statusSelect.style.fontSize = '0.8rem';
      ['reported', 'assigned', 'collected', 'delivered', 'cancelled'].forEach(s => {
        const o = document.createElement('option');
        o.value = s;
        o.textContent = s.charAt(0).toUpperCase() + s.slice(1);
        if (p.status === s) o.selected = true;
        statusSelect.appendChild(o);
      });

      statusSelect.addEventListener('change', async () => {
        const newStatus = statusSelect.value;
        if (newStatus === 'delivered') {
          openAdminDeliveryModal(p.id);
          return;
        }
        statusSelect.disabled = true;
        try {
          await adminSetPickupStatus(p.id, newStatus);
          showToast(`Status updated to ${newStatus}`, "success");
          await loadCounts();
          await loadPickups();
        } catch(err) {
          console.error("Status update error", err);
          showToast("Could not update status", "error");
          statusSelect.disabled = false;
        }
      });

      actionsWrap.appendChild(statusSelect);
      tdActions.appendChild(actionsWrap);
      tr.appendChild(tdActions);

      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Error loading pickups:", err);
    tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--red-600); padding: 2rem;">Error loading pickups from server.</td></tr>`;
  }
}

// 4. Load & Render Volunteer Applications
async function loadApplications() {
  const tbody = document.getElementById('volunteers-table-body');
  tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 2rem;">Loading applications…</td></tr>`;

  try {
    const apps = await adminListApplications();
    tbody.innerHTML = '';

    if (!apps || apps.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 2rem; color: var(--muted);">No volunteer applications found.</td></tr>`;
      return;
    }

    apps.forEach(a => {
      const tr = document.createElement('tr');

      const tdName = document.createElement('td');
      tdName.className = 'bold';
      tdName.textContent = a.full_name;
      tr.appendChild(tdName);

      const tdEmail = document.createElement('td');
      tdEmail.textContent = a.email;
      tr.appendChild(tdEmail);

      const tdPhone = document.createElement('td');
      tdPhone.textContent = a.phone;
      tr.appendChild(tdPhone);

      const tdCity = document.createElement('td');
      tdCity.textContent = a.city;
      tr.appendChild(tdCity);

      const tdRole = document.createElement('td');
      tdRole.textContent = a.preferred_role.replace('_', ' ');
      tr.appendChild(tdRole);

      const tdAvail = document.createElement('td');
      tdAvail.textContent = Array.isArray(a.availability) ? a.availability.join(', ') : a.availability;
      tr.appendChild(tdAvail);

      const tdMotiv = document.createElement('td');
      tdMotiv.style.maxWidth = '200px';
      tdMotiv.style.fontSize = '0.8rem';
      tdMotiv.textContent = a.motivation || '—';
      tr.appendChild(tdMotiv);

      const tdDate = document.createElement('td');
      tdDate.textContent = new Date(a.created_at).toLocaleDateString('en-IN');
      tr.appendChild(tdDate);

      const tdStatus = document.createElement('td');
      const badge = document.createElement('span');
      badge.className = `status-badge ${a.status === 'approved' ? 'status-badge--delivered' : (a.status === 'rejected' ? 'status-badge--cancelled' : 'status-badge--assigned')}`;
      badge.textContent = a.status;
      tdStatus.appendChild(badge);
      tr.appendChild(tdStatus);

      const tdActions = document.createElement('td');
      if (a.status === 'pending') {
        const approveBtn = document.createElement('button');
        approveBtn.className = 'btn btn-primary btn-small';
        approveBtn.textContent = 'Approve';
        approveBtn.style.marginRight = '0.4rem';
        approveBtn.onclick = async () => {
          approveBtn.disabled = true;
          try {
            await adminReviewApplication(a.id, true);
            showToast(`Approved ${a.full_name} as Volunteer!`, "success");
            approvedVolunteers = await adminListVolunteers();
            await loadCounts();
            await loadApplications();
          } catch(e) {
            console.error(e);
            showToast("Failed to approve application", "error");
            approveBtn.disabled = false;
          }
        };

        const rejectBtn = document.createElement('button');
        rejectBtn.className = 'btn btn-outline btn-small';
        rejectBtn.textContent = 'Reject';
        rejectBtn.onclick = async () => {
          rejectBtn.disabled = true;
          try {
            await adminReviewApplication(a.id, false);
            showToast(`Application rejected`, "info");
            await loadCounts();
            await loadApplications();
          } catch(e) {
            console.error(e);
            showToast("Failed to reject application", "error");
            rejectBtn.disabled = false;
          }
        };

        tdActions.appendChild(approveBtn);
        tdActions.appendChild(rejectBtn);
      } else {
        const reviewedText = document.createElement('span');
        reviewedText.style.fontSize = '0.8rem';
        reviewedText.style.color = 'var(--muted)';
        reviewedText.textContent = 'Reviewed';
        tdActions.appendChild(reviewedText);
      }
      tr.appendChild(tdActions);

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error loading volunteer applications", err);
    tbody.innerHTML = `<tr><td colspan="10" style="text-align: center; color: var(--red-600); padding: 2rem;">Error loading applications.</td></tr>`;
  }
}

// 5. Load & Render Contact Messages
async function loadMessages() {
  const tbody = document.getElementById('messages-table-body');
  tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem;">Loading messages…</td></tr>`;

  try {
    const messages = await adminListMessages();
    tbody.innerHTML = '';

    if (!messages || messages.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--muted);">No messages found.</td></tr>`;
      return;
    }

    messages.forEach(m => {
      const tr = document.createElement('tr');
      if (!m.is_read) {
        tr.style.backgroundColor = 'var(--cream)';
      }

      const tdStatus = document.createElement('td');
      tdStatus.textContent = m.is_read ? '✓ Read' : '● Unread';
      tdStatus.style.fontWeight = m.is_read ? 'normal' : 'bold';
      tdStatus.style.color = m.is_read ? 'var(--muted)' : 'var(--orange-600)';
      tr.appendChild(tdStatus);

      const tdSender = document.createElement('td');
      tdSender.textContent = m.full_name;
      if (!m.is_read) tdSender.className = 'bold';
      tr.appendChild(tdSender);

      const tdEmail = document.createElement('td');
      tdEmail.textContent = m.email;
      tr.appendChild(tdEmail);

      const tdCategory = document.createElement('td');
      tdCategory.className = 'bold';
      tdCategory.textContent = m.subject.toUpperCase();
      tr.appendChild(tdCategory);

      const tdDate = document.createElement('td');
      tdDate.textContent = new Date(m.created_at).toLocaleDateString('en-IN');
      tr.appendChild(tdDate);

      const tdMsg = document.createElement('td');
      tdMsg.style.maxWidth = '320px';
      tdMsg.textContent = m.message;
      tr.appendChild(tdMsg);

      const tdAction = document.createElement('td');
      if (!m.is_read) {
        const readBtn = document.createElement('button');
        readBtn.className = 'btn btn-outline btn-small';
        readBtn.textContent = 'Mark Read';
        readBtn.onclick = async () => {
          readBtn.disabled = true;
          try {
            await adminMarkMessageRead(m.id);
            showToast("Message marked as read", "success");
            await loadCounts();
            await loadMessages();
          } catch(e) {
            console.error(e);
            readBtn.disabled = false;
          }
        };
        tdAction.appendChild(readBtn);
      }
      tr.appendChild(tdAction);

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error loading messages", err);
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--red-600); padding: 2rem;">Error loading messages.</td></tr>`;
  }
}

// 6. Load & Render Newsletter Subscribers
let subscribersCache = [];
async function loadSubscribers() {
  const tbody = document.getElementById('subscribers-table-body');
  tbody.innerHTML = `<tr><td colspan="2" style="text-align: center; padding: 2rem;">Loading subscribers…</td></tr>`;

  try {
    subscribersCache = await adminListSubscribers();
    tbody.innerHTML = '';

    document.getElementById('subscribers-count').textContent = subscribersCache.length;

    if (!subscribersCache || subscribersCache.length === 0) {
      tbody.innerHTML = `<tr><td colspan="2" style="text-align: center; padding: 2rem; color: var(--muted);">No subscribers yet.</td></tr>`;
      return;
    }

    subscribersCache.forEach(s => {
      const tr = document.createElement('tr');

      const tdEmail = document.createElement('td');
      tdEmail.className = 'bold';
      tdEmail.textContent = s.email;
      tr.appendChild(tdEmail);

      const tdDate = document.createElement('td');
      tdDate.textContent = new Date(s.created_at).toLocaleString('en-IN');
      tr.appendChild(tdDate);

      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error loading subscribers", err);
    tbody.innerHTML = `<tr><td colspan="2" style="text-align: center; color: var(--red-600); padding: 2rem;">Error loading subscribers.</td></tr>`;
  }
}

// Client-side CSV Download
function downloadSubscribersCSV() {
  if (!subscribersCache || subscribersCache.length === 0) {
    alert("No subscriber rows to download.");
    return;
  }
  let csvContent = "data:text/csv;charset=utf-8,Email,Subscribed At\n";
  subscribersCache.forEach(row => {
    csvContent += `"${row.email}","${row.created_at}"\n`;
  });
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `second_serve_subscribers_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 7. Admin Delivery Destination Modal
function setupAdminModal() {
  const modal = document.getElementById('admin-delivery-modal');
  const cancelBtn = document.getElementById('admin-modal-cancel-btn');
  const form = document.getElementById('admin-delivery-form');

  cancelBtn.addEventListener('click', () => {
    modal.classList.remove('is-open');
    loadPickups();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('admin-pickup-id').value;
    const dest = document.getElementById('admin-destination-select').value;
    if (!dest) {
      alert("Please choose a destination facility.");
      return;
    }

    const confirmBtn = document.getElementById('admin-modal-confirm-btn');
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Saving…';

    try {
      await adminSetPickupStatus(id, 'delivered', dest);
      modal.classList.remove('is-open');
      showToast("Pickup confirmed delivered!", "success");
      await loadCounts();
      await loadPickups();
    } catch(err) {
      console.error("Error confirming delivery", err);
      showToast("Could not update pickup status", "error");
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Confirm & Save';
    }
  });
}

function openAdminDeliveryModal(pickupId) {
  const modal = document.getElementById('admin-delivery-modal');
  document.getElementById('admin-pickup-id').value = pickupId;
  document.getElementById('admin-destination-select').value = '';
  modal.classList.add('is-open');
}

// Init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}
