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

import { Clock } from 'lucide-react';

export default function OccupancyTimeline({ bookings }) {
  return (
    <div className="occupancy-timeline-v2">
      {bookings.length > 0 ? (
        bookings.map((b) => (
          <div key={b.id} className="timeline-slot-item">
             <div className="time-range">{b.startTime.substring(0, 5)} - {b.endTime.substring(0, 5)}</div>
             <div className="status-label reserved">Reserved</div>
          </div>
        ))
      ) : (
        <div className="all-clear-message">Fully Available for Selection</div>
      )}
    </div>
  );
}
