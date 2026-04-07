import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, Trash2, Edit3, MapPin, 
  Power, HardDrive, AlertCircle 
} from 'lucide-react';

export default function ResourceTable({ resources, onUpdateStatus, onDeleteResource }) {
  
  const getStatusStyle = (status) => {
    const s = String(status || '').toUpperCase();
    switch (s) {
      case 'ACTIVE':         return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', label: 'Online' };
      case 'MAINTENANCE':    return { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308', label: 'Service' };
      case 'OUT_OF_SERVICE': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Failure' };
      default:               return { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748b', label: s || 'Unknown' };
    }
  };

  const getNextStatus = (current) => {
    return current === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
  };

  return (
    <div style={{ 
      background: '#fff', 
      borderRadius: '24px', 
      border: '1px solid #e2e8f0', 
      overflow: 'hidden',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <th style={{ padding: '20px 24px', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Facility Details</th>
            <th style={{ padding: '20px 24px', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Location</th>
            <th style={{ padding: '20px 24px', textAlign: 'center', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Capacity</th>
            <th style={{ padding: '20px 24px', textAlign: 'center', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Status</th>
            <th style={{ padding: '20px 24px', textAlign: 'right', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {resources.map(r => {
            const status = getStatusStyle(r.status);
            return (
              <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                      <Building2 size={24} />
                    </div>
                    <div>
                      <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '1rem' }}>{r.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>{String(r.type || 'FACILITY').replace('_', ' ')}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontSize: '0.9rem', fontWeight: '500' }}>
                    <MapPin size={14} color="#94a3b8" /> {r.building}, Floor {r.floor}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '22px' }}>Room {r.roomNumber || 'N/A'}</div>
                </td>
                <td style={{ padding: '20px 24px', textAlign: 'center', color: '#334155', fontWeight: '600' }}>
                  {r.capacity} ppl
                </td>
                <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                  <span style={{ padding: '6px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '800', background: status.bg.replace('0.1', '0.08'), color: status.color, border: `1px solid ${status.color}20`, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {status.label}
                  </span>
                </td>
                <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
                    <button 
                      onClick={() => onUpdateStatus(r.id, getNextStatus(r.status))}
                      title="Toggle Status"
                      style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseOver={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#6366f1'; }}
                      onMouseOut={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#64748b'; }}
                    >
                      <Power size={18} />
                    </button>
                    <Link to={`/admin/resources/edit/${r.id}`} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center' }}
                      onMouseOver={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#6366f1'; }}
                      onMouseOut={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#64748b'; }}>
                      <Edit3 size={18} />
                    </Link>
                    <button onClick={() => onDeleteResource(r.id)} 
                      style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '10px', padding: '8px', color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseOver={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.border = '1px solid #ef4444'; }}
                      onMouseOut={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.border = '1px solid #fee2e2'; }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {resources.length === 0 && (
        <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>
          <HardDrive size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>No facilities found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
