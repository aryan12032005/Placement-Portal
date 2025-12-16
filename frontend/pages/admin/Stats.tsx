import React, { useEffect, useState } from 'react';
import { Api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { StatsChart } from '../../components/StatsChart';
import { 
  BarChart3, Users, Briefcase, TrendingUp, Building2, GraduationCap, 
  Target, Clock, CheckCircle, XCircle, Award, Calendar, PieChart, 
  Activity, ArrowUpRight, ArrowDownRight, Percent
} from 'lucide-react';
import { User, Job, Application, UserRole, ApplicationStatus } from '../../types';

export const Stats: React.FC = () => {
  const { isDark } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [usersData, jobsData, appsData] = await Promise.all([
        Api.getAllUsers(),
        Api.getJobs(),
        Api.getApplications()
      ]);
      setUsers(usersData);
      setJobs(jobsData);
      setApplications(appsData);
      setLoading(false);
    };
    load();
  }, []);

  const students = users.filter(u => u.role === UserRole.STUDENT);
  const companies = users.filter(u => u.role === UserRole.COMPANY);

  // Application stats
  const appliedCount = applications.filter(a => a.status === ApplicationStatus.APPLIED).length;
  const shortlistedCount = applications.filter(a => a.status === ApplicationStatus.SHORTLISTED).length;
  const offeredCount = applications.filter(a => a.status === ApplicationStatus.OFFERED).length;
  const rejectedCount = applications.filter(a => a.status === ApplicationStatus.REJECTED).length;

  // Compute branch stats from students
  const branchStats = students.reduce((acc: {name: string, placed: number, total: number}[], student) => {
    const branch = student.branch || 'Unknown';
    const existing = acc.find(b => b.name === branch);
    const isPlaced = applications.some(a => a.studentId === student.id && a.status === ApplicationStatus.OFFERED);
    if (existing) {
      existing.total++;
      if (isPlaced) existing.placed++;
    } else {
      acc.push({ name: branch, placed: isPlaced ? 1 : 0, total: 1 });
    }
    return acc;
  }, []);

  // Top internships by applications
  const internshipApplications = jobs.map(job => ({
    name: job.title.length > 20 ? job.title.substring(0, 20) + '...' : job.title,
    applications: applications.filter(a => a.jobId === job.id).length,
    company: job.companyName
  })).sort((a, b) => b.applications - a.applications).slice(0, 5);

  // Monthly application trends (mock data based on current applications)
  const currentMonth = new Date().getMonth();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
    const monthIndex = (currentMonth - 5 + i + 12) % 12;
    return {
      month: monthNames[monthIndex],
      count: Math.floor(Math.random() * 50) + 10 + (i * 5)
    };
  });

  const cardClass = `${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border`;

  const mainStats = [
    { label: 'Total Students', value: students.length, icon: GraduationCap, color: 'indigo', change: '+12%', up: true },
    { label: 'Companies', value: companies.length, icon: Building2, color: 'amber', change: '+5%', up: true },
    { label: 'Internships Posted', value: jobs.length, icon: Briefcase, color: 'emerald', change: '+8%', up: true },
    { label: 'Total Applications', value: applications.length, icon: TrendingUp, color: 'violet', change: '+23%', up: true },
  ];

  const applicationStats = [
    { label: 'Pending', value: appliedCount, icon: Clock, color: 'bg-slate-500' },
    { label: 'Shortlisted', value: shortlistedCount, icon: Target, color: 'bg-blue-500' },
    { label: 'Offered', value: offeredCount, icon: Award, color: 'bg-emerald-500' },
    { label: 'Rejected', value: rejectedCount, icon: XCircle, color: 'bg-red-500' },
  ];

  const placementRate = applications.length > 0 
    ? Math.round((offeredCount / applications.length) * 100) 
    : 0;

  const conversionRate = applications.length > 0 
    ? Math.round((shortlistedCount / applications.length) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 bg-white/20 backdrop-blur rounded-xl">
            <BarChart3 size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-white/80">Platform insights and performance metrics</p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((stat) => (
          <div key={stat.label} className={cardClass + ' p-5 hover:shadow-lg transition-shadow'}>
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-xl bg-${stat.color}-100`}>
                <stat.icon className={`text-${stat.color}-600`} size={22} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${stat.up ? 'text-emerald-600' : 'text-red-600'}`}>
                {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{stat.value}</p>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Application Status Breakdown */}
      <div className={cardClass + ' p-6'}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-indigo-50'}`}>
            <PieChart className={isDark ? 'text-slate-300' : 'text-indigo-600'} size={20} />
          </div>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Application Status Breakdown
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {applicationStats.map((stat) => (
            <div key={stat.label} className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="text-white" size={18} />
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{stat.value}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Application Pipeline</span>
            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{applications.length} total</span>
          </div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
            <div 
              className="bg-slate-500 transition-all" 
              style={{ width: `${applications.length > 0 ? (appliedCount / applications.length) * 100 : 0}%` }}
              title={`Pending: ${appliedCount}`}
            />
            <div 
              className="bg-blue-500 transition-all" 
              style={{ width: `${applications.length > 0 ? (shortlistedCount / applications.length) * 100 : 0}%` }}
              title={`Shortlisted: ${shortlistedCount}`}
            />
            <div 
              className="bg-emerald-500 transition-all" 
              style={{ width: `${applications.length > 0 ? (offeredCount / applications.length) * 100 : 0}%` }}
              title={`Offered: ${offeredCount}`}
            />
            <div 
              className="bg-red-500 transition-all" 
              style={{ width: `${applications.length > 0 ? (rejectedCount / applications.length) * 100 : 0}%` }}
              title={`Rejected: ${rejectedCount}`}
            />
          </div>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-slate-500 rounded"></span> Pending</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded"></span> Shortlisted</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded"></span> Offered</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded"></span> Rejected</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Key Metrics */}
        <div className={cardClass + ' p-6'}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-indigo-50'}`}>
              <Percent className={isDark ? 'text-slate-300' : 'text-indigo-600'} size={20} />
            </div>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Key Metrics
            </h2>
          </div>
          
          <div className="space-y-6">
            {/* Placement Rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Placement Rate</span>
                <span className={`text-2xl font-bold ${placementRate >= 50 ? 'text-emerald-600' : placementRate >= 25 ? 'text-amber-600' : 'text-red-600'}`}>
                  {placementRate}%
                </span>
              </div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${placementRate >= 50 ? 'bg-emerald-500' : placementRate >= 25 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${placementRate}%` }}
                />
              </div>
            </div>

            {/* Shortlist Conversion */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Shortlist Rate</span>
                <span className={`text-2xl font-bold text-blue-600`}>
                  {conversionRate}%
                </span>
              </div>
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${conversionRate}%` }} />
              </div>
            </div>

            {/* Avg Applications per Internship */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Avg Applications per Internship</span>
                <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {jobs.length > 0 ? Math.round(applications.length / jobs.length) : 0}
                </span>
              </div>
            </div>

            {/* Active Users */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
              <div className="flex justify-between items-center">
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Approved Users</span>
                <span className={`text-2xl font-bold text-emerald-600`}>
                  {users.filter(u => u.approved).length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Internships */}
        <div className={cardClass + ' p-6'}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-indigo-50'}`}>
              <Briefcase className={isDark ? 'text-slate-300' : 'text-indigo-600'} size={20} />
            </div>
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Top Internships by Applications
            </h2>
          </div>
          
          <div className="space-y-3">
            {internshipApplications.length > 0 ? internshipApplications.map((item, index) => (
              <div key={index} className={`flex items-center gap-4 p-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${
                  index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-slate-400' : index === 2 ? 'bg-amber-700' : 'bg-slate-500'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.name}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.company}</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.applications}</p>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>applications</p>
                </div>
              </div>
            )) : (
              <div className={`text-center py-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <Briefcase size={32} className="mx-auto mb-2 opacity-50" />
                <p>No internships yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Branch Distribution Chart */}
      <div className={cardClass + ' p-6'}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-indigo-50'}`}>
            <Activity className={isDark ? 'text-slate-300' : 'text-indigo-600'} size={20} />
          </div>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Students by Branch (with Placement Status)
          </h2>
        </div>
        {branchStats.length > 0 ? (
          <div className="h-80">
            <StatsChart data={branchStats} />
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center">
            <div className={`text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <GraduationCap size={48} className="mx-auto mb-2 opacity-50" />
              <p>No branch data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`${cardClass} p-4 text-center`}>
          <Calendar className={`mx-auto mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} size={24} />
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Active Since</p>
          <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Dec 2024</p>
        </div>
        <div className={`${cardClass} p-4 text-center`}>
          <CheckCircle className="mx-auto mb-2 text-emerald-500" size={24} />
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Success Stories</p>
          <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{offeredCount}</p>
        </div>
        <div className={`${cardClass} p-4 text-center`}>
          <Users className={`mx-auto mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} size={24} />
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Pending Approvals</p>
          <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{users.filter(u => !u.approved).length}</p>
        </div>
        <div className={`${cardClass} p-4 text-center`}>
          <TrendingUp className="mx-auto mb-2 text-indigo-500" size={24} />
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Growth Rate</p>
          <p className={`font-bold text-emerald-600`}>+23%</p>
        </div>
      </div>
    </div>
  );
};
