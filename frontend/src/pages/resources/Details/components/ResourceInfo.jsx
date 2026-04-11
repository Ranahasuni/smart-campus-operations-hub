import React from 'react';
import { Users, Building, MapPin, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ResourceInfo({ resource }) {
  // HARD-CODED INDESTRUCTIBLE STYLES
  const containerStyle = { marginBottom: '24px' };
  const badgeRowStyle = { display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' };
  const titleStyle = { color: '#000000', fontSize: '3.5rem', fontWeight: '950', margin: '10px 0', lineHeight: '1.1' };
  const descStyle = { color: '#334155', fontSize: '1.15rem', lineHeight: '1.7', marginBottom: '30px', fontWeight: '600' };

  const statCardStyle = { 
    background: '#f0f4ff', 
    padding: '24px', 
    borderRadius: '24px', 
    border: '2.5px solid #6366f1', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '16px',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.1)'
  };

  return (
    <div style={containerStyle}>
      <div style={badgeRowStyle}>
        <span style={{ padding: '8px 18px', background: '#f1f5f9', color: '#6366f1', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '900', border: '1.5px solid #6366f1' }}>
          {resource.type}
        </span>
        <Link to={`/tickets/new?resourceId=${resource.id}`} style={{ textDecoration: 'none' }}>
          <div style={{ padding: '8px 18px', background: '#fef2f2', color: '#ef4444', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '900', border: '1.5px solid #ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={14} /> Report Issue?
          </div>
        </Link>
      </div>

      <h1 style={{ ...titleStyle, fontSize: '2.4rem', fontWeight: '950', margin: '15px 0', lineHeight: '1.2' }}>
        {resource.name}
      </h1>
      <p style={descStyle}>{resource.description}</p>

      {/* 📏 FORCED GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        
        {/* CAPACITY */}
        <div style={statCardStyle}>
          <div style={{ background: 'white', padding: '12px', borderRadius: '14px', border: '1px solid #e0e7ff', color: '#8b5cf6', display: 'flex' }}>
            <Users size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#6366f1', fontWeight: '950', fontSize: '0.7rem', textTransform: 'uppercase' }}>CAPACITY</span>
            <span style={{ color: '#000000', fontWeight: '950', fontSize: '1.15rem' }}>{resource.capacity} Seats</span>
          </div>
        </div>

        {/* BUILDING */}
        <div style={statCardStyle}>
          <div style={{ background: 'white', padding: '12px', borderRadius: '14px', border: '1px solid #e0e7ff', color: '#6366f1', display: 'flex' }}>
            <Building size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#6366f1', fontWeight: '950', fontSize: '0.7rem', textTransform: 'uppercase' }}>BUILDING</span>
            <span style={{ color: '#000000', fontWeight: '950', fontSize: '1.15rem' }}>{resource.building}</span>
          </div>
        </div>

        {/* LOCATION */}
        <div style={statCardStyle}>
          <div style={{ background: 'white', padding: '12px', borderRadius: '14px', border: '1px solid #e0e7ff', color: '#0d9488', display: 'flex' }}>
            <MapPin size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#6366f1', fontWeight: '950', fontSize: '0.7rem', textTransform: 'uppercase' }}>FLOOR & ROOM</span>
            <span style={{ color: '#000000', fontWeight: '950', fontSize: '1.1rem' }}>
              {resource.floor % 10 === 1 ? '1st' : resource.floor % 10 === 2 ? '2nd' : resource.floor % 10 === 3 ? '3rd' : `${resource.floor}th`} Floor, {resource.roomNumber}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
