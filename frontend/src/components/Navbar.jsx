import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import '../styles/navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      {/* Brand */}
      <Link to="/" className="navbar-brand">
        <span className="navbar-logo">🏫</span>
        Smart Campus
      </Link>

      {/* Nav links */}
      <div className="navbar-links">
        <Link to="/"           className="nav-link">Home</Link>
        <Link to="/resources"  className="nav-link">Resources</Link>
        <Link to="/bookings"   className="nav-link">Bookings</Link>
        <Link to="/tickets"    className="nav-link">Tickets</Link>
        {user?.role === 'ADMIN' && (
          <Link to="/admin" className="nav-link nav-link-admin">Admin</Link>
        )}
        {['STAFF', 'LECTURER', 'TECHNICIAN'].includes(user?.role) && (
          <Link to="/staff" className="nav-link nav-link-staff">Staff Portal</Link>
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
              <span className="navbar-user-name">{user.fullName}</span>
            </Link>
            <button
              id="btn-navbar-logout"
              className="navbar-logout"
              onClick={handleLogout}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login"    className="navbar-btn-ghost">Sign In</Link>
            <Link to="/register" className="navbar-btn-primary">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
