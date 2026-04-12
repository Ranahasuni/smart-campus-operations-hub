import React from 'react';
import { Cpu } from 'lucide-react';

export default function EquipmentList({ equipment }) {
  if (!equipment || equipment.length === 0) return null;

  // HARD-CODED INDESTRUCTIBLE STYLES
  const titleStyle = { color: 'var(--text-primary)', fontSize: '1.4rem', fontWeight: '950', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' };
  const chipStyle = { padding: '12px 24px', background: 'var(--bg-tertiary)', color: 'var(--text-primary)', borderRadius: '16px', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: '900', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-sm)' };

  return (
    <div className="equipment-list-section-pro" style={{ marginTop: '20px', paddingTop: '24px', borderTop: '2px solid var(--glass-border)' }}>
      <h3 style={titleStyle}>
        <Cpu size={24} color="var(--accent-primary)" /> Technical Amenities
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
