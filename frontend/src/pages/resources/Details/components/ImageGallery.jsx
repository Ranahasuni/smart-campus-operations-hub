import React from 'react';

export default function ImageGallery({ images, name, status }) {
  const mainImage = images && images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80';

  // Dynamic Status Label Logic
  const getStatusLabel = () => {
    switch (status) {
      case 'ACTIVE':
        return { text: 'ONLINE', bg: 'rgba(34, 197, 94, 0.9)' };
      case 'MAINTENANCE':
        return { text: 'MAINTENANCE', bg: 'rgba(234, 179, 8, 0.9)' }; // Orange
      case 'OUT_OF_SERVICE':
      case 'OFFLINE':
        return { text: 'OFFLINE', bg: 'rgba(239, 68, 68, 0.9)' }; // Red
      default:
        return { text: 'UNKNOWN', bg: 'rgba(100, 116, 139, 0.9)' };
    }
  };

  const labelCfg = getStatusLabel();

  return (
    <div className="gallery-container">
      <img src={mainImage} alt={name} className="gallery-image" />
      
      {/* 🚀 DYNAMIC CORNER LABEL */}
      <div className="status-pill-over-photo" style={{ backgroundColor: labelCfg.bg }}>
        <div className="dot-white" />
        {labelCfg.text}
      </div>
    </div>
  );
}
