import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BranchData {
  name: string;
  placed: number;
  total: number;
}

interface StatsChartProps {
  data?: BranchData[];
}

const defaultData: BranchData[] = [
  { name: 'CS', placed: 0, total: 0 },
  { name: 'IT', placed: 0, total: 0 },
  { name: 'ECE', placed: 0, total: 0 },
  { name: 'EEE', placed: 0, total: 0 },
  { name: 'MECH', placed: 0, total: 0 },
];

export const StatsChart: React.FC<StatsChartProps> = ({ data = defaultData }) => {
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