import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, Plus, Search, Filter, HardDrive, 
  Trash2, Edit3, MapPin, Users, Loader2, AlertCircle
} from 'lucide-react';

export default function ResourcesPage() {
  const { authFetch } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const res = await authFetch('http://localhost:8081/api/resources');
      if (!res.ok) throw new Error('Failed to load facilities inventory');
      const data = await res.json();
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteResource = async (id) => {
    if (!window.confirm('CRITICAL: Are you sure you want to permanently delete this facility?')) return;
    try {
      const res = await authFetch(`http://localhost:8081/api/resources/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setResources(prev => prev.filter(r => r.id !== id));
      } else {
        alert('Server refused deletion. Check permissions.');
      }
    } catch (err) {
      alert('Network error during deletion');
    }
  };

  const getStatusStyle = (status) => {
    const s = String(status || '').toUpperCase();
    switch (s) {
      case 'ACTIVE':         return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', label: 'Online' };
      case 'MAINTENANCE':    return { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308', label: 'Service' };
      case 'OUT_OF_SERVICE': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Failure' };
      default:               return { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748b', label: s || 'Unknown' };
    }
  };

  const filteredResources = (Array.isArray(resources) ? resources : []).filter(r => 
    (r.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.building || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', color: '#94a3b8' }}>
      <Loader2 className="animate-spin" size={48} style={{ marginBottom: '16px', color: '#6366f1' }} />
      <p style={{ fontSize: '1.2rem', letterSpacing: '1px' }}>SYNCHRONIZING INVENTORY...</p>
    </div>
  );

  return (
    <div style={{ padding: '60px 40px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#fff', margin: 0, letterSpacing: '-1px' }}>
            Facilities <span style={{ color: '#818cf8' }}>Management</span>
          </h1>
          <p style={{ color: '#64748b', marginTop: '8px' }}>Administrative control over campus assets and real-estate.</p>
        </div>
        <Link to="/admin/resources/new" style={{ 
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          color: '#fff', textDecoration: 'none', padding: '14px 28px', borderRadius: '14px',
          fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px',
          boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)'
        }}>
          <Plus size={20} /> Register New Facility
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '20px', borderRadius: '16px', color: '#f87171', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <AlertCircle size={20} /> <strong>Error:</strong> {error}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
          <input 
            placeholder="Search by name, location, or equipment..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none' }}
          />
        </div>
        <button style={{ padding: '0 24px', borderRadius: '14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer' }}>
          <Filter size={20} />
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <th style={{ padding: '20px 24px', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Facility Details</th>
              <th style={{ padding: '20px 24px', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Location</th>
              <th style={{ padding: '20px 24px', textAlign: 'center', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</th>
              <th style={{ padding: '20px 24px', textAlign: 'right', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredResources.map(r => {
              const status = getStatusStyle(r.status);
              return (
                <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
                        <Building2 size={24} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#f8fafc', fontSize: '1rem' }}>{r.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{String(r.type || 'FACILITY')}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                      <MapPin size={14} color="#64748b" /> {r.building}, Floor {r.floor}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#475569', marginLeft: '22px' }}>Room {r.roomNumber}</div>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'center' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', background: status.bg, color: status.color, border: `1px solid ${status.color}30` }}>
                      {status.label}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                      <Link to={`/admin/resources/edit/${r.id}`} style={{ color: '#64748b', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#fff'} onMouseOut={e => e.currentTarget.style.color = '#64748b'}>
                        <Edit3 size={18} />
                      </Link>
                      <button onClick={() => deleteResource(r.id)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#ef4444'} onMouseOut={e => e.currentTarget.style.color = '#64748b'}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredResources.length === 0 && !loading && (
          <div style={{ padding: '80px', textAlign: 'center', color: '#475569' }}>
            <HardDrive size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
            <p>No facilities found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
