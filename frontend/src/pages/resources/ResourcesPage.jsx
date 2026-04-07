import { useState, useEffect } from 'react';
import api from '../../api/axiosInstance';
import SearchBar from './Catalogue/SearchBar';
import FilterPanel from './Catalogue/FilterPanel';
import ResourceCard from './Catalogue/ResourceCard';
import './Catalogue/Catalogue.css';

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchParams, setSearchParams] = useState({
    name: '',
    building: '',
    floor: '',
    type: '',
    status: '',
    capacity: ''
  });

  const fetchResources = async () => {
    setLoading(true);
    try {
      // Intelligently build the query string ignoring empty string states and frontend-only params
      const query = new URLSearchParams();
      Object.keys(searchParams).forEach(key => {
        if (key !== 'features' && searchParams[key]) {
          query.append(key, searchParams[key]);
        }
      });
      
      const res = await api.get(`/resources?${query.toString()}`);
      
      // Perform Frontend-side array filtering for 'features'
      let finalData = res.data || [];
      if (searchParams.features) {
        const requiredFeatures = searchParams.features.split(',');
        finalData = finalData.filter(resource => {
          if (!resource.equipment || resource.equipment.length === 0) return false;
          // Resource MUST contain EVERY selected feature to show up
          return requiredFeatures.every(rf => resource.equipment.includes(rf));
        });
      }
      
      setResources(finalData);
    } catch (err) {
      console.error('Failed to fetch resources', err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger API network calls automatically whenever the User updates searchParams.
  // Utilizing a slight 300ms debounce timer for optimal typing performance.
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchResources();
    }, 300);
    return () => clearTimeout(timer);
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
      capacity: ''
    });
  };

  return (
    <div className="catalogue-container">
      <div className="catalogue-header">
        <div>
          <h1 className="catalogue-title">Resource Catalogue</h1>
          <p className="catalogue-subtitle">Discover, evaluate, and dynamically provision premier campus facilities.</p>
        </div>
        <SearchBar searchParams={searchParams} updateParams={updateParams} />
      </div>

      <div className="catalogue-layout">
        <FilterPanel 
          searchParams={searchParams} 
          updateParams={updateParams} 
          clearFilters={clearFilters} 
        />
        
        {loading ? (
           <div className="catalogue-loading">Syncing secure resources with Operations Hub...</div>
        ) : (
          <div className="resource-grid">
            {resources.length > 0 ? (
              resources.map(resource => (
                <ResourceCard key={resource.id} resource={resource} />
              ))
            ) : (
              <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#64748b'}}>
                <h3>No resources found</h3>
                <p>No resources match your precise filters. Try adjusting your search or clearing the filters!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
