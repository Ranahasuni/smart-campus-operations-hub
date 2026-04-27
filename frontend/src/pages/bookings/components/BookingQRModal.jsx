import React from 'react';

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

import { X, QrCode, Smartphone, Download, ShieldCheck } from 'lucide-react';
import './BookingQRModal.css';

export default function BookingQRModal({ booking, onClose }) {
  if (!booking) return null;

  const qrData = booking.bookingCode || booking.id;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrData)}&color=8C0000&bgcolor=ffffff`;

  const handleDownload = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Booking_QR_${qrData}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: Open in new tab
      window.open(qrUrl, '_blank');
    }
  };

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-card" onClick={e => e.stopPropagation()}>
        
        <header className="qr-modal-header">
          <button onClick={onClose} className="qr-modal-close-btn" aria-label="Close">
            <X size={20} />
          </button>
          
          <div className="qr-modal-icon-wrap">
            <QrCode size={28} strokeWidth={2.5} />
          </div>
          
          <h2 className="qr-modal-title">Digital Check-In ID</h2>
          <p className="qr-modal-subtitle">Present this QR code to the staff member at the gate or resource entrance.</p>
        </header>

        <div className="qr-modal-body">
          <div className="qr-code-frame">
            <img 
              src={qrUrl} 
              alt="Booking QR Code" 
              className="qr-code-img"
            />
          </div>

          <div className="qr-modal-secure-badge">
            <ShieldCheck size={16} strokeWidth={2.5} /> 
            <span>SECURE ID: {qrData}</span>
          </div>

          <button onClick={handleDownload} className="qr-modal-download-btn">
            <Download size={18} /> Download for Offline Use
          </button>
          
          <div className="qr-modal-footer-text">
            <Smartphone size={14} /> Verification via Smart Campus App
          </div>
        </div>

      </div>
    </div>
  );
}
