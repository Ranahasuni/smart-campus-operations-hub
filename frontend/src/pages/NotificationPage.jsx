import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Trash2, CheckCircle, Info, Ticket, Calendar, Clock, Loader2, Filter, MailOpen } from 'lucide-react';

export default function NotificationPage() {
  const { user, authFetch } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user, filter]);

  const fetchNotifications = async () => {
    try {
      const endpoint = filter === 'UNREAD' ? '/api/notifications/unread' : '/api/notifications';
      const res = await authFetch(`http://localhost:8081${endpoint}?userId=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      const res = await authFetch(`http://localhost:8081/api/notifications/${id}/read`, { method: 'PUT' });
      if (res.ok) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const res = await authFetch(`http://localhost:8081/api/notifications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotifications(notifications.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'HIGH':   return { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', text: '#f87171' };
      case 'MEDIUM': return { bg: 'rgba(234, 179, 8, 0.1)',  border: '#fbbf24', text: '#fbbf24' };
      default:       return { bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6', text: '#60a5fa' };
    }
  };

  const getTypeIcon = (type) => {
    if (type?.includes('BOOKING')) return <Calendar size={18} />;
    if (type?.includes('TICKET'))  return <Ticket size={18} />;
    return <Bell size={18} />;
  };

  if (loading) return (
    <div style={{ padding: '80px', textAlign: 'center', color: '#64748b' }}>
      <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 1rem' }} />
      <p>Fetching alerts...</p>
    </div>
  );

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', 
        paddingBottom: '1.5rem' 
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#fff', fontWeight: 'bold' }}>Notification Hub</h1>
          <p style={{ color: '#94a3b8' }}>Stay updated on your bookings and tickets</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => setFilter('ALL')}
            style={{ 
              padding: '8px 16px', borderRadius: '10px', 
              background: filter === 'ALL' ? '#6366f1' : 'rgba(255,255,255,0.05)',
              color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.875rem' 
            }}
          >
            All Notifications
          </button>
          <button 
            onClick={() => setFilter('UNREAD')}
            style={{ 
              padding: '8px 16px', borderRadius: '10px', 
              background: filter === 'UNREAD' ? '#6366f1' : 'rgba(255,255,255,0.05)',
              color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.875rem' 
            }}
          >
            Unread
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px', color: '#64748b' }}>
            <MailOpen size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p>You have no {filter === 'UNREAD' ? 'unread' : ''} notifications at this time.</p>
          </div>
        ) : (
          notifications.map(n => {
            const styles = getPriorityColor(n.priority);
            return (
              <div key={n.id} style={{
                background: 'rgba(30, 41, 59, 0.4)',
                border: `1px solid ${n.read ? 'rgba(255,255,255,0.05)' : 'rgba(99, 102, 241, 0.3)'}`,
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                gap: '20px',
                position: 'relative',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: n.read ? 0.7 : 1,
                transform: n.read ? 'scale(0.99)' : 'scale(1)'
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: styles.bg, color: styles.border,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {getTypeIcon(n.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.125rem', color: '#f8fafc', fontWeight: '600' }}>{n.title}</h3>
                    <div style={{ 
                      fontSize: '0.75rem', fontWeight: 'bold', 
                      color: styles.text, padding: '2px 8px', 
                      border: `1px solid ${styles.border}`, borderRadius: '4px' 
                    }}>
                      {n.priority}
                    </div>
                  </div>

                  <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6', marginBottom: '12px' }}>
                    {n.message}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#64748b', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} /> {new Date(n.createdAt).toLocaleString()}
                    </div>
                    {n.referenceId && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Info size={14} /> Ref: {n.referenceId}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {!n.read && (
                    <button 
                      onClick={() => markRead(n.id)}
                      title="Mark as read"
                      style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer' }}
                    >
                      <CheckCircle size={20} />
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotification(n.id)}
                    title="Delete permanently"
                    style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.5)', cursor: 'pointer' }}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
