export default function AvailabilitySection({ formData, handleChange, setFormValue }) {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const availableDays = formData.availableDays || [];

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormValue('availableDays', [...availableDays, value]);
    } else {
      setFormValue('availableDays', availableDays.filter(d => d !== value));
    }
  };

  return (
    <div className="form-section">
      <h3>Availability</h3>
      
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="availableFrom">Available From *</label>
          <input
            type="time"
            id="availableFrom"
            name="availableFrom"
            className="form-input"
            value={formData.availableFrom || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="availableTo">Available To *</label>
          <input
            type="time"
            id="availableTo"
            name="availableTo"
            className="form-input"
            value={formData.availableTo || ''}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group" style={{ marginTop: '10px' }}>
        <label>Available Days</label>
        <div className="checkbox-group">
          {daysOfWeek.map(day => (
            <label key={day} className="advanced-checkbox">
              <input
                type="checkbox"
                name="availableDays"
                value={day}
                checked={availableDays.includes(day)}
                onChange={handleCheckboxChange}
              />
              <span className="checkmark"></span>
              <span className="label-text">{day}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
