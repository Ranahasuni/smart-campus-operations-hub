import { Plus, Trash2 } from 'lucide-react';

export default function AvailabilitySection({ formData, setFormValue }) {
  const availability = formData.availability || [
    { day: 'Mon', isAvailable: false, slots: [{ startTime: '08:00', endTime: '18:00' }] },
    { day: 'Tue', isAvailable: false, slots: [{ startTime: '08:00', endTime: '18:00' }] },
    { day: 'Wed', isAvailable: false, slots: [{ startTime: '08:00', endTime: '18:00' }] },
    { day: 'Thu', isAvailable: false, slots: [{ startTime: '08:00', endTime: '18:00' }] },
    { day: 'Fri', isAvailable: false, slots: [{ startTime: '08:00', endTime: '18:00' }] },
    { day: 'Sat', isAvailable: false, slots: [{ startTime: '08:00', endTime: '18:00' }] },
    { day: 'Sun', isAvailable: false, slots: [{ startTime: '08:00', endTime: '18:00' }] },
  ];

  const handleToggleDay = (index) => {
    const newAvailability = [...availability];
    newAvailability[index] = {
      ...newAvailability[index],
      isAvailable: !newAvailability[index].isAvailable
    };
    setFormValue('availability', newAvailability);
  };

  const handleAddTimeSlot = (dayIndex) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].slots.push({ startTime: '08:00', endTime: '18:00' });
    setFormValue('availability', newAvailability);
  };

  const handleRemoveTimeSlot = (dayIndex, slotIndex) => {
    const newAvailability = [...availability];
    if (newAvailability[dayIndex].slots.length > 1) {
      newAvailability[dayIndex].slots.splice(slotIndex, 1);
      setFormValue('availability', newAvailability);
    }
  };

  const handleTimeChange = (dayIndex, slotIndex, field, value) => {
    const newAvailability = [...availability];
    newAvailability[dayIndex].slots[slotIndex] = {
      ...newAvailability[dayIndex].slots[slotIndex],
      [field]: value
    };
    setFormValue('availability', newAvailability);
  };

  return (
    <div className="form-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Operational Availability</h3>
        <span style={{ fontSize: '0.85rem', color: '#64748b', background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px', fontWeight: '500' }}>
          Multiple slots supported per day
        </span>
      </div>

      <div className="availability-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {availability.map((item, dayIndex) => (
          <div 
            key={item.day} 
            className="availability-row" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '12px', 
              padding: '20px', 
              background: item.isAvailable ? '#f8fafc' : '#fff', 
              border: item.isAvailable ? '1px solid #6366f1' : '1px dashed #e2e8f0',
              borderRadius: '20px',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '60px', fontWeight: '800', color: item.isAvailable ? '#0f172a' : '#94a3b8', fontSize: '1.1rem' }}>
                {item.day}
              </div>

              <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={item.isAvailable} 
                  onChange={() => handleToggleDay(dayIndex)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span className="slider round" style={{ 
                  position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                  backgroundColor: item.isAvailable ? '#6366f1' : '#cbd5e1', 
                  transition: '.4s', borderRadius: '34px' 
                }}>
                  <span style={{ 
                    position: 'absolute', content: '""', height: '18px', width: '18px', left: item.isAvailable ? '26px' : '4px', bottom: '3px', 
                    backgroundColor: 'white', transition: '.4s', borderRadius: '50%' 
                  }}></span>
                </span>
              </label>

              <span style={{ fontSize: '0.9rem', color: item.isAvailable ? '#6366f1' : '#64748b', fontWeight: '700' }}>
                {item.isAvailable ? 'Available for Bookings' : 'Completely Unavailable'}
              </span>

              {item.isAvailable && (
                <button 
                  type="button"
                  onClick={() => handleAddTimeSlot(dayIndex)}
                  style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '10px', border: '1px solid #6366f1', background: 'transparent', color: '#6366f1', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer' }}
                >
                  <Plus size={14} /> Add Slot
                </button>
              )}
            </div>

            {item.isAvailable && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px', animation: 'fadeIn 0.3s' }}>
                {item.slots.map((slot, slotIndex) => (
                  <div key={slotIndex} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div className="time-picker-mini" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>Start</span>
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => handleTimeChange(dayIndex, slotIndex, 'startTime', e.target.value)}
                        style={{ border: 'none', background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}
                      />
                    </div>
                    <span style={{ color: '#94a3b8', fontWeight: '900' }}>→</span>
                    <div className="time-picker-mini" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>End</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => handleTimeChange(dayIndex, slotIndex, 'endTime', e.target.value)}
                        style={{ border: 'none', background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}
                      />
                    </div>
                    {item.slots.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => handleRemoveTimeSlot(dayIndex, slotIndex)}
                        style={{ marginLeft: 'auto', padding: '8px', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


