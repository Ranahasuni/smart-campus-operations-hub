import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Trash2, Edit3, MapPin,
  Power, HardDrive, AlertCircle, CheckCircle2, X
} from 'lucide-react';

export default function ResourceTable({ resources, onUpdateStatus, onDeleteResource }) {
  const [confirmModal, setConfirmModal] = useState({ show: false, type: '', id: null, title: '', message: '', nextStatus: null });
  const [successModal, setSuccessModal] = useState({ show: false, title: '', message: '' });

  const getStatusStyle = (status) => {
    // ... same logic ...
    const s = String(status || '').toUpperCase();
    switch (s) {
      case 'ACTIVE': return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', label: 'Online' };
      case 'MAINTENANCE': return { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308', label: 'Maintenance' };
      case 'OUT_OF_SERVICE': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Offline' };
      default: return { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748b', label: s || 'Unknown' };
    }
  };

  const getNextStatus = (current) => {
    return current === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
  };

  const openDeleteModal = (id, name) => {
    setConfirmModal({
      show: true, id, type: 'DELETE',
      title: 'Remove Facility?',
      message: `Are you sure you want to permanently delete "${name}" from the registry?`
    });
  };

  const openStatusModal = (id, currentStatus, name) => {
    const next = getNextStatus(currentStatus);
    setConfirmModal({
      show: true, id, type: 'STATUS', nextStatus: next,
      title: 'Change Asset Status?',
      message: `Are you sure you want to set "${name}" to ${next.replace('_', ' ').toLowerCase()}?`
    });
  };

  const handleConfirm = async () => {
    if (confirmModal.type === 'DELETE') {
      await onDeleteResource(confirmModal.id);
      setSuccessModal({ show: true, title: 'Delete Successful', message: 'The resource has been permanently removed from the system.' });
    } else if (confirmModal.type === 'STATUS') {
      await onUpdateStatus(confirmModal.id, confirmModal.nextStatus);
    }
    setConfirmModal({ ...confirmModal, show: false });
  };

  const getOrdinalFloor = (floor) => {
    const f = parseInt(floor);
    if (f === 0) return 'Ground Floor';
    const s = ["th", "st", "nd", "rd"];
    const v = f % 100;
    return f + (s[(v - 20) % 10] || s[v] || s[0]) + " Floor";
  };

  return (
    <div style={{ position: 'relative' }}>
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
              <th style={{ padding: '20px 24px', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', width: '35%' }}>Facility Details</th>
              <th style={{ padding: '20px 24px', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', width: '25%' }}>Location</th>
              <th style={{ padding: '20px 24px', textAlign: 'center', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', width: '10%' }}>Capacity</th>
              <th style={{ padding: '20px 24px', textAlign: 'center', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', width: '15%' }}>Status</th>
              <th style={{ padding: '20px 24px', textAlign: 'center', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', width: '15%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.map(r => {
              const status = getStatusStyle(r.status);
              return (
                <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s', cursor: 'default' }} onMouseOver={e => e.currentTarget.style.background = '#fcfdff'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: 'rgba(99, 102, 241, 0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#6366f1', overflow: 'hidden', border: '1px solid #f1f5f9'
                      }}>
                        {r.imageUrls && r.imageUrls[0] && (r.imageUrls[0].startsWith('http') || r.imageUrls[0].startsWith('data:')) ? (
                          <img src={r.imageUrls[0]} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Building2 size={24} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '1rem' }}>{r.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                          {(() => {
                            const t = String(r.type || 'FACILITY');
                            if (t === 'LECTURE_HALL') return 'LECTURE HALL';
                            return t.replace('_', ' ').toUpperCase();
                          })()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={16} color="#3b82f6" fill="#3b82f620" />
                        <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.95rem' }}>{r.building}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '24px' }}>
                        <span style={{ padding: '2px 8px', background: '#f1f5f9', borderRadius: '6px', fontSize: '0.7rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                          {getOrdinalFloor(r.floor)}
                        </span>
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>•</span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>{r.roomNumber || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px', height: '24px', padding: '10px', borderRadius: '8px', background: '#f1f5f9', color: '#0f172a', fontWeight: '800', fontSize: '0.9rem' }}>
                      {r.capacity}
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                    <span style={{ padding: '6px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '800', background: status.bg.replace('0.1', '0.08'), color: status.color, border: `1px solid ${status.color}20`, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {status.label}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                      <button
                        onClick={() => openStatusModal(r.id, r.status, r.name)}
                        title="Toggle Status"
                        style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                        onMouseOver={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#6366f1'; }}
                        onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#64748b'; }}
                      >
                        <Power size={18} />
                      </button>
                      <Link to={`/admin/resources/edit/${r.id}`}
                        title="Edit Resource"
                        style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e293b', cursor: 'pointer', transition: 'all 0.2s', textDecoration: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                        onMouseOver={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#94a3b8'; }}
                        onMouseOut={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                      >
                        <Edit3 size={18} />
                      </Link>
                      <button onClick={() => openDeleteModal(r.id, r.name)}
                        title="Delete Resource"
                        style={{ background: '#fff', border: '1px solid #fecaca', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                        onMouseOver={e => { e.currentTarget.style.background = '#fef2f2'; }}
                        onMouseOut={e => { e.currentTarget.style.background = '#fff'; }}
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

      {/* Confirm Modal */}
      {confirmModal.show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s' }}>
          {/* ... modal content ... */}
          <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: confirmModal.type === 'DELETE' ? '#fef2f2' : '#f0f9ff', color: confirmModal.type === 'DELETE' ? '#ef4444' : '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              {confirmModal.type === 'DELETE' ? <AlertCircle size={32} /> : <CheckCircle2 size={32} />}
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>{confirmModal.title}</h3>
            <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '0.95rem', lineHeight: '1.5' }}>{confirmModal.message}</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = '#fefeff'}
                onMouseOut={e => e.currentTarget.style.background = '#fff'}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
                  background: confirmModal.type === 'DELETE' ? '#ef4444' : '#6366f1',
                  color: '#fff', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: confirmModal.type === 'DELETE' ? '0 4px 12px rgba(239, 68, 68, 0.2)' : '0 4px 12px rgba(99, 102, 241, 0.2)'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {confirmModal.type === 'DELETE' ? 'Delete Asset' : 'Yes, Proceed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {successModal.show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '350px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: '800' }}>{successModal.title}</h3>
            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '0.9rem' }}>{successModal.message}</p>
            <button
              onClick={() => setSuccessModal({ ...successModal, show: false })}
              style={{ padding: '10px 24px', borderRadius: '10px', background: '#0f172a', color: '#fff', fontWeight: '700', border: 'none', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
