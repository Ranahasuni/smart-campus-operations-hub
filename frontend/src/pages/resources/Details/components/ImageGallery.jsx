import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageGallery({ images, name }) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="gallery-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#94a3b8' }}>
        <p>No Visual Context Available</p>
      </div>
    );
  }

  const next = () => setActiveIdx((activeIdx + 1) % images.length);
  const prev = () => setActiveIdx((activeIdx - 1 + images.length) % images.length);

  return (
    <div className="gallery-container">
      <img 
        src={images[activeIdx]} 
        alt={`${name} view ${activeIdx + 1}`} 
        className="gallery-image"
      />
      
      {images.length > 1 && (
        <>
          <button onClick={prev} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '50%', padding: '10px', color: '#fff', cursor: 'pointer' }}>
            <ChevronLeft size={24} />
          </button>
          <button onClick={next} style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '50%', padding: '10px', color: '#fff', cursor: 'pointer' }}>
            <ChevronRight size={24} />
          </button>
          
          <div style={{ position: 'absolute', bottom: '20px', right: '20px', background: 'rgba(0,0,0,0.5)', padding: '4px 12px', borderRadius: '20px', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}>
            {activeIdx + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}
