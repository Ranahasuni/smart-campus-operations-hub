import React, { useState, useEffect } from 'react';

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

import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  CheckCircle, XCircle, Clock, Loader2, 
  ShieldCheck, Smartphone, MapPin, Calendar, 
  ArrowRight, LogIn
} from 'lucide-react';
import '../../styles/check-in.css';

export default function CheckInPage() {
    const { type, id } = useParams();
    const { authFetch, API, user } = useAuth();
    const navigate = useNavigate();
    
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [message, setMessage] = useState('');
    const [details, setDetails] = useState(null);

    useEffect(() => {
        const performCheckIn = async () => {
            if (!user) return; // Wait for auth
            
            setStatus('loading');
            try {
                // Determine the correct endpoint based on type (booking or resource)
                const endpoint = type === 'resource' 
                    ? `${API}/api/check-in/resource/${id}`
                    : `${API}/api/check-in/${id}`;

                const response = await authFetch(endpoint, {
                    method: 'POST'
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    setStatus('success');
                    setMessage(data.message || 'Check-In Successful');
                    setDetails(data);
                } else {
                    setStatus('error');
                    setMessage(data.error || data.message || 'Verification Failed');
                }
            } catch (err) {
                console.error("Check-in error:", err);
                setStatus('error');
                setMessage('Network error. Could not connect to the verification server.');
            }
        };

        performCheckIn();
    }, [id, type, user, API]);

    if (!user) {
        return (
            <div className="checkin-full-page flex-center">
                <div className="glass-card p-10 text-center animate-fade-in">
                    <LogIn className="mx-auto mb-6 text-indigo-500" size={48} />
                    <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
                    <p className="text-slate-400 mb-8">Please sign in to verify your campus reservation.</p>
                    <button onClick={() => navigate('/login')} className="btn-proceed">Sign In to Continue</button>
                </div>
            </div>
        );
    }

    return (
        <div className="checkin-full-page flex-center">
            <div className="checkin-verification-card glass-card animate-fade-in">
                <div className="card-top-accent"></div>
                
                <header className="checkin-header">
                    <div className="brand-badge">
                        <ShieldCheck size={14} /> SMART CAMPUS SECURE
                    </div>
                    <h1>Booking Verification</h1>
                    <div className="accent-line"></div>
                </header>

                <main className="checkin-content">
                    {status === 'loading' && (
                        <div className="status-display loading">
                            <div className="loader-wrapper">
                                <Loader2 className="animate-spin" size={64} />
                                <div className="loader-pulse"></div>
                            </div>
                            <p className="status-hint">Synchronizing with Central Registry...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="status-display success animate-zoom-in">
                            <div className="icon-circle bg-emerald">
                                <CheckCircle size={40} />
                                <div className="icon-ring-pulse"></div>
                            </div>
                            <h2 className="text-gradient-emerald">Identity Verified</h2>
                            <p className="status-message">{message}</p>
                            
                            <div className="verification-details-premium">
                                <div className="detail-card-row">
                                    <div className="detail-item-sub">
                                        <span className="detail-label">Digital ID</span>
                                        <span className="detail-value-bold">{details?.bookingCode || 'N/A'}</span>
                                    </div>
                                    <div className="detail-item-sub">
                                        <span className="detail-label">Status</span>
                                        <span className="detail-value-bold text-success">ARRIVED</span>
                                    </div>
                                </div>
                                <div className="detail-timestamp-footer">
                                    Verified on {new Date(details?.checkInTime).toLocaleDateString()} at {new Date(details?.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>

                            <div className="action-area mt-8">
                                <button onClick={() => navigate('/my-bookings')} className="btn-success-action w-full">
                                    Continue to My Reservations <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="status-display error animate-zoom-in">
                            <div className="icon-circle bg-rose">
                                <XCircle size={40} />
                            </div>
                            <h2 className="text-gradient-rose">Access Denied</h2>
                            <p className="status-message">{message}</p>
                            
                            <div className="error-resolution-box">
                                <div className="resolution-item">
                                    <Clock size={16} /> <span>Check your reservation time slot</span>
                                </div>
                                <div className="resolution-item">
                                    <MapPin size={16} /> <span>Verify you are at the correct facility</span>
                                </div>
                                <div className="resolution-item">
                                    <Calendar size={16} /> <span>Ensure your booking is approved</span>
                                </div>
                            </div>

                            <div className="action-area mt-8">
                                <button onClick={() => navigate('/bookings')} className="btn-error-action w-full">
                                    Return to Reservations
                                </button>
                                <button onClick={() => navigate('/support')} className="btn-text-only mt-4">
                                    Need Help? Contact Staff
                                </button>
                            </div>
                        </div>
                    )}
                </main>

                <footer className="checkin-footer">
                    <Smartphone size={14} />
                    <span>Digital Identity Verified via Smart Campus OS Hub</span>
                </footer>
            </div>
        </div>
    );
}
