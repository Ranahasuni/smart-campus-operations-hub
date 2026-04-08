import React from 'react';
import { Cpu } from 'lucide-react';

export default function EquipmentList({ equipment }) {
  if (!equipment || equipment.length === 0) return null;

  return (
    <div style={{ padding: '0 40px 40px 40px' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Cpu size={20} color="#6366f1" /> Technical Amenities
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {equipment.map((item, idx) => (
          <div key={idx} className="equipment-chip">
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1' }} />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
