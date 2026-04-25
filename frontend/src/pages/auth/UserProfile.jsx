import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Shield, Calendar, Mail, Fingerprint, Lock, ShieldCheck, Clock, LogOut } from 'lucide-react';
import '../../styles/profile.css';

// ── Shared Animation Hooks ─────────────────────────────────
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) entry.target.classList.add('revealed');
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = '' }) {
  const ref = useScrollReveal();
  return <div ref={ref} className={`hp-reveal ${className}`}>{children}</div>;
}

const ROLE_BADGES = {
  ADMIN:    { label: 'System Administrator', color: '#8C0000' },
  LECTURER: { label: 'University Faculty',    color: '#B97A7A' },
  STUDENT:  { label: 'Campus Student',        color: '#4B5563' },
  STAFF:    { label: 'Administrative Staff',  color: '#5A0000' },
  TECHNICIAN: { label: 'Facility Technician',  color: '#3B0000' },
};

export default function UserProfile() {
  const { authFetch, API, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await authFetch(`${API}/api/users/profile`);
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#8C0000' }}>
      <Loader2 className="animate-spin mb-4" size={48} />
      <p style={{ fontWeight: 'bold', letterSpacing: '2px' }}>AUTHENTICATING IDENTITY...</p>
    </div>
  );
  
  if (error) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#8C0000' }}>
      <AlertCircle size={48} style={{ margin: '0 auto 20px' }} />
       <p>{error}</p>
    </div>
  );

  const badge = ROLE_BADGES[profile?.role] || { label: profile?.role, color: '#8C0000' };
  const initials = profile?.fullName
    ? profile.fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="profile-container" style={{ padding: '80px 24px', maxWidth: '900px', margin: '0 auto' }}>
      <Reveal>
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.5)', 
          backdropFilter: 'blur(30px)',
          borderRadius: '40px', 
          border: '1px solid rgba(185, 122, 122, 0.15)', 
          padding: '60px',
          position: 'relative',
          boxShadow: '0 20px 80px rgba(140, 0, 0, 0.08)'
        }}>
          {/* Header Section */}
          <div style={{ display: 'flex', gap: '40px', alignItems: 'center', marginBottom: '60px', borderBottom: '1px solid rgba(192, 128, 128, 0.1)', paddingBottom: '40px' }}>
            <div style={{ 
              width: '120px', height: '120px', borderRadius: '32px', 
              background: 'linear-gradient(135deg, #8C0000 0%, #C08080 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '3rem', fontWeight: '900', color: '#fff',
              boxShadow: '0 15px 40px rgba(140, 0, 0, 0.25)'
            }}>
              {initials}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h1 style={{ fontSize: '2.8rem', color: '#1F1F1F', fontWeight: '950', marginBottom: '8px', letterSpacing: '-1.5px' }}>{profile?.fullName}</h1>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ 
                      padding: '6px 16px', background: `${badge.color}10`, 
                      color: badge.color, border: `1px solid ${badge.color}25`,
                      borderRadius: '12px', fontSize: '0.8rem', fontWeight: '900',
                      display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase'
                    }}>
                      <Shield size={16} /> {badge.label}
                    </span>
                    <span style={{ 
                      padding: '6px 16px', background: 'rgba(34, 197, 94, 0.1)', 
                      color: '#166534', border: '1px solid rgba(34, 197, 94, 0.2)',
                      borderRadius: '12px', fontSize: '0.8rem', fontWeight: '900',
                      display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase'
                    }}>
                      <ShieldCheck size={16} /> Verified Security Status
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '48px' }}>
            <ProfileField icon={<Mail size={20} color="#C08080" />} label="University Email Address" value={profile?.campusEmail || 'N/A'} />
            <ProfileField icon={<Fingerprint size={20} color="#C08080" />} label="Internal Security ID" value={`RID-${profile?.id?.slice(-8).toUpperCase()}`} />
            <ProfileField icon={<Calendar size={20} color="#C08080" />} label="Campus Registration (ID)" value={profile?.campusId || 'N/A'} />
            <ProfileField icon={<Clock size={20} color="#C08080" />} label="Last Technical Login" value={profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Currently Active'} />
          </div>

          {/* Security Footer */}
          <div style={{ 
            marginTop: '60px', padding: '32px', borderRadius: '24px', 
            background: 'rgba(185, 122, 122, 0.04)', border: '1px solid rgba(185, 122, 122, 0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Lock size={20} color="#8C0000" />
              <div>
                <p style={{ color: '#1F1F1F', fontSize: '0.95rem', fontWeight: '800', margin: 0 }}>University Access Gateway</p>
                <p style={{ color: '#6B7281', fontSize: '0.8rem', fontWeight: '500', margin: '2px 0 0' }}>End-to-end encrypted identity tunnel active.</p>
              </div>
            </div>
            <button 
              onClick={logout}
              style={{
                padding: '12px 24px', borderRadius: '14px', background: '#fff', border: '1px solid rgba(140, 0, 0, 0.2)',
                color: '#8C0000', fontWeight: '900', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.3s'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(140, 0, 0, 0.05)'}
              onMouseOut={e => e.currentTarget.style.background = '#fff'}
            >
              <LogOut size={16} /> TERMINATE SESSION
            </button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function ProfileField({ icon, label, value }) {
  return (
    <div className="profile-field-anim">
      <div style={{ color: '#6B7281', fontSize: '0.8rem', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {icon} {label}
      </div>
      <div style={{ color: '#1F1F1F', fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.3px' }}>
        {value}
      </div>
    </div>
  );
}

function Loader2({ className, size }) {
    return <Clock className={className} size={size} />
}
function AlertCircle({ className, size }) {
    return <ShieldCheck className={className} size={size} />
}
