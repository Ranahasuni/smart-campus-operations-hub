import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axiosInstance';
import './ResourceForm.css';

import BasicInfoSection from './BasicInfoSection';
import LocationSection from './LocationSection';
import StatusSection from './StatusSection';
import EquipmentSection from './EquipmentSection';
import ImagesSection from './ImagesSection';
import AvailabilitySection from './AvailabilitySection';
import FormButtons from './FormButtons';

export default function ResourceEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authFetch, API } = useAuth();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    capacity: '',
    building: '',
    floor: '',
    roomNumber: '',
    status: 'ACTIVE',
    equipment: [],
    imageUrls: [],
    availability: [
      { day: 'Mon', isAvailable: false, slots: [{ startTime: '08:00', endTime: '18:00' }] },
      { day: 'Tue', isAvailable: false, slots: [{ startTime: '08:00', endTime: '18:00' }] },
      { day: 'Wed', isAvailable: false, slots: [{ startTime: '08:00', endTime: '18:00' }] },
      { day: 'Thu', isAvailable: false, slots: [{ startTime: '08:00', endTime: '18:00' }] },
      { day: 'Fri', isAvailable: false, slots: [{ startTime: '08:00', endTime: '18:00' }] },
      { day: 'Sat', isAvailable: false, slots: [{ startTime: '08:00', endTime: '18:00' }] },
      { day: 'Sun', isAvailable: false, slots: [{ startTime: '08:00', endTime: '18:00' }] },
    ]


  });

  useEffect(() => {
    if (isEdit) {
      fetchResource();
    }
  }, [id]);

  const DEFAULT_AVAILABILITY = [
    { day: 'Mon', isAvailable: false, slots: [{ startTime: '08:00', endTime: '18:00' }] },
    { day: 'Tue', isAvailable: false, slots: [{ startTime: '08:00', endTime: '18:00' }] },
    { day: 'Wed', isAvailable: false, slots: [{ startTime: '08:00', endTime: '18:00' }] },
    { day: 'Thu', isAvailable: false, slots: [{ startTime: '08:00', endTime: '18:00' }] },
    { day: 'Fri', isAvailable: false, slots: [{ startTime: '08:00', endTime: '18:00' }] },
    { day: 'Sat', isAvailable: false, slots: [{ startTime: '08:00', endTime: '18:00' }] },
    { day: 'Sun', isAvailable: false, slots: [{ startTime: '08:00', endTime: '18:00' }] },
  ];

  const fetchResource = async () => {
    try {
      setInitLoading(true);
      const res = await api.get(`/resources/${id}`);
      let data = res.data;

      // ✅ DEEP DATA NORMALIZATION
      if (!data.availability || data.availability.length === 0) {
        // Handle migration from old availableDays model if it exists
        if (data.availableDays && data.availableFrom && data.availableTo) {
          data.availability = DEFAULT_AVAILABILITY.map(d => ({
            day: d.day,
            isAvailable: data.availableDays.some(old => old.toUpperCase().startsWith(d.day.toUpperCase())),
            slots: [{ startTime: data.availableFrom, endTime: data.availableTo }]
          }));
        } else {
          data.availability = DEFAULT_AVAILABILITY;
        }
      } else {
        // Ensure every item is standardized (Fixing the isAvailable naming bug)
        data.availability = data.availability.map(item => ({
          ...item,
          isAvailable: item.isAvailable === true || item.available === true,
          slots: item.slots || [{ startTime: '08:00', endTime: '18:00' }]
        }));
      }

      setFormData(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch resource', err);
      setError('Failed to load resource data. Please check if the resource exists.');
    } finally {
      setInitLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const setFormValue = (field, value) => {
    if (field === 'images_error') {
      setValidationErrors(prev => ({ ...prev, images: value }));
      return;
    }

    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear or update the red error state as soon as the admin interacts with these sections
    const errorKey = field === 'imageUrls' ? 'images' : field;
    const specialSections = ['images', 'equipment', 'availability'];

    if (specialSections.includes(errorKey)) {
      const vErrors = runValidation({ ...formData, [field]: value });

      if (!vErrors[errorKey]) {
        // Corrected! Remove from state
        setValidationErrors(prev => {
          const updated = { ...prev };
          delete updated[errorKey];
          return updated;
        });
      } else {
        // Still error? Update message/color in state
        setValidationErrors(prev => ({ ...prev, [errorKey]: vErrors[errorKey] }));
      }
      return;
    }

    // Default cleanup for text inputs
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[errorKey];
        return updated;
      });
    }
  };

  // Manual Validation Brain (Accessible to both Submit and Blur)
  const runValidation = (data) => {
    const vErrors = {};
    if (!data.name || data.name.trim().length < 3) {
      vErrors.name = data.name?.trim().length === 0
        ? "This field is required. Please fill it to continue."
        : "Name is too short. Please enter at least 3 characters.";
    }
    if (!data.description || data.description.trim().length < 10) {
      vErrors.description = data.description?.trim().length === 0
        ? "This field is required. Please fill it to continue."
        : "Please provide a more detailed description (min. 10 characters).";
    }
    if (!data.type) vErrors.type = "Please select a category.";

    if (!data.capacity && data.capacity !== 0) {
      vErrors.capacity = "This field is required. Please enter a number.";
    } else if (Number(data.capacity) < 1) {
      vErrors.capacity = "Minimum capacity is 1.";
    } else if (Number(data.capacity) > 1000) {
      vErrors.capacity = "Total capacity exceeds the maximum campus limit of 1,000 seats.";
    }

    if (!data.building) vErrors.building = "Please select a building.";
    if (!data.floor && data.floor !== 0) vErrors.floor = "Please select a floor.";

    const roomPattern = /^[A-Z][0-9]{3,4}$/;
    if (!data.roomNumber) {
      vErrors.roomNumber = "Room Number is required. (e.g., A405 or G1102)";
    } else if (!roomPattern.test(data.roomNumber)) {
      vErrors.roomNumber = "Invalid format. Use one letter and 3-4 digits (e.g., A405 or G1102).";
    }

    // 🖼️ Image Validation (1 to 5)
    if (!data.imageUrls || data.imageUrls.length === 0) {
      vErrors.images = "At least one image is required to showcase the facility.";
    } else if (data.imageUrls.length > 5) {
      vErrors.images = "You can only upload a maximum of 5 images.";
    }

    // 🛠️ Equipment Validation (Min 1)
    if (!data.equipment || data.equipment.length === 0) {
      vErrors.equipment = "Smart Campus Requirement: Please list at least one feature or piece of equipment.";
    }

    // 🕒 Availability Validation (Real-World Logic)
    const activeDays = data.availability?.filter(d => d.isAvailable) || [];
    if (activeDays.length === 0) {
      vErrors.availability = "Operational Status: You must enable at least one day for this resource to be registered as functional.";
    } else {
      // Check if any active day has ZERO slots
      const dayWithNoSlots = activeDays.find(day => !day.slots || day.slots.length === 0);
      if (dayWithNoSlots) {
        vErrors.availability = `Critical Logic Error: ${dayWithNoSlots.day} is set to 'Available' but has no time slots. Please add a slot or disable the day.`;
      } else {
        // Check if all active days have valid time ranges
        const hasInvalidTime = activeDays.some(day =>
          day.slots?.some(slot => !slot.startTime || !slot.endTime || slot.startTime >= slot.endTime)
        );
        if (hasInvalidTime) {
          vErrors.availability = "Time Logic Error: Ensure every 'Start Time' is earlier than the 'End Time'.";
        }
      }
    }

    return vErrors;
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    const vErrors = runValidation(formData);
    if (vErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: vErrors[name] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setError(null);
    setValidationErrors({});

    const newErrors = runValidation(formData);

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      setError("Registration Incomplete: Some fields require your attention. Please fill required fields.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);

    try {
      // Ensure numeric fields are sent as Numbers (Integers) for Spring Boot DTO
      // & ONLY send fields defined in ResourceRequestDTO to avoid Jackson UnrecognizedPropertyException
      const preppedData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        capacity: formData.capacity ? Number(formData.capacity) : null,
        building: formData.building,
        floor: formData.floor ? Number(formData.floor) : null,
        roomNumber: formData.roomNumber,
        status: formData.status || 'ACTIVE',
        equipment: formData.equipment || [],
        imageUrls: formData.imageUrls || [],
        availability: formData.availability || []

      };

      const url = isEdit
        ? `${API}/api/resources/${id}`
        : `${API}/api/resources`;

      const res = await authFetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preppedData)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));

        // Handle Spring Boot validation errors (messages is a map)
        if (errorData.messages && typeof errorData.messages === 'object') {
          const fieldErrors = Object.entries(errorData.messages)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(', ');
          throw new Error(`Validation Failed: ${fieldErrors}`);
        }

        throw new Error(errorData.message || errorData.error || `Server Error (${res.status})`);
      }

      setShowSuccess(true);
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to save the resource. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return (
      <div className="resource-form-container" style={{ textAlign: 'center', padding: '100px' }}>
        <h2 style={{ color: '#94a3b8' }}>Loading Resource Data...</h2>
      </div>
    );
  }

  return (
    <div className="resource-form-container" style={{ position: 'relative' }}>

      {/* ADVANCED BACK BUTTON */}
      <Link to="/admin/resources" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        color: '#64748b', textDecoration: 'none', fontWeight: '600',
        fontSize: '0.9rem', marginBottom: '24px', padding: '8px 0',
        transition: 'color 0.2s'
      }} onMouseOver={e => e.currentTarget.style.color = '#6366f1'}
        onMouseOut={e => e.currentTarget.style.color = '#64748b'}>
        <ArrowLeft size={16} /> Back to Management
      </Link>

      <h2 className="resource-form-title" style={{ textAlign: 'center', marginBottom: '48px', fontSize: '2.2rem' }}>
        {isEdit ? 'Update Resource Details' : 'New Resource Registration'}
      </h2>

      {error && (
        <div className="error-banner">
          <Zap size={20} fill="#e11d48" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <BasicInfoSection formData={formData} handleChange={handleChange} handleBlur={handleBlur} errors={validationErrors} />
        <LocationSection formData={formData} handleChange={handleChange} handleBlur={handleBlur} errors={validationErrors} />
        <StatusSection formData={formData} handleChange={handleChange} />
        <EquipmentSection formData={formData} setFormValue={setFormValue} errors={validationErrors} />
        <ImagesSection formData={formData} setFormValue={setFormValue} errors={validationErrors} />
        <AvailabilitySection formData={formData} handleChange={handleChange} setFormValue={setFormValue} errors={validationErrors} />

        <FormButtons isEdit={isEdit} loading={loading} />
      </form>

      {/* PAF ADVANCED SUCCESS MODAL (ZERO BLUR STYLE) */}
      {showSuccess && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.25)', backdropFilter: 'none !important', WebkitBackdropFilter: 'none !important', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, animation: 'fadeIn 0.3s' }}>
          <div style={{ background: '#fff', padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '420px', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)' }}>
              <ShieldCheck size={40} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', margin: '0 0 32px 0' }}>
              {isEdit ? 'Resource Updated Successfully' : 'New Asset Registered'}
            </h2>
            <button
              onClick={() => navigate('/admin/resources')}
              style={{ width: '100%', marginTop: '12px', padding: '16px', borderRadius: '14px', border: 'none', background: '#0f172a', color: '#fff', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.2)' }}
            >
              Return to Management <Zap size={18} fill="#fff" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
