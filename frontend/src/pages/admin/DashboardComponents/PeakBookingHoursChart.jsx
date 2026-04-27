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
  // Ensure we have a full range of hours (08:00 to 22:00) even if data is missing
  const businessHours = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'
  ];

  const chartData = businessHours.map(hour => ({
    name: hour,
    value: data && data[hour] ? data[hour] : 0
  }));

  return (
    <div style={{ 
      background: '#F9FAFB', 
      padding: '30px', 
      borderRadius: '32px', 
      border: '1px solid rgba(0, 0, 0, 0.05)', 
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', 
      minHeight: '400px', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      <div style={{ marginBottom: '24px', flexShrink: 0 }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '950', color: '#111827', margin: 0 }}>Peak Booking Hours</h3>
        <p style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 600 }}>Hourly utilization intelligence for campus resources</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C08080" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#C08080" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0, 0, 0, 0.05)" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 700 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 700 }}
            domain={[0, 'auto']}
            padding={{ top: 20 }}
          />
          <Tooltip
            contentStyle={{
              background: '#FFFFFF',
              borderRadius: '16px', border: 'none',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              fontWeight: 800,
              padding: '12px',
              color: '#111827'
            }}
            itemStyle={{ color: '#C08080' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#C08080"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorValue)"
            animationDuration={1500}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#C08080' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
