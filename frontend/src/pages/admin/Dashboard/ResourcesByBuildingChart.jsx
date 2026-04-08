import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function ResourcesByBuildingChart({ data }) {
  const chartData = Object.entries(data || {}).map(([key, value]) => ({
    name: key,
    value: value
  }));

  return (
    <div style={{ background: '#fff', padding: '30px', borderRadius: '32px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', height: '400px' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', marginBottom: '24px' }}>Distribution by Building</h3>
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              borderRadius: '12px', border: 'none', 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              fontWeight: 700
            }} 
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle" 
            wrapperStyle={{ paddingTop: '20px', fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }} 
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
