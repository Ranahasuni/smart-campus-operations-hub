import React from 'react';
import { Building2, CheckCircle2, AlertTriangle, XCircle, Home } from 'lucide-react';

export default function SummaryCards({ stats }) {
  const cards = [
    {
      title: 'Total Resources',
      value: stats.totalResources || 0,
      icon: <Home size={24} />,
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.1)'
    },
    {
      title: 'Active Assets',
      value: stats.activeResources || 0,
      icon: <CheckCircle2 size={24} />,
      color: '#22c55e',
      bg: 'rgba(34, 197, 94, 0.1)'
    },
    {
      title: 'In Maintenance',
      value: stats.maintenanceResources || 0,
      icon: <AlertTriangle size={24} />,
      color: '#eab308',
      bg: 'rgba(234, 179, 8, 0.1)'
    },
    {
      title: 'Out of Service',
      value: stats.outOfServiceResources || 0,
      icon: <XCircle size={24} />,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.1)'
    }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
      {cards.map((card, i) => (
        <div key={i} style={{ 
          background: '#fff', 
          padding: '24px', 
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: '600', marginBottom: '8px' }}>{card.title}</p>
              <h3 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>{card.value}</h3>
            </div>
            <div style={{ 
              width: '48px', height: '48px', borderRadius: '14px', 
              background: card.bg, color: card.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
