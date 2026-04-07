import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api/axiosInstance';
import './ResourceForm.css';

import BasicInfoSection from './BasicInfoSection';
import LocationSection from './LocationSection';
import StatusSection from './StatusSection';
import EquipmentSection from './EquipmentSection';
import ImagesSection from './ImagesSection';
import AvailabilitySection from './AvailabilitySection';
import FormButtons from './FormButtons';

export default function ResourceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(isEdit);
  const [error, setError] = useState(null);

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
    availableFrom: '',
    availableTo: '',
    availableDays: []
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
      const preppedData = {
        ...formData,
        capacity: formData.capacity ? Number(formData.capacity) : null,
        floor: formData.floor ? Number(formData.floor) : null
      };

      console.log('Sending Payload:', preppedData);

      if (isEdit) {
        await api.put(`/resources/${id}`, preppedData);
      } else {
        await api.post('/resources', preppedData);
      }
      navigate('/admin/resources');
    } catch (err) {
      console.error('Submission error:', err);
      let errorMsg = 'Failed to save the resource. Please try again.';

      if (err.response?.data) {
        if (err.response.data.messages) {
          // It's a Validation error format mapped from Spring Boot
          errorMsg = 'Validation Error: ' + Object.values(err.response.data.messages).join(' | ');
        } else if (err.response.data.message) {
          // Our GlobalExceptionHandler format
          errorMsg = err.response.data.message;
        } else if (err.response.data.error) {
          // Generic Spring Boot format (e.g. 403 Forbidden)
          errorMsg = `Server Error (${err.response.status}): ${err.response.data.error} - Ensure you are an ADMIN.`;
        }
      } else if (err.response?.status) {
        errorMsg = `Server Error (${err.response.status}): The request was rejected by the server.`;
      } else if (err.message) {
        errorMsg = `Connection Error: ${err.message}`;
      }

      setError(errorMsg);
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
    <div className="resource-form-container">
      <h2 className="resource-form-title">
        {isEdit ? 'Edit Resource' : 'Create New Resource'}
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
    </div>
  );
}
