import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

const FormButtons = ({ isEdit, loading }) => {
  const navigate = useNavigate();

  return (
    <div className="form-actions">
      <button
        type="button"
        className="btn-secondary"
        onClick={() => navigate('/admin/resources')}
        disabled={loading}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <XCircle size={18} /> Cancel
        </span>
      </button>

      <button
        type="submit"
        className="btn-primary"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" /> 
            {isEdit ? 'Updating...' : 'Registering...'}
          </>
        ) : (
          <>
            <CheckCircle2 size={20} /> 
            {isEdit ? 'Update Facility' : 'Register Facility'}
          </>
        )}
      </button>
    </div>
  );
};

export default FormButtons;
