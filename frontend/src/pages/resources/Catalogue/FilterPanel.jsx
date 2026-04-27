import React, { useState, useEffect } from 'react';
import api from '../../../api/axiosInstance';
import { Building2, Map, Layout, Users, RotateCcw, ChevronDown } from 'lucide-react';
import './Catalogue.css';

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

import { useAuth } from '../../../context/AuthContext';

const RESOURCE_TYPES_CONFIG = [
  { id: 'LAB', name: 'LABS & SPECIALIST FACILITIES', roles: ['ADMIN', 'LECTURER', 'STUDENT'] },
  { id: 'MEETING_ROOM', name: 'MEETING ROOMS', roles: ['ADMIN', 'STUDENT', 'LECTURER'] },
  { id: 'VIDEO_CONFERENCE_ROOM', name: 'VIDEO CONFERENCE ROOMS', roles: ['ADMIN', 'LECTURER', 'STUDENT'] },
  { id: 'AUDITORIUM', name: 'AUDITORIUMS', roles: ['ADMIN', 'LECTURER', 'STUDENT'] },
  { id: 'SPORTS_FACILITY', name: 'SPORTS FACILITIES', roles: ['ADMIN', 'STUDENT'] },
  { id: 'LECTURE_HALL', name: 'LECTURE HALLS', roles: ['ADMIN', 'LECTURER'] },
  { id: 'LECTURE_THEATRE', name: 'LECTURE THEATRES', roles: ['ADMIN', 'LECTURER'] },
];

const FEATURES = ['Projector', 'Whiteboard', 'Core i7 PCs', 'Central AC'];

export default function FilterPanel({ searchParams, updateParams, clearFilters }) {
  const { user } = useAuth();
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const res = await api.get('/resources/buildings');
        setBuildings(res.data || []);
      } catch (err) {
        console.error("Failed to fetch buildings", err);
      }
    };
    fetchBuildings();
  }, []);

  useEffect(() => {
    if (searchParams.building) {
      const fetchFloors = async () => {
        try {
          const res = await api.get(`/resources/floors?building=${encodeURIComponent(searchParams.building)}`);
          setFloors(res.data || []);
        } catch (err) {
          console.error("Failed to fetch floors", err);
        }
      };
      fetchFloors();
    } else {
      setFloors([]);
    }
  }, [searchParams.building]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateParams(name, value);
  };

  const handleFeatureToggle = (feature) => {
    const currentFeatures = searchParams.features ? searchParams.features.split(',') : [];
    let newFeatures;
    if (currentFeatures.includes(feature)) {
      newFeatures = currentFeatures.filter(f => f !== feature);
    } else {
      newFeatures = [...currentFeatures, feature];
    }
    updateParams('features', newFeatures.join(','));
  };

  return (
    <div className="filter-panel">
      <div className="filter-header-pro">
        <h3 className="filter-title-pro">Facility Explorer</h3>
        <button className="reset-all-btn" onClick={clearFilters} title="Reset All">
          <RotateCcw size={16} />
        </button>
      </div>

      <div className="filter-content-pro">
        {/* Building Filter */}
        <div className="filter-group">
          <label className="filter-label">Building Location</label>
          <div className="input-wrapper-pro">
            <Building2 className="input-icon-pro" size={16} color="var(--accent-primary)" />
            <select
              className="filter-select-pro"
              name="building"
              value={searchParams.building || ''}
              onChange={handleChange}
            >
              <option value="">All Buildings</option>
              {buildings.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <ChevronDown className="dropdown-icon-right" size={14} color="#94a3b8" />
          </div>
        </div>

        {/* Floor Filter */}
        <div className="filter-group">
          <label className="filter-label">Target Floor</label>
          <div className="input-wrapper-pro">
            <Map className="input-icon-pro" size={16} color="var(--accent-secondary)" />
            <select
              className="filter-select-pro"
              name="floor"
              value={searchParams.floor || ''}
              onChange={handleChange}
              disabled={!searchParams.building}
            >
              <option value="">All Floors</option>
              {floors.map(f => <option key={f} value={f}>Floor {f}</option>)}
            </select>
            <ChevronDown className="dropdown-icon-right" size={14} color="#94a3b8" />
          </div>
        </div>

        {/* Resource Type Filter */}
        <div className="filter-group">
          <label className="filter-label">Facility Category</label>
          <div className="input-wrapper-pro">
            <Layout className="input-icon-pro" size={16} color="var(--accent-primary)" />
            <select
              className="filter-select-pro"
              name="type"
              value={searchParams.type || ''}
              onChange={handleChange}
            >
              <option value="">All Categories</option>
              {RESOURCE_TYPES_CONFIG
                .filter(cat => cat.roles.includes(user?.role))
                .map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>
            <ChevronDown className="dropdown-icon-right" size={14} color="#94a3b8" />
          </div>
        </div>

        {/* Capacity Filter */}
        <div className="filter-group">
          <label className="filter-label">Minimum Occupancy</label>
          <div className="input-wrapper-pro">
            <Users className="input-icon-pro" size={16} color="var(--accent-secondary)" />
            <select
              className="filter-select-pro"
              name="capacity"
              value={searchParams.capacity || ''}
              onChange={handleChange}
            >
              <option value="">Any Capacity</option>
              <option value="2">2+ Seats</option>
              <option value="10">10+ Seats</option>
              <option value="50">50+ Seats</option>
              <option value="100">100+ Seats</option>
              <option value="500">500+ Seats</option>
            </select>
            <ChevronDown className="dropdown-icon-right" size={14} color="#94a3b8" />
          </div>
        </div>

        {/* Popular Amenities Filter */}
        <div className="filter-group" style={{ display: 'block', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--glass-border)' }}>
          <label className="filter-label" style={{ display: 'block', marginBottom: '16px', width: '100%' }}>
            Popular Amenities
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {FEATURES.map(feature => {
              const isChecked = (searchParams.features || '').includes(feature);
              return (
                <label key={feature} className="feature-checkbox-item" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleFeatureToggle(feature)}
                    className="filter-checkbox"
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                  />
                  <span className="checkbox-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{feature}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
