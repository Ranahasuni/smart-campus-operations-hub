import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Shield, Calendar, Mail, Fingerprint, Lock, ShieldCheck, Clock } from 'lucide-react';
import '../../styles/profile.css';

const ROLE_BADGES = {
  ADMIN:    { label: 'Administrator',  color: '#f43f5e' },
  LECTURER: { label: 'Faculty',        color: '#8b5cf6' },
  STUDENT:  { label: 'Campus Student', color: '#0ea5e9' },
  STAFF:    { label: 'University Staff', color: '#10b981' },
  TECHNICIAN: { label: 'Technician',   color: '#f59e0b' },
};

export default function UserProfile() {
  const { authFetch, API } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await authFetch(`${API}/users/profile`);
      if (!res.ok) throw new Error('Could not load profile');
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px', color: '#64748b' }}>
      Loading your profile...
    </div>
  );
  
  if (error) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#f87171' }}>
      {error}
    </div>
  );

  const badge = ROLE_BADGES[profile?.role] || { label: profile?.role, color: '#6366f1' };
  const initials = profile?.fullName
    ? profile.fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="profile-container" style={{ padding: '60px 24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ 
        background: 'rgba(30, 41, 59, 0.4)', 
        borderRadius: '24px', 
        border: '1px solid rgba(255,255,255,0.05)', 
        padding: '40px',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div style={{ 
            width: '100px', height: '100px', borderRadius: '24px', 
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 'bold', color: '#fff',
            boxShadow: '0 10px 30px rgba(99, 102, 241, 0.3)'
          }}>
            {initials}
          </div>
          
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '2rem', color: '#fff', fontWeight: 'bold', marginBottom: '0.5rem' }}>{profile?.fullName}</h1>
            <div style={{ display: 'flex', gap: '10px' }}>
              <span style={{ 
                padding: '4px 12px', background: `${badge.color}20`, 
                color: badge.color, border: `1px solid ${badge.color}40`,
                borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                <Shield size={14} /> {badge.label}
              </span>
              <span style={{ 
                padding: '4px 12px', background: 'rgba(34, 197, 94, 0.1)', 
                color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}>
                <ShieldCheck size={14} /> {profile?.status || 'ACTIVE'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '30px' }}>
          <ProfileField icon={<Mail size={18} />} label="Campus Email" value={profile?.campusEmail || 'N/A'} />
          <ProfileField icon={<Fingerprint size={18} />} label="Internal Account ID" value={`#${profile?.id?.slice(-8)}`} />
          <ProfileField icon={<Calendar size={18} />} label="Campus ID" value={profile?.campusId || 'N/A'} />
          <ProfileField icon={<Clock size={18} />} label="Last Session" value={profile?.lastLogin && profile.lastLogin !== "" ? new Date(profile.lastLogin).toLocaleString() : 'Now'} />
        </div>

        <div style={{ 
          marginTop: '40px', padding: '20px', borderRadius: '16px', 
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <Lock size={18} color="#64748b" />
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Your account is secured with end-to-end encryption. You can reset your password from the security settings.
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ icon, label, value }) {
  return (
    <div>
      <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        {icon} {label}
      </div>
      <div style={{ color: '#cbd5e1', fontSize: '1.125rem', fontWeight: '500' }}>
        {value}
      </div>
    </div>
  );
}
