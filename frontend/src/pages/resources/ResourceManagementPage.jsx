import React, { useState, useEffect } from 'react';

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

import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import FilterPanel from './Admin/components/FilterPanel';
import ResourceTable from './Admin/components/ResourceTable';

export default function ResourceManagementPage() {
  const navigate = useNavigate();
  const [allResources, setAllResources] = useState(() => {
    const cached = sessionStorage.getItem('admin_registry_cache');
    return cached ? JSON.parse(cached) : [];
  });
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(() => !sessionStorage.getItem('admin_registry_cache'));
  const [filters, setFilters] = useState({
    name: '',
    building: '',
    floor: '',
    type: '',
    status: '',
    capacity: ''
  });

  const fetchAllResources = async () => {
    try {
      const res = await api.get('/resources');
      setAllResources(res.data || []);
      sessionStorage.setItem('admin_registry_cache', JSON.stringify(res.data || []));
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllResources();
  }, []);

  useEffect(() => {
    if (allResources.length >= 0) {
      let filtered = [...allResources];
      if (filters.name) {
        const q = filters.name.toLowerCase().trim();
        filtered = filtered.filter(r => (r.name || '').toLowerCase().startsWith(q));
      }
      if (filters.building) filtered = filtered.filter(r => r.building === filters.building);
      if (filters.floor) filtered = filtered.filter(r => String(r.floor) === String(filters.floor));
      if (filters.type) filtered = filtered.filter(r => r.type === filters.type);
      if (filters.status) filtered = filtered.filter(r => r.status === filters.status);
      if (filters.capacity) {
        const minCap = parseInt(filters.capacity);
        filtered = filtered.filter(r => (r.capacity || 0) >= minCap);
      }
      setFilteredResources(filtered);
    }
  }, [filters, allResources]);

  const handleUpdateStatus = async (id, nextStatus) => {
    try {
      await api.patch(`/resources/${id}/status?status=${nextStatus}`);
      setAllResources(prev => prev.map(r => r.id === id ? { ...r, status: nextStatus } : r));
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const handleDeleteResource = async (id) => {
    try {
      await api.delete(`/resources/${id}`);
      const updated = allResources.filter(r => r.id !== id);
      setAllResources(updated);
      sessionStorage.setItem('admin_registry_cache', JSON.stringify(updated));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const clearFilters = () => {
    setFilters({ name: '', building: '', floor: '', type: '', status: '', capacity: '' });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFFFFF', // ELITE MIDNIGHT BACKGROUND
      color: '#1F1F1F',
      padding: '40px'
    }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>

        {/* ELITE DARK HEADER */}
        <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '900', color: '#1F1F1F', margin: '0 0 8px 0', letterSpacing: '-1.5px' }}>
              Resource <span style={{ color: '#C08080' }}>Management</span>
            </h1>
            <p style={{ color: '#6B7281', fontSize: '1.2rem', margin: 0, fontWeight: '500' }}>
              Centralized Operational Control for Campus Facilities.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '400px' }}>
              <Search size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#6B7281' }} />
              <input
                placeholder="Search by name..."
                value={filters.name || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  width: '100%', height: '56px', padding: '12px 12px 12px 56px',
                  borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(192, 128, 128, 0.06)',
                  color: '#1F1F1F', fontSize: '1rem', fontWeight: '600', outline: 'none', transition: 'all 0.2s',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}
              />
            </div>

            <button
              onClick={() => navigate('/admin/resources/new')}
              style={{
                background: 'linear-gradient(135deg, #C08080 0%, #A86A6A 100%)',
                color: '#1F1F1F', padding: '0 36px', borderRadius: '18px', border: 'none',
                height: '56px', fontSize: '1rem', fontWeight: '800', cursor: 'pointer',
                boxShadow: '0 10px 30px -5px rgba(192, 128, 128, 0.4)',
                transition: 'all 0.3s', whiteSpace: 'nowrap'
              }}
            >
              + Add New Resource
            </button>
          </div>
        </div>

        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          clearFilters={clearFilters}
        />

        <ResourceTable
          resources={filteredResources}
          loading={loading}
          onUpdateStatus={handleUpdateStatus}
          onDeleteResource={handleDeleteResource}
          clearFilters={clearFilters}
        />
      </div>
    </div>
  );
}
