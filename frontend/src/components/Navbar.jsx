import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={{ padding: '12px 24px', borderBottom: '1px solid #eee',
      display: 'flex', gap: '24px', alignItems: 'center' }}>
      <span style={{ fontWeight: 600 }}>Smart Campus</span>
      <Link to="/">Home</Link>
      <Link to="/resources">Resources</Link>
      <Link to="/bookings">Bookings</Link>
      <Link to="/tickets">Tickets</Link>
      {user?.role === 'ADMIN' &&
        <Link to="/admin">Admin</Link>}
      {user
        ? <button onClick={logout}>Logout</button>
        : <Link to="/login">Login</Link>}
    </nav>
  );
}
