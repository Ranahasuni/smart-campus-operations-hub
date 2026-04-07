import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/bookings.css';

/**
 * RESOURCE_TYPES configuration mapping role-based access to resource categories.
 * IDs match the Backend ResourceType enum.
 */
const RESOURCE_TYPES = [
  { 
    id: 'LAB', 
    name: 'Labs', 
    icon: '🧪', 
    description: 'Scientific labs and computer centers for research and practical sessions.',
    roles: ['ADMIN', 'LECTURER', 'STUDENT'] 
  },
  { 
    id: 'LECTURE_HALL', 
    name: 'Lecture Halls', 
    icon: '🏛️', 
    description: 'Spacious halls equipped with modern audio-visual technology for large classes.',
    roles: ['ADMIN', 'LECTURER'] 
  },
  { 
    id: 'MEETING_ROOM', 
    name: 'Meeting Rooms', 
    icon: '🤝', 
    description: 'Collaborative spaces for group discussions, study sessions, and small meetings.',
    roles: ['ADMIN', 'STUDENT'] 
  },
  { 
    id: 'AUDITORIUM', 
    name: 'Auditoriums', 
    icon: '🎭', 
    description: 'Premiere venues for seminars, workshops, and large-scale academic events.',
    roles: ['ADMIN', 'LECTURER'] 
  },
  { 
    id: 'SPORTS_FACILITY', 
    name: 'Sports Facilities', 
    icon: '🏀', 
    description: 'Indoor and outdoor facilities for physical activities and sports events.',
    roles: ['ADMIN', 'STUDENT'] 
  },
  { 
    id: 'EQUIPMENT', 
    name: 'Equipment', 
    icon: '📽️', 
    description: 'Reserve projectors, laptops, cameras, and other academic peripherals.',
    roles: ['ADMIN', 'LECTURER', 'STUDENT'] 
  },
];

export default function BookingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filter categories allowed for the current user's role
  const availableCategories = useMemo(() => {
    if (!user) return [];
    return RESOURCE_TYPES.filter(cat => cat.roles.includes(user.role));
  }, [user]);

  const handleCategoryClick = (type) => {
    // Navigate to the list page with the selected resource type
    navigate(`/bookings/resources/${type}`);
  };

  return (
    <div className="bookings-container animate-fade-in">
      <header className="bookings-header">
        <h1 className="gradient-text">Campus Reservations</h1>
        <p>Explore and book the best campus resources tailored for your needs.</p>
      </header>

      <div className="resource-grid">
        {availableCategories.length > 0 ? (
          availableCategories.map((cat) => (
            <div 
              key={cat.id} 
              className="glass-card resource-card"
              onClick={() => handleCategoryClick(cat.id)}
            >
              <div className="resource-icon">{cat.icon}</div>
              <div className="resource-info">
                <h3>{cat.name}</h3>
                <p>{cat.description}</p>
              </div>
              <button className="book-btn">
                Browse Resources
              </button>
            </div>
          ))
        ) : (
          <div className="no-access glass-card">
            <p>You don't have access to any booking categories at this time.</p>
          </div>
        )}
      </div>

      <div className="bookings-footer">
        <p className="text-muted">
          Need help? Contact the campus administrator for access permissions.
        </p>
      </div>
    </div>
  );
}
