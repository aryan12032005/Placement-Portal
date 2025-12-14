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
        <div className="text-slate-500">Loading statistics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Placement Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Comprehensive placement statistics and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-xl text-white">
          <div className="flex items-center justify-between mb-3">
            <GraduationCap size={24} />
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded">Students</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalStudents}</p>
          <p className="text-blue-100 text-sm">Total Registered</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-5 rounded-xl text-white">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle size={24} />
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded">{stats.placementRate}%</span>
          </div>
          <p className="text-3xl font-bold">{stats.placedStudents}</p>
          <p className="text-green-100 text-sm">Students Placed</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-5 rounded-xl text-white">
          <div className="flex items-center justify-between mb-3">
            <Building2 size={24} />
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded">{stats.activeCompanies} active</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalCompanies}</p>
          <p className="text-orange-100 text-sm">Companies</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-5 rounded-xl text-white">
          <div className="flex items-center justify-between mb-3">
            <Briefcase size={24} />
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded">{stats.activeJobs} active</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalJobs}</p>
          <p className="text-purple-100 text-sm">Jobs Posted</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-5 rounded-xl text-white">
          <div className="flex items-center justify-between mb-3">
            <Target size={24} />
          </div>
          <p className="text-3xl font-bold">{stats.totalApplications}</p>
          <p className="text-cyan-100 text-sm">Applications</p>
        </div>
      </div>

      {/* Package Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <span className="text-sm text-slate-500">Highest Package</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">₹{stats.highestPackage} LPA</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <IndianRupee size={20} className="text-blue-600" />
            </div>
            <span className="text-sm text-slate-500">Average Package</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">₹{stats.avgPackage} LPA</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingDown size={20} className="text-orange-600" />
            </div>
            <span className="text-sm text-slate-500">Lowest Package</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">₹{stats.lowestPackage} LPA</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branch-wise Placements */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Branch-wise Placement</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={branchData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#e2e8f0" name="Total" radius={[4, 4, 0, 0]} />
                <Bar dataKey="placed" fill="#22c55e" name="Placed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Status Pie */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Application Status Distribution</h3>
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
                  <Tooltip />
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
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Top Hiring Companies</h3>
          <div className="h-72">
            {companyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={companyData} layout="vertical" margin={{ top: 10, right: 10, left: 60, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="applications" fill="#e2e8f0" name="Applications" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="offers" fill="#8b5cf6" name="Offers" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">No company data</div>
            )}
          </div>
        </div>

        {/* Package Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Package Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={packageData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="jobs" fill="#3b82f6" name="Number of Jobs" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Branch-wise Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Detailed Branch Statistics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-600">Branch</th>
                <th className="px-4 py-3 text-center font-medium text-slate-600">Total Students</th>
                <th className="px-4 py-3 text-center font-medium text-slate-600">Placed</th>
                <th className="px-4 py-3 text-center font-medium text-slate-600">Applications</th>
                <th className="px-4 py-3 text-center font-medium text-slate-600">Placement Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branchData.map((branch, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{branch.name}</td>
                  <td className="px-4 py-3 text-center text-slate-600">{branch.students}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                      {branch.placed}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600">{branch.applications}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${branch.rate}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600">{branch.rate}%</span>
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
