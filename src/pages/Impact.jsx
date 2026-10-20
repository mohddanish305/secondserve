import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Sparkles, Leaf, Waves, Award } from 'lucide-react';
import { getImpactStats, getImpactSeries, BASELINE_STATS, FALLBACK_MONTHLY_SERIES, FALLBACK_DESTINATIONS } from '../lib/api.js';

export default function Impact() {
  const [stats, setStats] = useState(BASELINE_STATS);
  const [monthly, setMonthly] = useState(FALLBACK_MONTHLY_SERIES);
  const [destinations, setDestinations] = useState(FALLBACK_DESTINATIONS);

  useEffect(() => {
    document.title = 'Impact Reports — Second Serve NGO';

    async function loadData() {
      try {
        const liveStats = await getImpactStats();
        if (liveStats) setStats((prev) => ({ ...prev, ...liveStats }));
      } catch (e) {
        console.warn('Error loading impact stats', e);
      }

      try {
        const seriesData = await getImpactSeries();
        if (seriesData) {
          if (seriesData.monthly) setMonthly(seriesData.monthly);
          if (seriesData.destinations) setDestinations(seriesData.destinations);
        }
      } catch (e) {
        console.warn('Error loading impact series', e);
      }
    }

    loadData();
  }, []);

  const formatNumber = (num) => {
    if (num == null) return '0';
    return Number(num).toLocaleString('en-IN');
  };

  // SVG Chart dimensions
  const svgWidth = 680;
  const svgHeight = 280;
  const padLeft = 50;
  const padBottom = 40;
  const padTop = 20;
  const chartW = svgWidth - padLeft - 20;
  const chartH = svgHeight - padBottom - padTop;
  const maxMeals = Math.max(...monthly.map((m) => m.meals), 18000);
  const barWidth = Math.floor(chartW / monthly.length) - 10;
  const destColors = ['#E8590C', '#2F9E44', '#F76707'];

  return (
    <main>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow eyebrow-green">Radical Accountability</span>
          <h1>Real-Time Rescue Impact</h1>
          <p>Every plate rescued is logged in our database. Here is how our network diverts wholesome banquet surplus from municipal landfills to community tables.</p>
        </div>
      </section>

      {/* 5 Live Counters Strip (TRD §4.5) */}
      <section className="section section-cream" style={{ paddingTop: '3rem' }}>
        <div className="container">
          <div className="card" style={{ padding: '2.5rem 1.5rem', borderColor: 'var(--border-warm)', boxShadow: 'var(--shadow-md)' }}>
            <div className="counter-grid counter-grid-5">
              <div className="counter-item">
                <div className="counter-value">{formatNumber(stats.meals_rescued)}</div>
                <div className="counter-label">Meals Rescued</div>
                <div className="counter-sub">Wholesome hot plates</div>
              </div>
              <div className="counter-item">
                <div className="counter-value green">{formatNumber(stats.food_waste_kg)}</div>
                <div className="counter-label">Waste Avoided (kg)</div>
                <div className="counter-sub">Landfill methane prevented</div>
              </div>
              <div className="counter-item">
                <div className="counter-value">{formatNumber(stats.partner_restaurants)}</div>
                <div className="counter-label">Donor Partners</div>
                <div className="counter-sub">Banquets & caterers</div>
              </div>
              <div className="counter-item">
                <div className="counter-value green">{formatNumber(stats.volunteers)}</div>
                <div className="counter-label">Registered Volunteers</div>
                <div className="counter-sub">Across active chapters</div>
              </div>
              <div className="counter-item">
                <div className="counter-value">{formatNumber(stats.cities)}</div>
                <div className="counter-label">Cities Served</div>
                <div className="counter-sub">Delhi, BLR, BOM + 3 more</div>
              </div>
            </div>
            <p className="baseline-disclaimer">
              Live counters are computed directly from database deliveries on top of verified illustrative baseline figures.
            </p>
          </div>
        </div>
      </section>

      {/* Charts Section: 12-Month Trend + Where the Food Goes */}
      <section className="section section-white">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }} className="impact-charts-grid">
            {/* 12-Month Trend SVG Bar Chart */}
            <div className="card">
              <span className="eyebrow">Monthly Growth</span>
              <h2 style={{ fontSize: '1.5rem', margin: '0.5rem 0 0.5rem 0' }}>12-Month Meal Rescue Trend</h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--ink-light)', marginBottom: '1.5rem' }}>
                Audited monthly meal volume rescued across our operating city zones.
              </p>

              <div style={{ width: '100%', overflowX: 'auto' }}>
                <svg viewBox="0 0 680 280" style={{ width: '100%', minWidth: '540px', height: 'auto' }} role="img" aria-label="12-Month rescued meals bar chart">
                  {/* Grid Lines */}
                  {[0, 1, 2, 3, 4].map((g) => {
                    const val = Math.round((maxMeals / 4) * g);
                    const y = padTop + chartH - g * (chartH / 4);
                    return (
                      <g key={g}>
                        <line x1={padLeft} y1={y} x2={svgWidth - 20} y2={y} stroke="#EEDEC9" strokeDasharray="3 3" />
                        <text x={padLeft - 8} y={y + 4} fill="#868E96" fontSize="11" textAnchor="end" fontFamily="'Inter', sans-serif">
                          {(val / 1000).toFixed(0)}k
                        </text>
                      </g>
                    );
                  })}

                  {/* Bars */}
                  {monthly.map((m, idx) => {
                    const x = padLeft + idx * (chartW / monthly.length) + 5;
                    const barH = (m.meals / maxMeals) * chartH;
                    const y = padTop + chartH - barH;
                    const labelText = m.meals >= 10000 ? (m.meals / 1000).toFixed(1) + 'k' : m.meals;

                    return (
                      <g key={idx} className="chart-bar-group" tabIndex="0" role="graphics-symbol" aria-label={`${m.month_label}: ${m.meals.toLocaleString()} meals`}>
                        <rect className="chart-bar-rect" x={x} y={y} width={barWidth} height={barH} rx="6" fill="#E8590C" />
                        <text x={x + barWidth / 2} y={y - 6} fill="#D9480F" fontSize="10.5" fontWeight="600" textAnchor="middle" fontFamily="'Inter', sans-serif">
                          {labelText}
                        </text>
                        <text x={x + barWidth / 2} y={svgHeight - 12} fill="#495057" fontSize="12" fontWeight="500" textAnchor="middle" fontFamily="'Inter', sans-serif">
                          {m.month_label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Where the Food Goes */}
            <div className="card">
              <span className="eyebrow eyebrow-green">Nutritional Flow</span>
              <h2 style={{ fontSize: '1.5rem', margin: '0.5rem 0 0.5rem 0' }}>Where the Rescued Food Goes</h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--ink-light)', marginBottom: '2rem' }}>
                Surplus meals are channeled to verified community facilities based on urgent local need.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {destinations.map((d, i) => (
                  <div key={d.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, marginBottom: '0.4rem' }}>
                      <span>{d.name}</span>
                      <span>{d.pct}%</span>
                    </div>
                    <div style={{ width: '100%', height: '16px', backgroundColor: 'var(--cream)', borderRadius: '8px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${d.pct}%`,
                          height: '100%',
                          backgroundColor: destColors[i % destColors.length],
                          borderRadius: '8px',
                          transition: 'width 0.8s ease'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beneficiary Impact Stories */}
      <section className="section section-cream-dark">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Dignity in Every Plate</span>
            <h2 className="section-title">Stories Behind the Statistics</h2>
            <p className="section-subtext">Every meal rescued is a real human life nourished with dignity and care.</p>
          </div>

          <div className="story-grid">
            {/* Story 1 */}
            <article className="story-card">
              <img src="/images/story-meera.jpg" alt="Meera Devi at East Delhi night shelter" className="story-card-img" loading="lazy" />
              <div className="story-card-body">
                <span className="eyebrow eyebrow-green" style={{ alignSelf: 'flex-start' }}>East Delhi Shelter</span>
                <h3 style={{ fontSize: '1.35rem', margin: '0.75rem 0 0.5rem 0' }}>Meera’s Daily Community Kitchen</h3>
                <p className="story-quote">
                  “When weddings finish at 11 PM, our volunteers deliver fresh shahi paneer and hot rotis by midnight. Children wake up to hot food instead of hungry tears.”
                </p>
                <p style={{ color: 'var(--ink-light)', fontSize: '0.95rem' }}>
                  Meera has managed night shelter distribution in Laxmi Nagar for 4 years, ensuring over 120 elderly and migrant workers receive guaranteed evening nourishment.
                </p>
              </div>
            </article>

            {/* Story 2 */}
            <article className="story-card">
              <img src="/images/story-ravi.jpg" alt="Elderly resident Ram Prasad receiving meal parcel" className="story-card-img" loading="lazy" />
              <div className="story-card-body">
                <span className="eyebrow" style={{ alignSelf: 'flex-start' }}>Elderly Care Program</span>
                <h3 style={{ fontSize: '1.35rem', margin: '0.75rem 0 0.5rem 0' }}>Nourishment with Respect: Ram Prasad</h3>
                <p className="story-quote">
                  “At 72, cooking after a day of manual labour was impossible. The meals brought by Second Serve volunteers are warm, respectful, and cleanly packed.”
                </p>
                <p style={{ color: 'var(--ink-light)', fontSize: '0.95rem' }}>
                  Through our weekend food drops, over 40 senior citizens living independently receive balanced nutrition without having to queue up at distant relief centres.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Illustrative Partner Strip */}
      <section className="section section-white">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="eyebrow">Hospitality Champions</span>
            <h2 style={{ fontSize: '1.6rem' }}>Partner Banquets & Venues</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.25rem' }}>(Names marked illustrative for assignment demonstration)</p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '2rem', opacity: 0.85 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--ink-light)', padding: '0.75rem 1.25rem', border: '1px dashed var(--border-warm)', borderRadius: 'var(--radius-sm)' }}>
              <Building2 size={18} strokeWidth={1.75} color="var(--orange-600)" aria-hidden="true" /> Grand Heritage Banquets
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--ink-light)', padding: '0.75rem 1.25rem', border: '1px dashed var(--border-warm)', borderRadius: 'var(--radius-sm)' }}>
              <Sparkles size={18} strokeWidth={1.75} color="var(--orange-600)" aria-hidden="true" /> Royal Palace Convention
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--ink-light)', padding: '0.75rem 1.25rem', border: '1px dashed var(--border-warm)', borderRadius: 'var(--radius-sm)' }}>
              <Leaf size={18} strokeWidth={1.75} color="var(--green-600)" aria-hidden="true" /> Spice Garden Hospitality
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--ink-light)', padding: '0.75rem 1.25rem', border: '1px dashed var(--border-warm)', borderRadius: 'var(--radius-sm)' }}>
              <Waves size={18} strokeWidth={1.75} color="var(--orange-600)" aria-hidden="true" /> Sea View Caterers
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--ink-light)', padding: '0.75rem 1.25rem', border: '1px dashed var(--border-warm)', borderRadius: 'var(--radius-sm)' }}>
              <Award size={18} strokeWidth={1.75} color="var(--orange-600)" aria-hidden="true" /> The Oberoi Grand Banqueting
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section-cream" style={{ textAlign: 'center' }}>
        <div className="container">
          <h2 className="section-title">Help Us Reach 5,00,000 Meals Rescued</h2>
          <p className="section-subtext" style={{ maxWidth: '600px', margin: '0 auto 2rem auto' }}>
            Whether you run a commercial kitchen or can spare three hours on a Saturday, your support counts.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/report-food" className="btn btn-primary btn-large">
              Donate Surplus Food
            </Link>
            <Link to="/volunteer" className="btn btn-secondary btn-large">
              Join as Volunteer
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
