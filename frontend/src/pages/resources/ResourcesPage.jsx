import { useState, useEffect, useRef } from 'react';

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

import api from '../../api/axiosInstance';
import SearchBar from './Catalogue/SearchBar';
import FilterPanel from './Catalogue/FilterPanel';
import ResourceCard from './Catalogue/ResourceCard';
import './Catalogue/Catalogue.css';

// ADVANCED CACHE: Stores resources outside the component so they stay in memory during the session
let sessionCache = null;

export default function ResourcesPage() {
  const [allResources, setAllResources] = useState(sessionCache || []); // Initialize from cache
  const [resources, setResources] = useState(sessionCache || []);      // Initialize from cache
  const [loading, setLoading] = useState(!sessionCache);               // Only show spinner if cache is empty
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
    // If we have cached data, don't show the big spinner (Faster feel)
    if (!sessionCache) setLoading(true);

    try {
      const query = new URLSearchParams();
      // Only send category filters to server
      ['building', 'floor', 'type', 'status', 'capacity'].forEach(key => {
        if (searchParams[key]) query.append(key, searchParams[key]);
      });

      const res = await api.get(`/resources?${query.toString()}`);
      const rawData = res.data || [];

      // Filter out removed categories globally
      const data = rawData.filter(r => r.type !== 'TEACHING_VENUE' && r.type !== 'SEMINAR_ROOM');

      sessionCache = data;
      setAllResources(data);
      applyInstantFilters(data, searchParams);
    } catch (err) {
      console.error('Fetch Error:', err);
    } finally {
      setLoading(false); // Stop spinner NO MATTER WHAT
    }
  };

  // MASTER FILTER LOGIC (100% Strict & Instant)
  const applyInstantFilters = (sourceData, params) => {
    if (!sourceData) return;
    let filtered = [...sourceData];

    // 1. Name Filter (Strict Start of Name)
    if (params.name) {
      const q = params.name.toLowerCase().trim();
      filtered = filtered.filter(r => r.name.toLowerCase().startsWith(q));
    }

    // 2. Building Filter (Strict Match)
    if (params.building && params.building !== '') {
      filtered = filtered.filter(r => r.building === params.building);
    }

    // 3. Floor Filter (Strict Match)
    if (params.floor !== undefined && params.floor !== '') {
      filtered = filtered.filter(r => r.floor.toString() === params.floor.toString());
    }

    // 4. Type / Category Filter (STRICT MATCH)
    if (params.type && params.type !== '') {
      filtered = filtered.filter(r => r.type === params.type);
    }

    // 5. Capacity Filter (Minimum Seats)
    if (params.capacity && params.capacity !== '') {
      const minSeats = parseInt(params.capacity);
      filtered = filtered.filter(r => (r.capacity || 0) >= minSeats);
    }

    // 6. Features (Multiple Amenities)
    if (params.features) {
      const req = params.features.split(',');
      filtered = filtered.filter(r => req.every(f => (r.equipment || []).includes(f)));
    }

    setResources(filtered);
  };

  // Effect for ALL changes (Instant)
  useEffect(() => {
    if (!loading) {
      applyInstantFilters(allResources, searchParams);
    }
  }, [searchParams, allResources, loading]);

  // MANDATORY: Start fetching when the page opens
  useEffect(() => {
    fetchResources();
  }, []); // Fires once on mount


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
      <div className="catalogue-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: '40px',
        marginBottom: '40px' 
      }}>
        <div style={{ flex: '1', minWidth: '0' }}>
          <h1 className="catalogue-title">Facility <span className="text-indigo">Catalogue</span></h1>
          <p className="catalogue-subtitle" style={{ whiteSpace: 'nowrap' }}>
            Intelligently navigate and provision high-tier campus research assets and specialized learning environments.
          </p>
        </div>
        <div style={{ width: '350px', flexShrink: 0 }}>
          <SearchBar searchParams={searchParams} updateParams={updateParams} />
        </div>
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
            <>
              {/* RESULTS COUNTER */}
              <div className="results-header-metadata">
                <span className="results-found-tag">
                  {resources.length === 0 ? 'No Facilities' : `${resources.length} ${resources.length === 1 ? 'Facility' : 'Facilities'}`} Discovered
                </span>
                {searchParams.name && (
                  <span className="search-term-tag">Searching for "{searchParams.name}"</span>
                )}
              </div>

              <div className="resource-grid">
                {resources.length > 0 ? (
                  resources.map(resource => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))
                ) : (
                  <div className="no-results-advanced">
                    <div className="no-results-icon">
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    </div>
                    <h3 className="no-results-title">No Facilities Found</h3>
                    <p className="no-results-text">
                      No campus assets matching your criteria were found.
                      Please adjust your filters or reset your search to continue.
                    </p>
                    <button className="reset-shortcut-btn" onClick={clearFilters}>Reset All Search Filters</button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
