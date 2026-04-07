export default function StatusSection({ formData, handleChange }) {
  return (
    <div className="form-section">
      <h3>Status</h3>
      <div className="form-group">
        <label htmlFor="status">Current Status</label>
        <select
          id="status"
          name="status"
          className="form-select"
          value={formData.status || 'ACTIVE'}
          onChange={handleChange}
        >
          <option value="ACTIVE">Active (Available for booking)</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="OUT_OF_SERVICE">Out of Service</option>
        </select>
      </div>
    </div>
  );
}
