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

import { Building2 } from 'lucide-react';
import { formatLongDate } from '../../../../utils/dateUtils';

export default function FacilityHeader({ name, building, type, floor }) {
  return (
    <div className="resource-detail-header-v2">
      <div className="flex items-center gap-2 text-indigo-400 mb-2">
        <Building2 size={16} />
        <span className="text-xs font-bold tracking-widest uppercase">{type.replace('_', ' ')}</span>
      </div>
      <h1 className="text-4xl font-black text-white mb-2">{name}</h1>
      <p className="text-slate-400 flex items-center gap-4">
        <span>Building {building}</span>
        <span className="opacity-30">|</span>
        <span>{floor} Floor</span>
      </p>
    </div>
  );
}
