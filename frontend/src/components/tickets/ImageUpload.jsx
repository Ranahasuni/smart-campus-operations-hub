import React, { useState, useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';

const ImageUpload = ({ onFilesSelected, maxFiles = 3 }) => {
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (previews.length + files.length > maxFiles) {
      alert(`You can only upload a maximum of ${maxFiles} images.`);
      return;
    }

    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));

    setPreviews(prev => [...prev, ...newPreviews]);
    onFilesSelected(prev => [...prev.map(p => p.file), ...files]);
  };

  const removeImage = (index) => {
    setPreviews(prev => {
      const updated = prev.filter((_, i) => i !== index);
      onFilesSelected(updated.map(p => p.file));
      return updated;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div 
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed rgba(192, 128, 128, 0.3)',
          borderRadius: '24px',
          padding: '40px 20px',
          textAlign: 'center',
          cursor: 'pointer',
          background: 'rgba(245, 230, 230, 0.4)',
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}
        onMouseOver={e => {
          e.currentTarget.style.borderColor = '#C08080';
          e.currentTarget.style.background = 'rgba(245, 230, 230, 0.6)';
        }}
        onMouseOut={e => {
          e.currentTarget.style.borderColor = 'rgba(192, 128, 128, 0.3)';
          e.currentTarget.style.background = 'rgba(245, 230, 230, 0.4)';
        }}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          multiple 
          accept="image/*" 
          style={{ display: 'none' }} 
        />
        
        <div style={{ 
          width: '56px', 
          height: '56px', 
          borderRadius: '18px', 
          background: '#fff', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 8px 20px rgba(192, 128, 128, 0.15)',
          color: '#C08080'
        }}>
          <UploadCloud size={28} />
        </div>
        <div>
          <p style={{ color: '#1F1F1F', fontWeight: '700', fontSize: '1.1rem', margin: '0 0 4px 0' }}>Click to upload photos</p>
          <p style={{ color: '#6B7281', fontSize: '0.85rem', fontWeight: '500', margin: 0 }}>PNG, JPG up to 5MB (Max {maxFiles} images)</p>
        </div>
      </div>

      {previews.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {previews.map((preview, index) => (
            <div key={index} style={{ 
              position: 'relative', 
              borderRadius: '20px', 
              overflow: 'hidden', 
              aspectRatio: '1/1',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              border: '1px solid rgba(192, 128, 128, 0.1)',
              background: '#fff'
            }}>
              <img 
                src={preview.url} 
                alt="preview" 
                style={{ width: '100%', height: '100%', objectCover: 'cover' }} 
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  width: '28px',
                  height: '28px',
                  borderRadius: '10px',
                  background: 'rgba(239, 68, 68, 0.9)',
                  color: '#fff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <X size={14} />
              </button>
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '8px 12px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {preview.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
