export enum UserRole {
  STUDENT = 'STUDENT',
  COMPANY = 'COMPANY',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  approved: boolean; // For Admin approval
  
  // Student specific
  rollNumber?: string;
  branch?: string;
  course?: string;
  collegeName?: string;
  graduationYear?: number;
  educationStatus?: 'Pursuing' | 'Graduated' | 'Undergraduate';
  cgpa?: number;
  skills?: string[];
  resumeUrl?: string;
  profilePicture?: string;
  phone?: string;
  linkedIn?: string;

  // Company specific
  companyName?: string;
  industry?: string;
  website?: string;
}

export enum JobType {
  FULL_TIME = 'Full Time',
  INTERNSHIP = 'Internship'
}

export interface Job {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  description: string;
  package: number; // LPA
  location: string;
  type: JobType;
  postedDate: string;
  deadline: string;
  eligibility: {
    minCGPA: number;
    branches: string[];
  };
  rounds: string[];
  status?: 'Active' | 'Stopped';
  registrationUrl?: string; // URL for external registration (from URL posts)
}

export enum ApplicationStatus {
  APPLIED = 'Applied',
  SHORTLISTED = 'Shortlisted',
  REJECTED = 'Rejected',
  OFFERED = 'Offered',
  INTERVIEW_SCHEDULED = 'Interview Scheduled'
}

export interface Application {
  id: string;
  jobId: string;
  studentId: string;
  studentName: string;
  jobTitle: string;
  companyName: string;
  status: ApplicationStatus;
  appliedDate: string;
  resumeUrl?: string;
  feedback?: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

// Announcements - Admin to All Students
export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'urgent';
  createdAt: string;
  createdBy: string;
  expiresAt?: string;
  isActive: boolean;
  readBy: string[]; // Array of user IDs who have read this
}

// Support Messages - Student to Admin Communication
export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  createdAt: string;
  attachments?: string[];
}

export interface SupportTicket {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  subject: string;
  category: 'general' | 'technical' | 'internship' | 'account' | 'feedback';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
}

export interface Stats {
  totalStudents: number;
  placedStudents: number;
  totalCompanies: number;
  averagePackage: number;
  highestPackage: number;
}