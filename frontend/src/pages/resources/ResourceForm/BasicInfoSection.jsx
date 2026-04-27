export default function BasicInfoSection({ formData, handleChange, handleBlur, errors = {}, staffOptions = [] }) {
  return (
    <div className="form-section">
      <h3>Basic Information</h3>
      <div className="form-grid">
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label htmlFor="name" className={errors.name ? 'label-error' : ''}>Resource Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            className={`form-input ${errors.name ? 'input-error' : ''}`}
            placeholder="e.g., Main Auditorium"
            value={formData.name || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            autoFocus
          />
          {errors.name && <p className="field-error-msg">{errors.name}</p>}
        </div>

        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label htmlFor="description" className={errors.description ? 'label-error' : ''}>Description *</label>
          <textarea
            id="description"
            name="description"
            className={`form-textarea ${errors.description ? 'input-error' : ''}`}
            placeholder="Provide details about the resource..."
            value={formData.description || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {errors.description && <p className="field-error-msg">{errors.description}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="type" className={errors.type ? 'label-error' : ''}>Resource Type *</label>
          <select
            id="type"
            name="type"
            className={`form-select ${errors.type ? 'input-error' : ''}`}
            value={formData.type || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          >
            <option value="" disabled>Select Type</option>
            <option value="LAB">Lab</option>
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="LECTURE_THEATRE">Lecture Theatre</option>
            <option value="MEETING_ROOM">Meeting Room</option>
            <option value="VIDEO_CONFERENCE_ROOM">Video Conference Room</option>
            <option value="AUDITORIUM">Auditorium</option>
            <option value="SPORTS_FACILITY">Sports Facility</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
          {errors.type && <p className="field-error-msg">{errors.type}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="capacity" className={errors.capacity ? 'label-error' : ''}>Capacity (Seats) *</label>
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
          />
          {errors.capacity && <p className="field-error-msg">{errors.capacity}</p>}
        </div>

        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label htmlFor="assignedStaffIds" className={errors.assignedStaffIds ? 'label-error' : ''}>Assigned Caretaker (Staff)</label>
          <select
            id="assignedStaffIds"
            name="assignedStaffIds"
            className={`form-select ${errors.assignedStaffIds ? 'input-error' : ''}`}
            value={formData.assignedStaffIds?.[0] || ''}
            onBlur={handleBlur}
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
            <p className="field-error-msg">{errors.assignedStaffIds}</p>
          ) : (
            <p className="field-hint">
              The staff member responsible for check-ins at this facility.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
