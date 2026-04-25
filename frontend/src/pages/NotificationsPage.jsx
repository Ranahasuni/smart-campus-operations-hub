import { useState, useEffect, useCallback } from 'react';

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
import '../styles/notifications.css';

const TYPE_ICONS = {
  BOOKING_APPROVED: '✅',
  BOOKING_REJECTED: '❌',
  BOOKING_REMINDER: '⏰',
  TICKET_UPDATED:   '🔧',
  SYSTEM:           '📢',
};

const PRIORITY_COLORS = {
  HIGH:   '#ef4444',
  MEDIUM: '#f59e0b',
  LOW:    '#6b7280',
};

const FILTERS = ['ALL', 'BOOKING_APPROVED', 'BOOKING_REJECTED', 'TICKET_UPDATED', 'SYSTEM'];

export default function NotificationsPage() {
  const { user, authFetch, API } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [filter,        setFilter]        = useState('ALL');
  const [showUnread,    setShowUnread]    = useState(false);
  const [loading,       setLoading]       = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      let url = `${API}/notifications?userId=${user.id}`;
      if (showUnread) url = `${API}/notifications/unread?userId=${user.id}`;
      if (filter !== 'ALL') url = `${API}/notifications/filter?userId=${user.id}&type=${filter}`;

      const res  = await authFetch(url);
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (_) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user, filter, showUnread]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    await authFetch(`${API}/notifications/${id}/read`, { method: 'PUT' });
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const handleMarkAllRead = async () => {
    await authFetch(`${API}/notifications/mark-all-read?userId=${user.id}`, { method: 'PUT' });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notif-page">
      {/* Header */}
      <div className="notif-header">
        <div className="notif-title-row">
          <h1>🔔 Notifications</h1>
          {unreadCount > 0 && (
            <span className="notif-badge-pill">{unreadCount} new</span>
          )}
        </div>

        <div className="notif-actions">
          <button
            className={`notif-toggle ${showUnread ? 'active' : ''}`}
            onClick={() => setShowUnread(v => !v)}
          >
            {showUnread ? 'Show All' : 'Unread Only'}
          </button>
          <button
            className="notif-mark-all"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
          >
            Mark All Read
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="notif-filters">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`filter-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'ALL' ? 'All' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="notif-loading">Loading…</div>
      ) : notifications.length === 0 ? (
        <div className="notif-empty">
          <div className="notif-empty-icon">🔕</div>
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="notif-list">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`notif-item ${!n.isRead ? 'unread' : ''}`}
              style={{ borderLeft: `4px solid ${PRIORITY_COLORS[n.priority] || '#6b7280'}` }}
            >
              <div className="notif-item-icon">{TYPE_ICONS[n.type] || '📌'}</div>
              <div className="notif-item-body">
                <div className="notif-item-title">{n.title}</div>
                <div className="notif-item-msg">{n.message}</div>
                <div className="notif-item-meta">
                  <span className="notif-type-tag">{n.type}</span>
                  <span className="notif-time">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              {!n.isRead && (
                <button
                  className="notif-read-btn"
                  onClick={() => handleMarkAsRead(n.id)}
                >
                  ✓
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
