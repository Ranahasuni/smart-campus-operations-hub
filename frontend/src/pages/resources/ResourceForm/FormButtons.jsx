import { useNavigate } from 'react-router-dom';

export default function FormButtons({ isEdit, loading }) {
  const navigate = useNavigate();

  return (
    <div className="form-actions">
      <button
        type="button"
        className="btn-secondary"
        onClick={() => navigate('/admin/resources')}
        disabled={loading}
      >
        Cancel
      </button>
      <button
        type="submit"
        className="btn-primary"
        disabled={loading}
      >
        {loading ? 'Saving...' : (isEdit ? 'Update Resource' : 'Create Resource')}
      </button>
    </div>
  );
}
