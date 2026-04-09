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

  const fetchResource = async () => {
    try {
      setInitLoading(true);
      const res = await api.get(`/resources/${id}`);
      setFormData(res.data);
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
  };

  const setFormValue = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
        <ArrowLeft size={16} /> Back to Registry
      </Link>

      <h2 className="resource-form-title" style={{ textAlign: 'left', marginBottom: '40px' }}>
        {isEdit ? 'Asset Modification' : 'New Asset Registration'}
      </h2>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit}>
        <BasicInfoSection formData={formData} handleChange={handleChange} />
        <LocationSection formData={formData} handleChange={handleChange} />
        <StatusSection formData={formData} handleChange={handleChange} />
        <EquipmentSection formData={formData} setFormValue={setFormValue} />
        <ImagesSection formData={formData} setFormValue={setFormValue} />
        <AvailabilitySection formData={formData} handleChange={handleChange} setFormValue={setFormValue} />

        <FormButtons isEdit={isEdit} loading={loading} />
      </form>

      {/* PAF ADVANCED SUCCESS MODAL (ZERO BLUR STYLE) */}
      {showSuccess && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.25)', backdropFilter: 'none !important', WebkitBackdropFilter: 'none !important', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, animation: 'fadeIn 0.3s' }}>
          <div style={{ background: '#fff', padding: '40px', borderRadius: '32px', width: '100%', maxWidth: '420px', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)' }}>
              <ShieldCheck size={40} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#0f172a', margin: '0 0 12px 0' }}>
              {isEdit ? 'Update Successful' : 'Registration Successful'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.6', margin: '0 0 32px 0' }}>
              {isEdit
                ? 'The facility configuration has been successfully updated in the central registry.'
                : 'The new campus asset has been successfully registered and published to the catalogue.'}
            </p>
            <button
              onClick={() => navigate('/admin/resources')}
              style={{ width: '100%', padding: '16px', borderRadius: '14px', border: 'none', background: '#0f172a', color: '#fff', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.2)' }}
            >
              Return to Resource Registry <Zap size={18} fill="#fff" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
