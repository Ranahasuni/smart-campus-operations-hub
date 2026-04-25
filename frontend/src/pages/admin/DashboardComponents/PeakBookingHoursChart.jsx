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

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

const COLORS = ['#C08080', '#4f46e5', '#4338ca', '#3730a3', '#312e81'];

export default function PeakBookingHoursChart({ data }) {
  // Convert object { "08:00": count } to array [{ name: '08:00', value: count }]
  const chartData = Object.entries(data || {}).map(([key, value]) => ({
    name: key,
    value: value
  }));

  return (
    <div style={{ background: 'rgba(192, 128, 128, 0.06)', padding: '30px', borderRadius: '32px', border: '1px solid rgba(192, 128, 128, 0.06)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)', height: '400px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#1F1F1F', margin: 0 }}>Peak Booking Hours</h3>
        <p style={{ fontSize: '0.85rem', color: '#6B7281', fontWeight: 600 }}>Hourly utilization intelligence for campus resources</p>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C08080" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#C08080" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(192, 128, 128, 0.06)" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }}
          />
          <Tooltip
            contentStyle={{
              background: '#FFFFFF',
              borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
              fontWeight: 800,
              padding: '12px',
              color: '#1F1F1F'
            }}
            itemStyle={{ color: '#C08080' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#C08080"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#colorValue)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
