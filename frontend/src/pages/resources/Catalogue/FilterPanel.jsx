import { useState, useEffect } from 'react';
import api from '../../../api/axiosInstance';
import { Building2, Map, Layout, Users, RotateCcw } from 'lucide-react';
import './Catalogue.css';

const RESOURCE_TYPES = [
  'LAB', 'LECTURE_HALL', 'MEETING_ROOM', 'AUDITORIUM', 'SPORTS_FACILITY', 'EQUIPMENT'
];

export default function FilterPanel({ searchParams, updateParams, clearFilters }) {
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
    <div className="filter-sidebar">
      <div className="filter-header-pro">
        <h3 className="filter-title-pro">FACILITY EXPLORER</h3>
        <button className="reset-all-btn" onClick={clearFilters} title="Reset All">
          <RotateCcw size={16} />
        </button>
      </div>

      <div className="filter-content-pro">
        {/* Building Filter */}
        <div className="filter-item-pro">
          <label className="filter-label-pro">Building Location</label>
          <div className="input-wrapper-pro">
            <Building2 className="input-icon-pro" size={16} color="#6366f1" />
            <select
              className="filter-select-pro"
              name="building"
              value={searchParams.building || ''}
              onChange={handleChange}
            >
              <option value="">Any Building</option>
              {buildings.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        {/* Floor Filter */}
        <div className="filter-item-pro">
          <label className="filter-label-pro">Target Floor</label>
          <div className="input-wrapper-pro">
            <Map className="input-icon-pro" size={16} color="#0d9488" />
            <select
              className="filter-select-pro"
              name="floor"
              value={searchParams.floor || ''}
              onChange={handleChange}
              disabled={!searchParams.building}
            >
              <option value="">Any Floor</option>
              {floors.map(f => <option key={f} value={f}>Floor {f}</option>)}
            </select>
          </div>
        </div>

        {/* Resource Type Filter */}
        <div className="filter-item-pro">
          <label className="filter-label-pro">Facility Category</label>
          <div className="input-wrapper-pro">
            <Layout className="input-icon-pro" size={16} color="#8b5cf6" />
            <select
              className="filter-select-pro"
              name="type"
              value={searchParams.type || ''}
              onChange={handleChange}
            >
              <option value="">All Types</option>
              {RESOURCE_TYPES.map(t => (
                <option key={t} value={t}>
                  {t.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Capacity Filter (Upgraded to Dropdown) */}
        <div className="filter-item-pro">
          <label className="filter-label-pro">Minimum Occupancy</label>
          <div className="input-wrapper-pro">
            <Users className="input-icon-pro" size={16} color="#f59e0b" />
            <select
              className="filter-select-pro"
              name="capacity"
              value={searchParams.capacity || ''}
              onChange={handleChange}
            >
              <option value="">Any Capacity</option>
              <option value="10">10+ Seats</option>
              <option value="50">50+ Seats</option>
              <option value="100">100+ Seats</option>
              <option value="200">200+ Seats</option>
            </select>
          </div>
        </div>

        {/* Features Split Section */}
        <div className="features-divider-pro">
          <span>Popular Amenities</span>
        </div>

        <div className="features-list-pro">
          {['Projector', 'Whiteboard', 'Core i7 PCs', 'Central AC'].map(feature => {
            const isChecked = (searchParams.features || '').includes(feature);
            return (
              <label key={feature} className="feature-checkbox-item">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleFeatureToggle(feature)}
                  className="filter-checkbox"
                />
                <span className="checkbox-label">{feature}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
