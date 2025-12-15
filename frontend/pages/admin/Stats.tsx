import React, { useEffect, useState } from 'react';
import { Api } from '../../services/api';
import { User, Job, Application, ApplicationStatus } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Users, Briefcase, Award, IndianRupee, Building2, GraduationCap, Target, CheckCircle } from 'lucide-react';

interface PlacementStats {
  totalStudents: number;
  placedStudents: number;
  placementRate: number;
  totalCompanies: number;
  activeCompanies: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  avgPackage: number;
  highestPackage: number;
  lowestPackage: number;
}

export const StatsPage: React.FC = () => {
  const [stats, setStats] = useState<PlacementStats>({
    totalStudents: 0,
    placedStudents: 0,
    placementRate: 0,
    totalCompanies: 0,
    activeCompanies: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    avgPackage: 0,
    highestPackage: 0,
    lowestPackage: 0
  });
  const [branchData, setBranchData] = useState<any[]>([]);
  const [companyData, setCompanyData] = useState<any[]>([]);
  const [packageData, setPackageData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const branchAliases: { [key: string]: string[] } = {
    'CS': ['cse', 'cs', 'computer', 'btech cse', 'computer science'],
    'IT': ['it', 'infotech', 'btech it', 'information technology'],
    'ECE': ['ece', 'electronics', 'electronics and communication'],
    'EEE': ['eee', 'electrical', 'electrical engineering'],
    'MECH': ['mech', 'me', 'mechanical', 'mechanical engineering'],
    'CIVIL': ['civil', 'ce', 'civil engineering'],
  };

  const getBranchCategory = (branch: string): string => {
    const branchLower = (branch || '').toLowerCase();
    for (const [key, aliases] of Object.entries(branchAliases)) {
      if (aliases.some(a => branchLower.includes(a))) {
        return key;
      }
    }
    return 'Other';
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const users = await Api.getAllUsers();
      const jobs = await Api.getJobs();
      const applications = await Api.getApplications();

      const students = users.filter(u => u.role === 'STUDENT');
      const companies = users.filter(u => u.role === 'COMPANY');
      const activeJobs = jobs.filter(j => j.status !== 'Stopped');

      // Placed students
      const placedStudentIds = new Set(
        applications.filter(a => a.status === ApplicationStatus.OFFERED).map(a => a.studentId)
      );

      // Package stats from jobs
      const packages = jobs.map(j => j.package).filter(p => p > 0);
      const avgPkg = packages.length > 0 ? packages.reduce((a, b) => a + b, 0) / packages.length : 0;
      const highPkg = packages.length > 0 ? Math.max(...packages) : 0;
      const lowPkg = packages.length > 0 ? Math.min(...packages) : 0;

      setStats({
        totalStudents: students.length,
        placedStudents: placedStudentIds.size,
        placementRate: students.length > 0 ? Math.round((placedStudentIds.size / students.length) * 100) : 0,
        totalCompanies: companies.length,
        activeCompanies: companies.filter(c => c.approved).length,
        totalJobs: jobs.length,
        activeJobs: activeJobs.length,
        totalApplications: applications.length,
        avgPackage: Math.round(avgPkg * 10) / 10,
        highestPackage: highPkg,
        lowestPackage: lowPkg
      });

      // Branch-wise data
      const branchCounts: { [key: string]: { total: number; placed: number; applications: number } } = {};
      students.forEach(student => {
        const category = getBranchCategory(student.branch || '');
        if (!branchCounts[category]) {
          branchCounts[category] = { total: 0, placed: 0, applications: 0 };
        }
        branchCounts[category].total++;
        if (placedStudentIds.has(student.id)) {
          branchCounts[category].placed++;
        }
        branchCounts[category].applications += applications.filter(a => a.studentId === student.id).length;
      });

      setBranchData(
        Object.entries(branchCounts).map(([name, data]) => ({
          name,
          students: data.total,
          placed: data.placed,
          applications: data.applications,
          rate: data.total > 0 ? Math.round((data.placed / data.total) * 100) : 0
        }))
      );

      // Company-wise hiring data
      const companyHiring: { [key: string]: { offers: number; applications: number } } = {};
      applications.forEach(app => {
        if (!companyHiring[app.companyName]) {
          companyHiring[app.companyName] = { offers: 0, applications: 0 };
        }
        companyHiring[app.companyName].applications++;
        if (app.status === ApplicationStatus.OFFERED) {
          companyHiring[app.companyName].offers++;
        }
      });

      setCompanyData(
        Object.entries(companyHiring)
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.offers - a.offers)
          .slice(0, 6)
      );

      // Package distribution
      const packageRanges = [
        { range: '0-5 LPA', min: 0, max: 5, count: 0 },
        { range: '5-10 LPA', min: 5, max: 10, count: 0 },
        { range: '10-15 LPA', min: 10, max: 15, count: 0 },
        { range: '15-20 LPA', min: 15, max: 20, count: 0 },
        { range: '20+ LPA', min: 20, max: 100, count: 0 },
      ];

      jobs.forEach(job => {
        const range = packageRanges.find(r => job.package >= r.min && job.package < r.max);
        if (range) range.count++;
      });

      setPackageData(packageRanges.map(r => ({ name: r.range, jobs: r.count })));

      // Application status distribution
      const statusCounts: { [key: string]: number } = {};
      applications.forEach(app => {
        statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
      });

      setStatusData(
        Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
      );

      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">📊 Placement Analytics</h1>
          <p className="text-white/80 text-lg">Comprehensive statistics and insights at a glance</p>
        </div>
      </div>

      {/* Key Metrics - Premium Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {/* Students Card */}
        <div className="relative group cursor-pointer">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-400 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-all duration-500"></div>
          <div className="relative bg-white rounded-2xl p-5 shadow-xl shadow-blue-500/10 ring-1 ring-blue-400/20 hover:shadow-2xl transition-all duration-300 group-hover:translate-y-[-2px]">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full blur-2xl"></div>
            </div>
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-blue-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <GraduationCap size={22} strokeWidth={2.5} />
              </div>
            </div>
            <p className="text-3xl font-black bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">{stats.totalStudents}</p>
            <p className="text-slate-600 font-semibold text-sm">Total Students</p>
          </div>
        </div>

        {/* Placed Card */}
        <div className="relative group cursor-pointer">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-all duration-500"></div>
          <div className="relative bg-white rounded-2xl p-5 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-400/20 hover:shadow-2xl transition-all duration-300 group-hover:translate-y-[-2px]">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
              <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-400 rounded-full blur-2xl"></div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <CheckCircle size={22} strokeWidth={2.5} />
                </div>
              </div>
              <span className="text-xs font-bold bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 px-2.5 py-1 rounded-full">{stats.placementRate}%</span>
            </div>
            <p className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">{stats.placedStudents}</p>
            <p className="text-slate-600 font-semibold text-sm">Students Placed</p>
          </div>
        </div>

        {/* Companies Card */}
        <div className="relative group cursor-pointer">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-all duration-500"></div>
          <div className="relative bg-white rounded-2xl p-5 shadow-xl shadow-orange-500/10 ring-1 ring-orange-400/20 hover:shadow-2xl transition-all duration-300 group-hover:translate-y-[-2px]">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
              <div className="w-full h-full bg-gradient-to-br from-orange-500 to-amber-400 rounded-full blur-2xl"></div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-400 flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Building2 size={22} strokeWidth={2.5} />
                </div>
              </div>
              <span className="text-xs font-bold bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 px-2.5 py-1 rounded-full">{stats.activeCompanies} active</span>
            </div>
            <p className="text-3xl font-black bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">{stats.totalCompanies}</p>
            <p className="text-slate-600 font-semibold text-sm">Companies</p>
          </div>
        </div>

        {/* Jobs Card */}
        <div className="relative group cursor-pointer">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-violet-500 to-pink-400 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-all duration-500"></div>
          <div className="relative bg-white rounded-2xl p-5 shadow-xl shadow-purple-500/10 ring-1 ring-purple-400/20 hover:shadow-2xl transition-all duration-300 group-hover:translate-y-[-2px]">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
              <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-400 rounded-full blur-2xl"></div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 via-violet-500 to-pink-400 flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Briefcase size={22} strokeWidth={2.5} />
                </div>
              </div>
              <span className="text-xs font-bold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-2.5 py-1 rounded-full">{stats.activeJobs} active</span>
            </div>
            <p className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">{stats.totalJobs}</p>
            <p className="text-slate-600 font-semibold text-sm">Jobs Posted</p>
          </div>
        </div>

        {/* Applications Card */}
        <div className="relative group cursor-pointer">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-400 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-all duration-500"></div>
          <div className="relative bg-white rounded-2xl p-5 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-400/20 hover:shadow-2xl transition-all duration-300 group-hover:translate-y-[-2px]">
            <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
              <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-teal-400 rounded-full blur-2xl"></div>
            </div>
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-cyan-500 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Target size={22} strokeWidth={2.5} />
              </div>
            </div>
            <p className="text-3xl font-black bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">{stats.totalApplications}</p>
            <p className="text-slate-600 font-semibold text-sm">Applications</p>
          </div>
        </div>
      </div>

      {/* Package Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl">
              <TrendingUp size={20} className="text-white" />
            </div>
            <span className="text-sm font-medium text-slate-500">Highest Package</span>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">₹{stats.highestPackage} LPA</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl">
              <IndianRupee size={20} className="text-white" />
            </div>
            <span className="text-sm font-medium text-slate-500">Average Package</span>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">₹{stats.avgPackage} LPA</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl">
              <TrendingDown size={20} className="text-white" />
            </div>
            <span className="text-sm font-medium text-slate-500">Lowest Package</span>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">₹{stats.lowestPackage} LPA</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch-wise Placements */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"></span>
            Branch-wise Placement
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Legend />
                <Bar dataKey="students" fill="#e2e8f0" name="Total" radius={[6, 6, 0, 0]} />
                <Bar dataKey="placed" fill="#22c55e" name="Placed" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Status Pie */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"></span>
            Application Status Distribution
          </h3>
          <div className="h-72 flex items-center justify-center">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500">No application data</p>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company-wise Hiring */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></span>
            Top Hiring Companies
          </h3>
          <div className="h-72">
            {companyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={companyData} layout="vertical" margin={{ top: 10, right: 10, left: 60, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Legend />
                  <Bar dataKey="applications" fill="#e2e8f0" name="Applications" radius={[0, 6, 6, 0]} />
                  <Bar dataKey="offers" fill="#8b5cf6" name="Offers" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">No company data</div>
            )}
          </div>
        </div>

        {/* Package Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></span>
            Package Distribution
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={packageData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="jobs" fill="#3b82f6" name="Number of Jobs" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Branch-wise Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"></span>
          Detailed Branch Statistics
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
              <tr>
                <th className="px-4 py-4 text-left font-semibold text-slate-700 rounded-tl-xl">Branch</th>
                <th className="px-4 py-4 text-center font-semibold text-slate-700">Total Students</th>
                <th className="px-4 py-4 text-center font-semibold text-slate-700">Placed</th>
                <th className="px-4 py-4 text-center font-semibold text-slate-700">Applications</th>
                <th className="px-4 py-4 text-center font-semibold text-slate-700 rounded-tr-xl">Placement Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branchData.map((branch, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-4 font-semibold text-slate-800">{branch.name}</td>
                  <td className="px-4 py-4 text-center text-slate-600">{branch.students}</td>
                  <td className="px-4 py-4 text-center">
                    <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                      {branch.placed}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center text-slate-600">{branch.applications}</td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-24 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full" 
                          style={{ width: `${branch.rate}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600">{branch.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {branchData.length === 0 && (
            <div className="p-8 text-center text-slate-500">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
};
