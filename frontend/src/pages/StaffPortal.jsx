import React, { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import '../styles/staff-portal.css';

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
      const res = await authFetch(`${API}/api/tickets`);
      if (res.ok) {
        const tickets = await res.json();
        
        // Calculate statistics - Adapted for Professional Workflow
        const myTasks = tickets.filter(t => t.technicianId === user.id && (t.status === 'IN_PROGRESS' || t.status === 'OPEN'));
        const urgent = tickets.filter(t => t.priority === 'HIGH' && t.status !== 'CLOSED' && t.status !== 'REJECTED');
        const active = tickets.filter(t => t.status !== 'CLOSED' && t.status !== 'REJECTED');
        const completed = tickets.filter(t => t.technicianId === user.id && (t.status === 'RESOLVED' || t.status === 'CLOSED'));

        // Fetch user bookings for lecturer stats
        let myBookingsCount = 0;
        if (user.role === 'LECTURER') {
          const bRes = await authFetch(`${API}/api/bookings/user`);
          if (bRes.ok) {
            const bData = await bRes.json();
            myBookingsCount = bData.length;
          }
        }

        setStats({
          activeTickets: active.length,
          myTickets: user.role === 'LECTURER' ? myBookingsCount : myTasks.length,
          urgentTickets: urgent.length,
          completedToday: completed.length
        });

        // Get top 5 recent tickets
        setRecentTickets(tickets.slice(0, 5));

        // Fetch assigned resources
        const rRes = await authFetch(`${API}/api/resources`);
        if (rRes.ok) {
           const resources = await rRes.json();
           const assigned = resources.filter(r => r.assignedStaffIds?.includes(user.id));
           setAssignedResources(assigned);
        }

        // Fetch today's schedule
        const sRes = await authFetch(`${API}/api/bookings/staff/today`);
        if (sRes.ok) {
           const schedule = await sRes.json();
           setTodaySchedule(schedule);
           setCheckInCount(schedule.filter(b => b.status === 'CHECKED_IN' || b.status === 'CHECKED_OUT').length);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!bookingCode) return;
    
    setVerifying(true);
    setVerificationResult(null);
    try {
      const res = await authFetch(`${API}/api/check-in/verify-qr`, {
        method: 'POST',
        body: JSON.stringify({ bookingCode })
      });
      const data = await res.json();
      if (res.ok) {
        setVerificationResult({ 
          success: true, 
          message: `✓ ${data.fullName} checked in for ${data.resourceNames.join(', ')}`,
          data 
        });
        setBookingCode('');
        fetchDashboardData(); // Refresh list to show CHECKED_IN status
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
      <header className="staff-page-header">
        <div className="header-content">
          <h1>Staff Portal</h1>
          <p>Welcome back, <strong>{user?.fullName}</strong>. Here is your operational overview.</p>
        </div>
        <div className="header-time">
          <Clock size={16} />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </header>

      {/* Summary Statistics */}
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
          color="#8b5cf6"
          subtitle={user.role === 'LECTURER' ? "Booked slots" : "Assigned to you"}
        />
        <SummaryCard 
          title="Urgent Alerts" 
          value={stats.urgentTickets} 
          icon={<AlertCircle size={24} />} 
          color="#ef4444"
          subtitle="Requires attention"
        />
        <SummaryCard 
          title="Daily Check-Ins" 
          value={checkInCount} 
          icon={<CheckCircle size={24} />} 
          color="#10b981"
          subtitle="Processed today"
        />
      </section>

      {/* NEW: Resource Check-In Section */}
      <section className="staff-checkin-section glass-card mb-8 p-8" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.4))' }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="checkin-info">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <UserCheck className="text-emerald-400" /> Verify Student Arrival
            </h2>
            <p className="text-slate-400">Scan student's Digital ID or enter the Booking Code to record check-in.</p>
          </div>
          
          <div className="checkin-controls w-full md:w-auto">
            <form onSubmit={handleCheckIn} className="flex gap-2">
              <div className="relative flex-grow">
                <input 
                  type="text" 
                  placeholder="Enter Booking Code (e.g. RSV-X01)"
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value)}
                  className="bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-xl w-full md:w-64 focus:border-indigo-500 transition-all outline-none"
                />
              </div>
              <button 
                type="submit" 
                disabled={verifying || !bookingCode}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {verifying ? 'Verifying...' : 'Verify ID'}
              </button>
              <button 
                type="button"
                onClick={() => setShowCheckInModal(true)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-xl transition-all"
                title="Launch Scanner"
              >
                <QrCode size={24} />
              </button>
            </form>
          </div>
        </div>

        {verificationResult && (
          <div className={`mt-6 p-4 rounded-xl flex items-center justify-between animate-fade-in ${verificationResult.success ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}>
            <div className="flex items-center gap-3">
              {verificationResult.success ? <CheckCircle size={20} /> : <ShieldAlert size={20} />}
              <div>
                <div className="font-bold">{verificationResult.success ? 'Access Granted' : 'Access Denied'}</div>
                <div className="text-sm opacity-80">{verificationResult.success ? (verificationResult.message || `Verified ${verificationResult.data.fullName}`) : verificationResult.error}</div>
              </div>
            </div>
            <button onClick={() => setVerificationResult(null)} className="text-xs uppercase tracking-widest font-black opacity-60 hover:opacity-100">Dismiss</button>
          </div>
        )}
      </section>

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
            
            <div className="today-bookings-list mt-4">
              {loading ? (
                <div className="p-8 text-center text-slate-500">Syncing schedule...</div>
              ) : todaySchedule.length === 0 ? (
                <div className="p-8 text-center glass-card border-dashed border-slate-700">
                  <Clock className="mx-auto mb-3 text-slate-600" size={32} />
                  <p className="text-slate-500">No bookings scheduled for your assigned resources today.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {todaySchedule.map(booking => (
                    <div key={booking.id} className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-l-indigo-500">
                      <div className="flex items-center gap-4">
                        <div className="time-block text-center min-w-[80px]">
                          <div className="text-lg font-bold text-white">{booking.startTime.substring(0, 5)}</div>
                          <div className="text-xs text-slate-500">to {booking.endTime.substring(0, 5)}</div>
                        </div>
                        <div className="divider w-px h-10 bg-slate-800 hidden md:block"></div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                             {booking.requesterName}
                          </div>
                          <div className="text-sm text-slate-400">{booking.resourceNames.join(', ')}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between md:justify-end gap-3">
                        <div className={`text-xs px-3 py-1.5 rounded-full font-bold tracking-wider uppercase
                          ${booking.status === 'APPROVED' ? 'bg-indigo-500/10 text-indigo-400' : 
                            booking.status === 'CHECKED_IN' ? 'bg-emerald-500/10 text-emerald-400' : 
                            'bg-slate-800 text-slate-500'}`}
                        >
                          {booking.status === 'APPROVED' ? 'Expected' : booking.status.replace('_', ' ')}
                        </div>
                        {booking.status === 'APPROVED' && (
                          <button 
                            onClick={() => {
                              setBookingCode(booking.bookingCode);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
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
  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode.start(
      { facingMode: "environment" }, 
      config, 
      (decodedText) => {
        html5QrCode.stop().then(() => {
          onScan(decodedText);
        });
      },
      (errorMessage) => {
        // Just keep scanning
      }
    ).catch((err) => {
      console.error("Camera detection error:", err);
    });

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(err => console.error("Stopping scan error", err));
      }
    };
  }, []);

  return (
    <div className="scanner-overlay" onClick={onClose}>
      <button onClick={onClose} className="scanner-close-btn">
        <X size={32} />
      </button>
      
      <div className="scanner-viewport" onClick={e => e.stopPropagation()}>
        {/* Real Camera Container */}
        <div id="qr-reader"></div>
        
        {/* Hardware-style Overlay */}
        <div className="scanner-frame-overlay">
           <div className="scanning-window">
              <div className="scanning-line"></div>
           </div>
           <p className="scanning-text">Scanning for ID</p>
        </div>
      </div>
    </div>
  );
}
