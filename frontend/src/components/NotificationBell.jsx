import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/notif-bell.css';

const TYPE_ICONS = {
  BOOKING_APPROVED: '✅',
  BOOKING_REJECTED: '❌',
  BOOKING_REMINDER: '⏰',
  TICKET_UPDATED:   '🔧',
  SYSTEM:           '📢',
};

/**
 * Notification Bell — shown in the Navbar.
 * Polls for unread count every 15 seconds.
 * Clicking opens a dropdown with the latest 5 notifications.
 */
export default function NotificationBell() {
  const { user, authFetch, API } = useAuth();

  const [count,    setCount]    = useState(0);
  const [items,    setItems]    = useState([]);
  const [open,     setOpen]     = useState(false);
  const [loading,  setLoading]  = useState(false);

  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Poll unread count
  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      try {
        const res  = await authFetch(`${API}/api/notifications/count?userId=${user.id}`);
        const data = await res.json();
        setCount(data.unread || 0);
      } catch (_) {}
    };
    fetchCount();
    const id = setInterval(fetchCount, 60_000);
    return () => clearInterval(id);
  }, [user]);

  // Fetch latest notifications on open
  const handleOpen = async () => {
    if (!open && user) {
      setLoading(true);
      try {
        const res  = await authFetch(`${API}/api/notifications/unread?userId=${user.id}`);
        const data = await res.json();
        setItems(Array.isArray(data) ? data.slice(0, 5) : []);
      } catch (_) { setItems([]); }
      setLoading(false);
    }
    setOpen(v => !v);
  };

  const markRead = async (id) => {
    await authFetch(`${API}/api/notifications/${id}/read`, { method: 'PUT' });
    setItems(prev => prev.filter(n => n.id !== id));
    setCount(c => Math.max(0, c - 1));
  };

  if (!user) return null;

  return (
    <div className="bell-wrapper" ref={dropdownRef}>
      {/* Bell button */}
      <button
        id="btn-notification-bell"
        className="bell-btn"
        onClick={handleOpen}
        aria-label={`Notifications (${count} unread)`}
      >
        🔔
        {count > 0 && (
          <span className="bell-badge">{count > 99 ? '99+' : count}</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="bell-dropdown">
          <div className="bell-dropdown-header">
            <span>Notifications</span>
            {count > 0 && <span className="bell-count-label">{count} unread</span>}
          </div>

          {loading ? (
            <div className="bell-loading">Loading…</div>
          ) : items.length === 0 ? (
            <div className="bell-empty">🎉 You're all caught up!</div>
          ) : (
            <ul className="bell-list">
              {items.map(n => (
                <li key={n.id} className="bell-item">
                  <span className="bell-item-icon">{TYPE_ICONS[n.type] || '📌'}</span>
                  <div className="bell-item-body">
                    <div className="bell-item-title">{n.title}</div>
                    <div className="bell-item-msg">{n.message}</div>
                  </div>
                  <button
                    className="bell-dismiss"
                    onClick={() => markRead(n.id)}
                    title="Mark as read"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}

          <Link to="/notifications" className="bell-see-all" onClick={() => setOpen(false)}>
            See all notifications →
          </Link>
        </div>
      )}
    </div>
  );
}
