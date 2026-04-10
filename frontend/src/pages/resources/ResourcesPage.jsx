import { useState, useEffect, useRef } from 'react';
import api from '../../api/axiosInstance';
import SearchBar from './Catalogue/SearchBar';
import FilterPanel from './Catalogue/FilterPanel';
import ResourceCard from './Catalogue/ResourceCard';
import './Catalogue/Catalogue.css';

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef(null);
  const isInitialMount = useRef(true);

  const [searchParams, setSearchParams] = useState({
    name: '',
    building: '',
    floor: '',
    type: '',
    status: '',
    capacity: '',
    features: ''
  });

  const fetchResources = async () => {
    // Abort previous request if it's still running (Prevents lag/clashing)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    try {
      const query = new URLSearchParams();
      Object.keys(searchParams).forEach(key => {
        if (key !== 'features' && searchParams[key]) {
          query.append(key, searchParams[key]);
        }
      });

      const res = await api.get(`/resources?${query.toString()}`, {
        signal: abortControllerRef.current.signal
      });

      let finalData = res.data || [];
      if (searchParams.features) {
        const requiredFeatures = searchParams.features.split(',');
        finalData = finalData.filter(resource => {
          const resourceEquipment = resource.equipment || [];
          return requiredFeatures.every(rf => resourceEquipment.includes(rf));
        });
      }

      setResources(finalData);
    } catch (err) {
      if (err.name !== 'CanceledError') {
        console.error('Catalogue Sync Error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // Performance Optimized Effect
  useEffect(() => {
    if (isInitialMount.current) {
      fetchResources(); // Instant first load
      isInitialMount.current = false;
    } else {
      const timer = setTimeout(() => {
        fetchResources(); // Debounced subsequent filters
      }, 250); // Faster 250ms delay
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const updateParams = (key, value) => {
    setSearchParams(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchParams({
      name: '',
      building: '',
      floor: '',
      type: '',
      status: '',
      capacity: '',
      features: ''
    });
  };

  return (
    <div className="catalogue-container">
      <div className="catalogue-header">
        <div>
          <h1 className="catalogue-title">Facility Catalogue</h1>
          <p className="catalogue-subtitle">Intelligently browse and provision premier campus research & learning facilities.</p>
        </div>
        <SearchBar searchParams={searchParams} updateParams={updateParams} />
      </div>

      <div className="catalogue-layout">
        <FilterPanel
          searchParams={searchParams}
          updateParams={updateParams}
          clearFilters={clearFilters}
        />

        <div className="resource-grid-container">
          {loading ? (
            <div className="catalogue-loading">
              <div className="spinner"></div>
              <p>SYNCHRONIZING SECURE FACILITY INVENTORY...</p>
            </div>
          ) : (
            <div className="resource-grid">
              {resources.length > 0 ? (
                resources.map(resource => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))
              ) : (
                <div className="no-results">
                  <h3 className="no-results-title">No facilities matched your criteria</h3>
                  <p className="no-results-text">Try adjusting your refine parameters or resetting your search preferences.</p>
                  <button className="reset-shortcut-btn" onClick={clearFilters}>Reset All Search Criteria</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
