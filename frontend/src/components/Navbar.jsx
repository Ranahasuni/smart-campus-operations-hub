import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { LogOut } from 'lucide-react';
import '../styles/navbar.css';

export default function Navbar() {
  const { user, logout, resetSimulation } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {user?.originalRole && (
        <div style={{
          background: 'linear-gradient(90deg, #f59e0b, #d97706)',
          color: '#000',
          padding: '6px 20px',
          textAlign: 'center',
          fontSize: '0.75rem',
          fontWeight: '800',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          zIndex: 1100,
          position: 'relative'
        }}>
          <span>⚠️ Simulation Mode Active: Viewing as {user.role}</span>
          <button 
            onClick={resetSimulation}
            style={{
              background: '#000',
              color: '#fff',
              border: 'none',
              padding: '2px 10px',
              borderRadius: '4px',
              fontSize: '0.65rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Reset Identity
          </button>
        </div>
      )}
      <nav className="navbar">
      {/* Brand */}
      <Link to="/" className="navbar-brand">
        <span className="navbar-logo">🏫</span>
        Smart Campus Hub
      </Link>

      {/* Role-Specific Navigation */}
      <div className="navbar-links">
        <NavLink to="/" className="nav-link">Home</NavLink>

        {/* Admin Navigation (Restricted) */}
        {user?.role === 'ADMIN' ? (
          <>
            <NavLink to="/admin" end className="nav-link nav-link-admin">Overview</NavLink>
            <NavLink to="/admin/users" className="nav-link nav-link-admin">Accounts</NavLink>
            <NavLink to="/admin/resources" className="nav-link nav-link-admin">Facilities</NavLink>
            <NavLink to="/admin/bookings" className="nav-link nav-link-admin">Reservations</NavLink>
            <NavLink to="/tickets" className="nav-link nav-link-admin">Tickets</NavLink>
            <NavLink to="/admin/logs" className="nav-link nav-link-admin">System Logs</NavLink>
            <NavLink to="/notifications" className="nav-link nav-link-admin">Alerts</NavLink>
          </>
        ) : (
          /* User / Lecturer / Staff Navigation */
          <>
            <NavLink to="/resources" className="nav-link">Resources</NavLink>
            
            {['STUDENT', 'LECTURER'].includes(user?.role) && (
              <>
                <NavLink to="/bookings" className="nav-link">Bookings</NavLink>
                <NavLink to="/my-bookings" className="nav-link">Active Bookings</NavLink>
                <NavLink to="/booking-history" className="nav-link">Booking History</NavLink>
              </>
            )}

            <NavLink to="/tickets" className="nav-link">Tickets</NavLink>

            {user?.role === 'TECHNICIAN' && (
              <NavLink to="/technician" className="nav-link nav-link-staff">Maintenance Hub</NavLink>
            )}

            {['STAFF', 'LECTURER'].includes(user?.role) && (
              <NavLink to="/staff" className="nav-link nav-link-staff">Staff Portal</NavLink>
            )}
          </>
        )}
      </div>

      {/* Right section */}
      <div className="navbar-right">
        {user ? (
          <>
            <NotificationBell />
            <Link to="/profile" className="navbar-user">
              <div className="navbar-avatar">
                {user.fullName?.[0]?.toUpperCase() || '?'}
              </div>
              <span className="navbar-user-name">
                {user.fullName}
                <span className="navbar-role-badge">[{user.role}]</span>
              </span>
            </Link>
            <button
              id="btn-navbar-logout"
              className="navbar-logout-premium"
              onClick={handleLogout}
              title="Sign Out"
            >
              <LogOut size={18} />
              <span className="logout-text">Sign Out</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-btn-ghost">Sign In</Link>
            <Link to="/register" className="navbar-btn-primary">Register</Link>
          </>
        )}
      </div>
    </nav>
    </>
  );
}
