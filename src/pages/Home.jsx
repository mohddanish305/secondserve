import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  CalendarCheck,
  Clock,
  ShieldCheck,
  Utensils,
  ClipboardList,
  Truck,
  HeartHandshake,
  Quote,
  Repeat,
  Route,
  QrCode,
  Phone
} from 'lucide-react';

const BASELINE_TARGETS = {
  meals_rescued: 320000,
  food_waste_kg: 96000,
  partner_restaurants: 210,
  volunteers: 850
};

function formatIndianNumber(num) {
  if (num == null) return '0';
  const val = Math.round(Number(num));
  const s = val.toString();
  if (s.length <= 3) return s;
  const last3 = s.substring(s.length - 3);
  const other = s.substring(0, s.length - 3);
  return other.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
}

export default function Home() {
  const stripRef = useRef(null);
  const hasAnimated = useRef(false);
  const [animatedStats, setAnimatedStats] = useState({
    meals_rescued: 0,
    food_waste_kg: 0,
    partner_restaurants: 0,
    volunteers: 0
  });
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setAnimatedStats(BASELINE_TARGETS);
      hasAnimated.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            const duration = 1600;
            const startTimestamp = performance.now();

            const step = (now) => {
              const elapsed = now - startTimestamp;
              const progress = Math.min(elapsed / duration, 1);
              const ease = 1 - Math.pow(1 - progress, 4); // easeOutQuart

              setAnimatedStats({
                meals_rescued: Math.floor(ease * BASELINE_TARGETS.meals_rescued),
                food_waste_kg: Math.floor(ease * BASELINE_TARGETS.food_waste_kg),
                partner_restaurants: Math.floor(ease * BASELINE_TARGETS.partner_restaurants),
                volunteers: Math.floor(ease * BASELINE_TARGETS.volunteers)
              });

              if (progress < 1) {
                requestAnimationFrame(step);
              } else {
                setAnimatedStats(BASELINE_TARGETS);
              }
            };

            requestAnimationFrame(step);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (stripRef.current) {
      observer.observe(stripRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const testimonials = [
    {
      quote: '“As a banquet manager, throwing away 150 untouched plates of royal feast after a wedding broke my heart. Second Serve makes it seamless — I submit on my phone in 45 seconds, and their team is here with insulated boxes before midnight.”',
      author: 'Ravi Sharma',
      org: 'General Manager, Grand Heritage Banquets (Delhi NCR)'
    },
    {
      quote: '“I wanted to volunteer for months but never knew how to start. Second Serve’s orientation and WhatsApp coordination gave me clear weekend shifts. Delivering 200 hot meals on a Saturday night is the most rewarding feeling.”',
      author: 'Priya Sundaram',
      org: 'Student Volunteer & Food Hero (Bengaluru)'
    },
    {
      quote: '“Radical transparency is why our corporate CSR chose Second Serve. Every meal counter is backed by real pickup reference logs, and 80G tax receipts are instantaneous. They operate like a modern logistics enterprise.”',
      author: 'Karan Singhania',
      org: 'CSR Director, FinTech Solutions (Mumbai)'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const formatNumber = (num) => {
    if (num == null) return '0';
    return Number(num).toLocaleString('en-IN');
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="hero" aria-label="Hero Introduction">
        <img
          className="hero-img"
          src="/images/hero-fallback.jpg"
          alt="Second Serve volunteers packing fresh meals in community kitchen"
          fetchpriority="high"
        />
        <div className="hero-scrim" aria-hidden="true"></div>

        <div className="hero-content">
          <div className="hero-badge">
            <MapPin size={16} strokeWidth={1.75} aria-hidden="true" /> Food Rescue NGO across 6 Major Cities in India
          </div>
          <h1>Good food shouldn't go to waste.</h1>
          <p className="hero-sub">
            India wastes ~6.87 crore tonnes of food every year. We collect surplus meals from weddings, hotels, and banquets — delivering them the same day to night shelters and community kitchens.
          </p>
          <div className="hero-ctas">
            <Link to="/report-food" className="btn btn-primary btn-large">
              <CalendarCheck size={18} strokeWidth={1.75} aria-hidden="true" /> Book a Free Pickup
            </Link>
            <Link to="/volunteer" className="btn btn-white btn-large">
              Become a Volunteer
            </Link>
          </div>
        </div>
      </section>

      {/* Live Impact Counters Strip (F-02, TRD §4.1) */}
      <div className="container">
        <section ref={stripRef} className="impact-strip" aria-label="Impact Statistics">
          <div className="counter-grid">
            <div className="counter-item">
              <div className="counter-value" data-stat="meals_rescued">{formatIndianNumber(animatedStats.meals_rescued)}</div>
              <div className="counter-label">Meals Rescued</div>
              <div className="counter-sub">Wholesome plates served</div>
            </div>
            <div className="counter-item">
              <div className="counter-value green" data-stat="food_waste_kg">{formatIndianNumber(animatedStats.food_waste_kg)}</div>
              <div className="counter-label">Food Waste Avoided (kg)</div>
              <div className="counter-sub">Diverted from landfills</div>
            </div>
            <div className="counter-item">
              <div className="counter-value" data-stat="partner_restaurants">{formatIndianNumber(animatedStats.partner_restaurants)}</div>
              <div className="counter-label">Partner Restaurants & Venues</div>
              <div className="counter-sub">Banquets, caterers, hotels</div>
            </div>
            <div className="counter-item">
              <div className="counter-value green" data-stat="volunteers">{formatIndianNumber(animatedStats.volunteers)}</div>
              <div className="counter-label">Active Volunteers</div>
              <div className="counter-sub">Community food heroes</div>
            </div>
          </div>
          <p className="baseline-disclaimer">
            Baseline figures are illustrative.
          </p>
        </section>
      </div>

      {/* How It Works Teaser (F-03, TRD §4.1) */}
      <section className="section section-cream" aria-labelledby="how-heading">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Zero Food Waste</span>
            <h2 id="how-heading" className="section-title">How Second Serve Works</h2>
            <p className="section-subtext">
              From event surplus to hot community meals in under three hours. Fast, transparent, and completely free of charge.
            </p>
          </div>

          <div className="steps-grid">
            {/* Step 1 */}
            <article className="step-card">
              <img
                src="/images/how-step-1.jpg"
                alt="Banquet chef handing over trays of fresh surplus food"
                className="step-card-img"
                loading="lazy"
              />
              <div className="step-card-body">
                <div className="step-icon-circle orange" aria-hidden="true">
                  <ClipboardList size={24} strokeWidth={1.75} />
                </div>
                <span className="step-chip">
                  <Clock size={16} strokeWidth={1.75} aria-hidden="true" /> Takes 60 seconds
                </span>
                <h3>Donate Surplus</h3>
                <p>Hotels, banquet halls, or wedding hosts submit surplus quantity online without creating an account. Our dispatch team confirms within 15 minutes.</p>
              </div>
            </article>

            {/* Step 2 */}
            <article className="step-card">
              <img
                src="/images/how-step-2.jpg"
                alt="Volunteers loading sealed food containers into an eco van"
                className="step-card-img"
                loading="lazy"
              />
              <div className="step-card-body">
                <div className="step-icon-circle green" aria-hidden="true">
                  <Truck size={24} strokeWidth={1.75} />
                </div>
                <span className="step-chip">
                  <ShieldCheck size={16} strokeWidth={1.75} aria-hidden="true" /> Food Safety Inspected
                </span>
                <h3>Collect & Inspect</h3>
                <p>Trained volunteers arrive in insulated vehicles within 2 hours, test food temperature and freshness, and pack it into sealed stainless steel containers.</p>
              </div>
            </article>

            {/* Step 3 */}
            <article className="step-card">
              <img
                src="/images/how-step-3.jpg"
                alt="Happy elderly and children receiving warm nutritious food"
                className="step-card-img"
                loading="lazy"
              />
              <div className="step-card-body">
                <div className="step-icon-circle green" aria-hidden="true">
                  <HeartHandshake size={24} strokeWidth={1.75} />
                </div>
                <span className="step-chip">
                  <Utensils size={16} strokeWidth={1.75} aria-hidden="true" /> Same-day serving
                </span>
                <h3>Deliver & Serve</h3>
                <p>Food is delivered directly to registered night shelters, slum kitchens, and children’s community centres for same-day hot dinner service.</p>
              </div>
            </article>
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/how-it-works" className="btn btn-secondary">
              See Full Logistics Process & Safety Protocols →
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Beneficiary & Partner Story (F-06, TRD §4.1) */}
      <section className="section section-white" aria-labelledby="story-heading">
        <div className="container">
          <div className="story-grid" style={{ alignItems: 'center' }}>
            <div>
              <img
                src="/images/story-meera.jpg"
                alt="Meera Devi in a community kitchen in Laxmi Nagar"
                className="step-card-img"
                style={{ height: '420px', borderRadius: 'var(--radius)' }}
                loading="lazy"
              />
            </div>
            <div>
              <span className="eyebrow eyebrow-green">Real Community Impact</span>
              <h2 id="story-heading" className="section-title">“We never have to wonder if dinner will arrive tonight.”</h2>
              <blockquote className="story-quote">
                “Before Second Serve partnered with our shelter in Laxmi Nagar, feeding 85 residents every evening meant constant rationing. Now, when wedding banquets have surplus dal, paneer, and rotis, our children and elders eat fresh, wholesome meals with dignity.”
              </blockquote>
              <p style={{ fontWeight: 700, marginBottom: '0.25rem' }}>— Meera Devi</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>Night Shelter Coordinator, East Delhi</p>
              <Link to="/impact" className="btn btn-primary">
                Explore Verified Impact Reports →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel (F-14, TRD §4.1) */}
      <section className="section section-cream-dark" aria-label="Partner and Volunteer Testimonials">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Voices of Trust</span>
            <h2 className="section-title">What Our Partners Say</h2>
            <p className="section-subtext">Hear from banquet managers, student volunteers, and community leaders.</p>
          </div>

          <div className="carousel" role="region" aria-roledescription="carousel" aria-label="Partner Quotes">
            <div className="carousel-track" style={{ transform: `translateX(-${activeSlide * 100}%)`, transition: 'transform 0.4s ease' }}>
              {testimonials.map((t, idx) => (
                <div key={idx} className="carousel-slide" role="group" aria-roledescription="slide" aria-label={`${idx + 1} of ${testimonials.length}`}>
                  <div className="testimonial-card">
                    <Quote size={24} strokeWidth={1.75} style={{ color: 'var(--orange-500)', marginBottom: '0.75rem', opacity: 0.8 }} aria-hidden="true" />
                    <p className="testimonial-quote">{t.quote}</p>
                    <div className="testimonial-author">{t.author}</div>
                    <div className="testimonial-org">{t.org}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="carousel-dots" aria-label="Carousel navigation">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`carousel-dot ${activeSlide === idx ? 'is-active' : ''}`}
                  aria-label={`Go to slide ${idx + 1}`}
                  onClick={() => setActiveSlide(idx)}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Donate & Cost-per-Meal Transparency (F-15, TRD §4.1) */}
      <section className="section section-white" aria-labelledby="donate-heading">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow eyebrow-green">Radical Transparency</span>
            <h2 id="donate-heading" className="section-title">₹38 Rescues & Serves 10 Meals</h2>
            <p className="section-subtext">Food is donated for free. Your contribution powers the temperature-checked vans, food-grade containers, and logistics coordination.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', maxWidth: '900px', margin: '0 auto 3rem auto' }}>
            <div className="card card-hover" style={{ textAlign: 'center' }}>
              <div className="donation-card-icon" aria-hidden="true">
                <Utensils size={24} strokeWidth={1.75} />
              </div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: '2.25rem', fontWeight: 800, color: 'var(--orange-500)', marginBottom: '0.5rem' }}>₹380</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Rescues 100 Meals</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-light)' }}>Feeds an entire night shelter dining hall for one evening.</p>
            </div>
            <div className="card card-hover" style={{ textAlign: 'center', borderColor: 'var(--orange-500)', backgroundColor: 'var(--cream)' }}>
              <div className="donation-card-icon" style={{ backgroundColor: 'var(--orange-500)', color: 'var(--white)' }} aria-hidden="true">
                <Repeat size={24} strokeWidth={1.75} />
              </div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: '2.25rem', fontWeight: 800, color: 'var(--orange-500)', marginBottom: '0.5rem' }}>₹1,140</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Monthly Supporter</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-light)' }}>Rescues 300 meals every single month with 80G tax exemption.</p>
            </div>
            <div className="card card-hover" style={{ textAlign: 'center' }}>
              <div className="donation-card-icon" aria-hidden="true">
                <Route size={24} strokeWidth={1.75} />
              </div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: '2.25rem', fontWeight: 800, color: 'var(--orange-500)', marginBottom: '0.5rem' }}>₹3,800</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Adopt a Route</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-light)' }}>Powers one electric refrigerated pickup van route for two weeks.</p>
            </div>
          </div>

          <div className="card" style={{ maxWidth: '720px', margin: '0 auto', backgroundColor: 'var(--cream-dark)', borderColor: 'var(--border-warm)', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--orange-100)', color: 'var(--orange-600)', marginBottom: '0.75rem' }} aria-hidden="true">
              <QrCode size={24} strokeWidth={1.75} />
            </div>
            <h4 style={{ marginBottom: '0.5rem' }}>Support Our Logistics via UPI</h4>
            <p style={{ fontSize: '0.95rem', color: 'var(--ink-light)', marginBottom: '1rem' }}>Official NGO UPI ID: <strong>secondserve@upi</strong> (Demo placeholder)</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: 0 }}>All donations are 50% tax exempt under Section 80G of the Indian Income Tax Act. Registration: <strong>AAKCS1234EF20261</strong>.</p>
          </div>
        </div>
      </section>

      {/* Urgent CTA Banner (TRD §4.1) */}
      <section className="section section-dark" aria-labelledby="cta-banner-heading">
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="eyebrow" style={{ backgroundColor: 'rgba(232,89,12,0.25)', color: '#FF922B' }}>Time-Critical Action</span>
          <h2 id="cta-banner-heading" className="section-title" style={{ color: '#FFF9F0', marginTop: '0.5rem' }}>Have Surplus Food Right Now?</h2>
          <p className="section-subtext" style={{ color: '#D3CDC6', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
            Surplus food from a wedding or corporate event? Don't let good nutrition end up in a dump. Donate it now, and our team will be at your doorstep.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
            <Link to="/report-food" className="btn btn-primary btn-large">
              Donate Surplus Food
            </Link>
            <a href="tel:1800XXXXXXX" className="btn btn-outline-white btn-large">
              <Phone size={18} strokeWidth={1.75} aria-hidden="true" /> Helpline: 1800-XXX-XXXX (demo)
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
