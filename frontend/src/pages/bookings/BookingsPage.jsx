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
    id: 'TEACHING_VENUE', 
    name: 'Teaching Venues', 
    icon: '📖', 
    description: 'General purpose teaching spaces and classrooms across campuses.',
    roles: ['ADMIN', 'LECTURER', 'STUDENT'] 
  },
  { 
    id: 'LECTURE_THEATRE', 
    name: 'Lecture Theatres', 
    icon: '🏛️', 
    description: 'Tiered theatres equipped with premium AV for large scale presentations.',
    roles: ['ADMIN', 'LECTURER'] 
  },
  { 
    id: 'SEMINAR_ROOM', 
    name: 'Seminar Rooms', 
    icon: '🗣️', 
    description: 'Formal spaces for collaborative academic seminars and workshops.',
    roles: ['ADMIN', 'LECTURER', 'STUDENT'] 
  },
  { 
    id: 'MEETING_ROOM', 
    name: 'Meeting Rooms', 
    icon: '🤝', 
    description: 'Professional spaces for group discussions and team coordination.',
    roles: ['ADMIN', 'STUDENT', 'LECTURER'] 
  },
  { 
    id: 'FUNCTION_SPACE', 
    name: 'Function Spaces', 
    icon: '🎉', 
    description: 'Versatile areas for events, exhibitions, and social gatherings.',
    roles: ['ADMIN', 'LECTURER'] 
  },
  { 
    id: 'VIDEO_CONFERENCE_ROOM', 
    name: 'Video Conference Rooms', 
    icon: '🎥', 
    description: 'High-tech rooms with dedicated MSTeams or Webex equipment.',
    roles: ['ADMIN', 'LECTURER', 'STUDENT'] 
  },
  { 
    id: 'LAB', 
    name: 'Labs & Specialist Facilities', 
    icon: '🧪', 
    description: 'Specialized computer and scientific labs for technical sessions.',
    roles: ['ADMIN', 'LECTURER', 'STUDENT'] 
  },
  { 
    id: 'AUDITORIUM', 
    name: 'Auditoriums', 
    icon: '🎭', 
    description: 'Large prestige venues for ceremonies and major events.',
    roles: ['ADMIN', 'LECTURER'] 
  },
  { 
    id: 'SPORTS_FACILITY', 
    name: 'Sports Facilities', 
    icon: '🏀', 
    description: 'Recreational spaces for physical activities and sporting events.',
    roles: ['ADMIN', 'STUDENT'] 
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
