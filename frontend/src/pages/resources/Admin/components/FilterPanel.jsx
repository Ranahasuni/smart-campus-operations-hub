import React, { useState, useEffect } from 'react';
import { Search, Filter, RotateCcw, Building2, Map, Users, Layout, Activity } from 'lucide-react';
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

  const optionStyle = {
    background: '#f8fafc',
    color: '#334155',
    padding: '12px'
  };

  return (
    <div style={{
      background: '#fff',
      padding: '24px',
      borderRadius: '24px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
      border: '1px solid #f1f5f9',
      marginBottom: '32px'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 0.8fr 1fr 0.8fr 0.5fr', gap: '12px', alignItems: 'center' }}>

        {/* 1. Name Search - Indigo */}
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6366f1' }} />
          <input
            name="name"
            placeholder="Search by name..."
            value={filters.name || ''}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        {/* 2. Building - Teal */}
        <div style={{ position: 'relative' }}>
          <Building2 size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#0d9488' }} />
          <select name="building" value={filters.building || ''} onChange={handleChange} style={{ ...selectStyle, paddingLeft: '44px' }}>
            <option value="" style={optionStyle}>Any Building</option>
            {buildings.map(b => <option key={b} value={b} style={optionStyle}>{b}</option>)}
          </select>
        </div>

        {/* 3. Floor - Teal */}
        <div style={{ position: 'relative' }}>
          <Map size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#0d9488' }} />
          <select name="floor" value={filters.floor || ''} onChange={handleChange} disabled={!filters.building} style={{ ...selectStyle, paddingLeft: '44px', background: !filters.building ? '#f8fafc' : '#fff' }}>
            <option value="" style={optionStyle}>Any Floor</option>
            {floors.map(f => <option key={f} value={f} style={optionStyle}>Floor {f}</option>)}
          </select>
        </div>

        {/* 4. Type - Violet */}
        <div style={{ position: 'relative' }}>
          <Layout size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#8b5cf6' }} />
          <select name="type" value={filters.type || ''} onChange={handleChange} style={{ ...selectStyle, paddingLeft: '44px' }}>
            <option value="" style={optionStyle}>All Types</option>
            {RESOURCE_TYPES.map(t => <option key={t} value={t} style={optionStyle}>{t.replace('_', ' ')}</option>)}
          </select>
        </div>

        {/* 5. Status - Slate */}
        <div style={{ position: 'relative' }}>
          <Activity size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <select name="status" value={filters.status || ''} onChange={handleChange} style={{ ...selectStyle, paddingLeft: '44px' }}>
            <option value="" style={optionStyle}>All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s} style={optionStyle}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>

        {/* 6. Capacity - Amber */}
        <div style={{ position: 'relative' }}>
          <Users size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#f59e0b' }} />
          <input
            type="number"
            name="capacity"
            placeholder="Min. Cap"
            value={filters.capacity || ''}
            onChange={handleChange}
            style={{ ...inputStyle, paddingLeft: '36px', fontSize: '0.85rem' }}
          />
        </div>

        {/* 7. Reset */}
        <button
          onClick={clearFilters}
          title="Reset Filters"
          style={{
            height: '48px', width: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0',
            color: '#64748b', cursor: 'pointer', transition: 'all 0.2s'
          }}
          onMouseOver={e => { e.currentTarget.style.color = '#6366f1'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#6366f1'; }}
          onMouseOut={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  height: '48px',
  padding: '12px 12px 12px 44px',
  borderRadius: '12px',
  background: '#fff',
  border: '1px solid #e2e8f0',
  color: '#0f172a',
  fontWeight: '600',
  outline: 'none',
  fontSize: '0.9rem',
  transition: 'border-color 0.2s',
};

const selectStyle = {
  width: '100%',
  height: '48px',
  borderRadius: '12px',
  background: '#fff',
  border: '1px solid #e2e8f0',
  color: '#475569',
  cursor: 'pointer',
  outline: 'none',
  fontWeight: '600',
  fontSize: '0.85rem',
  appearance: 'none',
};

