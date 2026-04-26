import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ClipboardList, 
  AlertCircle, 
  CheckCircle, 
  Wrench, 
  Search, 
  PlusCircle,
  Clock,
  ExternalLink,
  QrCode,
  UserCheck,
  ShieldAlert,
  X,
  Building2
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import '../styles/staff-portal.css';

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

export default function StaffPortal() {
  const { user, authFetch, API } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeTickets: 0,
    myTickets: 0,
    urgentTickets: 0,
    completedToday: 0
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [assignedResources, setAssignedResources] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRoomTickets, setMyRoomTickets] = useState([]);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [bookingCode, setBookingCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [checkInCount, setCheckInCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Use specialized high-performance endpoints added in Phase 1
      const [statsRes, recentRes, resourceRes, scheduleRes] = await Promise.all([
        authFetch(`${API}/api/tickets/stats/technician/${user.id}`),
        authFetch(`${API}/api/tickets/recent?limit=5`),
        authFetch(`${API}/api/resources`),
        authFetch(`${API}/api/bookings/staff/today`)
      ]);

      if (statsRes.ok && recentRes.ok && resourceRes.ok && scheduleRes.ok) {
        const [ticketStats, tickets, resources, schedule] = await Promise.all([
          statsRes.json(),
          recentRes.json(),
          resourceRes.json(),
          scheduleRes.json()
        ]);
        
        let myBookingsCount = 0;
        if (user.role === 'LECTURER') {
          const bRes = await authFetch(`${API}/api/bookings/user`);
          if (bRes.ok) {
            const bData = await bRes.json();
            myBookingsCount = bData.length;
          }
        }

        // For STAFF: Filter tickets to only those in their assigned rooms
        const assignedResourcesList = resources.filter(r => r.assignedStaffIds?.includes(user.id));
        const assignedRoomIds = assignedResourcesList.map(r => r.id);
        const staffRoomTickets = user.role === 'STAFF' 
          ? tickets.filter(t => assignedRoomIds.includes(t.resourceId) && t.status !== 'RESOLVED' && t.status !== 'CLOSED')
          : [];

        setStats({
          activeTickets: ticketStats.activeTickets || 0,
          myTickets: user.role === 'LECTURER' ? myBookingsCount : (ticketStats.myTickets || 0),
          urgentTickets: ticketStats.urgentTickets || 0,
          completedToday: ticketStats.completedToday || 0
        });

        setRecentTickets(tickets);
        setAssignedResources(assignedResourcesList);
        setMyRoomTickets(staffRoomTickets);
        setTodaySchedule(schedule);
        setCheckInCount(schedule.filter(b => b.status === 'CHECKED_IN' || b.status === 'CHECKED_OUT').length);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (e) => {
    if (e) e.preventDefault();
    if (!bookingCode) return;
    
    setVerifying(true);
    setVerificationResult(null);
    try {
      let endpoint = `${API}/api/check-in/verify-qr`;
      let body = JSON.stringify({ bookingCode });

      // SMART DETECTION: If scanned text is a URL, extract ID and call direct check-in
      if (bookingCode.includes('/check-in/booking/')) {
        const parts = bookingCode.split('/');
        const bookingId = parts[parts.length - 1];
        endpoint = `${API}/api/check-in/${bookingId}`;
        body = null; // GET/POST with no body for direct endpoint
      }

      const res = await authFetch(endpoint, {
        method: 'POST',
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body
      });
      
      const data = await res.json();
      if (res.ok) {
        setVerificationResult({ 
          success: true, 
          message: `✓ ${data.fullName || 'Student'} checked in successfully.`,
          data 
        });
        setBookingCode('');
        fetchDashboardData(); 
      } else {
        setVerificationResult({ success: false, error: data.error || data.message });
      }
    } catch (error) {
      setVerificationResult({ success: false, error: 'Network error. Could not reach server.' });
    } finally {
      setVerifying(false);
    }
  };

  const SummaryCard = ({ title, value, icon, color, subtitle }) => (
    <div className="staff-stat-card">
      <div className="stat-card-header">
        <div className="stat-icon" style={{ backgroundColor: `${color}20`, color: color }}>
          {icon}
        </div>
        <div className="stat-value">{value}</div>
      </div>
      <div className="stat-title">{title}</div>
      <div className="stat-subtitle">{subtitle}</div>
    </div>
  );

  return (
    <div className="staff-portal-container">
      <Reveal>
        <header className="staff-page-header" style={{
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(20px)',
          padding: '32px 40px',
          borderRadius: '32px',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div className="header-content">
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '950' }}>Staff <span style={{ color: 'var(--accent-primary)' }}>Portal</span></h1>
            <p style={{ margin: '8px 0 0', fontWeight: '500', color: 'var(--text-secondary)' }}>Welcome back, <strong>{user?.fullName}</strong>. Operational status is active.</p>
          </div>
          <div className="header-time" style={{ background: 'var(--accent-primary)', color: 'white', border: 'none' }}>
            <Clock size={16} />
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </header>
      </Reveal>

      {/* Summary Statistics */}
      <Reveal className="mt-12">
        <section className="staff-stats-grid">
        <SummaryCard 
          title="Active Tickets" 
          value={stats.activeTickets} 
          icon={<ClipboardList size={24} />} 
          color="#3b82f6"
          subtitle="Total campus issues"
        />
        <SummaryCard 
          title={user.role === 'LECTURER' ? "My Reservations" : "My Tasks"} 
          value={stats.myTickets} 
          icon={user.role === 'LECTURER' ? <Clock size={24} /> : <Wrench size={24} />} 
          color="#A86A6A"
          subtitle={user.role === 'LECTURER' ? "Booked slots" : "Assigned to you"}
        />
        <SummaryCard 
          title="Daily Check-Ins" 
          value={checkInCount} 
          icon={<CheckCircle size={24} />} 
          color="#10b981"
          subtitle="Processed today"
        />
      </section>
      </Reveal>
      
      {/* Managed Facilities Section */}
      {user.role === 'STAFF' && assignedResources.length > 0 && (
        <Reveal className="mt-12">
          <section className="managed-facilities-section">
            <div className="section-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Building2 size={28} style={{ color: 'var(--accent-primary)' }} />
                Facilities Under My Watch
              </h2>
              <span className="facility-count-badge">{assignedResources.length} Managed</span>
            </div>
            <div className="facilities-grid">
              {assignedResources.map(resource => (
                <div key={resource.id} className="facility-card-premium">
                  <div className="facility-status-dot"></div>
                  <div className="facility-info">
                    <h3>{resource.name}</h3>
                    <p>{resource.building} • Level {resource.floor}</p>
                  </div>
                  <div className="facility-actions">
                    <button 
                      className="report-btn-staff"
                      onClick={() => navigate(`/tickets/new?resourceId=${resource.id}&resourceName=${encodeURIComponent(resource.name)}`)}
                    >
                      <AlertCircle size={14} />
                      Report Issue
                    </button>
                    <button 
                      className="view-btn-staff"
                      onClick={() => navigate(`/resources/${resource.id}`)}
                    >
                      <Search size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* NEW: Resource Check-In Section */}
      <section className="staff-checkin-section glass-card" style={{ padding: '32px', marginBottom: '40px', background: 'linear-gradient(135deg, rgba(250, 234, 234, 0.4), rgba(245, 230, 230, 0.4))' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
          <div className="checkin-info">
            <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--accent-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <UserCheck size={28} /> Verify Student Arrival
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '500' }}>Scan student's Digital ID or enter the Booking Code to record check-in.</p>
          </div>
          
          <div className="checkin-controls">
            <form onSubmit={handleCheckIn} style={{ display: 'flex', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="RSV-X01..."
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value)}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '2px solid var(--glass-border)',
                    color: 'var(--text-primary)',
                    padding: '14px 20px',
                    borderRadius: '16px',
                    width: '260px',
                    fontWeight: '600',
                    outline: 'none',
                    transition: 'all 0.2s'
                  }}
                />
              </div>
              <button 
                type="submit" 
                disabled={verifying || !bookingCode}
                style={{
                  background: 'var(--accent-primary)',
                  color: 'white',
                  padding: '14px 28px',
                  borderRadius: '16px',
                  fontWeight: '800',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-md)',
                  opacity: (verifying || !bookingCode) ? 0.6 : 1
                }}
              >
                {verifying ? '...' : 'Verify'}
              </button>
              <button 
                type="button"
                onClick={() => setShowCheckInModal(true)}
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--accent-primary)',
                  padding: '14px',
                  borderRadius: '16px',
                  border: '2px solid var(--glass-border)',
                  cursor: 'pointer'
                }}
              >
                <QrCode size={24} />
              </button>
            </form>
          </div>
        </div>

        {verificationResult && (
          <div className={`verification-alert-premium animate-zoom-in ${verificationResult.success ? 'success' : 'error'}`}>
            <div className="alert-content-wrapper">
              <div className="alert-icon-box">
                {verificationResult.success ? <CheckCircle size={24} /> : <ShieldAlert size={24} />}
              </div>
              <div className="alert-text-group">
                <h4 className="alert-title">{verificationResult.success ? 'Access Granted' : 'Access Denied'}</h4>
                <p className="alert-message">{verificationResult.message}</p>
              </div>
            </div>
            <button onClick={() => setVerificationResult(null)} className="alert-dismiss-btn">
              Dismiss
            </button>
          </div>
        )}
      </section>

      {/* STAFF: Room Health Section */}
      {user?.role === 'STAFF' && myRoomTickets.length > 0 && (
        <Reveal className="mb-12">
          <section className="glass-card" style={{ padding: '32px', marginBottom: '40px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.06), rgba(251, 146, 60, 0.06))', border: '2px solid rgba(239, 68, 68, 0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px' }}>
                <AlertCircle size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1F1F1F', margin: '0 0 4px 0' }}>
                  🏠 Room Health Status
                </h2>
                <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem', fontWeight: '500' }}>
                  {myRoomTickets.length} active issue{myRoomTickets.length !== 1 ? 's' : ''} in your assigned rooms — Fix them immediately
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              {myRoomTickets.map(ticket => (
                <div key={ticket.id} style={{
                  padding: '16px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.6)',
                  border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  transition: 'all 0.3s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                    <div style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: ticket.priority === 'HIGH' ? '#ef4444' : ticket.priority === 'MEDIUM' ? '#f59e0b' : '#3b82f6'
                    }} />
                    <div>
                      <div style={{ fontWeight: '700', color: '#1F1F1F', marginBottom: '4px' }}>{ticket.title}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {ticket.resourceName} • {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: '800', padding: '6px 12px', borderRadius: '8px',
                      background: ticket.status === 'OPEN' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                      color: ticket.status === 'OPEN' ? '#f59e0b' : '#3b82f6'
                    }}>
                      {ticket.status}
                    </span>
                    <button
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      style={{
                        background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '8px 16px',
                        borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem',
                        transition: 'all 0.3s'
                      }}
                    >
                      Handle Issue
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      <div className="staff-dashboard-content">
        {/* Quick Actions */}
        <div className="staff-main-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions-grid">
            <button className="q-action-btn" onClick={() => navigate('/tickets')}>
              <div className="qa-icon"><ClipboardList /></div>
              <div className="qa-text">
                <h3>View Tickets</h3>
                <p>Manage and update reported issues</p>
              </div>
              <ExternalLink size={16} className="qa-arrow" />
            </button>
            <button className="q-action-btn" onClick={() => navigate('/resources')}>
              <div className="qa-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}><Search /></div>
              <div className="qa-text">
                <h3>{user.role === 'LECTURER' ? 'Campus Catalog' : 'Find Resources'}</h3>
                <p>Browse facilities and equipment</p>
              </div>
              <ExternalLink size={16} className="qa-arrow" />
            </button>
            <button className="q-action-btn" onClick={() => navigate('/tickets/new')}>
              <div className="qa-icon" style={{ backgroundColor: '#fff7ed', color: '#ea580c' }}><PlusCircle /></div>
              <div className="qa-text">
                <h3>{user.role === 'LECTURER' ? 'Request Assistance' : 'Report Fault'}</h3>
                <p>{user.role === 'LECTURER' ? 'Get help with room tech' : 'Log a new technical issue'}</p>
              </div>
              <ExternalLink size={16} className="qa-arrow" />
            </button>
          </div>

          <div className="recent-activity-section">
            <div className="section-header">
              <h2>Today's Facility Schedule</h2>
              <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </div>
            
            <div className="today-bookings-list mt-8">
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Syncing schedule...</div>
              ) : todaySchedule.length === 0 ? (
                <div className="glass-card" style={{ padding: '48px', textAlign: 'center', borderStyle: 'dashed' }}>
                  <Clock className="mx-auto mb-4" size={48} style={{ opacity: 0.2 }} />
                  <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>No bookings scheduled for today.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {todaySchedule.map(booking => (
                    <div key={booking.id} className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ textAlign: 'center', minWidth: '80px' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--accent-primary)' }}>{booking.startTime.substring(0, 5)}</div>
                          <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>to {booking.endTime.substring(0, 5)}</div>
                        </div>
                        <div style={{ width: '1px', height: '40px', background: 'var(--glass-border)' }}></div>
                        <div>
                          <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text-primary)' }}>{booking.requesterName}</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{booking.resourceNames.join(', ')}</div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ 
                          fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', padding: '6px 14px', borderRadius: '99px',
                          background: booking.status === 'APPROVED' ? 'rgba(192, 128, 128, 0.1)' : (booking.status === 'CHECKED_IN' ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-primary)'),
                          color: booking.status === 'APPROVED' ? 'var(--accent-secondary)' : (booking.status === 'CHECKED_IN' ? '#22c55e' : 'var(--text-muted)')
                        }}>
                          {booking.status === 'APPROVED' ? 'Expected' : booking.status.replace('_', ' ')}
                        </div>
                        {booking.status === 'APPROVED' && (
                          <button 
                            onClick={() => {
                              setBookingCode(booking.bookingCode);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            style={{
                              background: 'var(--accent-primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer'
                            }}
                          >
                            Check In
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <aside className="staff-sidebar">
          <div className="sidebar-card">
            <h3>Staff Support</h3>
            <p>Need help with the portal? Contact the IT Service Desk or check the system manual.</p>
            <button className="secondary-btn">System Manual</button>
          </div>
          <div className="sidebar-card maintenance-card">
            <div className="maintenance-icon">⚠️</div>
            <h3>Scheduled Maintenance</h3>
            <p>Database synchronization scheduled for 10:00 PM tonight. Please save all work.</p>
          </div>
        </aside>
      </div>
      {showCheckInModal && (
        <ScannerModal 
          onClose={() => setShowCheckInModal(false)} 
          onScan={(code) => {
            setBookingCode(code);
            setShowCheckInModal(false);
          }}
        />
      )}
    </div>
  );
}

function ScannerModal({ onClose, onScan }) {
  const scannerRef = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    let html5QrCode;
    
    const startScanner = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || cameras.length === 0) {
          console.error("No cameras found");
          return;
        }

        // Prefer back camera
        const backCamera = cameras.find(c => c.label.toLowerCase().includes('back')) || cameras[0];
        
        html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;

        const config = { 
          fps: 25, 
          aspectRatio: 1.0
        };

        await html5QrCode.start(
          backCamera.id, 
          config, 
          (decodedText) => {
            html5QrCode.stop().then(() => {
              onScan(decodedText);
            }).catch(() => onScan(decodedText));
          }
        );
        setActive(true);
      } catch (err) {
        console.error("Scanner start failed:", err);
      }
    };

    const timer = setTimeout(startScanner, 400);

    return () => {
      clearTimeout(timer);
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error("Cleanup stop error:", err));
      }
    };
  }, []);

  return (
    <div className="scanner-overlay" onClick={onClose}>
      <button onClick={onClose} className="scanner-close-btn">
        <X size={32} />
      </button>
      
      <div className="scanner-viewport" onClick={e => e.stopPropagation()}>
        <div id="qr-reader"></div>
        
        {/* Advanced Tactical HUD Overlay */}
        <div className={`scanner-frame-overlay ${active ? 'active' : ''}`}>
           <div className="hud-grid-lines"></div>
           
           <div className="scanning-window-advanced">
              <div className="corner-bracket tl"></div>
              <div className="corner-bracket tr"></div>
              <div className="corner-bracket bl"></div>
              <div className="corner-bracket br"></div>
              
              <div className="scanning-laser-line"></div>
              <div className="scan-inner-glow"></div>
           </div>

           <div className="scanner-status-group">
              <div className="status-badge-pulse">
                <span className="pulse-dot"></span>
                {active ? 'SYSTEM ACTIVE' : 'INITIALIZING'}
              </div>
              <p className="scanning-text-premium">{active ? 'ALIGN DIGITAL ID TO VERIFY' : 'CALIBRATING OPTICS...'}</p>
           </div>

           {/* Decorative HUD Data Elements */}
           <div className="hud-data-left">
              <span>SECURE_LINK: ESTABLISHED</span>
              <span>LAT: 6.9271° N</span>
              <span>LNG: 79.8612° E</span>
           </div>
           <div className="hud-data-right">
              <span>AUTH_MODE: ENCRYPTED</span>
              <span>VER: 4.2.0-STABLE</span>
              <span>FPS: 25.0</span>
           </div>
        </div>
      </div>
    </div>
  );
}
