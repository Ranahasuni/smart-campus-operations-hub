const BUILDINGS = [
  'MAIN BUILDING',
  'NEW BUILDING - F BLOCK',
  'NEW BUILDING - G BLOCK',
  'SPORTS COMPLEX'
];

export default function LocationSection({ formData, handleChange }) {
  const getFloors = () => {
    const building = formData.building || '';
    let count = 0;
    if (building === 'MAIN BUILDING') count = 7;
    else if (building.includes('NEW BUILDING')) count = 14;
    else if (building === 'SPORTS COMPLEX') count = 2;

    // Generate 0 to count (0 is Ground Floor)
    return Array.from({ length: count + 1 }, (_, i) => i);
  };

  const floors = getFloors();

  return (
    <div className="form-section">
      <h3>Location Details</h3>
      <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '-10px', marginBottom: '20px' }}>
        Select the official campus location. Floor options will update automatically based on the building.
      </p>
      <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div className="form-group">
          <label htmlFor="building" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Building *</label>
          <select
            id="building"
            name="building"
            className="form-input"
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', outline: 'none' }}
            value={formData.building || ''}
            onChange={handleChange}
            required
          >
            <option value="">Select Building</option>
            {BUILDINGS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="floor" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Floor *</label>
          <select
            id="floor"
            name="floor"
            className="form-input"
            style={{
              width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0',
              background: !formData.building ? '#f8fafc' : '#fff',
              cursor: !formData.building ? 'not-allowed' : 'pointer',
              outline: 'none'
            }}
            value={formData.floor || ''}
            onChange={handleChange}
            disabled={!formData.building}
            required
          >
            <option value="">{formData.building ? 'Select Floor' : 'Select building first'}</option>
            {floors.map(f => (
              <option key={f} value={f}>
                {f === 0 ? 'Ground Floor' : `Floor ${f}`}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="roomNumber" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569' }}>Room Number *</label>
          <input
            type="text"
            id="roomNumber"
            name="roomNumber"
            className="form-input"
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
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
