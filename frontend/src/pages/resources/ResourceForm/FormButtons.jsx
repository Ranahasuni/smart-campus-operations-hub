import { useNavigate } from 'react-router-dom';

export default function FormButtons({ isEdit, loading }) {
  const navigate = useNavigate();

  return (
    <div className="form-actions" style={{ display: 'flex', width: '100%', gap: '20px', marginTop: '40px', paddingTop: '30px', borderTop: '1px solid #e2e8f0' }}>
      <button
        type="button"
        className="btn-primary"
        onClick={() => navigate('/admin/resources')}
        disabled={loading}
        style={{ flex: 1, padding: '16px', borderRadius: '12px', fontWeight: '700', background: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
      >
        Cancel
      </button>
      <button
        type="submit"
        className="btn-primary"
        disabled={loading}
        style={{ flex: 1, padding: '16px', borderRadius: '12px', fontWeight: '700', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#ffffff', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
      >
        {loading ? 'Processing...' : (isEdit ? 'Update Resource' : 'Create Resource')}
      </button>
    </div>
  );
}
