import { useState } from 'react';

export default function EquipmentSection({ formData, setFormValue }) {
  const [inputValue, setInputValue] = useState('');
  const equipmentList = formData.equipment || [];

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = inputValue.trim();
      if (val && !equipmentList.includes(val)) {
        setFormValue('equipment', [...equipmentList, val]);
        setInputValue('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setFormValue(
      'equipment',
      equipmentList.filter(tag => tag !== tagToRemove)
    );
  };

  return (
    <div className="form-section">
      <h3>Equipment & Features</h3>
      <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '-10px', marginBottom: '15px' }}>
        Type an item and press Enter to add it.
      </p>
      
      <div className="tag-input-container">
        {equipmentList.map((tag, index) => (
          <span key={index} className="tag-pill">
            {tag}
            <button 
              type="button" 
              className="tag-remove" 
              onClick={() => removeTag(tag)}
            >
              &times;
            </button>
          </span>
        ))}
        <input
          type="text"
          className="tag-input"
          placeholder="e.g., Projector Cluster, Audio Matrix, High-Density Wi-Fi..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}
