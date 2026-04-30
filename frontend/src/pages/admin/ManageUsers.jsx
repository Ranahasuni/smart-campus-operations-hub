import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Shield, Search, Trash2, Edit2, Lock, Unlock, Loader2, AlertCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── Shared Animation Hooks ─────────────────────────────────
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) entry.target.classList.add('revealed');
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = '' }) {
  const ref = useScrollReveal();
  return <div ref={ref} className={`hp-reveal ${className}`}>{children}</div>;
}

export default function ManageUsers() {
  const { user: currentUser, authFetch, API } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    campusId: '',
    campusEmail: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await authFetch(`${API}/api/users`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password is too weak. Must include Uppercase, Lowercase, Number, and Special character (@#$%^&+=!)');
      return;
    }

    // Role-based validations (Same as RegisterPage)
    const emailLower = formData.campusEmail.toLowerCase();
    const idUpper = formData.campusId.toUpperCase();

    if (formData.role === 'STUDENT') {
      if (!emailLower.endsWith('@my.sliit.lk') && !emailLower.endsWith('@sliit.lk')) {
        setError('Students must use official @my.sliit.lk or @sliit.lk email');
        return;
      }
      if (!idUpper.startsWith('IT')) {
        setError('Student ID must start with IT');
        return;
      }
    } else if (formData.role === 'LECTURER') {
      if (!idUpper.startsWith('LEC')) {
        setError('Lecturer ID must start with LEC');
        return;
      }
    } else if (formData.role === 'TECHNICIAN') {
      if (!idUpper.startsWith('TECH')) {
        setError('Technician ID must start with TECH');
        return;
      }
    }

    try {
      const res = await authFetch(`${API}/api/users`, {
        method: 'POST',
        body: JSON.stringify({
          fullName: formData.fullName,
          campusId: formData.campusId,
          campusEmail: formData.campusEmail,
          password: formData.password,
          role: formData.role
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setUsers([...users, data]);
        setShowModal(false);
        setSuccessMsg(`Account for ${formData.fullName} has been successfully provisioned.`);
        setShowSuccess(true);
        setFormData({ fullName: '', campusId: '', campusEmail: '', password: '', confirmPassword: '', role: 'STUDENT' });
      } else {
        setError(data.message || 'Creation failed');
      }
    } catch (err) {
      setError('Connection refused. Is backend running?');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'LOCKED' || currentStatus === 'DISABLED' ? 'ACTIVE' : 'LOCKED';
    if (!window.confirm(`Are you sure you want to change this user's status to ${newStatus}?`)) return;
    try {
      const res = await authFetch(`${API}/api/users/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`CRITICAL: Are you sure you want to PERMANENTLY delete user "${name}"? This action cannot be undone.`)) return;
    try {
      const res = await authFetch(`${API}/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      } else {
        const data = await res.json();
        setError(data.message || 'Deletion failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (user) => {
    setError('');
    setIsEditing(true);
    setEditUserId(user.id);
    setFormData({
      fullName: user.fullName || '',
      campusId: user.campusId || '',
      campusEmail: user.campusEmail || '',
      password: '', // Not used in edit
      confirmPassword: '', // Not used in edit
      role: user.role || 'STUDENT'
    });
    setShowModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError('');

    // Role-based validations
    const emailLower = formData.campusEmail.toLowerCase();
    if (formData.role === 'STUDENT') {
      if (!emailLower.endsWith('@my.sliit.lk') && !emailLower.endsWith('@sliit.lk')) {
        setError('Students must use official @my.sliit.lk or @sliit.lk email');
        return;
      }
    }

    try {
      const res = await authFetch(`${API}/api/users/${editUserId}`, {
        method: 'PUT',
        body: JSON.stringify({
          fullName: formData.fullName,
          campusEmail: formData.campusEmail,
          role: formData.role
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setUsers(users.map(u => u.id === editUserId ? data : u));
        setShowModal(false);
        setSuccessMsg(`Account for ${formData.fullName} has been successfully updated.`);
        setShowSuccess(true);
      } else {
        setError(data.message || 'Update failed');
      }
    } catch (err) {
      setError('Connection refused. Is backend running?');
    }
  };

  const changeRole = async (id, newRole) => {
    try {
      const res = await authFetch(`${API}/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
      } else {
        const data = await res.json();
        setError(data.message || 'Update failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.campusEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.campusId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div style={{ padding: '100px', textAlign: 'center', color: '#6B7281' }}>
      <Loader2 className="animate-spin" size={48} style={{ margin: '0 auto 20px', color: '#C08080' }} />
      <p style={{ letterSpacing: '2px', fontWeight: 'bold' }}>SYNCHRONIZING IDENTITY DATABASE...</p>
    </div>
  );

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Reveal>
        <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '950', color: '#1F1F1F', margin: 0, letterSpacing: '-1.5px' }}>
              Account <span style={{ color: '#C08080' }}>Security</span>
            </h1>
            <p style={{ color: '#6B7281', marginTop: '8px', fontWeight: '500' }}>Administrative oversight of campus identities, access privileges, and security status.</p>
          </div>
          
          <button 
            onClick={() => {
              setError('');
              setIsEditing(false);
              setFormData({ fullName: '', campusId: '', campusEmail: '', password: '', confirmPassword: '', role: 'STUDENT' });
              setShowModal(true);
            }}
            style={{
              background: 'var(--accent-primary)',
              color: '#fff', border: 'none', borderRadius: '14px', padding: '14px 28px',
              fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
              boxShadow: '0 8px 20px rgba(140, 0, 0, 0.2)', transition: 'all 0.3s'
            }}
          >
            <Plus size={20} /> Create New Account
          </button>
        </header>
      </Reveal>

      {/* Filters */}
      <Reveal>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
            <input 
              placeholder="Search by Identity, Email or ID..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '16px 16px 16px 52px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(10px)', border: '1px solid rgba(192, 128, 128, 0.1)', color: '#1F1F1F', outline: 'none', fontWeight: '500' }}
            />
          </div>
        </div>
      </Reveal>

      {error && <div style={{ color: '#ef4444', marginBottom: '20px', padding: '16px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>{error}</div>}

      <Reveal>
        <div style={{ background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(30px)', borderRadius: '32px', border: '1px solid rgba(192, 128, 128, 0.1)', overflow: 'hidden', boxShadow: '0 4px 40px rgba(140, 0, 0, 0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(192, 128, 128, 0.06)', borderBottom: '1px solid rgba(192, 128, 128, 0.08)' }}>
                <th style={{ padding: '24px', textAlign: 'left', color: '#6B7281', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '900' }}>User Information</th>
                <th style={{ padding: '24px', textAlign: 'left', color: '#6B7281', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '900' }}>System Role</th>
                <th style={{ padding: '24px', textAlign: 'left', color: '#6B7281', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '900' }}>Security Status</th>
                <th style={{ padding: '24px', textAlign: 'left', color: '#6B7281', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '900' }}>Last Login</th>
                <th style={{ padding: '24px', textAlign: 'right', color: '#6B7281', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '900' }}>Control Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgba(192, 128, 128, 0.04)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ 
                        width: '48px', height: '48px', borderRadius: '16px', 
                        background: 'linear-gradient(135deg, #8C0000 0%, #C08080 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', 
                        fontWeight: '900', fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(140, 0, 0, 0.15)'
                      }}>
                        {user.fullName?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ color: '#1F1F1F', fontWeight: '800', fontSize: '1.05rem' }}>{user.fullName}</div>
                        <div style={{ color: '#6B7281', fontSize: '0.85rem', fontWeight: '500' }}>{user.campusEmail} • <span style={{ color: '#C08080', fontWeight: '700' }}>{user.campusId}</span></div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <select 
                      value={user.role}
                      onChange={(e) => changeRole(user.id, e.target.value)}
                      disabled={user.id === currentUser?.id}
                      style={{ 
                        padding: '8px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '900',
                        background: 'rgba(192, 128, 128, 0.05)', color: '#1F1F1F',
                        border: '1px solid rgba(192, 128, 128, 0.15)', outline: 'none', cursor: 'pointer'
                      }}
                    >
                      <option value="STUDENT">STUDENT</option>
                      <option value="LECTURER">LECTURER</option>
                      <option value="STAFF">STAFF</option>
                      <option value="TECHNICIAN">TECHNICIAN</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td style={{ padding: '20px 24px' }}>
                    <span style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '6px 14px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: '900',
                      background: user.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: user.status === 'ACTIVE' ? '#22c55e' : '#ef4444'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                      {user.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td style={{ padding: '20px 24px', color: '#6B7281', fontSize: '0.9rem', fontWeight: '500' }}>
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button 
                        onClick={() => handleEditClick(user)}
                        style={{ padding: '10px', borderRadius: '12px', background: 'rgba(192, 128, 128, 0.06)', border: '1px solid rgba(192, 128, 128, 0.1)', color: '#4B5563', cursor: 'pointer' }}
                        title="Edit User Details"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => toggleStatus(user.id, user.status)}
                        style={{ padding: '10px', borderRadius: '12px', background: 'rgba(192, 128, 128, 0.06)', border: '1px solid rgba(192, 128, 128, 0.1)', color: '#4B5563', cursor: 'pointer' }}
                        title="Toggle Security Lock"
                      >
                        {user.status === 'LOCKED' ? <Unlock size={18} /> : <Lock size={18} />}
                      </button>
                      <button 
                         onClick={() => deleteUser(user.id, user.fullName)}
                         style={{ padding: '10px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer' }}
                         title="Purge Account"
                      >
                         <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      {/* Modal - Advanced Glass Version */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(140, 0, 0, 0.2)', backdropFilter: 'blur(12px)' }}>
          <Reveal className="modal-reveal">
            <form onSubmit={isEditing ? handleUpdateUser : handleAddUser} style={{ background: '#fff', padding: '48px', borderRadius: '40px', width: '95%', maxWidth: '550px', boxShadow: '0 40px 100px rgba(0,0,0,0.2)', border: '1px solid rgba(192, 128, 128, 0.1)' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '950', color: '#1F1F1F', marginBottom: '8px' }}>{isEditing ? 'Update Profile' : 'Provision Account'}</h2>
              <p style={{ color: '#6B7281', marginBottom: '32px', fontWeight: '500' }}>{isEditing ? 'Modify existing identity details within the grid.' : 'Initialize a new identity within the campus operational grid.'}</p>
              
              {error && (
                <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '12px', marginBottom: '24px', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <FormInput placeholder="Identity Name" value={formData.fullName} onChange={v => setFormData({...formData, fullName: v})} />
                <FormInput 
                  placeholder="Campus ID (Immutable)" 
                  value={formData.campusId} 
                  onChange={v => !isEditing && setFormData({...formData, campusId: v})} 
                  style={{ opacity: isEditing ? 0.6 : 1, cursor: isEditing ? 'not-allowed' : 'text' }}
                  readOnly={isEditing}
                />
                <FormInput placeholder="University Email" type="email" value={formData.campusEmail} onChange={v => setFormData({...formData, campusEmail: v})} autoComplete="none" />
                
                {!isEditing && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <FormInput placeholder="Password" type="password" value={formData.password} onChange={v => setFormData({...formData, password: v})} autoComplete="new-password" />
                    <FormInput placeholder="Confirm" type="password" value={formData.confirmPassword} onChange={v => setFormData({...formData, confirmPassword: v})} autoComplete="new-password" />
                  </div>
                )}
                <select 
                   value={formData.role} 
                   onChange={e => setFormData({...formData, role: e.target.value})}
                   style={{ padding: '14px', borderRadius: '14px', background: 'rgba(192, 128, 128, 0.04)', border: '1px solid rgba(192, 128, 128, 0.1)', outline: 'none', color: '#1F1F1F', fontWeight: '600' }}
                >
                  <option value="STUDENT">STUDENT</option>
                  <option value="LECTURER">FACULTY / LECTURER</option>
                  <option value="STAFF">UNIVERSITY STAFF</option>
                  <option value="TECHNICIAN">FACILITY TECHNICIAN</option>
                  <option value="ADMIN">ADMINISTRATOR</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '16px', borderRadius: '16px', background: 'transparent', border: '2px solid rgba(192, 128, 128, 0.1)', color: '#4B5563', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '16px', borderRadius: '16px', background: 'var(--accent-primary)', border: 'none', color: '#fff', fontWeight: '800', cursor: 'pointer', boxShadow: '0 8px 20px rgba(140, 0, 0, 0.2)' }}>{isEditing ? 'Update Details' : 'Authorize Account'}</button>
              </div>
            </form>
          </Reveal>
        </div>
      )}
      {/* ═══ MINIMAL SUCCESS MODAL ═══ */}
      {showSuccess && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, animation: 'fadeIn 0.3s ease-out' }}>
          <div style={{ background: '#FFFFFF', padding: '48px 40px', borderRadius: '40px', width: '90%', maxWidth: '420px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
              <Shield size={40} strokeWidth={2.5} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111827', margin: '0 0 12px 0', letterSpacing: '-0.5px' }}>Account Authorized</h2>
            <p style={{ color: '#6B7281', fontSize: '1.05rem', fontWeight: '500', marginBottom: '40px', lineHeight: '1.5' }}>{successMsg}</p>
            <button onClick={() => setShowSuccess(false)} style={{ background: 'none', border: 'none', color: '#111827', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer', padding: '10px 20px' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function FormInput({ placeholder, type = 'text', value, onChange, autoComplete = 'off', readOnly, style }) {
  return (
    <input 
      type={type} 
      placeholder={placeholder} 
      value={value} 
      onChange={e => onChange(e.target.value)}
      autoComplete={autoComplete}
      readOnly={readOnly}
      style={{ 
        width: '100%',
        boxSizing: 'border-box',
        padding: '14px 20px', 
        borderRadius: '14px', 
        background: 'rgba(192, 128, 128, 0.04)', 
        border: '1px solid rgba(192, 128, 128, 0.1)', 
        outline: 'none', 
        color: '#1F1F1F', 
        fontWeight: '600', 
        fontSize: '1rem',
        ...style
      }}
    />
  );
}
