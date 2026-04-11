import React from 'react';
import { QrCode, Smartphone } from 'lucide-react';

export default function QRCodeDisplay({ resourceId }) {
  const currentUrl = `${window.location.origin}/resources/${resourceId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(currentUrl)}&color=0f172a&bgcolor=ffffff`;

  return (
    <div className="sidebar-card-qr-light" style={{ background: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1.5px solid #e2e8f0', textAlign: 'center', marginTop: '20px' }}>
      {/* 🖤 HARD-FORCED VISIBLE TITLE */}
      <div style={{ color: '#000000', fontWeight: '950', fontSize: '0.85rem', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <QrCode size={18} color="#6366f1" /> Asset Digital ID
      </div>

      <div style={{ background: 'white', padding: '15px', borderRadius: '20px', display: 'inline-block', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
        <img src={qrUrl} alt="Resource QR Code" style={{ width: '130px', height: '130px' }} />
      </div>

      {/* 🖤 HARD-FORCED VISIBLE FOOTER */}
      <div style={{ color: '#475569', fontWeight: '900', fontSize: '0.7rem', letterSpacing: '0.08em', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        <Smartphone size={12} color="#6366f1" /> SCAN TO SYNC MOBILE
      </div>
    </div>
  );
}
