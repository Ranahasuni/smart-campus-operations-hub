import React, { useState } from 'react';
import { QrCode, Smartphone, CheckCircle2, ChevronRight, Loader2, X, AlertTriangle } from 'lucide-react';
import { THEME } from '../../../theme';

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

      <style jsx>{`
        .arrival-control-root {
          width: 100%;
          margin-top: 20px;
        }

        .arrival-trigger-btn {
          width: 100%;
          padding: 16px 20px;
          background: ${THEME.colors.background};
          border: 1.5px solid ${THEME.colors.glassBorder};
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          color: white;
          text-align: left;
        }

        .arrival-trigger-btn:hover {
          transform: translateY(-2px);
          border-color: ${THEME.colors.primary};
          box-shadow: 0 15px 40px rgba(99, 102, 241, 0.2);
        }

        .btn-icon-bg {
          width: 44px;
          height: 44px;
          background: rgba(99, 102, 241, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${THEME.colors.primary};
        }

        .btn-text-content {
          display: flex;
          flex-direction: column;
        }

        .btn-main-label {
          font-weight: 800;
          font-size: 1.05rem;
          color: white;
        }

        .btn-sub-label {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 600;
        }

        .arrival-options-overlay {
          background: ${THEME.colors.background};
          border: 1px solid ${THEME.colors.glassBorder};
          border-radius: 28px;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }

        .options-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .header-badge {
          font-size: 0.65rem;
          font-weight: 950;
          letter-spacing: 0.1em;
          color: ${THEME.colors.primary};
          background: rgba(99, 102, 241, 0.1);
          padding: 4px 12px;
          border-radius: 99px;
        }

        .close-options {
          background: transparent;
          border: none;
          color: #475569;
          cursor: pointer;
        }

        .options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .option-card {
           background: rgba(255,255,255,0.02);
           border: 1px solid ${THEME.colors.glassBorder};
           border-radius: 20px;
           padding: 20px;
           display: flex;
           flex-direction: column;
           gap: 20px;
        }

        .option-info h4 {
          margin: 0 0 6px 0;
          color: white;
          font-size: 0.95rem;
          font-weight: 800;
        }

        .option-info p {
           margin: 0;
           font-size: 0.75rem;
           color: #64748b;
           line-height: 1.4;
        }

        .qr-container-pro {
          position: relative;
          background: white;
          padding: 12px;
          border-radius: 16px;
          width: fit-content;
          margin: 0 auto;
        }

        .qr-container-pro img {
          width: 140px;
          height: 140px;
        }

        .qr-center-logo {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 4px;
          border-radius: 4px;
        }

        .im-here-btn-premium {
          width: 100%;
          margin-top: auto;
          background: ${THEME.colors.primary};
          color: white;
          border: none;
          padding: 20px;
          border-radius: 16px;
          font-weight: 800;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2);
        }

        .im-here-btn-premium:hover:not(:disabled) {
          transform: scale(1.02);
          background: ${THEME.colors.accent};
        }

        .security-notice {
          font-size: 0.65rem;
          color: #475569;
          text-align: center;
          margin-top: 12px;
          font-weight: 600;
        }

        .arrival-verified-container {
           padding: 12px 20px;
           background: rgba(34, 197, 94, 0.05);
           border: 1px solid rgba(34, 197, 94, 0.2);
           border-radius: 16px;
           display: flex;
           justify-content: space-between;
           align-items: center;
           margin-top: 20px;
        }

        .verified-status-pro {
           color: ${THEME.colors.success};
           font-weight: 900;
           font-size: 0.85rem;
           display: flex;
           align-items: center;
           gap: 8px;
        }

        .arrival-timestamp {
           font-size: 0.75rem;
           color: #94a3b8;
           font-weight: 600;
        }

        .arrival-error-hint {
          background: rgba(239, 68, 68, 0.1);
          color: ${THEME.colors.danger};
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.9; transform: scale(0.995); }
        }
        .animate-pulse-subtle { animation: pulse-subtle 3s infinite ease-in-out; }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.4s ease; }

        @media (max-width: 640px) {
          .options-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
