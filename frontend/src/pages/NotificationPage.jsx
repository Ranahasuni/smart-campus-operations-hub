import React, { useState, useEffect } from 'react';
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
      if (view === 'FEED') fetchNotifications();
      if (view === 'SETTINGS') fetchPreferences();
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

  const getPriorityStyle = (p) => {
    switch (p) {
      case 'HIGH':   return { color: '#ef4444', label: 'HIGH',   icon: <TriangleAlert size={12} />, bg: 'rgba(239, 68, 68, 0.1)' };
      case 'MEDIUM': return { color: '#fbbf24', label: 'MEDIUM', icon: <EllipsisVertical size={12} />,  bg: 'rgba(251, 191, 36, 0.1)' };
      case 'LOW':    return { color: '#3b82f6', label: 'LOW',    icon: <Info size={12} />,          bg: 'rgba(59, 130, 246, 0.1)' };
      default:       return { color: '#94a3b8', label: 'NORMAL', icon: <Bell size={12} />,          bg: 'rgba(148, 163, 184, 0.1)' };
    }
  };

  const getTypeIcon = (type) => {
    if (type?.includes('BOOKING')) return <Calendar size={20} color="#818cf8" />;
    if (type?.includes('TICKET'))  return <Ticket size={20} color="#fb7185" />;
    if (type?.includes('SYSTEM') || type?.includes('SECURITY')) return <ShieldAlert size={20} color="#fcd34d" />;
    return <Bell size={20} color="#94a3b8" />;
  };

  const CATEGORY_MAP = {
    SYSTEM: { label: 'System Updates', desc: 'Platform announcements, new features, and campus-wide notices.', icon: <Activity size={20} /> },
    BOOKINGS: { label: 'Reservations', desc: 'Alerts for room bookings, lab check-ins, and schedule changes.', icon: <Calendar size={20} /> },
    MAINTENANCE: { label: 'Service Support', desc: 'Status updates on your technical tickets and maintenance tasks.', icon: <Wrench size={20} /> },
    SECURITY: { label: 'Critical Security', desc: 'Identity verification, login alerts, and account safety warnings.', icon: <ShieldCheck size={20} />, locked: true }
  };

  return (
    <div style={{ padding: '60px 24px', maxWidth: '900px', margin: '0 auto', color: '#f8fafc' }}>
      
      {/* Header */}
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px' }}>
            Alert <span className="gradient-text">Hub</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem' }}>Personalize and manage your campus activity stream</p>
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
          <div style={{ padding: '100px', textAlign: 'center', color: '#64748b' }}>
            <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto 1.5rem', color: '#6366f1' }} />
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
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ 
                  display: 'flex', gap: '8px', padding: '6px', 
                  background: 'rgba(255,255,255,0.03)', borderRadius: '14px', width: 'fit-content'
                }}>
                  {['ALL', 'UNREAD', 'READ', 'HIGH'].map(t => (
                    <button 
                      key={t}
                      onClick={() => setFilter(t)}
                      style={{
                        padding: '10px 24px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '600',
                        border: 'none', cursor: 'pointer', transition: 'all 0.3s ease',
                        background: filter === t ? '#6366f1' : 'transparent',
                        color: filter === t ? '#fff' : '#64748b',
                        boxShadow: filter === t ? '0 4px 12px rgba(99, 102, 241, 0.4)' : 'none'
                      }}
                    >
                      {t.charAt(0) + t.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
                
                <button 
                  onClick={markAllRead}
                  className="glass-btn"
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', 
                    fontSize: '0.875rem', fontWeight: '600', color: '#818cf8', borderRadius: '12px'
                  }}
                >
                  <CheckCheck size={18} /> Mark All as Read
                </button>
             </div>

             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {notifications.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', padding: '80px 20px', background: 'rgba(255,255,255,0.02)', 
                    borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' 
                  }}>
                    <MailOpen size={56} style={{ margin: '0 auto 1.5rem', opacity: 0.2, color: '#94a3b8' }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Inbox is clean 🔕</h3>
                    <p style={{ color: '#64748b' }}>We'll alert you based on your tailored preferences.</p>
                  </div>
                ) : (
                  notifications.map(n => {
                    const priority = getPriorityStyle(n.priority);
                    return (
                      <div 
                        key={n.id} 
                        className={`notif-card ${!n.read ? 'unread' : 'read'}`}
                        onClick={() => !n.read && markRead(n.id)}
                        style={{
                          display: 'flex', gap: '20px', padding: '22px', borderRadius: '20px',
                          background: !n.read ? 'rgba(99, 102, 241, 0.08)' : 'rgba(30, 41, 59, 0.4)',
                          border: `1px solid ${!n.read ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                          position: 'relative', transition: 'all 0.2s ease',
                          opacity: n.read ? 0.75 : 1,
                          cursor: !n.read ? 'pointer' : 'default'
                        }}
                      >
                        {!n.read && <div className="unread-dot" />}

                        <div className="icon-badge">
                          {getTypeIcon(n.type)}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.5px' }}>
                              {n.type?.replace('_', ' ')}
                            </span>
                            <div style={{ 
                              display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 10px', 
                              borderRadius: '6px', fontSize: '0.65rem', fontWeight: '800',
                              background: priority.bg, color: priority.color, border: `1px solid ${priority.color}30`
                            }}>
                              {priority.icon} {priority.label}
                            </div>
                          </div>

                          <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: !n.read ? '700' : '500', marginBottom: '6px' }}>
                            {n.title}
                          </h3>

                          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '14px' }}>
                            {n.message}
                          </p>

                          <div className="notif-footer">
                            <Clock size={13} /> {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString()}
                            {n.referenceId && <span style={{ marginLeft: '12px', color: '#4b5563' }}>ID: {n.referenceId}</span>}
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
          </div>
        )}

        {/* SETTINGS VIEW */}
        {!loading && view === 'SETTINGS' && preferences && (
          <div className="fade-in">
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '4px' }}>Delivery Preferences</h2>
                  <p style={{ color: '#64748b' }}>Configure which categories of alerts you want to receive.</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '6px', fontWeight: '600' }}>
                    <Clock size={12} style={{ marginRight: '4px' }} />
                    LAST UPDATED: {preferences.lastUpdated ? new Date(preferences.lastUpdated).toLocaleString() : 'Never'}
                  </p>
                  <button onClick={resetPreferences} disabled={savingPrefs} className="reset-btn">
                    <RotateCcw size={14} /> Reset Defaults
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(CATEGORY_MAP).map(([key, info]) => (
                  <div 
                    key={key} 
                    style={{ 
                      padding: '20px', borderRadius: '18px', background: 'rgba(15, 23, 42, 0.3)',
                      border: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: '20px'
                    }}
                  >
                    <div style={{ 
                      width: '44px', height: '44px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: info.locked ? 'rgba(234, 179, 8, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                      color: info.locked ? '#eab308' : '#6366f1', border: `1px solid ${info.locked ? '#eab30830' : '#6366f130'}`
                    }}>
                      {info.icon}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h4 style={{ fontWeight: '700', fontSize: '1.05rem' }}>{info.label}</h4>
                        {info.locked && (
                          <span style={{ fontSize: '0.65rem', padding: '2px 8px', background: 'rgba(234, 179, 8, 0.15)', color: '#eab308', borderRadius: '100px', fontWeight: '800', border: '1px solid #eab30830' }}>
                            ENFORCED
                          </span>
                        )}
                      </div>
                      <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{info.desc}</p>
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
                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', fontSize: '0.85rem', fontWeight: '600' }}>
                  <Loader2 className="animate-spin" size={16} /> Syncing preferences to cloud...
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      <style>{`
        .gradient-text {
          background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .tab-toggle {
          display: flex; align-items: center; gap: 8px; padding: 10px 20px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
          color: #94a3b8; border-radius: 12px; font-weight: 600; font-size: 0.9rem;
          cursor: pointer; transition: all 0.3s;
        }
        .tab-toggle.active {
          background: #6366f1; color: white; border-color: #6366f1;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        .notif-card { position: relative; transition: 0.2s; }
        .notif-card:hover { transform: translateY(-2px); border-color: rgba(99,102,241,0.3) !important; background: rgba(99, 102, 241, 0.12) !important; }
        .unread-dot {
          position: absolute; left: 8px; top: 50%; transform: translateY(-50%);
          width: 8px; height: 8px; background: #6366f1; border-radius: 50%;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.5);
        }
        .icon-badge {
          width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justifyContent: center;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); flex-shrink: 0;
        }
        .notif-footer { margin-top: 12px; display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: #475569; font-weight: 600; }
        .trash-btn {
          width: 36px; height: 36px; border-radius: 10px; border: none; background: rgba(239, 68, 68, 0.08);
          color: #ef4444; cursor: pointer; display: flex; align-items: center; justifyContent: center;
          transition: 0.2s;
        }
        .trash-btn:hover { background: #ef4444; color: white; transform: scale(1.1); }
        .reset-btn {
          display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.02);
          color: #64748b; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: 0.2s;
        }
        .reset-btn:hover { background: rgba(99, 102, 241, 0.1); color: #818cf8; border-color: #818cf830; }
        .reset-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Custom Toggle Switch */
        .toggle-wrapper { position: relative; width: 48px; height: 24px; }
        .toggle-wrapper input { opacity: 0; width: 0; height: 0; }
        .toggle-label {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background-color: #334155; border-radius: 34px; cursor: pointer;
          transition: .3s; border: 1px solid rgba(255,255,255,0.05);
        }
        .toggle-label.disabled { cursor: not-allowed; opacity: 0.4; }
        .toggle-switch {
          position: absolute; height: 18px; width: 18px; left: 3px; bottom: 2px;
          background-color: #f8fafc; border-radius: 50%; transition: .3s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        input:checked + .toggle-label { background-color: #6366f1; border-color: #818cf8; }
        input:checked + .toggle-label .toggle-switch { transform: translateX(24px); }
        
        .fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .glass-btn { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); transition: 0.2s; cursor: pointer; }
        .glass-btn:hover { background: rgba(99, 102, 241, 0.1); border-color: #6366f140; }
      `}</style>
    </div>
  );
}
