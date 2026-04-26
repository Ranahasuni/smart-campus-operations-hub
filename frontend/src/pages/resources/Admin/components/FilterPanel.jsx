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

import { RotateCcw, Building2, Map, Users, Layout, Activity, ChevronDown } from 'lucide-react';
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
    <div style={{
      background: 'rgba(192, 128, 128, 0.06)',
      padding: '16px',
      borderRadius: '24px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      marginBottom: '32px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
    }}>
      {/* ELITE FILTER TOOLBAR - MIDNIGHT EDITION */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        
        {/* 1. Building */}
        <div style={{ ...filterBoxStyle, flex: '1.4' }}>
          <Building2 size={16} style={iconStyle('#C08080')} />
          <select name="building" value={filters.building || ''} onChange={handleChange} style={selectStyle}>
            <option value="" style={{ background: '#FFFFFF' }}>All Buildings</option>
            {buildings.map(b => <option key={b} value={b} style={{ background: '#FFFFFF' }}>{b}</option>)}
          </select>
          <ChevronDown size={14} style={chevronStyle} />
        </div>

        {/* 2. Floor */}
        <div style={{ ...filterBoxStyle, flex: '0.9' }}>
          <Map size={16} style={iconStyle('#0ea5e9')} />
          <select name="floor" value={filters.floor || ''} onChange={handleChange} disabled={!filters.building} style={{ ...selectStyle, opacity: !filters.building ? 0.3 : 1 }}>
            <option value="" style={{ background: '#FFFFFF' }}>All Floors</option>
            {floors.map(f => <option key={f} value={f} style={{ background: '#FFFFFF' }}>Floor {f}</option>)}
          </select>
          <ChevronDown size={14} style={chevronStyle} />
        </div>

        {/* 3. Category */}
        <div style={{ ...filterBoxStyle, flex: '1.2' }}>
          <Layout size={16} style={iconStyle('#A86A6A')} />
          <select name="type" value={filters.type || ''} onChange={handleChange} style={selectStyle}>
            <option value="" style={{ background: '#FFFFFF' }}>All Categories</option>
            {RESOURCE_TYPES.map(t => (
              <option key={t} value={t} style={{ background: '#FFFFFF' }}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <ChevronDown size={14} style={chevronStyle} />
        </div>

        {/* 4. Status */}
        <div style={filterBoxStyle}>
          <Activity size={16} style={iconStyle('#94a3b8')} />
          <select name="status" value={filters.status || ''} onChange={handleChange} style={selectStyle}>
            <option value="" style={{ background: '#FFFFFF' }}>All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s} style={{ background: '#FFFFFF' }}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <ChevronDown size={14} style={chevronStyle} />
        </div>

        {/* 5. Capacity */}
        <div style={filterBoxStyle}>
          <Users size={16} style={iconStyle('#f59e0b')} />
          <select name="capacity" value={filters.capacity || ''} onChange={handleChange} style={selectStyle}>
            <option value="" style={{ background: '#FFFFFF' }}>Any Capacity</option>
            <option value="2" style={{ background: '#FFFFFF' }}>2+ Seats</option>
            <option value="10" style={{ background: '#FFFFFF' }}>10+ Seats</option>
            <option value="50" style={{ background: '#FFFFFF' }}>50+ Seats</option>
            <option value="100" style={{ background: '#FFFFFF' }}>100+ Seats</option>
            <option value="500" style={{ background: '#FFFFFF' }}>500+ Seats</option>
          </select>
          <ChevronDown size={14} style={chevronStyle} />
        </div>

        {/* 6. Professional Reset */}
        <button
          onClick={clearFilters}
          title="Reset Register Filters"
          style={resetBtnStyle}
          onMouseOver={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
          onMouseOut={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(192, 128, 128, 0.06)'; }}
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  );
}

const filterBoxStyle = {
  flex: '1',
  position: 'relative',
  minWidth: '0'
};

const selectStyle = {
  width: '100%',
  height: '52px',
  padding: '10px 24px 10px 48px',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  background: 'rgba(192, 128, 128, 0.06)',
  color: '#4B5563',
  cursor: 'pointer',
  outline: 'none',
  fontWeight: '600',
  fontSize: '0.92rem',
  appearance: 'none',
  transition: 'all 0.2s',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
};

const iconStyle = (color) => ({
  position: 'absolute',
  left: '18px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: color,
  zIndex: 2
});

const chevronStyle = {
  position: 'absolute',
  right: '14px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#6B7281',
  pointerEvents: 'none'
};

const resetBtnStyle = {
  height: '52px',
  width: '52px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '16px',
  background: 'rgba(192, 128, 128, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: '#6B7281',
  cursor: 'pointer',
  transition: 'all 0.2s',
  flexShrink: 0
};
