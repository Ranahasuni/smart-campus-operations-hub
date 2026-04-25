export default function BasicInfoSection({ formData, handleChange, handleBlur, errors = {}, staffOptions = [] }) {
  const getErrorStyle = (field) => {
    if (errors[field]) {
      return { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.02)' };
    }
    return {};
  };

  return (
    <div className="form-section">
      <h3>Basic Information</h3>
      <div className="form-grid">
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label htmlFor="name" style={{ color: errors.name ? '#ef4444' : 'inherit' }}>Resource Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            className={`form-input ${errors.name ? 'input-error' : ''}`}
            placeholder="e.g., Main Auditorium"
            value={formData.name || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            style={getErrorStyle('name')}
            autoFocus
          />
          {errors.name && <p className="field-error-msg" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px', fontWeight: '600' }}>{errors.name}</p>}
        </div>

        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label htmlFor="description" style={{ color: errors.description ? '#ef4444' : 'inherit' }}>Description *</label>
          <textarea
            id="description"
            name="description"
            className={`form-textarea ${errors.description ? 'input-error' : ''}`}
            placeholder="Provide details about the resource..."
            value={formData.description || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            style={getErrorStyle('description')}
          />
          {errors.description && <p className="field-error-msg" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px', fontWeight: '600' }}>{errors.description}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="type" style={{ color: errors.type ? '#ef4444' : 'inherit' }}>Resource Type *</label>
          <select
            id="type"
            name="type"
            className={`form-select ${errors.type ? 'input-error' : ''}`}
            value={formData.type || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            style={getErrorStyle('type')}
          >
            <option value="" disabled>Select Type</option>
            <option value="LAB">Lab</option>
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="MEETING_ROOM">Meeting Room</option>
            <option value="AUDITORIUM">Auditorium</option>
            <option value="SPORTS_FACILITY">Sports Facility</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
          {errors.type && <p className="field-error-msg" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px', fontWeight: '600' }}>{errors.type}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="capacity" style={{ color: errors.capacity ? '#ef4444' : 'inherit' }}>Capacity (Seats) *</label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            className={`form-input ${errors.capacity ? 'input-error' : ''}`}
            min="1"
            max="1000"
            value={formData.capacity || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            style={getErrorStyle('capacity')}
          />
          {errors.capacity && <p className="field-error-msg" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px', fontWeight: '600' }}>{errors.capacity}</p>}
        </div>

        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label htmlFor="assignedStaffIds" style={{ color: errors.assignedStaffIds ? '#ef4444' : 'inherit' }}>Assigned Caretaker (Staff)</label>
          <select
            id="assignedStaffIds"
            name="assignedStaffIds"
            className={`form-select ${errors.assignedStaffIds ? 'input-error' : ''}`}
            value={formData.assignedStaffIds?.[0] || ''}
            onBlur={handleBlur}
            style={getErrorStyle('assignedStaffIds')}
            onChange={(e) => {
              const val = e.target.value;
              handleChange({
                target: {
                  name: 'assignedStaffIds',
                  value: val ? [val] : []
                }
              });
            }}
          >
            <option value="">Unassigned</option>
            {staffOptions.map(staff => (
              <option key={staff.id} value={staff.id}>
                {staff.fullName} ({staff.campusId})
              </option>
            ))}
          </select>
          {errors.assignedStaffIds ? (
            <p className="field-error-msg" style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px', fontWeight: '600' }}>{errors.assignedStaffIds}</p>
          ) : (
            <p className="field-hint" style={{ fontSize: '0.75rem', color: '#6B7281', marginTop: '4px' }}>
              The staff member responsible for check-ins at this facility.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
