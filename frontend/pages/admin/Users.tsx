import React, { useEffect, useState } from 'react';
import { Api } from '../../services/api';
import { User, Application, ApplicationStatus } from '../../types';
import { Search, Filter, Check, X, Eye, Trash2, Mail, Phone, GraduationCap, Building2, UserCheck, UserX, Users as UsersIcon } from 'lucide-react';

export const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState<'all' | 'STUDENT' | 'COMPANY'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const allUsers = await Api.getAllUsers();
    const allApps = await Api.getApplications();
    setUsers(allUsers.filter(u => u.role !== 'ADMIN'));
    setApplications(allApps);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      await Api.approveUser(userId);
      loadData();
    } catch (error: any) {
      alert(error.message || 'Failed to approve user');
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      // For now, just remove from local state (would need backend DELETE endpoint)
      setUsers(prev => prev.filter(u => u.id !== userId));
      setSelectedUser(null);
    }
  };

  const getPlacementStatus = (userId: string): 'Placed' | 'Not Placed' => {
    const hasOffer = applications.some(a => a.studentId === userId && a.status === ApplicationStatus.OFFERED);
    return hasOffer ? 'Placed' : 'Not Placed';
  };

  const getApplicationCount = (userId: string): number => {
    return applications.filter(a => a.studentId === userId).length;
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = filter === 'all' || user.role === filter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'approved' && user.approved) || 
      (statusFilter === 'pending' && !user.approved);
    const matchesSearch = search === '' || 
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.companyName?.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  const stats = {
    total: users.length,
    students: users.filter(u => u.role === 'STUDENT').length,
    companies: users.filter(u => u.role === 'COMPANY').length,
    pending: users.filter(u => !u.approved).length,
    placed: users.filter(u => u.role === 'STUDENT' && getPlacementStatus(u.id) === 'Placed').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
            <UsersIcon size={24} />
          </div>
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
        <p className="text-white/80">Manage all registered students and companies</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl">
              <UsersIcon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              <p className="text-xs font-medium text-slate-500">Total Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.students}</p>
              <p className="text-xs font-medium text-slate-500">Students</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.companies}</p>
              <p className="text-xs font-medium text-slate-500">Companies</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
              <UserX size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
              <p className="text-xs font-medium text-slate-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
              <UserCheck size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.placed}</p>
              <p className="text-xs font-medium text-slate-500">Placed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <select
              className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none bg-white font-medium"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="all">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="COMPANY">Companies</option>
            </select>
            <select
              className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none bg-white font-medium"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500">Loading users...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 text-slate-600 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Details</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shadow-lg ${
                          user.role === 'STUDENT' ? 'bg-gradient-to-br from-blue-500 to-indigo-500' : 'bg-gradient-to-br from-orange-500 to-amber-500'
                        }`}>
                          {(user.name || user.companyName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{user.name || user.companyName}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                        user.role === 'STUDENT' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700' : 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {user.role === 'STUDENT' ? (
                        <div className="text-xs">
                          <p className="font-medium">{user.collegeName || user.branch || 'No details'}</p>
                          <p className="text-slate-400">CGPA: {user.cgpa || 'N/A'} • Apps: {getApplicationCount(user.id)}</p>
                        </div>
                      ) : (
                        <div className="text-xs">
                          <p className="font-medium">{user.industry || 'No industry'}</p>
                          <p className="text-slate-400">{user.website || 'No website'}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block w-fit ${
                          user.approved ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' : 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700'
                        }`}>
                          {user.approved ? '✓ Approved' : '⏳ Pending'}
                        </span>
                        {user.role === 'STUDENT' && (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block w-fit ${
                            getPlacementStatus(user.id) === 'Placed' ? 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {getPlacementStatus(user.id)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setSelectedUser(user)}
                          className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-110 transition-all" 
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {!user.approved && (
                          <button 
                            onClick={() => handleApprove(user.id)}
                            className="p-2 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 text-green-600 hover:from-green-200 hover:to-emerald-200 hover:scale-110 transition-all" 
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-2 rounded-xl bg-gradient-to-r from-red-100 to-rose-100 text-red-600 hover:from-red-200 hover:to-rose-200 hover:scale-110 transition-all" 
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-slate-500">No users found matching your criteria.</div>
            )}
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className={`p-6 ${selectedUser.role === 'STUDENT' ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500' : 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500'}`}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {(selectedUser.name || selectedUser.companyName || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="text-white">
                  <h2 className="text-xl font-bold">{selectedUser.name || selectedUser.companyName}</h2>
                  <p className="text-white/80 text-sm">{selectedUser.email}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold">
                    {selectedUser.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {selectedUser.role === 'STUDENT' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl">
                      <p className="text-xs font-medium text-slate-500">Roll Number</p>
                      <p className="font-bold text-slate-800">{selectedUser.rollNumber || 'N/A'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl">
                      <p className="text-xs font-medium text-slate-500">CGPA</p>
                      <p className="font-bold text-slate-800">{selectedUser.cgpa || 'N/A'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl">
                      <p className="text-xs font-medium text-slate-500">Branch</p>
                      <p className="font-bold text-slate-800">{selectedUser.branch || 'N/A'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl">
                      <p className="text-xs font-medium text-slate-500">Course</p>
                      <p className="font-bold text-slate-800">{selectedUser.course || 'N/A'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl col-span-2">
                      <p className="text-xs font-medium text-slate-500">College</p>
                      <p className="font-bold text-slate-800">{selectedUser.collegeName || 'N/A'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl">
                      <p className="text-xs font-medium text-slate-500">Graduation Year</p>
                      <p className="font-bold text-slate-800">{selectedUser.graduationYear || 'N/A'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl">
                      <p className="text-xs font-medium text-slate-500">Status</p>
                      <p className="font-bold text-slate-800">{selectedUser.educationStatus || 'N/A'}</p>
                    </div>
                  </div>
                  {selectedUser.skills && selectedUser.skills.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.skills.map((skill, i) => (
                          <span key={i} className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4 pt-2">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                      getPlacementStatus(selectedUser.id) === 'Placed' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {getPlacementStatus(selectedUser.id) === 'Placed' ? '🎉 ' : ''}{getPlacementStatus(selectedUser.id)}
                    </span>
                    <span className="text-sm text-slate-500 font-medium">
                      📝 {getApplicationCount(selectedUser.id)} Applications
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl col-span-2">
                      <p className="text-xs font-medium text-slate-500">Company Name</p>
                      <p className="font-bold text-slate-800">{selectedUser.companyName || selectedUser.name}</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl">
                      <p className="text-xs font-medium text-slate-500">Industry</p>
                      <p className="font-bold text-slate-800">{selectedUser.industry || 'N/A'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl">
                      <p className="text-xs font-medium text-slate-500">Website</p>
                      <p className="font-bold text-slate-800 truncate">{selectedUser.website || 'N/A'}</p>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4 border-t">
                {!selectedUser.approved && (
                  <button 
                    onClick={() => { handleApprove(selectedUser.id); setSelectedUser(null); }}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 flex items-center justify-center gap-2 font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    <Check size={18} /> Approve User
                  </button>
                )}
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-bold transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
