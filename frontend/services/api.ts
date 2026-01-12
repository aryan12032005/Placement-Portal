import { User, Job, Application, UserRole, ApplicationStatus, Notification } from '../types';
import { MOCK_USERS, MOCK_JOBS, MOCK_APPLICATIONS } from './mockData';

// Keys for localStorage
const USERS_KEY = 'uniplace_users';
const JOBS_KEY = 'uniplace_jobs';
const APPS_KEY = 'uniplace_apps';
const NOTIFS_KEY = 'uniplace_notifs';
const HACKATHONS_KEY = 'uniplace_hackathons';

// Default hackathons data
const DEFAULT_HACKATHONS = [
  {
    id: 'h1',
    title: 'Google Summer of Code 2025',
    organizer: 'Google',
    logo: 'G',
    deadline: '2025-04-02',
    startDate: '2025-05-27',
    endDate: '2025-08-25',
    postedDate: '2025-12-15',
    prize: 'Stipend + Swag',
    participants: 18000,
    mode: 'Online',
    tags: ['Open Source', 'Coding', 'Mentorship'],
    difficulty: 'Intermediate',
    description: 'Contribute to open source projects with guidance from experienced mentors. A 12-week program for student developers.',
    registrationUrl: 'https://summerofcode.withgoogle.com/',
    status: 'Upcoming'
  },
  {
    id: 'h2',
    title: 'Microsoft Imagine Cup 2025',
    organizer: 'Microsoft',
    logo: 'M',
    deadline: '2025-02-15',
    startDate: '2025-03-01',
    endDate: '2025-05-30',
    postedDate: '2025-12-10',
    prize: '₹75,00,000+',
    participants: 50000,
    mode: 'Hybrid',
    location: 'Seattle, USA (Finals)',
    tags: ['AI/ML', 'Cloud', 'Innovation'],
    difficulty: 'Advanced',
    description: 'Build innovative solutions using Microsoft technologies.',
    registrationUrl: 'https://imaginecup.microsoft.com/',
    status: 'Upcoming'
  },
  {
    id: 'h3',
    title: 'Flipkart GRiD 6.0',
    organizer: 'Flipkart',
    logo: 'F',
    deadline: '2025-01-30',
    startDate: '2025-02-15',
    endDate: '2025-04-10',
    postedDate: '2025-12-17',
    prize: '₹6,00,000',
    participants: 125000,
    mode: 'Online',
    tags: ['E-commerce', 'Problem Solving', 'Tech'],
    difficulty: 'Intermediate',
    description: 'India\'s largest tech challenge for engineering students.',
    registrationUrl: 'https://unstop.com/hackathons/flipkart-grid',
    status: 'Ongoing'
  }
];

// Initialize storage if empty
const initStorage = () => {
  if (!localStorage.getItem(USERS_KEY)) localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS));
  if (!localStorage.getItem(JOBS_KEY)) localStorage.setItem(JOBS_KEY, JSON.stringify(MOCK_JOBS));
  if (!localStorage.getItem(APPS_KEY)) localStorage.setItem(APPS_KEY, JSON.stringify(MOCK_APPLICATIONS));
  if (!localStorage.getItem(NOTIFS_KEY)) localStorage.setItem(NOTIFS_KEY, JSON.stringify([]));
  if (!localStorage.getItem(HACKATHONS_KEY)) localStorage.setItem(HACKATHONS_KEY, JSON.stringify(DEFAULT_HACKATHONS));
};

initStorage();

const getItems = <T>(key: string): T[] => JSON.parse(localStorage.getItem(key) || '[]');
const setItems = <T>(key: string, items: T[]) => localStorage.setItem(key, JSON.stringify(items));

// Dynamic API URL - uses localhost for development, Render for production
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5001/api' 
  : 'https://placement-portal-1ca3.onrender.com/api';
export const Api = {
  // Auth & User
  login: async (email: string, password?: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },
  
  register: async (user: any): Promise<User> => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  googleLogin: async (credential: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Google login failed:', data.message);
        return null;
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      return data;
    } catch (error) {
      console.error('Google login error:', error);
      return null;
    }
  },

  updateUser: async (user: User): Promise<User> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: user.name,
          phone: user.phone,
          linkedIn: user.linkedIn,
          rollNumber: user.rollNumber,
          branch: user.branch,
          course: user.course,
          collegeName: user.collegeName,
          graduationYear: user.graduationYear,
          educationStatus: user.educationStatus,
          cgpa: user.cgpa,
          skills: user.skills,
          resumeUrl: user.resumeUrl,
          profilePicture: user.profilePicture,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to update profile');
      }
      return await response.json();
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const users = await response.json();
      // Map _id to id for frontend compatibility
      return users.map((u: any) => ({ ...u, id: u._id }));
    } catch (error) {
      console.error('Get all users error:', error);
      return [];
    }
  },

  getStudents: async (): Promise<User[]> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch students');
      const users = await response.json();
      return users.map((u: any) => ({ ...u, id: u._id }));
    } catch (error) {
      console.error('Get students error:', error);
      return [];
    }
  },

  getUserById: async (userId: string): Promise<User | null> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) return null;
      const user = await response.json();
      return { ...user, id: user._id };
    } catch (error) {
      console.error('Get user by id error:', error);
      return null;
    }
  },

  approveUser: async (userId: string): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/${userId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to approve user');
      }
    } catch (error) {
      console.error('Approve user error:', error);
      throw error;
    }
  },

  // Jobs
  getJobs: async (): Promise<Job[]> => {
    // Use localStorage for consistency (like hackathons)
    return getItems<Job>(JOBS_KEY);
  },
  
  postJob: async (job: Omit<Job, 'id' | 'postedDate' | 'companyName'>, companyName: string): Promise<Job> => {
    // Use localStorage for consistency (like hackathons)
    const jobs = getItems<Job>(JOBS_KEY);
    const newJob: Job = {
      ...job,
      id: `j${Date.now()}`,
      companyName: companyName,
      postedDate: new Date().toISOString().split('T')[0],
    } as Job;
    jobs.unshift(newJob); // Add to beginning (most recent first)
    setItems(JOBS_KEY, jobs);
    return newJob;
  },

  stopRecruiting: async (jobId: string): Promise<Job> => {
    const jobs = getItems<Job>(JOBS_KEY);
    const jobIndex = jobs.findIndex(j => j.id === jobId);
    if (jobIndex === -1) throw new Error('Job not found');
    jobs[jobIndex] = { ...jobs[jobIndex], status: 'Stopped' };
    setItems(JOBS_KEY, jobs);
    return jobs[jobIndex];
  },

  updateJob: async (jobId: string, job: Partial<Job>): Promise<Job> => {
    const jobs = getItems<Job>(JOBS_KEY);
    const jobIndex = jobs.findIndex(j => j.id === jobId);
    if (jobIndex === -1) throw new Error('Job not found');
    jobs[jobIndex] = { ...jobs[jobIndex], ...job };
    setItems(JOBS_KEY, jobs);
    return jobs[jobIndex];
  },

  getJobById: async (jobId: string): Promise<Job | null> => {
    const jobs = getItems<Job>(JOBS_KEY);
    return jobs.find(j => j.id === jobId) || null;
  },

  deleteJob: async (jobId: string): Promise<void> => {
    const jobs = getItems<Job>(JOBS_KEY);
    const filtered = jobs.filter(j => j.id !== jobId);
    setItems(JOBS_KEY, filtered);
  },

  // Applications
  applyForJob: async (jobId: string, studentId: string, studentName: string, jobTitle: string, companyName: string): Promise<Application> => {
    const apps = getItems<Application>(APPS_KEY);
    const newApp: Application = {
      id: `a${Date.now()}`,
      jobId,
      studentId,
      studentName,
      jobTitle,
      companyName,
      status: ApplicationStatus.APPLIED,
      appliedDate: new Date().toISOString()
    };
    apps.push(newApp);
    setItems(APPS_KEY, apps);
    return newApp;
  },

  getApplications: async (): Promise<Application[]> => getItems<Application>(APPS_KEY),

  updateApplicationStatus: async (id: string, status: ApplicationStatus): Promise<void> => {
    const apps = getItems<Application>(APPS_KEY);
    const app = apps.find(a => a.id === id);
    if (app) {
      app.status = status;
      setItems(APPS_KEY, apps);
    }
  },

  deleteApplication: async (id: string): Promise<void> => {
    const apps = getItems<Application>(APPS_KEY);
    const filtered = apps.filter(a => a.id !== id);
    setItems(APPS_KEY, filtered);
  },

  deleteUser: async (userId: string): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  },

  // Notifications
  getNotifications: async (userId: string): Promise<Notification[]> => {
    const all = getItems<Notification>(NOTIFS_KEY);
    return all.filter(n => n.userId === userId).reverse();
  },

  addNotification: async (userId: string, message: string, type: Notification['type'] = 'info'): Promise<void> => {
    const all = getItems<Notification>(NOTIFS_KEY);
    all.push({
      id: `n${Date.now()}`,
      userId,
      message,
      date: new Date().toISOString(),
      read: false,
      type
    });
    setItems(NOTIFS_KEY, all);
  },

  // Hackathons
  getHackathons: async (): Promise<any[]> => {
    return getItems<any>(HACKATHONS_KEY);
  },

  postHackathon: async (hackathon: any): Promise<any> => {
    const hackathons = getItems<any>(HACKATHONS_KEY);
    const newHackathon = {
      ...hackathon,
      id: `h${Date.now()}`,
      postedDate: new Date().toISOString().split('T')[0],
      participants: Math.floor(Math.random() * 50000) + 1000,
      logo: hackathon.organizer?.charAt(0) || 'H',
      tags: hackathon.tags ? hackathon.tags.split(',').map((t: string) => t.trim()) : [],
      status: new Date(hackathon.startDate) > new Date() ? 'Upcoming' : 'Ongoing'
    };
    hackathons.unshift(newHackathon); // Add to beginning (most recent first)
    setItems(HACKATHONS_KEY, hackathons);
    return newHackathon;
  },

  deleteHackathon: async (id: string): Promise<void> => {
    const hackathons = getItems<any>(HACKATHONS_KEY);
    const filtered = hackathons.filter(h => h.id !== id);
    setItems(HACKATHONS_KEY, filtered);
  },

  // ============================================================
  // INTERNSHIP EXTRACTION API
  // ============================================================

  /**
   * Extract internship details from any public internship page URL
   * @param url - Public URL of the internship page
   * @returns Structured internship data
   * 
   * @example
   * const data = await Api.extractInternship('https://internshala.com/internship/...');
   * console.log(data);
   * // { title: "Web Developer Intern", stipend: "₹15,000/month", deadline: "25 Dec 2025", location: "Remote", eligibility: "..." }
   */
  extractInternship: async (url: string): Promise<{
    title: string;
    stipend: string;
    deadline: string;
    location: string;
    eligibility: string;
  }> => {
    try {
      const response = await fetch(`${API_URL}/extract-internship`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error extracting internship:', error);
      throw error;
    }
  }
};