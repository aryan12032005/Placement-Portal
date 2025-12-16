import React, { useEffect, useState } from 'react';
import { Api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { StatsChart } from '../../components/StatsChart';
import { User, Job, Application, ApplicationStatus } from '../../types';
import { Users, Building2, TrendingUp, CheckCircle, Check, Briefcase, UserPlus, FileText } from 'lucide-react';

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
  const { isDark } = useTheme();
  const [stats, setStats] = useState({ students: 0, companies: 0, jobs: 0, placed: 0 });
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [branchStats, setBranchStats] = useState<BranchStat[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

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
      if (aliases.some(a => branchLower.includes(a))) return key;
    }
    return null;
  };

  const loadData = async () => {
    const users = await Api.getAllUsers();
    const jobs = await Api.getJobs();
    const applications = await Api.getApplications();
    const activeJobs = jobs.filter(j => j.status !== 'Stopped');
    
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

    const branchCounts: { [key: string]: { total: number; placed: number } } = {
      'CS': { total: 0, placed: 0 }, 'IT': { total: 0, placed: 0 },
      'ECE': { total: 0, placed: 0 }, 'EEE': { total: 0, placed: 0 }, 'MECH': { total: 0, placed: 0 },
    };

    students.forEach(student => {
      const category = getBranchCategory(student.branch || '');
      if (category && branchCounts[category]) {
        branchCounts[category].total++;
        if (placedStudentIds.has(student.id)) branchCounts[category].placed++;
      }
    });

    setBranchStats(Object.entries(branchCounts).map(([name, data]) => ({ name, total: data.total, placed: data.placed })));

    const recentActivities: Activity[] = [];
    jobs.slice(-3).forEach(job => {
      recentActivities.push({ id: `job-${job.id}`, type: 'job', message: `${job.companyName} posted "${job.title}"`, timestamp: job.postedDate });
    });
    companies.slice(-2).forEach(company => {
      recentActivities.push({ id: `user-${company.id}`, type: 'user', message: `New company: ${company.companyName || company.name}`, timestamp: new Date().toISOString() });
    });
    applications.slice(-2).forEach(app => {
      recentActivities.push({ id: `app-${app.id}`, type: 'application', message: `${app.studentName} applied for ${app.jobTitle}`, timestamp: app.appliedDate });
    });
    recentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setActivities(recentActivities.slice(0, 5));
    setPendingUsers(users.filter(u => !u.approved && u.role !== 'ADMIN'));
  };

  useEffect(() => { loadData(); }, []);

  const handleApprove = async (userId: string) => {
    try { await Api.approveUser(userId); loadData(); } 
    catch (error: any) { alert(error.message || 'Failed to approve user'); }
  };

  const cards = [
    { label: 'Total Students', value: stats.students, icon: Users },
    { label: 'Companies', value: stats.companies, icon: Building2 },
    { label: 'Internships', value: stats.jobs, icon: Briefcase },
    { label: 'Offers Given', value: stats.placed, icon: CheckCircle },
  ];

  const cardClass = `${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cardClass + ' p-6'}>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Admin Dashboard</h1>
        <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Manage internships, users, and track progress</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((stat) => (
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

      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <div className={`${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} p-6 rounded-xl border`}>
          <div className="flex items-center gap-3 mb-4">
            <UserPlus className="text-amber-600" size={20} />
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>Pending Approvals</h2>
            <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">{pendingUsers.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className={`border-b ${isDark ? 'border-amber-800' : 'border-amber-200'}`}>
                  <th className={`pb-3 font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Name</th>
                  <th className={`pb-3 font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Email</th>
                  <th className={`pb-3 font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Role</th>
                  <th className={`pb-3 font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-amber-800' : 'divide-amber-100'}`}>
                {pendingUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="py-3"><span className={isDark ? 'text-white' : 'text-slate-800'}>{user.name || user.companyName}</span></td>
                    <td className={`py-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'COMPANY' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>{user.role}</span>
                    </td>
                    <td className="py-3">
                      <button onClick={() => handleApprove(user.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700">
                        <Check size={14} /> Approve
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
        <div className={cardClass + ' p-6'}>
          <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            <TrendingUp size={20} className="text-indigo-600" /> Branch-wise Placements
          </h2>
          <div className="h-64 w-full">
            <StatsChart data={branchStats} />
          </div>
        </div>
        
        {/* Recent Activities */}
        <div className={cardClass + ' p-6'}>
          <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            <FileText size={20} className="text-indigo-600" /> Recent Activities
          </h2>
          <div className="space-y-3">
            {activities.length > 0 ? activities.map((activity) => (
              <div key={activity.id} className={`flex gap-3 p-3 rounded-lg ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-indigo-50'}`}>
                  {activity.type === 'job' ? <Briefcase size={16} className={isDark ? 'text-slate-300' : 'text-indigo-600'} /> : 
                   activity.type === 'user' ? <UserPlus size={16} className={isDark ? 'text-slate-300' : 'text-indigo-600'} /> : 
                   <FileText size={16} className={isDark ? 'text-slate-300' : 'text-indigo-600'} />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${isDark ? 'text-white' : 'text-slate-700'}`}>{activity.message}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{new Date(activity.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
            )) : (
              <div className={`text-center py-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <FileText size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activities</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
