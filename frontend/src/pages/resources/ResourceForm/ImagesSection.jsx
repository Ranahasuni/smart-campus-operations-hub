import React from 'react';
import { ImagePlus, X, Image as ImageIcon } from 'lucide-react';

export default function ImagesSection({ formData, setFormValue, errors = {} }) {
  const imageUrls = formData.imageUrls || [];

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (limit to 1MB for Base64 storage safety in demo)
    if (file.size > 1024 * 1024) {
      // Create a temporary status so the admin knows why it failed
      setFormValue('images_error', "File too large: Please select a high-quality image under 1MB for optimal system performance.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const newUrls = [...imageUrls];
      newUrls[index] = reader.result; // This is the Base64 string
      setFormValue('imageUrls', newUrls);
    };
    reader.readAsDataURL(file);
  };

  const addImageSlot = () => {
    if (imageUrls.length < 5) {
      setFormValue('imageUrls', [...imageUrls, '']);
    }
  };

  const removeImage = (index) => {
    const newUrls = [...imageUrls];
    newUrls.splice(index, 1);
    setFormValue('imageUrls', newUrls);
  };

  return (
    <div className="form-section" style={{ border: errors.images ? '1px solid #ef4444' : '1px solid #bfdbfe' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ color: errors.images ? '#ef4444' : '#334155' }}>Resource Gallery</h3>
        <span style={{ fontSize: '0.8rem', color: errors.images ? '#ef4444' : '#64748b', fontWeight: '500' }}>
          {imageUrls.length} / 5 Images
        </span>
      </div>

      <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '-10px', marginBottom: '20px' }}>
        Select 1 to 5 high-quality images from your computer to showcase this resource effectively.
      </p>

      <div className="image-grid-paf">
        {imageUrls.map((url, index) => (
          <div key={index} className="image-slot-paf" style={{ borderColor: errors.images ? '#fca5a5' : '#e2e8f0' }}>
            {url ? (
              <div className="image-preview-wrapper">
                <img src={url} alt={`Preview ${index}`} className="image-preview-paf" />
                <button
                  type="button"
                  className="btn-remove-image-paf"
                  onClick={() => removeImage(index)}
                  title="Remove Image"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="image-upload-label-paf">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, index)}
                  style={{ display: 'none' }}
                />
                <div className="upload-placeholder-paf">
                  <ImagePlus size={24} color={errors.images ? "#f87171" : "#3b82f6"} />
                  <span style={{ color: errors.images ? '#f87171' : '#64748b' }}>Browse</span>
                </div>
              </label>
            )}
          </div>
        ))}

        {imageUrls.length < 5 && (
          <button
            type="button"
            className="btn-add-slot-paf"
            onClick={addImageSlot}
            style={{
              borderColor: errors.images ? '#fca5a5' : '#bfdbfe',
              background: errors.images ? '#fff1f2' : '#eff6ff',
              color: errors.images ? '#ef4444' : '#3b82f6'
            }}
            title="Add another image slot"
          >
            <ImagePlus size={20} />
            <span>Add Slot</span>
          </button>
        )}
      </div>

      {imageUrls.length === 0 && (
        <div className="empty-gallery-state" style={{ background: errors.images ? '#fff1f2' : '#f8fafc' }}>
          <ImageIcon size={40} color={errors.images ? "#fca5a5" : "#e2e8f0"} />
          <p style={{ color: errors.images ? '#ef4444' : '#94a3b8' }}>No images selected yet</p>
        </div>
      )}

      {errors.images && (
        <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '15px', fontWeight: '700', textAlign: 'center' }}>
          {errors.images}
        </p>
      )}
    </div>
  );
}
