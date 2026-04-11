import { useState, useEffect } from 'react';
import api from '../../../api/axiosInstance';
import { Filter } from 'lucide-react';
import './Catalogue.css';

const RESOURCE_TYPES = [
  'TEACHING_VENUE', 'LECTURE_THEATRE', 'SEMINAR_ROOM', 'MEETING_ROOM', 'FUNCTION_SPACE', 'VIDEO_CONFERENCE_ROOM', 'LAB', 'AUDITORIUM', 'SPORTS_FACILITY'
];

const FEATURES = ['Projector', 'Microsoft Teams', 'Cisco Webex', 'Whiteboard', 'Sound System', 'Video Conferencing'];

const STATUSES = ['ACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE'];

export default function FilterPanel({ searchParams, updateParams, clearFilters }) {
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);

  // Fetch unique buildings on mount
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

  // Fetch floors when a building is selected
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
      if (searchParams.floor) {
        updateParams('floor', ''); // Clear floor if building is cleared
      }
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
      <div className="filter-header">
        <h3 style={{display:'flex', alignItems:'center', gap:'8px'}}>
            <Filter size={20} color="#3b82f6"/> 
            Filters
        </h3>
        <button className="clear-filters-btn" onClick={clearFilters}>
          Clear All
        </button>
      </div>

      <div className="filter-group">
        <label className="filter-label">Building</label>
        <select 
          className="filter-select" 
          name="building" 
          value={searchParams.building || ''} 
          onChange={handleChange}
        >
          <option value="">Any Building</option>
          {buildings.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Floor</label>
        <select 
          className="filter-select" 
          name="floor" 
          value={searchParams.floor || ''} 
          onChange={handleChange}
          disabled={!searchParams.building}
        >
          <option value="">Any Floor</option>
          {floors.map(f => <option key={f} value={f}>Floor {f}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Resource Type</label>
        <select 
          className="filter-select" 
          name="type" 
          value={searchParams.type || ''} 
          onChange={handleChange}
        >
          <option value="">All Types</option>
          {RESOURCE_TYPES.map(t => (
            <option key={t} value={t}>{t.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Minimum Capacity</label>
        <div style={{ position: 'relative' }}>
          <input 
            type="number" 
            className="filter-input" 
            name="capacity" 
            placeholder="e.g. 30" 
            min="1"
            value={searchParams.capacity || ''} 
            onChange={handleChange}
            style={{ paddingRight: '40px' }}
          />
          <span style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.875rem' }}>
            ppl
          </span>
        </div>
      </div>

      <div className="filter-group" style={{ marginTop: '24px' }}>
        <label className="filter-label" style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px' }}>
          Popular Features
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {FEATURES.map(feature => {
            const isChecked = (searchParams.features || '').includes(feature);
            return (
              <label key={feature} className="feature-checkbox" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem', color: '#64748b' }}>
                <input 
                  type="checkbox" 
                  checked={isChecked}
                  onChange={() => handleFeatureToggle(feature)}
                  style={{ width: '18px', height: '18px', accentColor: '#6366f1', cursor: 'pointer' }}
                />
                {feature}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
