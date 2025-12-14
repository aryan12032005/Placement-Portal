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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all registered students and companies</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <UsersIcon size={20} className="text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              <p className="text-xs text-slate-500">Total Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.students}</p>
              <p className="text-xs text-slate-500">Students</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Building2 size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.companies}</p>
              <p className="text-xs text-slate-500">Companies</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <UserX size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
              <p className="text-xs text-slate-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{stats.placed}</p>
              <p className="text-xs text-slate-500">Placed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <select
              className="px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="all">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="COMPANY">Companies</option>
            </select>
            <select
              className="px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Details</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                          user.role === 'STUDENT' ? 'bg-blue-500' : 'bg-orange-500'
                        }`}>
                          {(user.name || user.companyName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{user.name || user.companyName}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === 'STUDENT' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {user.role === 'STUDENT' ? (
                        <div className="text-xs">
                          <p>{user.collegeName || user.branch || 'No details'}</p>
                          <p className="text-slate-400">CGPA: {user.cgpa || 'N/A'} • Apps: {getApplicationCount(user.id)}</p>
                        </div>
                      ) : (
                        <div className="text-xs">
                          <p>{user.industry || 'No industry'}</p>
                          <p className="text-slate-400">{user.website || 'No website'}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium inline-block w-fit ${
                          user.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {user.approved ? 'Approved' : 'Pending'}
                        </span>
                        {user.role === 'STUDENT' && (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium inline-block w-fit ${
                            getPlacementStatus(user.id) === 'Placed' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
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
                          className="p-1.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200" 
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {!user.approved && (
                          <button 
                            onClick={() => handleApprove(user.id)}
                            className="p-1.5 rounded bg-green-100 text-green-600 hover:bg-green-200" 
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 rounded bg-red-100 text-red-600 hover:bg-red-200" 
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className={`p-6 ${selectedUser.role === 'STUDENT' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-orange-500 to-orange-600'}`}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {(selectedUser.name || selectedUser.companyName || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="text-white">
                  <h2 className="text-xl font-bold">{selectedUser.name || selectedUser.companyName}</h2>
                  <p className="text-white/80 text-sm">{selectedUser.email}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-white/20 rounded text-xs">
                    {selectedUser.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {selectedUser.role === 'STUDENT' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">Roll Number</p>
                      <p className="font-medium text-slate-800">{selectedUser.rollNumber || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">CGPA</p>
                      <p className="font-medium text-slate-800">{selectedUser.cgpa || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">Branch</p>
                      <p className="font-medium text-slate-800">{selectedUser.branch || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">Course</p>
                      <p className="font-medium text-slate-800">{selectedUser.course || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg col-span-2">
                      <p className="text-xs text-slate-500">College</p>
                      <p className="font-medium text-slate-800">{selectedUser.collegeName || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">Graduation Year</p>
                      <p className="font-medium text-slate-800">{selectedUser.graduationYear || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">Status</p>
                      <p className="font-medium text-slate-800">{selectedUser.educationStatus || 'N/A'}</p>
                    </div>
                  </div>
                  {selectedUser.skills && selectedUser.skills.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.skills.map((skill, i) => (
                          <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4 pt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      getPlacementStatus(selectedUser.id) === 'Placed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {getPlacementStatus(selectedUser.id)}
                    </span>
                    <span className="text-sm text-slate-500">
                      {getApplicationCount(selectedUser.id)} Applications
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg col-span-2">
                      <p className="text-xs text-slate-500">Company Name</p>
                      <p className="font-medium text-slate-800">{selectedUser.companyName || selectedUser.name}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">Industry</p>
                      <p className="font-medium text-slate-800">{selectedUser.industry || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500">Website</p>
                      <p className="font-medium text-slate-800 truncate">{selectedUser.website || 'N/A'}</p>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4 border-t">
                {!selectedUser.approved && (
                  <button 
                    onClick={() => { handleApprove(selectedUser.id); setSelectedUser(null); }}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <Check size={18} /> Approve User
                  </button>
                )}
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
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
