import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { User } from '../../types';
import { Users, Search, Check, Building2, GraduationCap, Shield, Trash2 } from 'lucide-react';
import { ConfirmDialog, useConfirmDialog } from '../../components/ConfirmDialog';

export const UsersManagement: React.FC = () => {
  const { isDark } = useTheme();
  const { confirm, dialogProps } = useConfirmDialog();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadUsers = async () => {
    const allUsers = await Api.getAllUsers();
    setUsers(allUsers);
  };

  useEffect(() => { loadUsers(); }, []);

  const handleApprove = async (userId: string) => {
    try { await Api.approveUser(userId); loadUsers(); toast.success('User approved successfully!'); } 
    catch (error: any) { toast.error(error.message || 'Failed to approve user'); }
  };

  const handleDelete = async (userId: string, userName: string) => {
    const confirmed = await confirm({
      title: 'Delete User',
      message: `Are you sure you want to delete "${userName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger'
    });
    if (!confirmed) return;
    
    setDeleting(userId);
    try {
      await Api.deleteUser(userId);
      loadUsers();
      toast.success('User deleted successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
    setDeleting(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name || user.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const stats = [
    { label: 'Total Users', value: users.length, icon: Users },
    { label: 'Students', value: users.filter(u => u.role === 'STUDENT').length, icon: GraduationCap },
    { label: 'Companies', value: users.filter(u => u.role === 'COMPANY').length, icon: Building2 },
    { label: 'Admins', value: users.filter(u => u.role === 'ADMIN').length, icon: Shield },
  ];

  const cardClass = `${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-xl border`;

  return (
    <>
    <ConfirmDialog {...dialogProps} />
    <div className="space-y-6">
      {/* Header */}
      <div className={cardClass + ' p-6'}>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>User Management</h1>
        <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>Manage all users in the system</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
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

      {/* Filters */}
      <div className={cardClass + ' p-4'}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border outline-none ${
                isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200 focus:border-indigo-500'
              }`}
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className={`px-4 py-2.5 rounded-lg border outline-none ${
              isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-slate-200'
            }`}
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="COMPANY">Companies</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className={cardClass + ' overflow-hidden'}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDark ? 'bg-slate-700/50' : 'bg-slate-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>User</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Email</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Role</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Status</th>
                <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Users className={`mx-auto mb-2 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} size={32} />
                    <p className={isDark ? 'text-slate-500' : 'text-slate-400'}>No users found</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className={`${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'} transition-colors`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                          {(user.name || user.companyName || 'U').charAt(0)}
                        </div>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          {user.name || user.companyName}
                        </span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' ? 'bg-violet-100 text-violet-700' :
                        user.role === 'COMPANY' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>{user.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.approved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>{user.approved ? 'Approved' : 'Pending'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {!user.approved && user.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700"
                          >
                            <Check size={14} /> Approve
                          </button>
                        )}
                        {user.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleDelete(user.id, user.name || user.companyName || 'User')}
                            disabled={deleting === user.id}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 disabled:opacity-50"
                          >
                            <Trash2 size={14} /> {deleting === user.id ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
};
