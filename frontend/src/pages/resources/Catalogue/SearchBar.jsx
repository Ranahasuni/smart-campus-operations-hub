import React from 'react';
import { Search } from 'lucide-react';

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

import './Catalogue.css';

export default function SearchBar({ searchParams, updateParams }) {
  const handleChange = (e) => {
    updateParams('name', e.target.value);
  };

  return (
    <div className="search-bar-container">
      <Search className="search-icon" size={22} />
      <input
        type="text"
        className="search-input"
        placeholder="Search by name..."
        value={searchParams.name || ''}
        onChange={handleChange}
      />
    </div>
  );
}
