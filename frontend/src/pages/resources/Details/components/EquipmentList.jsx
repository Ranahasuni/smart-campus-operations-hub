import React from 'react';
import { Cpu } from 'lucide-react';

export default function EquipmentList({ equipment }) {
  if (!equipment || equipment.length === 0) return null;

  // HARD-CODED INDESTRUCTIBLE STYLES
  const titleStyle = { color: '#000000', fontSize: '1.4rem', fontWeight: '950', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' };
  const chipStyle = { padding: '12px 24px', background: '#ffffff', color: '#000000', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: '900', border: '2.5px solid #6366f1', boxShadow: '0 4px 10px rgba(99, 102, 241, 0.05)' };

  return (
    <div className="equipment-list-section-pro" style={{ marginTop: '20px', paddingTop: '24px', borderTop: '2.5px solid #f1f5f9' }}>
      <h3 style={titleStyle}>
        <Cpu size={24} color="#6366f1" /> Technical Amenities
      </h3>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
        {equipment.map((item, index) => (
          <div key={index} style={chipStyle}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
