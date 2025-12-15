import React, { useEffect, useState } from 'react';
import { Api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { StatsChart } from '../../components/StatsChart';
import { BarChart3, Users, Briefcase, TrendingUp, Building2, GraduationCap } from 'lucide-react';
import { User, Job, Application, UserRole, ApplicationStatus } from '../../types';

export const Stats: React.FC = () => {
  const { isDark } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    const load = async () => {
      const [usersData, jobsData, appsData] = await Promise.all([
        Api.getAllUsers(),
        Api.getJobs(),
        Api.getApplications()
      ]);
      setUsers(usersData);
      setJobs(jobsData);
      setApplications(appsData);
    };
    load();
  }, []);

  const students = users.filter(u => u.role === UserRole.STUDENT);
  const companies = users.filter(u => u.role === UserRole.COMPANY);

  // Compute branch stats from students
  const branchStats = students.reduce((acc: {name: string, placed: number, total: number}[], student) => {
    const branch = student.branch || 'Unknown';
    const existing = acc.find(b => b.name === branch);
    if (existing) {
      existing.total++;
    } else {
      acc.push({ name: branch, placed: 0, total: 1 });
    }
    return acc;
  }, []);

  const cardClass = `${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border`;

  const statCards = [
    { label: 'Total Students', value: students.length, icon: GraduationCap },
    { label: 'Total Companies', value: companies.length, icon: Building2 },
    { label: 'Total Jobs', value: jobs.length, icon: Briefcase },
    { label: 'Applications', value: applications.length, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cardClass + ' p-6'}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-indigo-50'}`}>
            <BarChart3 className={isDark ? 'text-slate-300' : 'text-indigo-600'} size={24} />
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Statistics</h1>
            <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Platform analytics and insights</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className={cardClass + ' p-5'}>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-indigo-50'}`}>
                <stat.icon className={isDark ? 'text-slate-300' : 'text-indigo-600'} size={20} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{stat.value}</p>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Branch Distribution Chart */}
      <div className={cardClass + ' p-6'}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
          Students by Branch
        </h2>
        {branchStats.length > 0 ? (
          <div className="h-80">
            <StatsChart data={branchStats} />
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center">
            <p className={isDark ? 'text-slate-500' : 'text-slate-400'}>No branch data available</p>
          </div>
        )}
      </div>

      {/* Platform Summary */}
      <div className={cardClass + ' p-6'}>
        <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
          Platform Summary
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Users size={18} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>User Breakdown</span>
            </div>
            <div className="space-y-1">
              <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                <span className="font-semibold text-indigo-600">{users.filter(u => u.approved).length}</span> approved users
              </p>
              <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                <span className="font-semibold text-amber-600">{users.filter(u => !u.approved).length}</span> pending approval
              </p>
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Briefcase size={18} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Job Status</span>
            </div>
            <div className="space-y-1">
              <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                <span className="font-semibold text-emerald-600">{jobs.length}</span> active jobs
              </p>
              <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                <span className="font-semibold text-slate-500">{applications.length}</span> total applications
              </p>
            </div>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
              <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Success Rate</span>
            </div>
            <div className="space-y-1">
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {applications.length > 0 
                  ? Math.round((applications.filter(a => a.status === ApplicationStatus.OFFERED).length / applications.length) * 100) 
                  : 0}%
              </p>
              <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>placement rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
