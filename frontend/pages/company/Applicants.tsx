import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Application, ApplicationStatus, Job, User } from '../../types';
import { Download, Check, X, Eye, GraduationCap, Mail, Phone, Award, FileText, Linkedin, Trash2 } from 'lucide-react';
import { ConfirmDialog, useConfirmDialog } from '../../components/ConfirmDialog';

export const Applicants: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { confirm, dialogProps } = useConfirmDialog();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [filterJob, setFilterJob] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const allJobs = await Api.getJobs();
      setJobs(allJobs);

      const allApps = await Api.getApplications();
      setApplications(allApps);

      // Fetch students data
      const studentData = await Api.getStudents();
      setStudents(studentData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleStatusChange = async (appId: string, status: ApplicationStatus) => {
    await Api.updateApplicationStatus(appId, status);
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    
    const app = applications.find(a => a.id === appId);
    if(app) await Api.addNotification(app.studentId, `Your application for ${app.jobTitle} is now ${status}`);
  };

  const handleDeleteApplication = async (appId: string, studentName: string) => {
    const confirmed = await confirm({
      title: 'Delete Application',
      message: `Are you sure you want to delete the application from "${studentName}"?`,
      confirmText: 'Delete',
      variant: 'danger'
    });
    if (!confirmed) return;
    
    setDeleting(appId);
    try {
      await Api.deleteApplication(appId);
      setApplications(prev => prev.filter(a => a.id !== appId));
      toast.success('Application deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete application');
    }
    setDeleting(null);
  };

  const getStudentDetails = (studentId: string): User | undefined => {
    return students.find(u => u.id === studentId);
  };

  const handleViewProfile = async (studentId: string) => {
    // Fetch fresh student data
    const student = await Api.getUserById(studentId);
    if (student) {
      setSelectedStudent(student);
    } else {
      // Fallback to cached data
      const cached = getStudentDetails(studentId);
      if (cached) setSelectedStudent(cached);
    }
  };

  const filteredApps = filterJob === 'all' 
    ? applications 
    : applications.filter(a => a.jobId === filterJob);

  return (
    <>
    <ConfirmDialog {...dialogProps} />
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
                <GraduationCap size={24} />
              </div>
              <h1 className="text-2xl font-bold">Applicants Management</h1>
            </div>
            <p className="text-white/80">Review and manage internship applicants</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={loadData}
              className="px-4 py-2 text-sm bg-white/20 backdrop-blur text-white rounded-xl hover:bg-white/30 font-medium transition-all"
            >
              ↻ Refresh
            </button>
            <select 
              className="border-0 bg-white/20 backdrop-blur text-white rounded-xl px-4 py-2 text-sm outline-none font-medium"
              value={filterJob}
              onChange={(e) => setFilterJob(e.target.value)}
            >
              <option value="all" className="text-slate-800">All Internships</option>
              {jobs.map(j => <option key={j.id} value={j.id} className="text-slate-800">{j.title}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className={`rounded-xl shadow-lg border overflow-hidden ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Loading applicants...</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className={isDark ? 'bg-slate-700/50' : 'bg-slate-50'}>
              <tr>
                <th className={`px-6 py-4 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Candidate</th>
                <th className={`px-6 py-4 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Education</th>
                <th className={`px-6 py-4 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Internship</th>
                <th className={`px-6 py-4 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>CGPA</th>
                <th className={`px-6 py-4 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Resume</th>
                <th className={`px-6 py-4 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Status</th>
                <th className={`px-6 py-4 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-700' : 'divide-slate-100'}`}>
              {filteredApps.map((app) => {
                const student = getStudentDetails(app.studentId);
                return (
                  <tr key={app.id} className={`transition-colors ${isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                          {(app.studentName || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{app.studentName}</p>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{student?.collegeName || student?.email || 'Loading...'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <p className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{student?.course || student?.branch || 'N/A'}</p>
                        <p className={isDark ? 'text-slate-500' : 'text-slate-400'}>{student?.educationStatus || 'Pursuing'} • {student?.graduationYear || 'N/A'}</p>
                      </div>
                    </td>
                    <td className={`px-6 py-4 font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{app.jobTitle}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-lg text-indigo-500">{student?.cgpa || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {student?.resumeUrl ? (
                        <a 
                          href={student.resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-500 hover:text-indigo-600 flex items-center gap-1.5 font-medium"
                        >
                          <Download size={14} /> View
                        </a>
                      ) : (
                        <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No resume</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                        app.status === ApplicationStatus.SHORTLISTED ? 'bg-green-100 text-green-700' : 
                        app.status === ApplicationStatus.REJECTED ? 'bg-red-100 text-red-700' : 
                        app.status === ApplicationStatus.OFFERED ? 'bg-purple-100 text-purple-700' : 
                        isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                      }`}>{app.status === ApplicationStatus.OFFERED ? '🎉 ' : ''}{app.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewProfile(app.studentId)}
                          className={`p-2 rounded-xl transition-all hover:scale-110 ${isDark ? 'bg-slate-700 text-indigo-400 hover:bg-slate-600' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                          title="View Profile"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(app.id, ApplicationStatus.SHORTLISTED)}
                          className={`p-2 rounded-xl transition-all hover:scale-110 ${isDark ? 'bg-slate-700 text-green-400 hover:bg-slate-600' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                          title="Shortlist"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(app.id, ApplicationStatus.OFFERED)}
                          className={`p-2 rounded-xl transition-all hover:scale-110 ${isDark ? 'bg-slate-700 text-purple-400 hover:bg-slate-600' : 'bg-purple-50 text-purple-600 hover:bg-purple-100'}`}
                          title="Send Offer"
                        >
                          <Award size={16} />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(app.id, ApplicationStatus.REJECTED)}
                          className={`p-2 rounded-xl transition-all hover:scale-110 ${isDark ? 'bg-slate-700 text-red-400 hover:bg-slate-600' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                          title="Reject"
                        >
                          <X size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteApplication(app.id, app.studentName)}
                          disabled={deleting === app.id}
                          className={`p-2 rounded-xl transition-all hover:scale-110 ${isDark ? 'bg-red-900/50 text-red-400 hover:bg-red-900' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                          title="Delete Application"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {!loading && filteredApps.length === 0 && (
          <div className={`p-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No applicants found.</div>
        )}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedStudent(null)}>
          <div className={`rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto ${isDark ? 'bg-slate-800' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-indigo-600 p-6 rounded-t-xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {(selectedStudent.name || 'S').charAt(0).toUpperCase()}
                </div>
                <div className="text-white">
                  <h2 className="text-xl font-bold">{selectedStudent.name}</h2>
                  <p className="text-white/80 text-sm">{selectedStudent.email}</p>
                  <p className="text-white/60 text-xs mt-1 bg-white/20 inline-block px-2 py-0.5 rounded-full">{selectedStudent.rollNumber}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Contact Info */}
              <div className="flex flex-wrap gap-4">
                <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
                  <Mail size={16} className="text-indigo-500" />
                  <span>{selectedStudent.email}</span>
                </div>
                {selectedStudent.phone && (
                  <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
                    <Phone size={16} className="text-indigo-500" />
                    <span>{selectedStudent.phone}</span>
                  </div>
                )}
              </div>

              {/* College */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap size={18} className="text-indigo-500" />
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Education</span>
                </div>
                <p className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{selectedStudent.collegeName || 'College not specified'}</p>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{selectedStudent.course || selectedStudent.branch || 'N/A'}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                  <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Branch</p>
                  <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedStudent.branch || 'N/A'}</p>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-indigo-50'}`}>
                  <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>CGPA</p>
                  <p className="font-bold text-2xl text-indigo-500">{selectedStudent.cgpa || 'N/A'}</p>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                  <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Graduation Year</p>
                  <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedStudent.graduationYear || 'N/A'}</p>
                </div>
                <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}>
                  <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Status</p>
                  <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedStudent.educationStatus || 'Pursuing'}</p>
                </div>
              </div>

              {/* Skills */}
              {selectedStudent.skills && selectedStudent.skills.length > 0 && (
                <div>
                  <p className={`text-sm font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.skills.map((skill, i) => (
                      <span key={i} className={`px-3 py-1.5 rounded-full text-sm font-bold ${isDark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex gap-3 pt-2">
                {selectedStudent.resumeUrl && (
                  <a 
                    href={selectedStudent.resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg transition-all"
                  >
                    <FileText size={16} /> View Resume
                  </a>
                )}
                {selectedStudent.linkedIn && (
                  <a 
                    href={selectedStudent.linkedIn} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg transition-all"
                  >
                    <Linkedin size={16} /> LinkedIn
                  </a>
                )}
              </div>

              {/* Close Button */}
              <div className={`pt-4 border-t flex justify-end ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className={`px-6 py-2.5 rounded-xl font-bold transition-all ${isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};
