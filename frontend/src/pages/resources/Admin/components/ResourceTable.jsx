import React, { useState } from 'react';

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

import { Link } from 'react-router-dom';
import {
  Building2, Trash2, Edit3, MapPin,
  Power, HardDrive, AlertCircle, CheckCircle2, X, Loader2,
  SearchX
} from 'lucide-react';

import { useAuth } from '../../../../context/AuthContext';

export default function ResourceTable({ resources, loading, onUpdateStatus, onDeleteResource, clearFilters }) {
  const { API } = useAuth();
  const [confirmModal, setConfirmModal] = useState({ show: false, type: '', id: null, title: '', message: '', nextStatus: null });
  const [successModal, setSuccessModal] = useState({ show: false, title: '', message: '' });

  const resolveUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    if (url.startsWith('/api/uploads')) return `${API}${url}`;
    return url;
  };

  const getStatusStyle = (status) => {
    const s = String(status || '').toUpperCase();
    switch (s) {
      case 'ACTIVE': return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', label: 'Online' };
      case 'MAINTENANCE': return { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308', label: 'Maintenance' };
      case 'OUT_OF_SERVICE': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Offline' };
      default: return { bg: 'rgba(100, 116, 139, 0.1)', color: '#6B7281', label: s || 'Unknown' };
    }
  };

  const getNextStatus = (current) => {
    const s = String(current || '').toUpperCase();
    if (s === 'ACTIVE') return 'MAINTENANCE';
    if (s === 'MAINTENANCE') return 'ACTIVE';
    return 'ACTIVE'; // Fallback for OUT_OF_SERVICE or unknown
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
      setConfirmModal({ ...confirmModal, show: false });
    } else if (confirmModal.type === 'STATUS') {
      const id = confirmModal.id;
      const status = confirmModal.nextStatus;
      setConfirmModal({ ...confirmModal, show: false }); // ⚡ Close instantly
      onUpdateStatus(id, status); // Fire and forget (Optimistic)
    }
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
        {/* Elite Table Container */}
      <div style={{
        background: 'rgba(192, 128, 128, 0.06)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        minHeight: '450px',
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(10px)'
      }}>
        {loading ? (
          /* ELITE GHOST SKELETON - THE PROFESSIONAL WAY */
          <div style={{ padding: '0' }}>
            <div style={{ background: 'rgba(192, 128, 128, 0.06)', height: '60px', borderBottom: '1px solid rgba(192, 128, 128, 0.06)', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
              <div style={skeletonLineStyle('120px')} />
              <div style={{ ...skeletonLineStyle('100px'), marginLeft: 'auto' }} />
              <div style={{ ...skeletonLineStyle('60px'), marginLeft: 'auto' }} />
              <div style={{ ...skeletonLineStyle('100px'), marginLeft: 'auto' }} />
              <div style={{ ...skeletonLineStyle('120px'), marginLeft: 'auto' }} />
            </div>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ height: '92px', borderBottom: '1px solid rgba(192, 128, 128, 0.06)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px', opacity: 1 - (i * 0.15) }}>
                <div style={{ width: '52px', height: '52px', background: 'rgba(192, 128, 128, 0.06)', borderRadius: '14px' }} className="animate-pulse" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={skeletonLineStyle('180px')} />
                  <div style={skeletonLineStyle('100px')} />
                </div>
                <div style={{ ...skeletonLineStyle('140px'), marginLeft: 'auto' }} />
                <div style={{ ...skeletonLineStyle('40px'), marginLeft: 'auto' }} />
                <div style={{ ...skeletonLineStyle('80px'), marginLeft: 'auto' }} />
                <div style={{ ...skeletonLineStyle('110px'), marginLeft: 'auto' }} />
              </div>
            ))}
          </div>
        ) : resources.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(192, 128, 128, 0.06)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '20px 24px', textAlign: 'left', color: '#6B7281', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', width: '35%' }}>Facility Details</th>
                <th style={{ padding: '20px 24px', textAlign: 'left', color: '#6B7281', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', width: '25%' }}>Location</th>
                <th style={{ padding: '20px 24px', textAlign: 'center', color: '#6B7281', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', width: '10%' }}>Capacity</th>
                <th style={{ padding: '20px 24px', textAlign: 'center', color: '#6B7281', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', width: '15%' }}>Status</th>
                <th style={{ padding: '20px 24px', textAlign: 'center', color: '#6B7281', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', width: '15%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map(r => {
                const status = getStatusStyle(r.status);
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(192, 128, 128, 0.06)', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(192, 128, 128, 0.06)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '52px', height: '52px', borderRadius: '14px',
                          background: 'rgba(192, 128, 128, 0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#C08080', overflow: 'hidden', border: '1px solid rgba(192, 128, 128, 0.06)'
                        }}>
                          {r.imageUrls && r.imageUrls[0] ? (
                            <img src={resolveUrl(r.imageUrls[0])} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Building2 size={26} />
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: '800', color: '#1F1F1F', fontSize: '1.05rem' }}>{r.name}</div>
                          <div style={{ fontSize: '0.85rem', color: '#6B7281', fontWeight: '600', textTransform: 'uppercase' }}>
                            {r.type ? r.type.replace(/_/g, ' ') : 'FACILITY'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MapPin size={16} color="#C08080" />
                          <span style={{ fontWeight: '800', color: '#1F1F1F', fontSize: '0.95rem' }}>{r.building}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '24px' }}>
                          <span style={{ padding: '2px 8px', background: 'rgba(192, 128, 128, 0.06)', borderRadius: '6px', fontSize: '0.7rem', color: '#6B7281', fontWeight: '700', textTransform: 'uppercase' }}>
                            {getOrdinalFloor(r.floor)}
                          </span>
                          <span style={{ color: '#475569', fontSize: '0.75rem' }}>•</span>
                          <span style={{ fontSize: '0.8rem', color: '#6B7281', fontWeight: '500' }}>{r.roomNumber || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px', height: '24px', padding: '12px', borderRadius: '10px', background: 'rgba(192, 128, 128, 0.06)', color: '#1F1F1F', fontWeight: '800', fontSize: '0.95rem' }}>
                        {r.capacity}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                      <span style={{ padding: '8px 16px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '800', background: status.bg.replace('0.1', '0.15'), color: status.color, border: `1px solid ${status.color}40`, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {status.label}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        <button
                          onClick={() => openStatusModal(r.id, r.status, r.name)}
                          title="Toggle Status"
                          style={{ background: 'rgba(192, 128, 128, 0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7281', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseOver={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#C08080'; e.currentTarget.style.background = 'rgba(192, 128, 128, 0.1)'; }}
                          onMouseOut={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(192, 128, 128, 0.06)'; }}
                        >
                          <Power size={20} />
                        </button>
                        <Link to={`/admin/resources/edit/${r.id}`}
                          title="Edit Resource"
                          style={{ background: 'rgba(192, 128, 128, 0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1F1F1F', cursor: 'pointer', transition: 'all 0.2s', textDecoration: 'none' }}
                          onMouseOver={e => { e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                          onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(192, 128, 128, 0.06)'; }}
                        >
                          <Edit3 size={20} />
                        </Link>
                        <button onClick={() => openDeleteModal(r.id, r.name)}
                          title="Delete Resource"
                          style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s' }}
                          onMouseOver={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
                          onMouseOut={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'; }}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          /* IDENTICAL TO STUDENT CATALOGUE EMPTY STATE (ONLY SHOWN AFTER LOAD) */
          <div style={{
            padding: '100px 40px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            animation: 'fadeIn 0.3s'
          }}>
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: '#1F1F1F', border: '1px solid #6B7281',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '32px', color: '#6B7281'
            }}>
              <SearchX size={48} strokeWidth={1.5} />
            </div>
            
            <h2 style={{
              fontSize: '2rem', fontWeight: '900', color: '#FFFFFF',
              marginBottom: '16px', letterSpacing: '-0.5px'
            }}>
              No Facilities Found
            </h2>
            
            <p style={{
              maxWidth: '500px', fontSize: '1.1rem', color: '#6B7281',
              lineHeight: '1.6', marginBottom: '32px', fontWeight: '500'
            }}>
              No campus assets matching your specific registry criteria were found. 
              Please adjust your filters or reset your search to continue.
            </p>
            
            <button 
              onClick={clearFilters}
              style={{
                padding: '16px 40px', borderRadius: '16px', background: '#C08080',
                color: '#1F1F1F', fontSize: '1.05rem', fontWeight: '800', border: 'none',
                cursor: 'pointer', transition: 'all 0.3s',
                boxShadow: '0 10px 20px -5px rgba(192, 128, 128, 0.4)'
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(192, 128, 128, 0.5)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(192, 128, 128, 0.4)'; }}
            >
              Reset All Search Filters
            </button>
          </div>
        )}

        {/* PROFESSIONAL REGISTRY STATUS STRIP */}
        {resources.length > 0 && (
          <div style={{
            padding: '16px 24px',
            background: '#1F1F1F',
            borderTop: '1px solid #6B7281',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'auto'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#6B7281', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Showing <span style={{ color: '#FFFFFF' }}>{resources.length}</span> {resources.length === 1 ? 'facility' : 'facilities'} in current view
            </div>
            <div style={{ fontSize: '0.8rem', color: '#4B5563', fontWeight: '400', fontStyle: 'italic' }}>
              Registry snapshot is real-time and synchronized.
            </div>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {confirmModal.show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(245, 230, 230, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s' }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: confirmModal.type === 'DELETE' ? '#fef2f2' : '#f0f9ff', color: confirmModal.type === 'DELETE' ? '#ef4444' : '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              {confirmModal.type === 'DELETE' ? <AlertCircle size={32} /> : <CheckCircle2 size={32} />}
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: '800', color: '#1F1F1F' }}>{confirmModal.title}</h3>
            <p style={{ margin: '0 0 24px 0', color: '#6B7281', fontSize: '0.95rem', lineHeight: '1.5' }}>{confirmModal.message}</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #6B7281', background: '#fff', color: '#6B7281', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = '#fefeff'}
                onMouseOut={e => e.currentTarget.style.background = '#fff'}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
                  background: confirmModal.type === 'DELETE' ? '#ef4444' : '#C08080',
                  color: '#1F1F1F', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: confirmModal.type === 'DELETE' ? '0 4px 12px rgba(239, 68, 68, 0.2)' : '0 4px 12px rgba(192, 128, 128, 0.2)'
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(245, 230, 230, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', width: '100%', maxWidth: '350px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: '800' }}>{successModal.title}</h3>
            <p style={{ margin: '0 0 20px 0', color: '#6B7281', fontSize: '0.9rem' }}>{successModal.message}</p>
            <button
              onClick={() => setSuccessModal({ ...successModal, show: false })}
              style={{ padding: '10px 24px', borderRadius: '10px', background: '#FFFFFF', color: '#1F1F1F', fontWeight: '700', border: 'none', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ELITE SKELETON CSS UTILITIES
const skeletonLineStyle = (width) => ({
  width: width,
  height: '12px',
  background: '#1F1F1F',
  borderRadius: '6px'
});
