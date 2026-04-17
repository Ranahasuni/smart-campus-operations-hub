import React from 'react';
import { QrCode, Smartphone } from 'lucide-react';

export default function QRCodeDisplay({ resourceId, resourceName }) {
  const currentUrl = `${window.location.origin}/check-in/resource/${resourceId}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentUrl)}&color=0f172a&bgcolor=ffffff`;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Door Sign - ${resourceName}</title>
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
            .sign-card { border: 10px solid #6366f1; padding: 50px; border-radius: 40px; max-width: 500px; }
            h1 { font-size: 3rem; margin: 0 0 10px; color: #0f172a; }
            p { font-size: 1.2rem; color: #64748b; margin-bottom: 30px; }
            .badge { background: #6366f1; color: white; padding: 10px 20px; border-radius: 50px; font-weight: bold; margin-bottom: 40px; display: inline-block; }
            img { width: 300px; height: 300px; }
            .footer { margin-top: 40px; font-weight: bold; color: #94a3b8; letter-spacing: 2px; }
          </style>
        </head>
        <body>
          <div class="sign-card">
            <div class="badge">SMART CAMPUS OS</div>
            <h1>${resourceName || 'Facility'}</h1>
            <p>Scan to verify booking and check-in</p>
            <img src="${qrUrl}" alt="QR Code" />
            <div class="footer">SECURE DIGITAL IDENTITY</div>
          </div>
          <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="sidebar-card-qr-light" style={{ background: '#f8fafc', padding: '24px', borderRadius: '24px', border: '1.5px solid #e2e8f0', textAlign: 'center', marginTop: '20px' }}>
      {/* 🖤 HARD-FORCED VISIBLE TITLE */}
      <div style={{ color: '#000000', fontWeight: '950', fontSize: '0.85rem', letterSpacing: '0.05em', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <QrCode size={18} color="#6366f1" /> Secure Check-In ID
      </div>

      <div style={{ background: 'white', padding: '15px', borderRadius: '20px', display: 'inline-block', border: '1px solid #e2e8f0', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
        <img src={qrUrl} alt="Resource QR Code" style={{ width: '130px', height: '130px' }} />
      </div>

      {/* 🖤 HARD-FORCED VISIBLE FOOTER */}
      <div style={{ color: '#475569', fontWeight: '900', fontSize: '0.7rem', letterSpacing: '0.08em', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        <Smartphone size={12} color="#6366f1" /> SCAN TO CHECK-IN
      </div>

      <button 
        onClick={handlePrint}
        style={{ 
          marginTop: '20px', 
          width: '100%', 
          padding: '12px', 
          background: 'rgba(99, 102, 241, 0.1)', 
          border: '1px solid rgba(99, 102, 241, 0.2)', 
          borderRadius: '12px', 
          color: '#6366f1', 
          fontSize: '0.75rem', 
          fontWeight: '800', 
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseOver={e => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'}
        onMouseOut={e => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
      >
        Print Door Signage
      </button>
    </div>
  );
}
