import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, MapPin, Users, Search, Filter, 
  ChevronLeft, Info, Calendar, Clock, Loader2,
  AlertCircle, LayoutGrid, CheckCircle2, XCircle, AlertTriangle
} from 'lucide-react';
import '../../styles/resource-list.css';

const CATEGORY_MAP = {
  TEACHING_VENUE: { name: 'Teaching Venues', icon: '📖', roles: ['ADMIN', 'LECTURER', 'STUDENT'] },
  LECTURE_THEATRE: { name: 'Lecture Theatres', icon: '🏛️', roles: ['ADMIN', 'LECTURER'] },
  LECTURE_HALL: { name: 'Lecture Halls', icon: '🏛️', roles: ['ADMIN', 'LECTURER'] },
  SEMINAR_ROOM: { name: 'Seminar Rooms', icon: '🗣️', roles: ['ADMIN', 'LECTURER', 'STUDENT'] },
  MEETING_ROOM: { name: 'Meeting Rooms', icon: '🤝', roles: ['ADMIN', 'STUDENT', 'LECTURER'] },
  FUNCTION_SPACE: { name: 'Function Spaces', icon: '🎉', roles: ['ADMIN', 'LECTURER'] },
  VIDEO_CONFERENCE_ROOM: { name: 'Video Conference Rooms', icon: '🎥', roles: ['ADMIN', 'LECTURER', 'STUDENT'] },
  LAB: { name: 'Labs & Specialist Facilities', icon: '🧪', roles: ['ADMIN', 'LECTURER', 'STUDENT'] },
  AUDITORIUM: { name: 'Auditoriums', icon: '🎭', roles: ['ADMIN', 'LECTURER'] },
  SPORTS_FACILITY: { name: 'Sports Facilities', icon: '🏀', roles: ['ADMIN', 'STUDENT'] },
};

export default function BookingResourceListPage() {
  const { type } = useParams();
  const { user, authFetch, API } = useAuth();
  const navigate = useNavigate();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [buildings, setBuildings] = useState([]);
  
  // Filters
  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('');
  const [floorFilter, setFloorFilter] = useState('');
  const [capacityFilter, setCapacityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const category = CATEGORY_MAP[type] || { name: type, icon: '📍', roles: [] };

  // Role check
  useEffect(() => {
    if (user && !category.roles.includes(user.role)) {
      navigate('/bookings');
    }
  }, [user, type, navigate, category.roles]);

  useEffect(() => {
    fetchBuildings();
    fetchResources();
  }, [type, buildingFilter, floorFilter, statusFilter, capacityFilter]);

  const fetchBuildings = async () => {
    try {
      const res = await authFetch(`${API}/api/resources/buildings`);
      if (res.ok) {
        const data = await res.json();
        setBuildings(data);
      }
    } catch (err) {
      console.error('Error fetching buildings:', err);
    }
  };

  const fetchResources = async () => {
    setLoading(true);
    try {
      let url = `${API}/api/resources?type=${type}`;
      if (buildingFilter) url += `&building=${buildingFilter}`;
      if (floorFilter) url += `&floor=${floorFilter}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (capacityFilter) url += `&capacity=${capacityFilter}`;

      const res = await authFetch(url);
      if (!res.ok) throw new Error('Failed to fetch resources');
      const data = await res.json();
      setResources(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = useMemo(() => {
    return resources.filter(r => 
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.building.toLowerCase().includes(search.toLowerCase()) ||
      (r.equipment && r.equipment.some(e => e.toLowerCase().includes(search.toLowerCase())))
    );
  }, [resources, search]);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'ACTIVE': return { class: 'status-active', icon: <CheckCircle2 size={14} />, label: 'Available' };
      case 'UNDER_MAINTENANCE': return { class: 'status-maintenance', icon: <AlertTriangle size={14} />, label: 'Maintenance' };
      case 'OUT_OF_SERVICE': return { class: 'status-failure', icon: <XCircle size={14} />, label: 'Unavailable' };
      default: return { class: '', icon: <Info size={14} />, label: status };
    }
  };

  if (loading && resources.length === 0) {
    return (
      <div className="resource-list-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <Loader2 className="animate-spin" size={48} style={{ marginBottom: '16px', color: '#6366f1' }} />
          <p>Scanning campus assets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="resource-list-container animate-fade-in">
      <header className="resource-list-header">
        <div className="breadcrumb">
          <Link to="/bookings"><ChevronLeft size={16} /> Back to Categories</Link>
        </div>
        <div>
          <h1 className="gradient-text">Available {category.name}</h1>
          <div className="category-badge">
            <span>{category.icon}</span>
            <span>{category.name} Division</span>
          </div>
        </div>
      </header>

      {error && (
        <div className="glass-card" style={{ padding: '20px', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', marginBottom: '24px', display: 'flex', gap: '12px' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <section className="list-controls">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name, building, or equipment..." 
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <select 
            className="filter-select" 
            value={buildingFilter} 
            onChange={(e) => setBuildingFilter(e.target.value)}
          >
            <option value="">All Buildings</option>
            {buildings.length > 0 ? (
              buildings.map(b => (
                <option key={b} value={b}>{b}</option>
              ))
            ) : (
              // Fallback during loading or if empty
              <>
                <option value="Main Block">Main Block</option>
                <option value="Engineering Block">Engineering Block</option>
                <option value="Science Wing">Science Wing</option>
                <option value="Admin Building">Admin Building</option>
                <option value="Information Technology Building">Information Technology Building</option>
                <option value="New Building">New Building</option>
              </>
            )}
          </select>

          <select 
            className="filter-select"
            value={capacityFilter}
            onChange={(e) => setCapacityFilter(e.target.value)}
          >
            <option value="">Any Capacity</option>
            <option value="10">10+ People</option>
            <option value="30">30+ People</option>
            <option value="50">50+ People</option>
            <option value="100">100+ People</option>
          </select>

          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Online</option>
            <option value="UNDER_MAINTENANCE">Under Service</option>
            <option value="OUT_OF_SERVICE">Disconnected</option>
          </select>
        </div>
      </section>

      <div className="resource-list-grid">
        {filteredResources.length > 0 ? (
          filteredResources.map((res) => {
            const statusInfo = getStatusInfo(res.status);
            return (
              <div key={res.id} className="glass-card resource-item-card animate-fade-in">
                <div className="card-image-wrapper">
                  {res.imageUrls && res.imageUrls.length > 0 ? (
                    <img src={res.imageUrls[0]} alt={res.name} className="resource-card-img" />
                  ) : (
                    <div className="card-image-placeholder">
                      <LayoutGrid size={32} opacity={0.2} />
                    </div>
                  )}
                  <div className={`status-chip ${statusInfo.class}`}>
                    {statusInfo.icon} {statusInfo.label}
                  </div>
                </div>

                <div className="card-content">
                  <div className="card-title-row">
                    <h3>{res.name}</h3>
                  </div>

                  <div className="location-info">
                    <div className="location-detail">
                      <Building2 size={14} /> {res.building}
                    </div>
                    <div className="location-detail">
                      <MapPin size={14} /> Floor {res.floor}, Room {res.roomNumber}
                    </div>
                  </div>

                  <div className="specs-row">
                    <div className="spec-item">
                      <Users size={14} /> {res.capacity} Max
                    </div>
                    <div className="spec-item">
                      <Clock size={14} /> {res.availableFrom} - {res.availableTo}
                    </div>
                  </div>

                  {res.equipment && res.equipment.length > 0 && (
                    <div className="equipment-list">
                      {res.equipment.slice(0, 3).map((item, idx) => (
                        <span key={idx} className="equipment-tag">{item}</span>
                      ))}
                      {res.equipment.length > 3 && (
                        <span className="equipment-tag">+{res.equipment.length - 3} more</span>
                      )}
                    </div>
                  )}

                  <div className="availability-hint">
                    <Calendar size={14} />
                    <span>Next available: Today, {res.availableFrom || '08:00'} AM</span>
                  </div>

                  <div className="card-actions">
                    <Link to={`/resources/${res.id}`} className="action-btn btn-details">
                      <Info size={16} /> View Details
                    </Link>
                    <Link 
                      to={res.status === 'ACTIVE' ? `/bookings/create/${res.id}` : '#'} 
                      className="action-btn btn-book"
                      disabled={res.status !== 'ACTIVE'}
                      onClick={(e) => res.status !== 'ACTIVE' && e.preventDefault()}
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state glass-card">
            <LayoutGrid size={48} strokeWidth={1} style={{ opacity: 0.2 }} />
            <h2>No Resources Found</h2>
            <p>We couldn't find any {category.name.toLowerCase()} matching your filters.</p>
            <button 
              className="action-btn btn-details" 
              style={{ marginTop: '20px', width: 'auto' }}
              onClick={() => {
                setSearch('');
                setBuildingFilter('');
                setStatusFilter('');
                setCapacityFilter('');
              }}
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
