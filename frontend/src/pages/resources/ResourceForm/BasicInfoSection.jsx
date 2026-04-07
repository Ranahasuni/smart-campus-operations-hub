export default function BasicInfoSection({ formData, handleChange }) {
  return (
    <div className="form-section">
      <h3>Basic Information</h3>
      <div className="form-grid">
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label htmlFor="name">Resource Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            className="form-input"
            placeholder="e.g., Main Auditorium"
            value={formData.name || ''}
            onChange={handleChange}
            required
            autoFocus
          />
        </div>

        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            className="form-textarea"
            placeholder="Provide details about the resource..."
            value={formData.description || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">Resource Type *</label>
          <select
            id="type"
            name="type"
            className="form-select"
            value={formData.type || ''}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select Type</option>
            <option value="LAB">Lab</option>
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="MEETING_ROOM">Meeting Room</option>
            <option value="AUDITORIUM">Auditorium</option>
            <option value="SPORTS_FACILITY">Sports Facility</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="capacity">Capacity (Persons) *</label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            className="form-input"
            min="1"
            value={formData.capacity || ''}
            onChange={handleChange}
            required
          />
        </div>
      </div>
    </div>
  );
}
