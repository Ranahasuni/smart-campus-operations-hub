import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef } from 'react';
import '../styles/homepage.css';

// ── Role-Specific Module Lists ────────────────────────────
const USER_FEATURES = [
  { icon: '🏛️', title: 'Facilities & Assets',   desc: 'Browse and manage university lecture halls, labs, and catalogues across Campus.',             link: '/resources' },
  { icon: '📅', title: 'Smart Reservations',     desc: 'Reserve space for lectures, workshops, or study groups with real-time availability.',        link: '/bookings' },
  { icon: '🎫', title: 'Support Tickets',        desc: 'Report facility issues or request technical support for campus infrastructure.',              link: '/tickets' },
  { icon: '🔔', title: 'Live Notifications',     desc: 'Receive real-time updates on booking approvals, reminders, and campus alerts.',               link: '/notifications' }
];

const ADMIN_FEATURES = [
  { icon: '🛡️', title: 'Admin Dashboard',       desc: 'System-wide monitoring, performance metrics, and overall campus health reports.',              link: '/admin' },
  { icon: '👥', title: 'Account Management',     desc: 'Manage users, assign roles, unlock accounts, and control system permissions.',               link: '/admin/users' },
  { icon: '📜', title: 'Audit Trails',           desc: 'View chronological security logs of all system modifications and admin events.',              link: '/admin/logs' },
  { icon: '🔔', title: 'System Alerts',          desc: 'Monitor login attempts, security events, and high-priority system notifications.',           link: '/notifications' }
];

const LECTURER_FEATURES = [
  { icon: '🏛️', title: 'Facilities & Assets',   desc: 'Browse and manage university lecture halls, labs, and catalogues across Campus.',             link: '/resources' },
  { icon: '📅', title: 'Smart Reservations',     desc: 'Reserve space for lectures, workshops, or study groups with real-time availability.',        link: '/bookings' },
  { icon: '🎫', title: 'Support Tickets',        desc: 'Report facility issues or request technical support for campus infrastructure.',              link: '/tickets' },
  { icon: '🔔', title: 'Live Notifications',     desc: 'Receive real-time updates on booking approvals, reminders, and campus alerts.',               link: '/notifications' }
];


// ── Animated Counter Hook ─────────────────────────────────
function useCounter(end, duration = 2000) {
  const ref = useRef(null);
  const counted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !counted.current) {
        counted.current = true;
        let start = 0;
        const step = end / (duration / 16);
        const tick = () => {
          start += step;
          if (start >= end) {
            if (ref.current) ref.current.textContent = end.toLocaleString() + (end >= 100 ? '+' : '');
            return;
          }
          if (ref.current) ref.current.textContent = Math.floor(start).toLocaleString();
          requestAnimationFrame(tick);
        };
        tick();
      }
    }, { threshold: 0.5 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return ref;
}

// ── Scroll Reveal Hook ────────────────────────────────────
function useScrollReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return ref;
}


// ── Stat Item Component ───────────────────────────────────
function StatItem({ number, label }) {
  const counterRef = useCounter(number);
  return (
    <div className="hp-stat">
      <div className="hp-stat-number" ref={counterRef}>0</div>
      <div className="hp-stat-label">{label}</div>
    </div>
  );
}

// ── Reveal Wrapper ────────────────────────────────────────
function Reveal({ children, className = '', style = {} }) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`hp-reveal ${className}`} style={style}>
      {children}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// HOMEPAGE COMPONENT
// ═══════════════════════════════════════════════════════════
export default function HomePage() {
  const { user } = useAuth();

  const features = user?.role === 'ADMIN'
    ? ADMIN_FEATURES
    : user?.role === 'LECTURER'
      ? LECTURER_FEATURES
      : user?.role === 'TECHNICIAN'
        ? USER_FEATURES.filter(f => f.title !== 'Smart Reservations')
        : USER_FEATURES;

  const roleGreeting = user?.role === 'ADMIN'
    ? 'Administrator Portal — Full system control authorized.'
    : user?.role === 'LECTURER'
      ? 'Lecturer Console — Manage academic reservations & facilities.'
      : user?.role === 'TECHNICIAN'
        ? 'Technician Dashboard — Monitor facilities & resolve issues.'
        : 'Your digital gateway to campus facilities and services.';

  return (
    <div className="hp-root">

      {/* ═══════ HERO ═══════ */}
      <section className="hp-hero">
        <div className="hp-hero-bg">
          <img src="/images/campus-hero.png" alt="Smart Campus" loading="eager" />
        </div>
        <div className="hp-hero-overlay" />

        <div className="hp-hero-content">
          <div className="hp-hero-badge">
            <span className="badge-dot" />
            {user ? `${user.role} Access Active` : 'Smart Campus Platform'}
          </div>

          <h1>
            {user
              ? <>Welcome back, <span className="highlight">{user.fullName}</span></>
              : <>Smart Campus <span className="highlight">Operations Hub</span></>
            }
          </h1>

          <p className="hp-hero-sub">
            {user
              ? roleGreeting
              : 'An intelligent platform for managing university facilities, reservations, and campus operations — all in one place.'
            }
          </p>

          <div className="hp-hero-actions">
            {user ? (
              <>
                <Link to="/resources" className="hp-btn-primary">
                  Browse Facilities <span>→</span>
                </Link>
                <Link to="/bookings" className="hp-btn-outline">
                  My Reservations
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="hp-btn-primary">
                  Get Started <span>→</span>
                </Link>
                <Link to="/resources" className="hp-btn-outline">
                  Explore Facilities
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="hp-scroll-indicator">
          Scroll
          <div className="scroll-line" />
        </div>
      </section>


      {/* ═══════ STATS BAR ═══════ */}
      <section className="hp-stats">
        <div className="hp-stats-inner">
          <StatItem number={120} label="Campus Facilities" />
          <StatItem number={5000} label="Active Students" />
          <StatItem number={350} label="Daily Bookings" />
          <StatItem number={99} label="Uptime %" />
        </div>
      </section>


      {/* ═══════ MODULES SECTION ═══════ */}
      <section className="hp-section">
        <Reveal>
          {user?.role === 'ADMIN' && (
            <div className="hp-admin-banner">
              <span>🛡️</span>
              <span>Security Protocol Active — You are logged in with <strong>Full Administrative Privileges</strong>. All actions are logged in the audit trail.</span>
            </div>
          )}
          <div className="hp-section-label">
            <span>◆</span> Your Modules
          </div>
          <h2 className="hp-section-title">Everything you need,<br />in one place</h2>
          <p className="hp-section-desc">
            Access all campus services through our unified platform. From facility management to real-time notifications, your campus experience starts here.
          </p>
        </Reveal>

        <div className="hp-features-grid">
          {features.map((f, i) => (
            <Reveal key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
              <Link to={f.link} className="hp-feature-card">
                <div className="hp-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <div className="hp-feature-link">
                  Open Module <span>→</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>


      {/* ═══════ PARALLAX IMAGE BREAK ═══════ */}
      <section className="hp-parallax-section">
        <img src="/images/campus-library.png" alt="Campus Library" loading="lazy" />
        <div className="hp-parallax-overlay" />
        <div className="hp-parallax-content">
          <Reveal>
            <h2>Designed for the <span style={{ color: '#FFD5D5', textShadow: '0 0 30px rgba(255,180,180,0.4)' }}>Modern University</span></h2>
            <p>
              Our platform integrates facility management, reservation systems, and real-time communication
              into a seamless experience for students, lecturers, and administrators.
            </p>
            <Link to="/resources" className="hp-btn-primary">
              Explore Facilities <span>→</span>
            </Link>
          </Reveal>
        </div>
      </section>


      {/* ═══════ BENTO CAPABILITIES ═══════ */}
      <section className="hp-section">
        <Reveal>
          <div className="hp-section-label">
            <span>◆</span> Platform Capabilities
          </div>
          <h2 className="hp-section-title">Built for scale,<br />crafted for ease</h2>
          <p className="hp-section-desc">
            Every feature has been thoughtfully designed to enhance your daily campus experience.
          </p>
        </Reveal>

        <Reveal>
          <div className="hp-bento-grid">
            {/* Large dark item - Real-Time Availability */}
            <div className="hp-bento-item bento-large hp-bento-dark bento-primary">
              <div className="hp-bento-icon">⚡</div>
              <h3>Real-Time Availability</h3>
              <p>Instantly see which rooms, labs, and halls are available — no double bookings, no delays.</p>
              <div className="hp-bento-shine"></div>
            </div>

            {/* Right column - stacked items */}
            <div className="hp-bento-column">
              <div className="hp-bento-item hp-bento-rose">
                <div className="hp-bento-icon">🔒</div>
                <h3>Role-Based Access</h3>
                <p>Secure, role-specific views for Students, Lecturers, Technicians, and Admins.</p>
              </div>
              <div className="hp-bento-item hp-bento-coral">
                <div className="hp-bento-icon">📊</div>
                <h3>Analytics Dashboard</h3>
                <p>Track usage patterns and optimize campus resource allocation.</p>
              </div>
            </div>

            {/* Bottom row */}
            <div className="hp-bento-item hp-bento-light">
              <div className="hp-bento-icon">📋</div>
              <h3>QR Check-In</h3>
              <p>Scan and confirm your arrival with our contactless check-in system.</p>
            </div>
            <div className="hp-bento-item hp-bento-dark bento-secondary">
              <div className="hp-bento-icon">🔔</div>
              <h3>Smart Notifications</h3>
              <p>Never miss an update with personalized, priority-based alerts.</p>
            </div>
          </div>
        </Reveal>
      </section>


      {/* ═══════ SECOND PARALLAX ═══════ */}
      <section className="hp-parallax-section">
        <img src="/images/campus-lecture.png" alt="Lecture Hall" loading="lazy" />
        <div className="hp-parallax-overlay" />
        <div className="hp-parallax-content">
          <Reveal>
            <h2>From <span style={{ color: '#fca5a5' }}>Lecture Halls</span> to <span style={{ color: '#fca5a5' }}>Labs</span></h2>
            <p>
              Manage every type of campus facility — seminar rooms, computer labs, auditoriums, and sports
              complexes — all from a single, unified platform.
            </p>
          </Reveal>
        </div>
      </section>


      {/* ═══════ CTA ═══════ */}
      <section className="hp-cta">
        <Reveal>
          <h2>Ready to get started?</h2>
          <p>
            Join thousands of students and faculty members who are already using Smart Campus Hub
            to streamline their university experience.
          </p>
          {user ? (
            <Link to="/resources" className="hp-btn-primary">
              Browse Facilities <span>→</span>
            </Link>
          ) : (
            <Link to="/login" className="hp-btn-primary">
              Sign In Now <span>→</span>
            </Link>
          )}
        </Reveal>
      </section>


      {/* ═══════ FOOTER ═══════ */}
      <footer className="hp-footer">
        <div className="hp-footer-brand">🏛️ Smart Campus Hub</div>
        <p>© {new Date().getFullYear()} Smart Campus Operations Hub — SLIIT. All rights reserved.</p>
      </footer>

    </div>
  );
}
