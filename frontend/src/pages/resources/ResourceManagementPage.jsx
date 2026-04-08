import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import PageHeader from './Admin/components/PageHeader';
import FilterPanel from './Admin/components/FilterPanel';
import ResourceTable from './Admin/components/ResourceTable';
import api from '../../api/axiosInstance';

export default function ResourceManagementPage() {
  const { authFetch } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    name: '',
    building: '',
    floor: '',
    type: '',
    status: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResources();
    }, 300); // 300ms debounce for smoother typing
    return () => clearTimeout(timer);
  }, [filters]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) query.append(key, filters[key]);
      });

      const res = await api.get(`/resources?${query.toString()}`);
      setResources(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch (err) {
      console.error('Fetch error:', err);
      const msg = err.response?.data?.message || err.message || 'Unknown network error';
      setError(`Failed to synchronize facilities inventory: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await authFetch(`http://localhost:8082/api/resources/${id}/status?status=${newStatus}`, {
        method: 'PATCH'
      });
      if (res.ok) {
        fetchResources(); // Refresh list
      }
    } catch (err) {
      console.error('Status Update error:', err);
    }
  };

  const handleDeleteResource = async (id) => {
    try {
      const res = await authFetch(`http://localhost:8082/api/resources/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setResources(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error('Deletion error:', err);
    }
  };

  const clearFilters = () => {
    setFilters({ name: '', building: '', floor: '', type: '', status: '' });
  };

  if (loading && resources.length === 0) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', color: '#64748b' }}>
      <Loader2 className="animate-spin" size={48} style={{ marginBottom: '16px', color: '#6366f1' }} />
      <p style={{ fontSize: '1.2rem', letterSpacing: '1px' }}>SYNCHRONIZING SECURE INVENTORY...</p>
    </div>
  );

  return (
    <div style={{ padding: '60px 40px', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh', background: '#f8fafc' }}>
      <PageHeader />

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '20px', borderRadius: '16px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <AlertCircle size={20} /> <strong>Error:</strong> {error}
        </div>
      )}

      <FilterPanel
        filters={filters}
        setFilters={setFilters}
        clearFilters={clearFilters}
      />

      <ResourceTable
        resources={resources}
        onUpdateStatus={handleUpdateStatus}
        onDeleteResource={handleDeleteResource}
      />
    </div>
  );
}
