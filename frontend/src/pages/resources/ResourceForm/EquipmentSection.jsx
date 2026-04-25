import { useState } from 'react';

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


export default function EquipmentSection({ formData, setFormValue, errors = {} }) {
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
    <div className="form-section" style={{ border: errors.equipment ? '1px solid #ef4444' : '1px solid #bfdbfe' }}>
      <h3 style={{ color: errors.equipment ? '#ef4444' : '#334155' }}>Equipment & Features</h3>
      <p style={{ fontSize: '0.85rem', color: '#6B7281', marginTop: '-10px', marginBottom: '15px' }}>
        Type an item and press Enter to add it.
      </p>

      <div className="tag-input-container" style={{ borderColor: errors.equipment ? '#fca5a5' : '#4B5563' }}>
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
      {errors.equipment && (
        <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '10px', fontWeight: '700' }}>
          {errors.equipment}
        </p>
      )}
    </div>
  );
}
