import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Role-Specific Module Lists
const USER_FEATURES = [
  { icon: '🏰', title: 'Facilities & Assets', desc: 'Browse and manage university lecture halls, labs, and catalogues.', link: '/resources' },
  { icon: '📅', title: 'Reservations', desc: 'Reserve space for lectures, workshops, or study groups in real-time.', link: '/bookings' },
  { icon: '🎫', title: 'Support Tickets', desc: 'Report facility issues or request technical support for campus assets.', link: '/tickets' },
  { icon: '🔔', title: 'Notifications', desc: 'Real-time updates on booking approvals and ticket status.', link: '/notifications' }
];

const ADMIN_FEATURES = [
  { icon: '🛡️', title: 'Admin Overview', desc: 'System-wide monitoring, status updates, and overall health reports.', link: '/admin' },
  { icon: '👥', title: 'Account Control', desc: 'Manage users, assign roles, unlock accounts, and control system access.', link: '/admin/users' },
  { icon: '📜', title: 'Security Logs', desc: 'View chronological audit trails of all system modifications and events.', link: '/admin/logs' },
  { icon: '🔔', title: 'System Alerts', desc: 'Monitor failed login attempts and high-security system events.', link: '/notifications' }
];

const LECTURER_FEATURES = [
  { icon: '🏰', title: 'Facilities & Assets', desc: 'Browse and manage university lecture halls, labs, and catalogues.', link: '/resources' },
  { icon: '📅', title: 'Reservations', desc: 'Reserve space for lectures, workshops, or study groups in real-time.', link: '/bookings' },
  { icon: '🎫', title: 'Support Tickets', desc: 'Report facility issues or request technical support for campus assets.', link: '/tickets' },
  { icon: '🔔', title: 'Notifications', desc: 'Real-time updates on booking approvals and ticket status.', link: '/notifications' }
];

export default function HomePage() {
  const { user } = useAuth();
  const features = user?.role === 'ADMIN' 
    ? ADMIN_FEATURES 
    : user?.role === 'LECTURER'
      ? LECTURER_FEATURES
      : user?.role === 'TECHNICIAN'
        ? USER_FEATURES.filter(f => f.title !== 'Reservations')
        : USER_FEATURES;

  return (
    <div className="home-hero" style={{
      padding: '80px 24px',
      background: 'radial-gradient(circle at 50% -20%, #8C0000 0%, #3B0000 70%)',
      minHeight: 'calc(100vh - 64px)',
      color: '#fff'
    }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '20px', color: '#fff' }}>
          Welcome back, <span className="gradient-text">{user?.fullName || 'Academic Leader'}</span>
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.85)',
          fontSize: '1.25rem',
          maxWidth: '800px',
          margin: '0 auto 60px'
        }}>
          {user?.role === 'ADMIN'
            ? 'Administrator Portal: Oversee campus operations and maintain system integrity with full security authorization.'
            : user?.role === 'LECTURER'
              ? 'Lecturer Console: Manage your academic reservations and monitor campus facilities in real-time.'
              : 'Experience a smarter way to manage university operations. Seamlessly book space, monitor assets, and stay informed.'}
        </p>


        {/* Feature Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
          margin: '0 auto',
        }}>
          {features.map((f, i) => (
            <Link key={i} to={f.link} className="glass-card feature-item" style={{
              padding: '40px 32px',
              textAlign: 'left',
              transition: 'transform 0.3s, box-shadow 0.3s',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(185, 122, 122, 0.3)',
              boxShadow: '0 8px 32px rgba(140, 0, 0, 0.08)'
            }}>
              <div style={{ fontSize: '2.5rem' }}>{f.icon}</div>
              <h3 style={{ color: '#1F1F1F' }}>{f.title}</h3>
              <p style={{ color: '#4B5563', fontSize: '0.95rem' }}>{f.desc}</p>
              <div style={{
                marginTop: 'auto',
                color: '#8C0000',
                fontWeight: '700',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                Open Module →
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Help for Admin */}
        {user?.role === 'ADMIN' && (
          <div className="glass-card" style={{
            marginTop: '60px',
            padding: '24px',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            background: 'rgba(234, 179, 8, 0.05)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <span style={{ fontSize: '1.5rem' }}>🛡️</span>
            <span style={{ color: '#fbbf24', fontSize: '0.9rem', fontWeight: '500' }}>
              Security Protocol: You are logged in with **Full Administrative Privileges**.
            </span>
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
