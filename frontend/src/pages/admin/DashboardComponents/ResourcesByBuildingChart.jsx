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

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#C08080', '#10b981', '#f59e0b', '#ef4444', '#A86A6A', '#ec4899'];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 25; // Adjusted radius gap
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Professional Label Mapping - Direct Replacement
  let displayName = name.toUpperCase().trim();
  
  if (displayName.includes('- I') || displayName.includes('BUILDING 1') || displayName === 'NEW BUILDING 1') {
    displayName = 'NEW BUILDING - F BLOCK';
  }

  return (
    <text 
      x={x} 
      y={y} 
      fill="#64748b" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      style={{ fontSize: '0.65rem', fontWeight: 800, fontFamily: 'Inter, sans-serif' }}
    >
      {displayName}
    </text>
  );
};

export default function ResourcesByBuildingChart({ data, isDark }) {
  // Sort and Map Data for Tooltip consistency
  const chartData = Object.entries(data || {})
    .map(([key, value]) => {
      let displayName = key.toUpperCase().trim();
      if (displayName.includes('- I') || displayName.includes('BUILDING 1') || displayName === 'NEW BUILDING 1') {
        displayName = 'NEW BUILDING - F BLOCK';
      }
      return { name: displayName, value: value };
    })
    .sort((a, b) => b.value - a.value);

  return (
    <div style={{ 
      background: 'rgba(192, 128, 128, 0.06)', 
      padding: '30px', 
      borderRadius: '32px', 
      border: '1px solid rgba(192, 128, 128, 0.06)', 
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)', 
      height: '400px',
      backdropFilter: 'blur(10px)',
      position: 'relative'
    }}>
      <div style={{ marginBottom: '15px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#1F1F1F', margin: 0, letterSpacing: '-0.5px' }}>
          Building-Wide Asset Distribution
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#6B7281', fontWeight: 600, marginTop: '4px' }}>
          Spatial analysis of campus resource allocation
        </p>
      </div>

      <ResponsiveContainer width="100%" height="80%">
        <PieChart margin={{ left: 20, right: 20 }}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={0}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            stroke="#FFFFFF"
            strokeWidth={3}
            label={(props) => renderCustomizedLabel({ ...props, isDark: true })}
            labelLine={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1.5 }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              fontWeight: 900,
              background: '#FFFFFF',
              color: '#1F1F1F',
              fontSize: '0.8rem'
            }} 
            itemStyle={{ color: '#1F1F1F' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
