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
      case 'MAINTENANCE': return { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308', label: 'Service' };
      case 'OUT_OF_SERVICE': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Failure' };
      default: return { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748b', label: s || 'Unknown' };
    }
  };

  const getNextStatus = (current) => {
    return current === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
  };

  const openDeleteModal = (id, name) => {
    setConfirmModal({
      show: true, id, type: 'DELETE',
      title: 'Delete Asset?',
      message: `Are you sure you want to permanently remove "${name}" from the registry?`
    });
  };

  const openStatusModal = (id, currentStatus, name) => {
    const next = getNextStatus(currentStatus);
    setConfirmModal({
      show: true, id, type: 'STATUS', nextStatus: next,
      title: 'Toggle Registry Status?',
      message: `Change ${name} status to ${next.replace('_', ' ')}?`
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
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
                      <button
                        onClick={() => openStatusModal(r.id, r.status, r.name)}
                        title="Toggle Asset Availability"
                        style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px', color: '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        <Power size={18} />
                      </button>
                      <Link to={`/admin/resources/edit/${r.id}`} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px', color: '#1e293b', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center' }}>
                        <Edit3 size={18} />
                      </Link>
                      <button onClick={() => openDeleteModal(r.id, r.name)}
                        style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '10px', padding: '8px', color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s' }}
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
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: '700', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: confirmModal.type === 'DELETE' ? '#ef4444' : '#6366f1', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
              >
                {confirmModal.type === 'DELETE' ? 'Delete Forever' : 'Yes, Proceed'}
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
