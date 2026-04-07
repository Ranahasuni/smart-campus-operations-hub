export default function LocationSection({ formData, handleChange }) {
  return (
    <div className="form-section">
      <h3>Location Details</h3>
      <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '-10px', marginBottom: '15px' }}>
        The full location string will be automatically built from these fields.
      </p>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="building">Building *</label>
          <input
            type="text"
            id="building"
            name="building"
            className="form-input"
            placeholder="e.g., Block A"
            value={formData.building || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="floor">Floor *</label>
          <input
            type="number"
            id="floor"
            name="floor"
            className="form-input"
            placeholder="e.g., 2"
            value={formData.floor || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="roomNumber">Room Number *</label>
          <input
            type="text"
            id="roomNumber"
            name="roomNumber"
            className="form-input"
            placeholder="e.g., A303"
            value={formData.roomNumber || ''}
            onChange={handleChange}
            required
          />
        </div>
      </div>
    </div>
  );
}
