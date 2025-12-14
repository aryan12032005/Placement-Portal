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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Applicants Management</h1>
        <div className="flex gap-3">
          <button 
            onClick={loadData}
            className="px-4 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
          >
            Refresh
          </button>
          <select 
            className="border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none"
            value={filterJob}
            onChange={(e) => setFilterJob(e.target.value)}
          >
            <option value="all">All Jobs</option>
            {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading applicants...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Candidate</th>
                <th className="px-6 py-4 font-medium">Education</th>
                <th className="px-6 py-4 font-medium">Job Role</th>
                <th className="px-6 py-4 font-medium">CGPA</th>
                <th className="px-6 py-4 font-medium">Resume</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApps.map((app) => {
                const student = getStudentDetails(app.studentId);
                return (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-800">{app.studentName}</p>
                        <p className="text-xs text-slate-500">{student?.collegeName || student?.email || 'Loading...'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs">
                        <p className="text-slate-700">{student?.course || student?.branch || 'N/A'}</p>
                        <p className="text-slate-400">{student?.educationStatus || 'Pursuing'} • {student?.graduationYear || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{app.jobTitle}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-800">{student?.cgpa || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4">
                      {student?.resumeUrl ? (
                        <a 
                          href={student.resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Download size={14} /> View
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs">No resume</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        app.status === ApplicationStatus.SHORTLISTED ? 'bg-green-100 text-green-700' : 
                        app.status === ApplicationStatus.REJECTED ? 'bg-red-100 text-red-700' : 
                        app.status === ApplicationStatus.OFFERED ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                      }`}>{app.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewProfile(app.studentId)}
                          className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100" 
                          title="View Profile"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(app.id, ApplicationStatus.SHORTLISTED)}
                          className="p-1.5 rounded bg-green-50 text-green-600 hover:bg-green-100" 
                          title="Shortlist"
                        >
                          <Check size={16} />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(app.id, ApplicationStatus.OFFERED)}
                          className="p-1.5 rounded bg-purple-50 text-purple-600 hover:bg-purple-100" 
                          title="Send Offer"
                        >
                          <Award size={16} />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(app.id, ApplicationStatus.REJECTED)}
                          className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100" 
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedStudent(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-t-2xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {(selectedStudent.name || 'S').charAt(0).toUpperCase()}
                </div>
                <div className="text-white">
                  <h2 className="text-xl font-bold">{selectedStudent.name}</h2>
                  <p className="text-white/80 text-sm">{selectedStudent.email}</p>
                  <p className="text-white/60 text-xs mt-1">{selectedStudent.rollNumber}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Contact Info */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail size={16} className="text-slate-400" />
                  <span>{selectedStudent.email}</span>
                </div>
                {selectedStudent.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone size={16} className="text-slate-400" />
                    <span>{selectedStudent.phone}</span>
                  </div>
                )}
              </div>

              {/* College */}
              <div className="bg-slate-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap size={18} className="text-blue-600" />
                  <span className="font-medium text-slate-800">Education</span>
                </div>
                <p className="text-slate-700 font-medium">{selectedStudent.collegeName || 'College not specified'}</p>
                <p className="text-slate-500 text-sm">{selectedStudent.course || selectedStudent.branch || 'N/A'}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-400">Branch</p>
                  <p className="font-medium text-slate-800">{selectedStudent.branch || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-400">CGPA</p>
                  <p className="font-medium text-slate-800 text-lg">{selectedStudent.cgpa || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-400">Graduation Year</p>
                  <p className="font-medium text-slate-800">{selectedStudent.graduationYear || 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-400">Status</p>
                  <p className="font-medium text-slate-800">{selectedStudent.educationStatus || 'Pursuing'}</p>
                </div>
              </div>

              {/* Skills */}
              {selectedStudent.skills && selectedStudent.skills.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.skills.map((skill, i) => (
                      <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
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
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium"
                  >
                    <FileText size={16} /> View Resume
                  </a>
                )}
                {selectedStudent.linkedIn && (
                  <a 
                    href={selectedStudent.linkedIn} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                  >
                    <Linkedin size={16} /> LinkedIn
                  </a>
                )}
              </div>

              {/* Close Button */}
              <div className="pt-4 border-t flex justify-end">
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium"
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