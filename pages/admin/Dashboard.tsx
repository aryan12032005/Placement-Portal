import React, { useEffect, useState } from 'react';
import { Api } from '../../services/api';
import { StatsChart } from '../../components/StatsChart';
import { User, Job } from '../../types';
import { Users, Building2, TrendingUp, CheckCircle } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    students: 0,
    companies: 0,
    jobs: 0,
    placed: 12 // Mock placed count
  });

  useEffect(() => {
    const load = async () => {
      const users = await Api.getAllUsers();
      const jobs = await Api.getJobs();
      
      setStats({
        students: users.filter(u => u.role === 'STUDENT').length,
        companies: users.filter(u => u.role === 'COMPANY').length,
        jobs: jobs.length,
        placed: 15 // Mock data for demo
      });
    };
    load();
  }, []);

  const cards = [
    { label: 'Total Students', value: stats.students, icon: Users, color: 'bg-blue-500' },
    { label: 'Registered Companies', value: stats.companies, icon: Building2, color: 'bg-orange-500' },
    { label: 'Jobs Posted', value: stats.jobs, icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Students Placed', value: stats.placed, icon: CheckCircle, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">TPO Administrator Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cards.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`${stat.color} p-4 rounded-lg text-white`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Placement Statistics (Branch-wise)</h2>
          <div className="h-64 w-full">
            <StatsChart />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Activities</h2>
          <div className="space-y-4">
             <div className="flex gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <p className="text-slate-600">Tech Corp posted a new job "Software Engineer I".</p>
             </div>
             <div className="flex gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                <p className="text-slate-600">John Doe updated their profile.</p>
             </div>
             <div className="flex gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                <p className="text-slate-600">New Company registration: "Innovate AI".</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};