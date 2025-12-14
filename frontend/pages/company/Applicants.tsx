import React, { useEffect, useState } from 'react';
import { Api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Application, ApplicationStatus, Job, User } from '../../types';
import { Download, Check, X, Eye, GraduationCap, Mail, Phone } from 'lucide-react';

export const Applicants: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filterJob, setFilterJob] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);

  useEffect(() => {
    const load = async () => {
      const allJobs = await Api.getJobs();
      const myJobs = allJobs.filter(j => j.companyId === user?.id);
      setJobs(myJobs);

      const allApps = await Api.getApplications();
      const myApps = allApps.filter(a => myJobs.find(j => j.id === a.jobId));
      setApplications(myApps);

      const users = await Api.getAllUsers();
      setAllUsers(users);
    };
    load();
  }, [user]);

  const handleStatusChange = async (appId: string, status: ApplicationStatus) => {
    await Api.updateApplicationStatus(appId, status);
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    
    const app = applications.find(a => a.id === appId);
    if(app) await Api.addNotification(app.studentId, `Your application for ${app.jobTitle} is now ${status}`);
  };

  const getStudentDetails = (studentId: string): User | undefined => {
    return allUsers.find(u => u.id === studentId);
  };

  const filteredApps = filterJob === 'all' 
    ? applications 
    : applications.filter(a => a.jobId === filterJob);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Applicants Management</h1>
        <select 
          className="border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none"
          value={filterJob}
          onChange={(e) => setFilterJob(e.target.value)}
        >
          <option value="all">All Jobs</option>
          {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
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
                      <p className="text-xs text-slate-500">{student?.collegeName || 'College not specified'}</p>
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
                    <a href="#" className="text-blue-600 hover:underline flex items-center gap-1">
                      <Download size={14} /> PDF
                    </a>
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
                        onClick={() => setSelectedStudent(student || null)}
                        className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100" title="View Profile"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleStatusChange(app.id, ApplicationStatus.SHORTLISTED)}
                        className="p-1.5 rounded bg-green-50 text-green-600 hover:bg-green-100" title="Shortlist"
                      >
                        <Check size={16} />
                      </button>
                      <button 
                        onClick={() => handleStatusChange(app.id, ApplicationStatus.REJECTED)}
                        className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100" title="Reject"
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
        {filteredApps.length === 0 && <div className="p-8 text-center text-slate-500">No applicants found.</div>}
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedStudent(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                  {selectedStudent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{selectedStudent.name}</h2>
                  <p className="text-slate-500 text-sm">{selectedStudent.rollNumber}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-slate-400" />
                  <span>{selectedStudent.email}</span>
                </div>
                {selectedStudent.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={16} className="text-slate-400" />
                    <span>{selectedStudent.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <GraduationCap size={16} className="text-slate-400" />
                  <span>{selectedStudent.collegeName || 'College not specified'}</span>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-medium text-slate-700 mb-3">Education</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-400">Course</p>
                      <p className="font-medium">{selectedStudent.course || selectedStudent.branch || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Branch</p>
                      <p className="font-medium">{selectedStudent.branch || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">CGPA</p>
                      <p className="font-medium">{selectedStudent.cgpa || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Graduation Year</p>
                      <p className="font-medium">{selectedStudent.graduationYear || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-400">Status</p>
                      <p className="font-medium">{selectedStudent.educationStatus || 'Pursuing'}</p>
                    </div>
                  </div>
                </div>

                {selectedStudent.skills && selectedStudent.skills.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-slate-700 mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.skills.map((skill, i) => (
                        <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedStudent.linkedIn && (
                  <div className="border-t pt-4">
                    <a href={selectedStudent.linkedIn} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline text-sm">
                      View LinkedIn Profile →
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end">
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
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