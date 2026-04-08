import React from 'react';

export default function MostBookedTable({ data = [] }) {
  return (
    <div style={{ background: '#fff', padding: '30px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', marginBottom: '24px' }}>Top Performing Facilities (By Booking)</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              <th style={thStyle}>Resource Name</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Location</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Bookings Count</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={tdStyle}><strong>{item.name}</strong></td>
                <td style={tdStyle}><span style={badgeStyle}>{item.type.replace('_', ' ')}</span></td>
                <td style={tdStyle}>{item.building}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.05)', color: '#6366f1', fontWeight: 900 }}>
                        {item.count}
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

const thStyle = {
  textAlign: 'left',
  padding: '16px',
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  color: '#64748b',
  fontWeight: 800
};

const tdStyle = {
  padding: '16px',
  color: '#334155',
  fontSize: '0.9rem'
};

const badgeStyle = {
  fontSize: '0.7rem',
  fontWeight: 800,
  background: '#f1f5f9',
  padding: '4px 10px',
  borderRadius: '8px',
  color: '#475569',
  textTransform: 'uppercase'
};
