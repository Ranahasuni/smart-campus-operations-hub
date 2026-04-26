import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// -- Shared Animation Hooks ---------------------------------
function useScrollReveal() {
  const ref = React.useRef(null);
  React.useEffect(() => {
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
  return <div ref={ref} className={`hp-reveal `}>{children}</div>;
}

import { useAuth } from '../context/AuthContext';
import { 
  Bell, Trash2, CheckCircle, Info, Ticket, Calendar, Clock, 
  Loader2, Filter, MailOpen, TriangleAlert, ShieldAlert,
  CheckCheck, EllipsisVertical, Settings, ShieldCheck, 
  Wrench, Activity, ChevronRight, RotateCcw
} from 'lucide-react';

/**
 * Advanced Notification Hub
 * Features: Multi-category Feed, Preference Settings, Enforced Security Alerts.
 */
export default function NotificationPage() {
  const navigate = useNavigate();
  const { user, authFetch, API } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('FEED'); // FEED, SETTINGS
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD, READ, HIGH
  const [preferences, setPreferences] = useState(null);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      // Always fetch preferences for filtering
      fetchPreferences();
      
      if (view === 'FEED') fetchNotifications();
    }
  }, [user, view, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      let endpoint = '/api/notifications';
      if (filter === 'UNREAD') endpoint = '/api/notifications/unread';
      
      const res = await authFetch(`${API}${endpoint}?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch notifications');
      
      let data = await res.json();
      
      if (filter === 'READ') data = data.filter(n => n.read);
      if (filter === 'HIGH') data = data.filter(n => n.priority === 'HIGH');

      setNotifications(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API}/api/notification-preferences/me`);
      if (!res.ok) throw new Error('Failed to fetch settings');
      const data = await res.json();
      setPreferences(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (category, value) => {
    if (category === 'SECURITY') return; // Enforce security stays ON

    const newSettings = { ...preferences.settings, [category]: value };
    await savePreferences(newSettings);
  };

  const savePreferences = async (settings) => {
    setSavingPrefs(true);
    try {
      const res = await authFetch(`${API}/api/notification-preferences/me`, {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Failed to save preferences');
      const data = await res.json();
      setPreferences(data);
    } catch (err) {
      setError('Failed to sync preferences. Please try again.');
    } finally {
      setSavingPrefs(false);
    }
  };

  const resetPreferences = async () => {
    const defaults = {
      SYSTEM: true,
      BOOKINGS: true,
      MAINTENANCE: true,
      SECURITY: true
    };
    await savePreferences(defaults);
  };

  const markRead = async (id) => {
    try {
      const res = await authFetch(`${API}/api/notifications/${id}/read`, { method: 'PUT' });
      if (res.ok) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    if (notifications.filter(n => !n.read).length === 0) return;
    try {
      const res = await authFetch(`${API}/api/notifications/mark-all-read?userId=${user.id}`, { method: 'PUT' });
      if (res.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const res = await authFetch(`${API}/api/notifications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotifications(notifications.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    // 1. Mark as read if not already
    if (!notif.read) {
      markRead(notif.id);
    }

    // 2. Navigation logic based on type and referenceId
    if (!notif.referenceId) return;

    if (notif.type?.includes('BOOKING')) {
      try {
        // Fetch booking to see if it's history or active
        const res = await authFetch(`${API}/api/bookings/${notif.referenceId}`);
        if (!res.ok) {
          navigate('/my-bookings');
          return;
        }
        const b = await res.json();
        
        // Smart Redirect Logic
        const today = new Date().toISOString().split('T')[0];
        const isHistory = b.status === 'REJECTED' || b.status === 'CANCELLED' || 
                          b.status === 'CHECKED_OUT' || b.status === 'NO_SHOW' || 
                         (b.status === 'APPROVED' && b.date < today);

        if (isHistory) {
          navigate('/booking-history');
        } else {
          navigate('/my-bookings');
        }
      } catch (err) {
        navigate('/my-bookings');
      }
    } else if (notif.type?.includes('TICKET')) {
      // Direct user to specific ticket details
      navigate(`/tickets/${notif.referenceId}`);
    } else if (notif.type?.includes('SECURITY')) {
      navigate('/profile');
    }
  };

  const getPriorityStyle = (p) => {
    switch (p) {
      case 'HIGH':   return { color: '#ef4444', label: 'HIGH',   icon: <TriangleAlert size={12} style={{ display: 'block' }} />, bg: 'rgba(239, 68, 68, 0.1)' };
      case 'MEDIUM': return { color: '#fbbf24', label: 'MEDIUM', icon: <EllipsisVertical size={12} style={{ display: 'block' }} />,  bg: 'rgba(251, 191, 36, 0.1)' };
      case 'LOW':    return { color: '#3b82f6', label: 'LOW',    icon: <Info size={12} style={{ display: 'block' }} />,          bg: 'rgba(59, 130, 246, 0.1)' };
      default:       return { color: '#6B7281', label: 'NORMAL', icon: <Bell size={12} style={{ display: 'block' }} />,          bg: 'rgba(148, 163, 184, 0.1)' };
    }
  };

  const getTypeIcon = (type) => {
    if (type?.includes('BOOKING')) return <Calendar size={18} />;
    if (type?.includes('TICKET'))  return <Ticket size={18} />;
    if (type?.includes('SYSTEM') || type?.includes('SECURITY')) return <ShieldAlert size={18} />;
    return <Bell size={18} />;
  };

  const CATEGORY_MAP = {
    SYSTEM: { label: 'System Updates', desc: 'Critical platform announcements and campus-wide technical notices.', icon: <Activity size={18} /> },
    BOOKINGS: { label: 'Reservations', desc: 'Alerts for room bookings, lab check-ins, and schedule modifications.', icon: <Calendar size={18} /> },
    MAINTENANCE: { label: 'Service Support', desc: 'Operational status on technical tickets and infrastructure tasks.', icon: <Wrench size={18} /> },
    SECURITY: { label: 'Account Security', desc: 'Identity verification, login alerts, and multi-factor safety warnings.', icon: <ShieldCheck size={18} />, locked: true }
  };

  return (
    <div style={{ padding: '80px 24px', maxWidth: '1000px', margin: '0 auto', color: '#0f172a' }}>
      
      {/* Header */}
      <header style={{ marginBottom: '3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2.8rem', fontWeight: '900', marginBottom: '8px', letterSpacing: '-2px', color: '#1e293b' }}>
            Alert <span style={{ color: '#8C0000' }}>Hub</span>
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '500' }}>Manage your university activity stream and security notifications.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setView('FEED')}
            className={`tab-toggle ${view === 'FEED' ? 'active' : ''}`}
          >
            <Bell size={18} /> Feed
          </button>
          <button 
            onClick={() => setView('SETTINGS')}
            className={`tab-toggle ${view === 'SETTINGS' ? 'active' : ''}`}
          >
            <Settings size={18} /> Settings
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ minHeight: '400px', position: 'relative' }}>
        
        {loading && (
          <div style={{ padding: '100px', textAlign: 'center', color: '#6B7281' }}>
            <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto 1.5rem', color: '#C08080' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Syncing data...</p>
          </div>
        )}

        {!loading && error && (
          <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '12px', textAlign: 'center', marginBottom: '2rem' }}>
            {error}
          </div>
        )}

        {/* FEED VIEW */}
        {!loading && view === 'FEED' && (
          <div className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div style={{ 
                  display: 'flex', gap: '4px', padding: '4px', 
                  background: '#f1f5f9', borderRadius: '10px', width: 'fit-content',
                  border: '1px solid #e2e8f0'
                }}>
                  {['ALL', 'UNREAD', 'READ', 'HIGH'].map(t => (
                    <button 
                      key={t}
                      onClick={() => setFilter(t)}
                      style={{
                        padding: '8px 20px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700',
                        border: 'none', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        background: filter === t ? '#fff' : 'transparent',
                        color: filter === t ? '#0f172a' : '#64748b',
                        boxShadow: filter === t ? '0 4px 10px rgba(0,0,0,0.05)' : 'none'
                      }}
                    >
                      {t.charAt(0) + t.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={markAllRead}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', 
                    fontSize: '0.85rem', fontWeight: '700', color: '#8C0000', borderRadius: '10px',
                    background: 'transparent', border: '1px solid #e2e8f0', cursor: 'pointer'
                  }}
                >
                  <CheckCheck size={18} /> Mark All Read
                </button>
             </div>

             {/* Get notifications filtered by preferences */}
             {(() => {
               const getCategoryForNotification = (type) => {
                 if (type?.includes('BOOKING')) return 'BOOKINGS';
                 if (type?.includes('TICKET') || type?.includes('MAINTENANCE')) return 'MAINTENANCE';
                 if (type?.includes('SECURITY')) return 'SECURITY';
                 return 'SYSTEM';
               };

               const filteredNotifications = notifications.filter(n => {
                 const category = getCategoryForNotification(n.type);
                 return preferences?.settings?.[category] !== false;
               });

               return (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredNotifications.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', padding: '100px 20px', background: '#f8fafc', 
                    borderRadius: '20px', border: '1px dashed #e2e8f0' 
                  }}>
                    <MailOpen size={48} style={{ margin: '0 auto 1.5rem', color: '#cbd5e1' }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', color: '#334155' }}>No alerts found</h3>
                    <p style={{ color: '#64748b', fontWeight: '500' }}>Your activity stream is currently up to date.</p>
                  </div>
                ) : (
                  filteredNotifications.map(n => {
                    const priority = getPriorityStyle(n.priority);
                    return (
                      <div 
                        key={n.id} 
                        className={`notif-card ${!n.read ? 'unread' : 'read'}`}
                        onClick={() => handleNotificationClick(n)}
                        style={{
                          display: 'flex', gap: '24px', padding: '24px', borderRadius: '16px',
                          background: '#fff',
                          border: '1px solid #e2e8f0',
                          position: 'relative', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          opacity: n.read ? 0.6 : 1,
                          boxShadow: !n.read ? '0 10px 30px rgba(99, 102, 241, 0.08)' : 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {!n.read && <div className="unread-dot" />}

                        <div style={{
                          width: '52px', height: '52px', borderRadius: '12px', background: '#f1f5f9',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b',
                          border: '1px solid #e2e8f0', flexShrink: 0
                        }}>
                          {getTypeIcon(n.type)}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase' }}>
                              {n.type?.replace('_', ' ')}
                            </span>
                            <div style={{ 
                              display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', 
                              borderRadius: '8px', fontSize: '0.7rem', fontWeight: '900',
                              background: priority.bg, color: priority.color, border: `1px solid ${priority.color}30`
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{priority.icon}</div> 
                              {priority.label}
                            </div>
                          </div>

                          <h3 style={{ fontSize: '1.2rem', color: '#1e293b', fontWeight: '800', marginBottom: '6px', letterSpacing: '-0.3px' }}>
                            {n.title}
                          </h3>

                          <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.6', marginBottom: '16px', fontWeight: '500' }}>
                            {n.message}
                          </p>

                          <div className="notif-footer" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8' }}>
                            <Clock size={14} /> 
                            <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString()}</span>
                            {n.referenceId && <span style={{ marginLeft: '12px', paddingLeft: '12px', borderLeft: '2px solid #f1f5f9' }}>REF: {n.referenceId}</span>}
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <button onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }} className="trash-btn">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
             </div>
               );
             })()}
          </div>
        )}

        {/* SETTINGS VIEW */}
        {!loading && view === 'SETTINGS' && preferences && (
          <div className="fade-in">
            <div style={{ background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '40px', boxShadow: '0 20px 50px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '8px', letterSpacing: '-1px' }}>Notification Settings</h2>
                  <p style={{ color: '#64748b', fontWeight: '500' }}>Control how you receive alerts across university modules.</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px', fontWeight: '700' }}>
                    SYNCED: {preferences.lastUpdated ? new Date(preferences.lastUpdated).toLocaleString() : 'Never'}
                  </p>
                  <button onClick={resetPreferences} disabled={savingPrefs} className="reset-btn">
                    <RotateCcw size={14} /> Restore Defaults
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Object.entries(CATEGORY_MAP).map(([key, info]) => (
                  <div 
                    key={key} 
                    style={{ 
                      padding: '24px', borderRadius: '16px', background: '#f8fafc',
                      border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '20px'
                    }}
                  >
                    <div style={{ 
                      width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: info.locked ? '#fffbeb' : '#fff',
                      color: info.locked ? '#d97706' : '#8C0000', border: `1px solid ${info.locked ? '#fffbeb' : '#e2e8f0'}`
                    }}>
                      {info.icon}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <h4 style={{ fontWeight: '800', fontSize: '1.1rem', color: '#1e293b' }}>{info.label}</h4>
                        {info.locked && (
                          <span style={{ fontSize: '0.65rem', padding: '4px 10px', background: '#fffbeb', color: '#d97706', borderRadius: '6px', fontWeight: '900', border: '1px solid #fef3c7' }}>
                            ENFORCED
                          </span>
                        )}
                      </div>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>{info.desc}</p>
                    </div>

                    <div className="toggle-wrapper">
                      <input 
                        type="checkbox" 
                        disabled={info.locked || savingPrefs}
                        checked={preferences.settings[key] ?? true}
                        onChange={(e) => updatePreference(key, e.target.checked)}
                        id={`toggle-${key}`}
                      />
                      <label htmlFor={`toggle-${key}`} className={`toggle-label ${info.locked ? 'disabled' : ''}`}>
                        <span className="toggle-inner" />
                        <span className="toggle-switch" />
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {savingPrefs && (
                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#C08080', fontSize: '0.85rem', fontWeight: '600' }}>
                  <Loader2 className="animate-spin" size={16} /> Syncing preferences to cloud...
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      <style>{`
        .gradient-text {
          background: linear-gradient(135deg, #C08080 0%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .tab-toggle {
          display: flex; align-items: center; gap: 8px; padding: 10px 24px;
          background: transparent; border: 1px solid #e2e8f0;
          color: #64748b; border-radius: 10px; font-weight: 700; font-size: 0.9rem;
          cursor: pointer; transition: 0.2s;
        }
        .tab-toggle.active {
          background: #0f172a; color: white; border-color: #0f172a;
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.1);
        }
        .unread-dot {
          position: absolute; left: -4px; top: 24px;
          width: 8px; height: 8px; background: #8C0000; border-radius: 50%;
          box-shadow: 0 0 12px rgba(140, 0, 0, 0.4);
        }
        .notif-card:hover { border-color: #cbd5e1 !important; transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.04); }
        .trash-btn {
          width: 40px; height: 40px; border-radius: 10px; border: none; background: #fef2f2;
          color: #ef4444; cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
        }
        .trash-btn:hover { background: #fee2e2; transform: scale(1.05); }
        .reset-btn {
          display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 10px;
          border: 1px solid #e2e8f0; background: #f8fafc;
          color: #475569; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: 0.2s;
        }
        .reset-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }
        .reset-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Custom Toggle Switch */
        .toggle-wrapper { position: relative; width: 44px; height: 22px; }
        .toggle-wrapper input { opacity: 0; width: 0; height: 0; }
        .toggle-label {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background-color: #e2e8f0; border-radius: 34px; cursor: pointer;
          transition: .3s;
        }
        .toggle-label.disabled { cursor: not-allowed; opacity: 0.4; }
        .toggle-switch {
          position: absolute; height: 16px; width: 16px; left: 3px; bottom: 3px;
          background-color: #fff; border-radius: 50%; transition: .3s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        input:checked + .toggle-label { background-color: #10b981; }
        input:checked + .toggle-label .toggle-switch { transform: translateX(22px); }
        
        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
