import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  // Wait for session restoration from localStorage
  if (loading) {
    return (
      <div style={{
        height: '80vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: '#6B7281'
      }}>
        Loading session...
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!user) return <Navigate to="/login" />;

  // Redirect to home if role mismatch (e.g. non-admin tries to visit /admin)
  if (role) {
    const isAllowed = Array.isArray(role) ? role.includes(user.role) : user.role === role;
    if (!isAllowed) {
      console.warn(`Access denied to role: ${role}`);
      return <Navigate to="/" />;
    }
  }


  return children;
}
