import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function PageHeader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
      <div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-1px' }}>
          Manage <span style={{ color: '#6366f1' }}>Resources</span>
        </h1>
        <p style={{ color: '#64748b', marginTop: '8px' }}>Administrative control over campus assets and real-estate inventory.</p>
      </div>
      <Link to="/admin/resources/new" style={{ 
        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        color: '#fff', textDecoration: 'none', padding: '14px 28px', borderRadius: '14px',
        fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px',
        boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)',
        transition: 'transform 0.2s'
      }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} 
         onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
        <Plus size={20} /> Add New Resource
      </Link>
    </div>
  );
}
