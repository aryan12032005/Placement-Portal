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

      {/* Pending Approvals Section */}
      {pendingUsers.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Pending Approvals</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 font-semibold text-slate-600">Name</th>
                  <th className="pb-3 font-semibold text-slate-600">Email</th>
                  <th className="pb-3 font-semibold text-slate-600">Role</th>
                  <th className="pb-3 font-semibold text-slate-600">Details</th>
                  <th className="pb-3 font-semibold text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-slate-50">
                    <td className="py-3">{user.name || user.companyName}</td>
                    <td className="py-3 text-slate-500">{user.email}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'COMPANY' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-slate-500">
                      {user.role === 'COMPANY' ? user.industry : `${user.branch} (${user.rollNumber})`}
                    </td>
                    <td className="py-3">
                      <button 
                        onClick={() => handleApprove(user.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Placement Statistics (Branch-wise)</h2>
          <div className="h-64 w-full">
            <StatsChart data={branchStats} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex gap-3 text-sm">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'job' ? 'bg-blue-500' : 
                    activity.type === 'user' ? 'bg-orange-500' : 'bg-green-500'
                  }`}></div>
                  <div>
                    <p className="text-slate-600">{activity.message}</p>
                    <p className="text-xs text-slate-400">{new Date(activity.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm">No recent activities</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};