import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, Plus, Search, Filter, HardDrive, 
  Trash2, Edit3, MapPin, Users, Loader2, MoreVertical
} from 'lucide-react';

/**
 * Admin Resource Management Page
 * Displays a beautiful table of all campus facilities with CRUD actions.
 */
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
      if (!res.ok) throw new Error('Failed to load facilities');
      const data = await res.json();
      setResources(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteResource = async (id) => {
    if (!window.confirm('Are you sure you want to delete this facility? This cannot be undone.')) return;
    try {
      const res = await authFetch(`http://localhost:8081/api/resources/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setResources(resources.filter(r => r.id !== id));
      }
    } catch (err) {
      alert('Error deleting: ' + err.message);
    }
  };

  // Helper for status colors
  const getStatusStyle = (status) => {
    switch (status) {
      case 'ACTIVE':         return { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', label: 'Online' };
      case 'MAINTENANCE':    return { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308', label: 'Service' };
      case 'OUT_OF_SERVICE': return { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', label: 'Failure' };
      default:               return { bg: 'rgba(100, 116, 139, 0.1)', color: '#64748b', label: status };
    }
  };

  const filtered = resources.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.building.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#94a3b8' }}>
      <Loader2 className="animate-spin" size={48} style={{ marginBottom: '1rem', color: '#6366f1' }} />
      <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Accessing Assets Catalogue...</p>
    </div>
  );

  return (
    <div style={{ padding: '60px 40px', maxWidth: '1400px', margin: '0 auto', color: '#f8fafc' }}>
      
      {/* Header Section */}
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px' }}>
            Facilities <span className="gradient-text">Catalogue</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem' }}>Manage campus real estate, equipment, and utility states.</p>
        </div>
        
        <Link to="/admin/resources/new" className="primary-btn-glow" style={{ textDecoration: 'none' }}>
          <Plus size={18} /> Register Facility
        </Link>
      </header>

      {/* Controls Bar */}
      <div style={{ 
        display: 'flex', gap: '16px', marginBottom: '2rem', background: 'rgba(255,255,255,0.03)', 
        padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input 
            type="text" 
            placeholder="Search by name, building, or type..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              width: '100%', padding: '12px 12px 12px 42px', borderRadius: '12px', border: 'none',
              background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.95rem', outline: 'none'
            }}
          />
        </div>
        <button className="glass-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px', borderRadius: '12px', color: '#94a3b8' }}>
          <Filter size={18} /> Filters
        </button>
      </div>

      {error ? (
        <div style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '16px', textAlign: 'center' }}>
          {error}
        </div>
      ) : (
        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
            <thead>
              <tr style={{ color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                <th style={{ textAlign: 'left', padding: '0 20px' }}>Facility</th>
                <th style={{ textAlign: 'left', padding: '0 20px' }}>Location</th>
                <th style={{ textAlign: 'center', padding: '0 20px' }}>Capacity</th>
                <th style={{ textAlign: 'center', padding: '0 20px' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '0 20px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const status = getStatusStyle(r.status);
                return (
                  <tr key={r.id} className="table-row">
                    <td style={{ padding: '20px', borderRadius: '16px 0 0 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ 
                          width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', flexShrink: 0
                        }}>
                          <Building2 size={24} />
                        </div>
                        <div>
                          <p style={{ fontWeight: '700', fontSize: '1.05rem', margin: 0 }}>{r.name}</p>
                          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0' }}>{r.type}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>
                        <MapPin size={15} />
                        <span>{r.building}, Floor {r.floor}</span>
                      </div>
                      <p style={{ color: '#64748b', fontSize: '0.75rem', margin: '4px 0 0', marginLeft: '23px' }}>Room {r.roomNumber}</p>
                    </td>

                    <td style={{ padding: '20px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>
                        <Users size={15} style={{ color: '#64748b' }} /> {r.capacity}
                      </div>
                    </td>

                    <td style={{ padding: '20px', textAlign: 'center' }}>
                      <span style={{ 
                        display: 'inline-flex', alignItems: 'center', padding: '6px 14px', borderRadius: '8px',
                        fontSize: '0.75rem', fontWeight: '700', background: status.bg, color: status.color
                      }}>
                        {status.label}
                      </span>
                    </td>

                    <td style={{ padding: '20px', textAlign: 'right', borderRadius: '0 16px 16px 0' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <Link to={`/admin/resources/edit/${r.id}`} className="row-action-btn" title="Edit">
                          <Edit3 size={18} />
                        </Link>
                        <button onClick={() => deleteResource(r.id)} className="row-action-btn delete" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
              <HardDrive size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>No facilities match your current search criteria.</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        .gradient-text {
          background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .primary-btn-glow {
          background: #6366f1;
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
          transition: all 0.3s;
        }
        .primary-btn-glow:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
        }
        .glass-btn {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          cursor: pointer;
          transition: 0.3s;
        }
        .table-row {
          background: rgba(30, 41, 59, 0.4);
          transition: transform 0.2s, background 0.2s;
        }
        .table-row:hover {
          background: rgba(30, 41, 59, 0.7);
          transform: scale(1.002);
        }
        .row-action-btn {
          width: 38px; height: 38px; border-radius: 10px; border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s; background: rgba(255,255,255,0.03);
          color: #94a3b8; text-decoration: none;
        }
        .row-action-btn:hover {
          color: #818cf8; background: rgba(99, 102, 241, 0.1);
        }
        .row-action-btn.delete:hover {
          color: #ef4444; background: rgba(239, 68, 68, 0.1);
        }
      `}</style>
    </div>
  );
}
