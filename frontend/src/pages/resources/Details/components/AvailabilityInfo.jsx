import React from 'react';

// -- Shared Animation Hooks ---------------------------------
function useScrollReveal() {
  const ref = React.useRef(null);
  React.useEffect(() => {
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
  return <div ref={ref} className={`hp-reveal `}>{children}</div>;
}

import { Clock, CheckCircle2, XCircle } from 'lucide-react';

export default function AvailabilityInfo({ availability }) {
  // HARD-CODED FORCE STYLES (FROM MAIN BRANCH)
  // UNIFIED DARK THEME STYLES
  const boxBackground = { background: 'var(--bg-tertiary)', borderRadius: '32px', padding: '28px', border: '1px solid var(--glass-border)', marginBottom: '32px' };
  const titleStyle = { color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: '800', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' };
  const cardStyle = { background: 'var(--bg-secondary)', borderRadius: '20px', padding: '16px', marginBottom: '14px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center' };
  const dayStyle = { color: 'var(--text-primary)', fontWeight: '800', fontSize: '0.85rem', width: '70px', flexShrink: 0, textAlign: 'center' };
  const timeStyle = { color: 'var(--accent-primary)', fontSize: '0.95rem', fontWeight: '800' };

  if (!availability || availability.length === 0) {
    return (
      <div style={boxBackground}>
        <h3 style={titleStyle}><Clock size={18} /> Weekly Schedule</h3>
        <p style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Waiting for operational data...</p>
      </div>
    );
  }

  return (
    <div style={boxBackground}>
      <h3 style={titleStyle}>
        <Clock size={20} color="#C08080" /> Weekly Schedule
      </h3>

      <div className="schedule-days-container">
        {availability.map((item) => (
          <div key={item.day} style={{ ...cardStyle, opacity: item.isAvailable ? 1 : 0.7 }}>
            {/* LEFT: DAY */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '70px' }}>
              <span style={dayStyle}>{item.day}</span>
              {item.isAvailable ? (
                <CheckCircle2 size={16} color="#22c55e" strokeWidth={3} />
              ) : (
                <XCircle size={16} color="#94a3b8" strokeWidth={3} />
              )}
            </div>

            {/* DIVIDER */}
            <div style={{ width: '1.5px', height: '40px', background: 'var(--glass-border)', margin: '0 16px' }} />

            {/* RIGHT: TIMES */}
            <div style={{ flexGrow: 1 }}>
              {item.isAvailable ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {item.slots?.map((slot, idx) => (
                    <div key={idx} style={timeStyle}>
                      {slot.startTime} — {slot.endTime}
                    </div>
                  ))}
                </div>
              ) : (
                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontWeight: '800' }}>NOT AVAILABLE</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
