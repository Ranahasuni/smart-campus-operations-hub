import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Shield, Search, Trash2, Edit2, Lock, Unlock, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ManageUsers() {
  const { authFetch } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await authFetch('http://localhost:8081/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'LOCKED' || currentStatus === 'DISABLED' ? 'ACTIVE' : 'LOCKED';
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

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action is IRREVERSIBLE.')) return;
    try {
      const res = await authFetch(`http://localhost:8081/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
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
        
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input 
            type="text" 
            placeholder="Search ID, email or name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '12px 12px 12px 40px',
              color: '#fff',
              width: '300px',
              outline: 'none'
            }}
          />
        </div>
      </header>

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
                    style={{ 
                      padding: '4px 10px', 
                      borderRadius: '8px', 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold',
                      background: user.role === 'ADMIN' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                      color: user.role === 'ADMIN' ? '#fbbf24' : '#818cf8',
                      border: user.role === 'ADMIN' ? '1px solid rgba(234, 179, 8, 0.2)' : '1px solid rgba(99, 102, 241, 0.2)',
                      outline: 'none',
                      cursor: 'pointer'
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
                <td style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '0.875rem' }}>
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button 
                      onClick={() => toggleStatus(user.id, user.status)}
                      title={user.status === 'ACTIVE' ? 'Lock Account' : 'Unlock Account'}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                    >
                      {user.status === 'ACTIVE' ? <Lock size={18} /> : <Unlock size={18} color="#22c55e" />}
                    </button>
                    
                    <button 
                      onClick={() => deleteUser(user.id)}
                      title="Delete User"
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
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
    </div>
  );
}
