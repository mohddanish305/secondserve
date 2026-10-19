/**
 * Second Serve — Main Client Logic (TRD v2.0 §8)
 * Handles navigation, mobile menu, animated counters, FAQ accordion,
 * testimonials carousel, newsletter, and global UI components.
 */

import { getImpactStats, subscribeNewsletter } from "./api.js";
import { updateNavbarAuth } from "./auth.js";

// Format numbers according to Indian numbering system (e.g., 3,20,000)
export function formatIndianNumber(x) {
  if (isNaN(x)) return x;
  const num = Math.round(x);
  const s = num.toString();
  if (s.length <= 3) return s;
  const last3 = s.substring(s.length - 3);
  const other = s.substring(0, s.length - 3);
  return other.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3;
}

// Global Toast System
export function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// 1. Sticky Navbar & Mobile Drawer
function initNavigation() {
  const navbar = document.querySelector('.navbar');
  const toggleBtn = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        navbar.classList.add('is-scrolled');
      } else {
        navbar.classList.remove('is-scrolled');
      }
    }, { passive: true });
  }

  if (toggleBtn && mobileNav) {
    toggleBtn.addEventListener('click', () => {
      const isOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', !isOpen);
      mobileNav.classList.toggle('is-open', !isOpen);
      document.body.style.overflow = !isOpen ? 'hidden' : '';
    });

    // Close on navigation click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggleBtn.setAttribute('aria-expanded', 'false');
        mobileNav.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  // Active Link Highlighter
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('is-active');
    } else {
      link.classList.remove('is-active');
    }
  });
}

// 2. Animated Impact Counters (TRD §4.1, §4.5, §8)
async function initCounters() {
  const counterElements = document.querySelectorAll('[data-stat]');
  if (counterElements.length === 0) return;

  // Baseline values
  const stats = await getImpactStats();

  counterElements.forEach(el => {
    const key = el.getAttribute('data-stat');
    if (stats[key] !== undefined) {
      el.setAttribute('data-target', stats[key]);
      el.textContent = formatIndianNumber(stats[key]);
    }
  });

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const targetVal = parseFloat(el.getAttribute('data-target') || '0');
        if (targetVal > 0) {
          animateValue(el, 0, targetVal, 1600);
        }
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.2 });

  counterElements.forEach(el => observer.observe(el));
}

function animateValue(element, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    // easeOutQuart
    const ease = 1 - Math.pow(1 - progress, 4);
    const current = Math.floor(ease * (end - start) + start);
    element.textContent = formatIndianNumber(current);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.textContent = formatIndianNumber(end);
    }
  };
  window.requestAnimationFrame(step);
}

// 3. FAQ Accordion (TRD §4.7)
function initFAQ() {
  const triggers = document.querySelectorAll('.accordion-trigger');
  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      const content = trigger.parentElement.nextElementSibling;

      // Close all others
      triggers.forEach(otherTrigger => {
        if (otherTrigger !== trigger) {
          otherTrigger.setAttribute('aria-expanded', 'false');
          const otherContent = otherTrigger.parentElement.nextElementSibling;
          if (otherContent) otherContent.classList.remove('is-open');
        }
      });

      trigger.setAttribute('aria-expanded', !isExpanded);
      if (content) {
        content.classList.toggle('is-open', !isExpanded);
      }
    });
  });
}

// 4. Testimonials Carousel (Home page, P1)
function initCarousel() {
  const carousel = document.querySelector('.carousel');
  if (!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const slides = carousel.querySelectorAll('.carousel-slide');
  const dots = carousel.querySelectorAll('.carousel-dot');
  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  let intervalId;

  function goToSlide(index) {
    currentIndex = index;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === currentIndex);
    });
  }

  function startAutoplay() {
    intervalId = setInterval(() => {
      const next = (currentIndex + 1) % slides.length;
      goToSlide(next);
    }, 6000);
  }

  function stopAutoplay() {
    clearInterval(intervalId);
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      stopAutoplay();
      goToSlide(idx);
      startAutoplay();
    });
  });

  carousel.addEventListener('mouseenter', stopAutoplay);
  carousel.addEventListener('mouseleave', startAutoplay);

  startAutoplay();
}

// 5. Global Newsletter Form Handler
function initNewsletter() {
  const forms = document.querySelectorAll('.footer-newsletter-form');
  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const honeypot = form.querySelector('input[name="website"]');
      if (honeypot && honeypot.value) {
        showToast("You're subscribed!", "success");
        form.reset();
        return;
      }

      const input = form.querySelector('input[type="email"]');
      const btn = form.querySelector('button[type="submit"]');
      if (!input || !input.value.trim()) return;

      const email = input.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showToast("Please enter a valid email address.", "error");
        return;
      }

      const originalBtnText = btn ? btn.textContent : '';
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Subscribing…';
      }

      try {
        const res = await subscribeNewsletter(email);
        if (res && res.duplicate) {
          showToast("You're already subscribed to our newsletter!", "info");
        } else {
          showToast("Thank you! You're subscribed to our updates.", "success");
          form.reset();
        }
      } catch (err) {
        console.error("Newsletter error", err);
        showToast("Could not subscribe right now. Please try again later.", "error");
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.textContent = originalBtnText;
        }
      }
    });
  });
}

// 6. Role Card Interactivity (Volunteer page)
function initRoleCards() {
  const roleCards = document.querySelectorAll('.role-card');
  roleCards.forEach(card => {
    const roleBtn = card.querySelector('[data-role-select]');
    if (roleBtn) {
      roleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const role = roleBtn.getAttribute('data-role-select');
        const roleSelect = document.getElementById('preferred_role');
        const volunteerForm = document.getElementById('volunteer-form');
        if (roleSelect) {
          roleSelect.value = role;
          roleSelect.focus();
        }
        if (volunteerForm) {
          volunteerForm.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  });
}

// 7. Footer Current Year
function initFooterYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

// Master Init
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initCounters();
  initFAQ();
  initCarousel();
  initNewsletter();
  initRoleCards();
  initFooterYear();
  updateNavbarAuth();
});
