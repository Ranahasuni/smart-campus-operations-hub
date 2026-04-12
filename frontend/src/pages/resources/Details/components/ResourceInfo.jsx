import { Users, Building, MapPin, AlertTriangle, CheckCircle, Settings, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ResourceInfo({ resource, activeIssueTicket }) {
  const statusMap = {
    'ACTIVE': { label: 'ONLINE', bg: '#22c55e', icon: <CheckCircle size={14} /> },
    'MAINTENANCE': { label: 'MAINTENANCE', bg: '#f59e0b', icon: <Settings size={14} /> },
    'OUT_OF_SERVICE': { label: 'OFFLINE', bg: '#ef4444', icon: <Info size={14} /> }
  };

  const statusCfg = statusMap[resource.status] || { label: resource.status, bg: '#64748b', icon: null };

  const statCardStyle = {
    background: 'var(--bg-tertiary)',
    padding: '24px',
    borderRadius: '24px',
    border: '1px solid var(--glass-border)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: 'var(--shadow-md)'
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ padding: '8px 18px', background: 'var(--bg-elevated)', color: 'var(--accent-primary)', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '900', border: '1.5px solid var(--accent-primary)' }}>
          {resource.type?.replace(/_/g, ' ') || 'FACILITY'}
        </span>
        <span style={{ 
          padding: '8px 18px', 
          background: statusCfg.bg, 
          color: 'white', 
          borderRadius: '99px', 
          fontSize: '0.65rem', 
          fontWeight: '900', 
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          {statusCfg.label === 'ONLINE' && <span className="dot-white pulsing"></span>}
          {statusCfg.icon} {statusCfg.label}
        </span>
        {/* SMART TICKET LINK: Show in Active or Maintenance states */}
        {(resource.status === 'ACTIVE' || resource.status === 'MAINTENANCE') && (
          <Link
            to={`/tickets/new?resourceId=${resource.id}&resourceName=${encodeURIComponent(resource.name)}`}
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
          >
            <div style={{ padding: '8px 18px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '900', border: '1.5px solid #ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={14} /> Report Issue?
            </div>
          </Link>
        )}
      </div>

      <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-primary)', margin: '15px 0', lineHeight: '1.2' }}>
        {resource.name}
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '30px', fontWeight: '500' }}>
        {resource.description}
      </p>

      <div style={{ height: '1.5px', background: 'var(--glass-border)', width: '100%', marginBottom: '30px', opacity: 0.5 }}></div>

      {/* STATS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>

        {/* CAPACITY */}
        <div style={statCardStyle}>
          <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '14px', border: '1px solid var(--glass-border)', color: 'var(--accent-secondary)', display: 'flex' }}>
            <Users size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CAPACITY</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '1.15rem' }}>{resource.capacity} Seats</span>
          </div>
        </div>

        {/* BUILDING */}
        <div style={statCardStyle}>
          <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '14px', border: '1px solid var(--glass-border)', color: 'var(--accent-primary)', display: 'flex' }}>
            <Building size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>BUILDING</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '1.15rem' }}>{resource.building}</span>
          </div>
        </div>

        {/* LOCATION */}
        <div style={statCardStyle}>
          <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '14px', border: '1px solid var(--glass-border)', color: 'var(--success)', display: 'flex' }}>
            <MapPin size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: 'var(--accent-primary)', fontWeight: '700', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>FLOOR & ROOM</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '1.1rem' }}>
              {resource.floor === 1 ? '1st' : resource.floor === 2 ? '2nd' : resource.floor === 3 ? '3rd' : `${resource.floor}th`} Floor, Room {resource.roomNumber}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
