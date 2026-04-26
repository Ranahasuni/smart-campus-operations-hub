import React, { useState } from 'react';
import { QrCode, Smartphone, CheckCircle2, ChevronRight, Loader2, X, AlertTriangle, Download } from 'lucide-react';

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

import { THEME } from '../../../theme';
import '../../../styles/arrival-action.css';

/**
 * ArrivalAction Component
 * Provides a secure, dual-method check-in interface.
 * Users can either scan a generated QR code with their mobile device 
 * or confirm arrival directly via the "I'm Here" button.
 * 
 * @param {Object} booking - The booking object to check in for.
 * @param {Function} onCheckIn - Callback handler for the check-in action.
 */
export default function ArrivalAction({ booking, onCheckIn }) {
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Digital ID QR contains the simplified Booking Code for high-speed scanning
  const qrData = booking.bookingCode;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrData)}&color=000000&bgcolor=ffffff&qzone=2`;

  const handleManualCheckIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await onCheckIn(booking.id);
    } catch (err) {
      setError(err.message || "Manual check-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `booking-qr-${booking.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  if (booking.isCheckedIn) {
    return (
      <div className="arrival-verified-container">
        <div className="verified-status-pro">
          <CheckCircle2 size={16} /> Verified Arrived
        </div>
        <div className="arrival-timestamp">
          at {new Date(booking.checkInTime || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    );
  }

  return (
    <div className="arrival-control-root">
      {!showOptions ? (
        <button 
          className="arrival-trigger-btn animate-pulse-subtle"
          onClick={() => setShowOptions(true)}
        >
          <div className="btn-icon-bg">
            <Smartphone size={18} />
          </div>
          <div className="btn-text-content">
            <span className="btn-main-label">Ready to Check-In?</span>
            <span className="btn-sub-label">QR Scan or "I'm Here"</span>
          </div>
          <ChevronRight size={20} className="ml-auto opacity-40" />
        </button>
      ) : (
        <div className="arrival-options-overlay animate-slide-up">
           <div className="options-header">
              <div className="header-badge">SECURE ARRIVAL</div>
              <button className="close-options" onClick={() => setShowOptions(false)}><X size={20} /></button>
           </div>

           <div className="options-grid">
              {/* Option 1: QR CODE SCANNABLE ON DEVICE */}
              <div className="option-card qr-option">
                <div className="option-info">
                  <h4>Staff Verification Pass</h4>
                  <p>Present this code to a staff member for arrival verification</p>
                </div>
                <div className="qr-container-pro">
                  <img src={qrUrl} alt="Check-in QR" />
                </div>
                <button 
                  onClick={handleDownloadQR}
                  className="download-qr-btn"
                  style={{
                    marginTop: '16px', width: '100%', padding: '10px',
                    borderRadius: '8px', border: '1px solid #e2e8f0',
                    background: '#fff', color: '#475569', fontSize: '0.8rem',
                    fontWeight: '700', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '8px', cursor: 'pointer',
                    transition: '0.2s'
                  }}
                >
                  <Download size={14} /> Download QR Code
                </button>
              </div>

              {/* Option 2: DIRECT BUTTON */}
              <div className="option-card direct-option">
                <div className="option-info">
                  <h4>Confirm Arrival Directly</h4>
                  <p>Skip the scan if you are at the facility</p>
                </div>
                
                <button 
                  className="im-here-btn-premium"
                  onClick={handleManualCheckIn}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} />}
                  <span>I'm Here — Confirm Now</span>
                </button>

                {error && (
                  <div className="arrival-error-hint animate-shake">
                    <AlertTriangle size={14} /> {error}
                  </div>
                )}

                <div className="security-notice">
                   <Smartphone size={12} /> Verification tied to your active session
                </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
