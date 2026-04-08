import React from 'react';
import { MapPin, Users, Building, Layers, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ResourceInfo({ resource }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'ACTIVE': return { label: 'Online', bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' };
      case 'MAINTENANCE': return { label: 'Maintenance', bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308' };
      case 'OUT_OF_SERVICE': return { label: 'Offline', bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
      default: return { label: status, bg: '#f1f5f9', color: '#64748b' };
    }
  };

  const statusCfg = getStatusConfig(resource.status);

  return (
    <div className="info-content">
      <div className="badge-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ padding: '6px 16px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', borderRadius: '99px', fontSize: '0.8rem', fontWeight: '800' }}>
          {resource.type}
        </span>
        <span className="status-badge" style={{ background: statusCfg.bg, color: statusCfg.color }}>
          {statusCfg.label}
        </span>
        
        {/* TOP MARKS: SMART TICKET LINK */}
        {resource.status === 'ACTIVE' && (
          <Link 
            to={`/tickets/new?resourceId=${resource.id}&resourceName=${encodeURIComponent(resource.name)}`}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px',
              padding: '6px 16px', 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: '#ef4444', 
              borderRadius: '99px', 
              fontSize: '0.8rem', 
              fontWeight: '800',
              textDecoration: 'none',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
          >
            <AlertTriangle size={14} /> Report Issue?
          </Link>
        )}
      </div>

      <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#0f172a', marginBottom: '16px' }}>{resource.name}</h1>
      <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: '1.7', marginBottom: '32px' }}>{resource.description}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', padding: '24px', background: '#f8fafc', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Capacity</div>
            <div style={{ fontWeight: '800', color: '#1e293b' }}>{resource.capacity} Seats</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <Building size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Building</div>
            <div style={{ fontWeight: '800', color: '#1e293b' }}>{resource.building}</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <Layers size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Floor & Room</div>
            <div style={{ fontWeight: '800', color: '#1e293b' }}>Lvl {resource.floor}, {resource.roomNumber}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
