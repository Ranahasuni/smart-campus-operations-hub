import React, { useState } from 'react';

export default function ImageGallery({ images, name, status }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const fallbackImage = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80';
  const hasImages = images && images.length > 0;
  const mainImage = hasImages ? images[activeImageIndex] : fallbackImage;

  return (
    <div className="gallery-container-paf">
      {/* 🖼️ PRIMARY DISPLAY */}
      <div className="main-image-wrapper">
        <img src={mainImage} alt={name} className="gallery-main-image" />
      </div>

      {/* 📸 THUMBNAIL STRIP (Only shows if there are multiple images) */}
      {hasImages && images.length > 1 && (
        <div className="thumbnail-strip">
          {images.map((url, idx) => (
            <div 
              key={idx} 
              className={`thumbnail-box ${activeImageIndex === idx ? 'active' : ''}`}
              onClick={() => setActiveImageIndex(idx)}
            >
              <img src={url} alt={`${name} view ${idx + 1}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
