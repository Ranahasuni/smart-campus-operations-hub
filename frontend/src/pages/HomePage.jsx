import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: '🏰',
    title: 'Facilities & Assets',
    desc: 'Browse and manage university lecture halls, labs, and equipment catalogues.',
    link: '/resources',
  },
  {
    icon: '📅',
    title: 'Reservations',
    desc: 'Reserve space for lectures, workshops, or study groups in real-time.',
    link: '/bookings',
  },
  {
    icon: '🎫',
    title: 'Support Tickets',
    desc: 'Report facility issues or request technical support for campus assets.',
    link: '/tickets',
  },
  {
    icon: '🔔',
    title: 'System Updates',
    desc: 'Real-time notifications for booking approvals, ticket updates, and security alerts.',
    link: '/notifications',
  },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="home-hero" style={{
      padding: '80px 24px',
      background: 'radial-gradient(circle at 50% -20%, #1e1b4b 0%, #0f172a 70%)',
      minHeight: 'calc(100vh - 64px)'
    }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '20px' }}>
          Welcome back, <span className="gradient-text">{user?.name || 'Academic Leader'}</span>
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1.25rem',
          maxWidth: '700px',
          margin: '0 auto 60px'
        }}>
          Experience a smarter way to manage university operations. Seamlessly book space, monitor assets, and stay informed with real-time updates.
        </p>

        {/* Feature Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
          margin: '0 auto',
        }}>
          {FEATURES.map((f, i) => (
            <Link key={i} to={f.link} className="glass-card feature-item" style={{
              padding: '40px 32px',
              textAlign: 'left',
              transition: 'transform 0.3s, box-shadow 0.3s',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              <div style={{ fontSize: '2.5rem' }}>{f.icon}</div>
              <h3 style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{f.desc}</p>
              <div style={{
                marginTop: 'auto',
                color: 'var(--accent-primary)',
                fontWeight: '600',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                Explore module →
              </div>
            </Link>
          ))}
        </div>

        {/* Call to Action for Admin */}
        {user?.role === 'ADMIN' && (
          <div className="glass-card" style={{
            marginTop: '60px',
            padding: '32px',
            border: '1px solid var(--accent-primary)',
            background: 'rgba(99, 102, 241, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            flexWrap: 'wrap'
          }}>
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>🛡️ Admin Control Panel</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Manage user permissions, approve high-priority bookings, and oversee system health.
              </p>
            </div>
            <Link to="/admin" className="navbar-btn-primary" style={{ padding: '12px 32px' }}>
              Launch Admin Dashboard
            </Link>
          </div>
        )}
      </div>

      <style>{`
        .feature-item:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          border-color: var(--accent-primary);
        }
      `}</style>
    </div>
  );
}
