import React, { useEffect, useState } from 'react';
import { Api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Application, ApplicationStatus, Job, User } from '../../types';
import { Download, Check, X, Eye, GraduationCap, Mail, Phone, Award, FileText, Linkedin } from 'lucide-react';

export const Applicants: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [filterJob, setFilterJob] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const allJobs = await Api.getJobs();
      const myJobs = allJobs.filter(j => j.companyId === user?.id);
      setJobs(myJobs);

      const allApps = await Api.getApplications();
      const myApps = allApps.filter(a => myJobs.find(j => j.id === a.jobId));
      setApplications(myApps);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
                <GraduationCap size={24} />
              </div>
              <h1 className="text-2xl font-bold">Applicants Management</h1>
            </div>
            <p className="text-white/80">Review and manage job applicants</p>
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
              <option value="all" className="text-slate-800">All Jobs</option>
              {jobs.map(j => <option key={j.id} value={j.id} className="text-slate-800">{j.title}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500">Loading applicants...</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 text-slate-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Candidate</th>
                <th className="px-6 py-4 font-semibold">Education</th>
                <th className="px-6 py-4 font-semibold">Job Role</th>
                <th className="px-6 py-4 font-semibold">CGPA</th>
                <th className="px-6 py-4 font-semibold">Resume</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map((app) => {
                const student = getStudentDetails(app.studentId);
                return (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
                          {(app.studentName || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{app.studentName}</p>
                          <p className="text-xs text-slate-500">{student?.collegeName || student?.email || 'Loading...'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <p className="text-slate-700 font-medium">{student?.course || student?.branch || 'N/A'}</p>
                        <p className="text-slate-400">{student?.educationStatus || 'Pursuing'} • {student?.graduationYear || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{app.jobTitle}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{student?.cgpa || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {student?.resumeUrl ? (
                        <a 
                          href={student.resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5 font-medium"
                        >
                          <Download size={14} /> View
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs">No resume</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                        app.status === ApplicationStatus.SHORTLISTED ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' : 
                        app.status === ApplicationStatus.REJECTED ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700' : 
                        app.status === ApplicationStatus.OFFERED ? 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                      }`}>{app.status === ApplicationStatus.OFFERED ? '🎉 ' : ''}{app.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewProfile(app.studentId)}
                          className="p-2 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100 hover:scale-110 transition-all" 
                          title="View Profile"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(app.id, ApplicationStatus.SHORTLISTED)}
                          className="p-2 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 hover:from-green-100 hover:to-emerald-100 hover:scale-110 transition-all" 
                          title="Shortlist"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(app.id, ApplicationStatus.OFFERED)}
                          className="p-2 rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 text-purple-600 hover:from-purple-100 hover:to-violet-100 hover:scale-110 transition-all" 
                          title="Send Offer"
                        >
                          <Award size={16} />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(app.id, ApplicationStatus.REJECTED)}
                          className="p-2 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 text-red-600 hover:from-red-100 hover:to-rose-100 hover:scale-110 transition-all" 
                          title="Reject"
                        >
                          <X size={16} />
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
          <div className="p-8 text-center text-slate-500">No applicants found.</div>
        )}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedStudent(null)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-6 rounded-t-3xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
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
                <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-xl">
                  <Mail size={16} className="text-emerald-500" />
                  <span>{selectedStudent.email}</span>
                </div>
                {selectedStudent.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-xl">
                    <Phone size={16} className="text-emerald-500" />
                    <span>{selectedStudent.phone}</span>
                  </div>
                )}
              </div>

              {/* College */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap size={18} className="text-emerald-600" />
                  <span className="font-bold text-slate-800">Education</span>
                </div>
                <p className="text-slate-700 font-semibold">{selectedStudent.collegeName || 'College not specified'}</p>
                <p className="text-slate-500 text-sm">{selectedStudent.course || selectedStudent.branch || 'N/A'}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl">
                  <p className="text-xs font-medium text-slate-500">Branch</p>
                  <p className="font-bold text-slate-800">{selectedStudent.branch || 'N/A'}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl">
                  <p className="text-xs font-medium text-slate-500">CGPA</p>
                  <p className="font-bold text-2xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{selectedStudent.cgpa || 'N/A'}</p>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl">
                  <p className="text-xs font-medium text-slate-500">Graduation Year</p>
                  <p className="font-bold text-slate-800">{selectedStudent.graduationYear || 'N/A'}</p>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl">
                  <p className="text-xs font-medium text-slate-500">Status</p>
                  <p className="font-bold text-slate-800">{selectedStudent.educationStatus || 'Pursuing'}</p>
                </div>
              </div>

              {/* Skills */}
              {selectedStudent.skills && selectedStudent.skills.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.skills.map((skill, i) => (
                      <span key={i} className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-bold">
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
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 text-sm font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    <FileText size={16} /> View Resume
                  </a>
                )}
                {selectedStudent.linkedIn && (
                  <a 
                    href={selectedStudent.linkedIn} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 text-sm font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    <Linkedin size={16} /> LinkedIn
                  </a>
                )}
              </div>

              {/* Close Button */}
              <div className="pt-4 border-t flex justify-end">
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 font-bold transition-all"
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