const BUILDINGS = [
  'MAIN BUILDING',
  'NEW BUILDING - F BLOCK',
  'NEW BUILDING - G BLOCK',
  'SPORTS COMPLEX'
];

export default function LocationSection({ formData, handleChange, handleBlur, errors = {} }) {
  const getFloors = () => {
    const building = formData.building || '';
    let count = 0;
    if (building === 'MAIN BUILDING') count = 7;
    else if (building.includes('NEW BUILDING')) count = 14;
    else if (building === 'SPORTS COMPLEX') count = 2;

    return Array.from({ length: count + 1 }, (_, i) => i);
  };

  const floors = getFloors();

  return (
    <div className="form-section">
      <h3>Location Details</h3>
      <p style={{ fontSize: '0.85rem', color: '#6B7281', marginTop: '-10px', marginBottom: '20px' }}>
        Select the official campus location. Floor options will update automatically based on the building.
      </p>
      <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div className="form-group">
          <label htmlFor="building" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: errors.building ? '#ef4444' : '#475569' }}>Building *</label>
          <select
            id="building"
            name="building"
            className="form-input"
            style={{
              width: '100%', padding: '12px', borderRadius: '10px',
              border: errors.building ? '1px solid #ef4444' : '1px solid #6B7281',
              background: errors.building ? 'rgba(239, 68, 68, 0.02)' : '#fff',
              cursor: 'pointer', outline: 'none'
            }}
            value={formData.building || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value="">Select Building</option>
            {BUILDINGS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          {errors.building && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px', fontWeight: '600' }}>{errors.building}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="floor" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: errors.floor ? '#ef4444' : '#475569' }}>Floor *</label>
          <select
            id="floor"
            name="floor"
            className="form-input"
            style={{
              width: '100%', padding: '12px', borderRadius: '10px',
              border: errors.floor ? '1px solid #ef4444' : '1px solid #6B7281',
              background: errors.floor ? 'rgba(239, 68, 68, 0.02)' : (!formData.building ? '#1F1F1F' : '#fff'),
              cursor: !formData.building ? 'not-allowed' : 'pointer',
              outline: 'none'
            }}
            value={formData.floor || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={!formData.building}
          >
            <option value="">{formData.building ? 'Select Floor' : 'Select building first'}</option>
            {floors.map(f => (
              <option key={f} value={f}>
                {f === 0 ? 'Ground Floor' : `Floor ${f}`}
              </option>
            ))}
          </select>
          {errors.floor && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px', fontWeight: '600' }}>{errors.floor}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="roomNumber" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: errors.roomNumber ? '#ef4444' : '#475569' }}>Room Number *</label>
          <input
            type="text"
            id="roomNumber"
            name="roomNumber"
            className="form-input"
            style={{
              width: '100%', padding: '12px', borderRadius: '10px',
              border: errors.roomNumber ? '1px solid #ef4444' : '1px solid #6B7281',
              background: errors.roomNumber ? 'rgba(239, 68, 68, 0.02)' : '#fff',
              outline: 'none'
            }}
            placeholder="e.g., A302"
            value={formData.roomNumber || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.roomNumber && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px', fontWeight: '600' }}>{errors.roomNumber}</p>}
        </div>
      </div>
    </div>
  );
}
