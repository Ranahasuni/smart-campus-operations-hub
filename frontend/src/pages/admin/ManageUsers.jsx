import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Shield, Search, Trash2, Edit2, Lock, Unlock, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ManageUsers() {
  const { user: currentUser, authFetch } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    campusId: '',
    campusEmail: '',
    password: '',
    role: 'STUDENT'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await authFetch('http://localhost:8081/users');
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
    
    try {
      const res = await authFetch('http://localhost:8081/users', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        setUsers([...users, data]);
        setShowModal(false);
        setFormData({ fullName: '', campusId: '', campusEmail: '', password: '', role: 'STUDENT' });
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
      const res = await authFetch(`http://localhost:8081/users/${id}/status`, {
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
      const res = await authFetch(`http://localhost:8081/users/${id}`, { method: 'DELETE' });
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

  const changeRole = async (id, newRole) => {
    try {
      const res = await authFetch(`http://localhost:8081/users/${id}`, {
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
    <div style={{ padding: '80px', textAlign: 'center', color: '#64748b' }}>
      <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 1rem' }} />
      <p>Loading users...</p>
    </div>
  );

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.5rem' }}>Account Management</h1>
          <p style={{ color: '#94a3b8' }}>Manage user access, roles, and security status ({users.length} total users)</p>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '10px 12px 10px 40px',
                color: '#fff',
                width: '240px',
                outline: 'none'
              }}
            />
          </div>
          
          <button 
            onClick={() => setShowModal(true)}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: '#fff', border: 'none', borderRadius: '12px', padding: '10px 20px',
              fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
            }}
          >
            <User size={18} /> Add User
          </button>
        </div>
      </header>

      {/* Add User Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(8px)'
        }}>
          <form onSubmit={handleAddUser} autoComplete="off" style={{
            background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px',
            padding: '32px', width: '450px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ color: '#fff', marginBottom: '24px', fontSize: '1.5rem' }}>Create New Account</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input 
                placeholder="Full Name" required autoComplete="off"
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              />
              <input 
                placeholder="Campus ID (e.g. STU123)" required autoComplete="off"
                value={formData.campusId}
                onChange={e => setFormData({...formData, campusId: e.target.value})}
                style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              />
              <input 
                placeholder="Campus Email" required type="email" autoComplete="off"
                value={formData.campusEmail}
                onChange={e => setFormData({...formData, campusEmail: e.target.value})}
                style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              />
              <input 
                placeholder="Initial Password" required type="password" autoComplete="new-password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              />
              <select 
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              >
                <option value="STUDENT">STUDENT</option>
                <option value="LECTURER">LECTURER</option>
                <option value="STAFF">STAFF</option>
                <option value="TECHNICIAN">TECHNICIAN</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button 
                type="button" 
                onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                type="submit"
                style={{ flex: 1, padding: '12px', borderRadius: '10px', background: '#6366f1', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#f87171', display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '1.5rem' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      <div style={{ 
        background: 'rgba(15, 23, 42, 0.5)', 
        borderRadius: '20px', 
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '16px 24px', color: '#cbd5e1', fontWeight: '600' }}>User / Campus ID</th>
              <th style={{ padding: '16px 24px', color: '#cbd5e1', fontWeight: '600' }}>Role</th>
              <th style={{ padding: '16px 24px', color: '#cbd5e1', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '16px 24px', color: '#cbd5e1', fontWeight: '600' }}>Last Login</th>
              <th style={{ padding: '16px 24px', color: '#cbd5e1', fontWeight: '600', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '600' }}>
                      {user.fullName?.[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ color: '#f8fafc', fontWeight: '500' }}>{user.fullName}</div>
                      <div style={{ color: '#64748b', fontSize: '0.875rem' }}>{user.campusEmail} • <span style={{ color: '#818cf8' }}>{user.campusId}</span></div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <select 
                    value={user.role}
                    onChange={(e) => changeRole(user.id, e.target.value)}
                    disabled={user.id === currentUser?.id}
                    title={user.id === currentUser?.id ? "You cannot change your own role" : ""}
                    style={{ 
                      padding: '4px 10px', 
                      borderRadius: '8px', 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold',
                      background: user.role === 'ADMIN' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                      color: user.role === 'ADMIN' ? '#fbbf24' : '#818cf8',
                      border: user.role === 'ADMIN' ? '1px solid rgba(234, 179, 8, 0.2)' : '1px solid rgba(99, 102, 241, 0.2)',
                      outline: 'none',
                      cursor: user.id === currentUser?.id ? 'not-allowed' : 'pointer',
                      opacity: user.id === currentUser?.id ? 0.5 : 1
                    }}
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="LECTURER">LECTURER</option>
                    <option value="STAFF">STAFF</option>
                    <option value="TECHNICIAN">TECHNICIAN</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ 
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: user.status === 'ACTIVE' ? '#22c55e' : (user.status === 'LOCKED' ? '#ef4444' : '#64748b')
                    }} />
                    <span style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>{user.status}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '0.875rem' }}>
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  {user.id !== currentUser?.id ? (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button 
                        onClick={() => toggleStatus(user.id, user.status)}
                        style={{ 
                          padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                          background: 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer', fontSize: '0.75rem'
                        }}
                      >
                        {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        onClick={() => deleteUser(user.id, user.fullName)}
                        style={{ 
                          padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)',
                          background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#475569', fontStyle: 'italic' }}>Current Session</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
