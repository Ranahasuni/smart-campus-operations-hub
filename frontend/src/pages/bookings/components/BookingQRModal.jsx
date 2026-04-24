import React from 'react';
import { X, QrCode, Smartphone, Download, ShieldCheck } from 'lucide-react';

export default function BookingQRModal({ booking, onClose }) {
  if (!booking) return null;

  const qrData = booking.bookingCode || booking.id;
  // Using an external QR generation service for simplicity, or we could use qrcode.react
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrData)}&color=0f172a&bgcolor=ffffff`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `Booking_QR_${qrData}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4" onClick={onClose}>
      <div 
        className="glass-card max-w-md w-full p-8 relative overflow-hidden text-center" 
        onClick={e => e.stopPropagation()}
        style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))' }}
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-500"></div>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 mb-6">
            <QrCode size={28} />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Digital Check-In ID</h2>
          <p className="text-slate-400 text-sm mb-8">Present this QR code to the staff member at the gate or resource entrance.</p>
          
          <div className="bg-white p-6 rounded-[2rem] shadow-2xl mb-8 group transition-transform hover:scale-[1.02]">
            <img 
              src={qrUrl} 
              alt="Booking QR Code" 
              className="w-48 h-48 sm:w-64 sm:h-64"
            />
          </div>

          <div className="flex flex-col gap-4 w-full">
            <div className="flex items-center justify-center gap-2 text-indigo-400 font-black tracking-widest text-xs uppercase bg-indigo-500/10 py-2 rounded-lg">
              <ShieldCheck size={14} /> SECURE BOOKING: {qrData}
            </div>

            <button 
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700"
            >
              <Download size={18} /> Download for Offline Use
            </button>
            
            <div className="flex items-center justify-center gap-2 text-slate-500 text-xs mt-2">
              <Smartphone size={12} /> Verification via Smart Campus QR System
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
