import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Bell, Trash2, CheckCircle, Info, Ticket, Calendar, Clock, 
  Loader2, Filter, MailOpen, TriangleAlert, ShieldAlert,
  CheckCheck, EllipsisVertical
} from 'lucide-react';

/**
 * Advanced Notification Hub
 * Features: Relative time, Priority colors, Mark all as read, Empty states, Filter tabs.
 */
export default function NotificationPage() {
  const { user, authFetch } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD, READ, HIGH
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user, filter]);

  const fetchNotifications = async () => {
    try {
      let endpoint = '/api/notifications';
      if (filter === 'UNREAD') endpoint = '/api/notifications/unread';
      
      const res = await authFetch(`http://localhost:8082${endpoint}?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch notifications');
      
      let data = await res.json();
      
      // Client-side filtering for READ and HIGH since backend is simple
      if (filter === 'READ') data = data.filter(n => n.read);
      if (filter === 'HIGH') data = data.filter(n => n.priority === 'HIGH');

      setNotifications(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      const res = await authFetch(`http://localhost:8082/api/notifications/${id}/read`, { method: 'PUT' });
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
      const res = await authFetch(`http://localhost:8082/api/notifications/mark-all-read?userId=${user.id}`, { method: 'PUT' });
      if (res.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const res = await authFetch(`http://localhost:8082/api/notifications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotifications(notifications.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Helper: Format Time Relative
  const formatTime = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now - past;
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return 'Yesterday';
    return past.toLocaleDateString();
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

  if (loading) return (
    <div style={{ padding: '100px', textAlign: 'center', color: '#64748b' }}>
      <Loader2 className="animate-spin" size={40} style={{ margin: '0 auto 1.5rem', color: '#6366f1' }} />
      <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Syncing your campus alerts...</p>
    </div>
  );

  return (
    <div style={{ padding: '60px 24px', maxWidth: '900px', margin: '0 auto', color: '#f8fafc' }}>
      
      {/* Header */}
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px' }}>
            Alert <span className="gradient-text">Hub</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem' }}>Stay informed with real-time campus activity</p>
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
      </header>

      {/* Filter Tabs */}
      <div style={{ 
        display: 'flex', gap: '8px', marginBottom: '2rem', padding: '6px', 
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

      {error ? (
        <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '12px', textAlign: 'center' }}>
          {error}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {notifications.length === 0 ? (
            <div style={{ 
              textAlign: 'center', padding: '80px 20px', background: 'rgba(255,255,255,0.02)', 
              borderRadius: '24px', border: '1px dashed rgba(255,255,255,0.1)' 
            }}>
              <MailOpen size={56} style={{ margin: '0 auto 1.5rem', opacity: 0.2, color: '#94a3b8' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No notifications found 🔕</h3>
              <p style={{ color: '#64748b' }}>We'll alert you when something important happens.</p>
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
                  {/* Status Indicator (Red Dot) */}
                  {!n.read && (
                    <div style={{ 
                      position: 'absolute', left: '-4px', top: '50%', transform: 'translateY(-50%)',
                      width: '8px', height: '8px', background: '#f43f5e', borderRadius: '50%',
                      boxShadow: '0 0 10px #f43f5e'
                    }} />
                  )}

                  {/* Icon Area */}
                  <div style={{ 
                    width: '52px', height: '52px', borderRadius: '15px', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    {getTypeIcon(n.type)}
                  </div>

                  {/* Content Area */}
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

                    <h3 style={{ 
                      fontSize: '1.15rem', color: '#fff', fontWeight: !n.read ? '700' : '500', 
                      marginBottom: '6px', lineHeight: '1.4' 
                    }}>
                      {n.title}
                    </h3>

                    <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '14px' }}>
                      {n.message}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#64748b', fontSize: '0.75rem', fontWeight: '500' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={13} /> {formatTime(n.createdAt)}
                      </div>
                      {n.referenceId && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Info size={13} /> Ref: {n.referenceId}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                    {!n.read && (
                      <button 
                        onClick={() => markRead(n.id)}
                        className="action-btn-circle"
                        title="Mark as Read"
                        style={{ color: '#6366f1', background: 'rgba(99,102,241,0.1)' }}
                      >
                        <CheckCircle size={20} />
                      </button>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n.id);
                      }}
                      className="action-btn-circle"
                      title="Delete"
                      style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <style>{`
        .action-btn-circle {
          width: 40px; height: 40px; border-radius: 12px; border: none;
          display: flex; alignItems: center; justifyContent: center;
          cursor: pointer; transition: all 0.2s ease;
        }
        .action-btn-circle:hover {
          transform: scale(1.1);
        }
        .notif-card:hover {
          transform: translateX(4px);
          border-color: rgba(99, 102, 241, 0.4);
          background: rgba(99, 102, 241, 0.12) !important;
        }
        .gradient-text {
          background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .glass-btn {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          cursor: pointer;
          transition: 0.3s;
        }
        .glass-btn:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(129, 140, 248, 0.4);
        }
      `}</style>
    </div>
  );
}
