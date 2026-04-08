import React from 'react';
import { QrCode, Smartphone } from 'lucide-react';

export default function QRCodeDisplay({ resourceId }) {
  // We use the full URL so it's ready for deployment
  const currentUrl = `${window.location.origin}/resources/${resourceId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentUrl)}&color=0f172a&bgcolor=f8fafc`;

  return (
    <div className="sidebar-card">
      <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <QrCode size={18} color="#6366f1" /> Asset Quick-Scan
      </h3>
      <div className="qr-container">
        <img src={qrUrl} alt="Resource QR Code" className="qr-code" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#64748b', fontSize: '0.8rem', fontWeight: 'bold', textAlign: 'center' }}>
          Scan to access this resource details instantly on your device
        </div>
      </div>
    </div>
  );
}
