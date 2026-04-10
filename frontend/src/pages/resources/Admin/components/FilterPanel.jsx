import React, { useState, useEffect } from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import api from '../../../../api/axiosInstance';

const RESOURCE_TYPES = ['LAB', 'LECTURE_HALL', 'MEETING_ROOM', 'AUDITORIUM', 'SPORTS_FACILITY', 'EQUIPMENT'];
const STATUSES = ['ACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE'];

export default function FilterPanel({ filters, setFilters, clearFilters }) {
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);

  useEffect(() => {
    fetchBuildings();
  }, []);

  useEffect(() => {
    if (filters.building) {
      fetchFloors(filters.building);
    } else {
      setFloors([]);
    }
  }, [filters.building]);

  const fetchBuildings = async () => {
    try {
      const res = await api.get('/resources/buildings');
      setBuildings(res.data || []);
    } catch (err) {
      console.error('Failed to fetch buildings', err);
    }
  };

  const fetchFloors = async (building) => {
    try {
      const res = await api.get(`/resources/floors?building=${encodeURIComponent(building)}`);
      setFloors(res.data || []);
    } catch (err) {
      console.error('Failed to fetch floors', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
      <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input 
          name="name"
          placeholder="Search by name..."
          value={filters.name || ''}
          onChange={handleChange}
          style={{ width: '100%', padding: '14px 14px 14px 48px', borderRadius: '14px', background: '#fff', border: '1px solid #e2e8f0', color: '#0f172a', outline: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
        />
      </div>

      <select 
        name="building"
        value={filters.building || ''}
        onChange={handleChange}
        style={{ padding: '0 24px', borderRadius: '14px', background: '#fff', border: '1px solid #e2e8f0', color: '#475569', cursor: 'pointer', minWidth: '150px', outline: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
      >
        <option value="">Any Building</option>
        {buildings.map(b => <option key={b} value={b}>{b}</option>)}
      </select>

      <select 
        name="floor"
        value={filters.floor || ''}
        onChange={handleChange}
        disabled={!filters.building}
        style={{ padding: '0 24px', borderRadius: '14px', background: !filters.building ? '#f1f5f9' : '#fff', border: '1px solid #e2e8f0', color: '#475569', cursor: 'pointer', minWidth: '150px', outline: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
      >
        <option value="">Any Floor</option>
        {floors.map(f => <option key={f} value={f}>Floor {f}</option>)}
      </select>

      <select 
        name="type"
        value={filters.type || ''}
        onChange={handleChange}
        style={{ padding: '0 24px', borderRadius: '14px', background: '#fff', border: '1px solid #e2e8f0', color: '#475569', cursor: 'pointer', minWidth: '150px', outline: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
      >
        <option value="">All Types</option>
        {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
      </select>

      <select 
        name="status"
        value={filters.status || ''}
        onChange={handleChange}
        style={{ padding: '0 24px', borderRadius: '14px', background: '#fff', border: '1px solid #e2e8f0', color: '#475569', cursor: 'pointer', minWidth: '150px', outline: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
      >
        <option value="">All Statuses</option>
        {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
      </select>

      <button 
        onClick={clearFilters}
        style={{ 
          display: 'flex', alignItems: 'center', gap: '8px', padding: '0 24px', 
          borderRadius: '14px', background: '#fff', border: '1px solid #e2e8f0', 
          color: '#6366f1', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem',
          transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}
        onMouseOver={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#fcfdff'; }}
        onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff'; }}
      >
        <RotateCcw size={16} /> Reset Filters
      </button>
    </div>
  );
}
