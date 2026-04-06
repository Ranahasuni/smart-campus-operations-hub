import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/profile.css';

const ROLE_BADGES = {
  ADMIN:    { label: 'Admin',    color: '#ef4444' },
  LECTURER: { label: 'Lecturer', color: '#8b5cf6' },
  STUDENT:  { label: 'Student',  color: '#3b82f6' },
  USER:     { label: 'User',     color: '#6b7280' },
};

export default function UserProfile() {
  const { user, authFetch, API } = useAuth();
  const [profile,  setProfile]   = useState(null);
  const [loading,  setLoading]   = useState(true);
  const [error,    setError]     = useState('');

  useEffect(() => {
    authFetch(`${API}/users/profile`)
      .then(r => r.json())
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load profile');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="profile-loading">Loading profile…</div>;
  if (error)   return <div className="profile-error">{error}</div>;

  const badge = ROLE_BADGES[profile?.role] || ROLE_BADGES.USER;
  const initials = profile?.name
    ? profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="profile-page">
      <div className="profile-card">
        {/* Avatar */}
        <div className="profile-avatar">{initials}</div>

        {/* Name + Badge */}
        <h2 className="profile-name">{profile?.name}</h2>
        <span className="profile-badge" style={{ background: badge.color }}>
          {badge.label}
        </span>

        {/* Info grid */}
        <div className="profile-info">
          <div className="profile-info-row">
            <span className="info-label">📧 Email</span>
            <span className="info-value">{profile?.email}</span>
          </div>
          <div className="profile-info-row">
            <span className="info-label">🪪 User ID</span>
            <span className="info-value">#{profile?.id}</span>
          </div>
          <div className="profile-info-row">
            <span className="info-label">🔐 Role</span>
            <span className="info-value">{profile?.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
