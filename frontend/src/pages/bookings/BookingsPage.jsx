import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/bookings.css';

const RESOURCE_TYPES = [
  { id: 'LECTURE_ROOM', name: 'Lecture Rooms', icon: '🏫', roles: ['ADMIN', 'STAFF'] },
  { id: 'LAB', name: 'Labs', icon: '🧪', roles: ['ADMIN', 'STAFF', 'STUDENT'] },
  { id: 'MEETING_ROOM', name: 'Meeting Rooms', icon: '🤝', roles: ['ADMIN', 'STAFF', 'STUDENT'] },
  { id: 'AUDITORIUM', name: 'Auditoriums', icon: '🎭', roles: ['ADMIN', 'STAFF', 'STUDENT'] },
  { id: 'SPORTS', name: 'Sports Facilities', icon: '🏀', roles: ['ADMIN', 'STAFF', 'STUDENT'] },
  { id: 'EQUIPMENT', name: 'Equipment', icon: '📽️', roles: ['ADMIN', 'STAFF', 'STUDENT'] },
];

export default function BookingsPage() {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState(null);

  // Filter resources based on user role
  const availableResources = useMemo(() => {
    return RESOURCE_TYPES.filter(res => res.roles.includes(user?.role));
  }, [user]);

  // Specific limited equipment logic for students if needed
  // For now, we just filter the categories as requested

  return (
    <div className="bookings-container">
      <header className="bookings-header">
        <h1 className="gradient-text">Campus Reservations</h1>
        <p>Select a category to browse available resources and book your slot.</p>
      </header>

      <div className="resource-grid">
        {availableResources.map((res) => (
          <div 
            key={res.id} 
            className={`glass-card resource-card ${selectedType === res.id ? 'active' : ''}`}
            onClick={() => setSelectedType(res.id)}
          >
            <div className="resource-icon">{res.icon}</div>
            <div className="resource-info">
              <h3>{res.name}</h3>
              <p>Available for {res.id.toLowerCase().replace('_', ' ')} bookings.</p>
            </div>
            <button className="book-btn">Browse {res.name}</button>
          </div>
        ))}
      </div>

      {selectedType && (
        <div className="booking-details glass-card animate-fade-in">
          <h2>Booking: {RESOURCE_TYPES.find(r => r.id === selectedType)?.name}</h2>
          <p>This section would fetch specific items from the backend for: {selectedType}</p>
          {/* Booking form logic would go here */}
        </div>
      )}
    </div>
  );
}
