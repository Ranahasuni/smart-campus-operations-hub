import React, { useState } from 'react';

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


import { useAuth } from '../../../../context/AuthContext';

export default function ImageGallery({ images, name, status }) {
  const { API } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const fallbackImage = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80';
  
  const resolveUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    if (url.startsWith('/api/uploads')) return `${API}${url}`;
    return url;
  };

  const hasImages = images && images.length > 0;
  const rawMainImage = hasImages ? images[activeImageIndex] : fallbackImage;
  const mainImage = resolveUrl(rawMainImage);

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
              <img src={resolveUrl(url)} alt={`${name} view ${idx + 1}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
