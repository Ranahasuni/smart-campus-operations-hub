import { QrCode, Smartphone, CheckCircle2, ChevronRight, Loader2, X, AlertTriangle } from 'lucide-react';
import { THEME } from '../../../theme';
import '../../../styles/arrival-action.css';

export default function ArrivalAction({ booking, onCheckIn }) {
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Link for the QR code (pointing to the Check-In page)
  const checkInUrl = `${window.location.origin}/check-in/booking/${booking.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(checkInUrl)}&color=0f172a&bgcolor=ffffff`;

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
                  <h4>Scan Physical/Digital QR</h4>
                  <p>Scan the door sign or this code with your mobile</p>
                </div>
                <div className="qr-container-pro">
                  <img src={qrUrl} alt="Check-in QR" />
                  <div className="qr-center-logo">
                    <QrCode size={24} color={THEME.colors.primary} />
                  </div>
                </div>
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
