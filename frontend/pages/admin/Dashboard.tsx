import React, { useEffect, useState } from 'react';
import { Api } from '../../services/api';
import { StatsChart } from '../../components/StatsChart';
import { User, Job, Application, ApplicationStatus } from '../../types';
import { Users, Building2, TrendingUp, CheckCircle, Check, X, Briefcase, UserPlus, FileText } from 'lucide-react';

interface Activity {
  id: string;
  type: 'job' | 'user' | 'application';
  message: string;
  timestamp: string;
}

interface BranchStat {
  name: string;
  placed: number;
  total: number;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    students: 0,
    companies: 0,
    jobs: 0,
    placed: 0
  });
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [branchStats, setBranchStats] = useState<BranchStat[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Branch aliases for matching
  const branchAliases: { [key: string]: string[] } = {
    'CS': ['cse', 'cs', 'computer', 'btech cse', 'computer science'],
    'IT': ['it', 'infotech', 'btech it', 'information technology'],
    'ECE': ['ece', 'electronics', 'electronics and communication'],
    'EEE': ['eee', 'electrical', 'electrical engineering'],
    'MECH': ['mech', 'me', 'mechanical', 'mechanical engineering'],
  };

  const getBranchCategory = (branch: string): string | null => {
    const branchLower = (branch || '').toLowerCase();
    for (const [key, aliases] of Object.entries(branchAliases)) {
      if (aliases.some(a => branchLower.includes(a))) {
        return key;
      }
    }
    return null;
  };

  const loadData = async () => {
    const users = await Api.getAllUsers();
    const jobs = await Api.getJobs();
    const applications = await Api.getApplications();
    const activeJobs = jobs.filter(j => j.status !== 'Stopped');
    
    // Count placed students (those with OFFERED status)
    const placedStudentIds = new Set(
      applications.filter(a => a.status === ApplicationStatus.OFFERED).map(a => a.studentId)
    );
    
    const students = users.filter(u => u.role === 'STUDENT');
    const companies = users.filter(u => u.role === 'COMPANY');
    
    setStats({
      students: students.length,
      companies: companies.length,
      jobs: activeJobs.length,
      placed: placedStudentIds.size
    });

    // Calculate branch-wise stats
    const branchCounts: { [key: string]: { total: number; placed: number } } = {
      'CS': { total: 0, placed: 0 },
      'IT': { total: 0, placed: 0 },
      'ECE': { total: 0, placed: 0 },
      'EEE': { total: 0, placed: 0 },
      'MECH': { total: 0, placed: 0 },
    };

    students.forEach(student => {
      const category = getBranchCategory(student.branch || '');
      if (category && branchCounts[category]) {
        branchCounts[category].total++;
        if (placedStudentIds.has(student.id)) {
          branchCounts[category].placed++;
        }
      }
    });

    setBranchStats(
      Object.entries(branchCounts).map(([name, data]) => ({
        name,
        total: data.total,
        placed: data.placed
      }))
    );

    // Build recent activities from real data
    const recentActivities: Activity[] = [];
    
    // Add recent jobs
    jobs.slice(-3).forEach(job => {
      recentActivities.push({
        id: `job-${job.id}`,
        type: 'job',
        message: `${job.companyName} posted a new job "${job.title}"`,
        timestamp: job.postedDate
      });
    });

    // Add recent registrations
    companies.slice(-2).forEach(company => {
      recentActivities.push({
        id: `user-${company.id}`,
        type: 'user',
        message: `New company registration: "${company.companyName || company.name}"`,
        timestamp: new Date().toISOString()
      });
    });

    // Add recent applications
    applications.slice(-2).forEach(app => {
      recentActivities.push({
        id: `app-${app.id}`,
        type: 'application',
        message: `${app.studentName} applied for ${app.jobTitle}`,
        timestamp: app.appliedDate
      });
    });

    // Sort by timestamp and take latest 5
    recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setActivities(recentActivities.slice(0, 5));

    setPendingUsers(users.filter(u => !u.approved && u.role !== 'ADMIN'));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      await Api.approveUser(userId);
      // Refresh data
      loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to approve user');
    }
  };

  const cards = [
    { 
      label: 'Total Students', 
      value: stats.students, 
      icon: Users, 
      gradient: 'from-blue-600 via-blue-500 to-cyan-400',
      glow: 'shadow-blue-500/25',
      iconBg: 'bg-blue-500',
      ring: 'ring-blue-400/30'
    },
    { 
      label: 'Companies', 
      value: stats.companies, 
      icon: Building2, 
      gradient: 'from-amber-500 via-orange-500 to-yellow-400',
      glow: 'shadow-orange-500/25',
      iconBg: 'bg-orange-500',
      ring: 'ring-orange-400/30'
    },
    { 
      label: 'Jobs Posted', 
      value: stats.jobs, 
      icon: Briefcase, 
      gradient: 'from-purple-600 via-pink-500 to-rose-400',
      glow: 'shadow-purple-500/25',
      iconBg: 'bg-purple-500',
      ring: 'ring-purple-400/30'
    },
    { 
      label: 'Placed', 
      value: stats.placed, 
      icon: CheckCircle, 
      gradient: 'from-emerald-600 via-emerald-500 to-teal-400',
      glow: 'shadow-emerald-500/25',
      iconBg: 'bg-emerald-500',
      ring: 'ring-emerald-400/30'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard 🎯</h1>
          <p className="text-white/80 text-lg">Manage placements, users, and track progress</p>
        </div>
      </div>
      
      {/* Stats Grid - Premium Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((stat, index) => (
          <div 
            key={stat.label} 
            className={`relative group cursor-pointer`}
          >
            {/* Animated gradient border */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-2xl opacity-0 group-hover:opacity-100 blur transition-all duration-500`}></div>
            
            {/* Card content */}
            <div className={`relative bg-white rounded-2xl p-6 shadow-xl ${stat.glow} shadow-2xl ring-1 ${stat.ring} hover:shadow-2xl transition-all duration-300 group-hover:translate-y-[-2px]`}>
              {/* Background pattern */}
              <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
                <div className={`w-full h-full bg-gradient-to-br ${stat.gradient} rounded-full blur-2xl`}></div>
              </div>
              
              {/* Icon with animated ring */}
              <div className="relative mb-4">
                <div className={`absolute inset-0 ${stat.iconBg} rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity`}></div>
                <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <stat.icon size={26} strokeWidth={2.5} />
                </div>
              </div>
              
              {/* Value with gradient text */}
              <div className="relative">
                <p className={`text-4xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
                <p className="text-slate-600 font-semibold mt-1 tracking-wide">{stat.label}</p>
              </div>
              
              {/* Hover indicator */}
              <div className={`absolute bottom-3 right-3 w-2 h-2 rounded-full bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Approvals Section */}
      {pendingUsers.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl shadow-lg border border-amber-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white">
              <UserPlus size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Pending Approvals</h2>
            <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {pendingUsers.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-amber-200">
                  <th className="pb-3 font-semibold text-slate-600">Name</th>
                  <th className="pb-3 font-semibold text-slate-600">Email</th>
                  <th className="pb-3 font-semibold text-slate-600">Role</th>
                  <th className="pb-3 font-semibold text-slate-600">Details</th>
                  <th className="pb-3 font-semibold text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {pendingUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-amber-100/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold">
                          {(user.name || user.companyName || 'U').charAt(0)}
                        </div>
                        <span className="font-semibold text-slate-800">{user.name || user.companyName}</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-500">{user.email}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'COMPANY' ? 'bg-orange-100 text-orange-700 border border-orange-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-slate-500">
                      {user.role === 'COMPANY' ? user.industry : `${user.branch} (${user.rollNumber})`}
                    </td>
                    <td className="py-4">
                      <button 
                        onClick={() => handleApprove(user.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:shadow-lg transition-all font-medium text-sm"
                      >
                        <Check size={16} /> Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch Stats */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white">
              <TrendingUp size={18} />
            </div>
            Branch-wise Placements
          </h2>
          <div className="h-64 w-full">
            <StatsChart data={branchStats} />
          </div>
        </div>
        
        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white">
              <FileText size={18} />
            </div>
            Recent Activities
          </h2>
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                    activity.type === 'job' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 
                    activity.type === 'user' ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-gradient-to-r from-emerald-500 to-green-500'
                  }`}>
                    {activity.type === 'job' ? <Briefcase size={18} /> : 
                     activity.type === 'user' ? <UserPlus size={18} /> : <FileText size={18} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-700 font-medium">{activity.message}</p>
                    <p className="text-xs text-slate-400">{new Date(activity.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400">
                <FileText size={32} className="mx-auto mb-2 opacity-50" />
                <p>No recent activities</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};