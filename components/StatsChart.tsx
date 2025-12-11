import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'CS', placed: 45, total: 60 },
  { name: 'IT', placed: 35, total: 50 },
  { name: 'ECE', placed: 25, total: 55 },
  { name: 'EEE', placed: 15, total: 40 },
  { name: 'MECH', placed: 10, total: 45 },
];

export const StatsChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip cursor={{fill: 'transparent'}} />
        <Bar dataKey="total" fill="#e2e8f0" name="Total Students" radius={[4, 4, 0, 0]} />
        <Bar dataKey="placed" fill="#3b82f6" name="Placed" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};