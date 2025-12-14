import { User, Job, Application, UserRole, ApplicationStatus, Notification } from '../types';
import { MOCK_USERS, MOCK_JOBS, MOCK_APPLICATIONS } from './mockData';

// Keys for localStorage
const USERS_KEY = 'uniplace_users';
const JOBS_KEY = 'uniplace_jobs';
const APPS_KEY = 'uniplace_apps';
const NOTIFS_KEY = 'uniplace_notifs';

// Initialize storage if empty
const initStorage = () => {
  if (!localStorage.getItem(USERS_KEY)) localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS));
  if (!localStorage.getItem(JOBS_KEY)) localStorage.setItem(JOBS_KEY, JSON.stringify(MOCK_JOBS));
  if (!localStorage.getItem(APPS_KEY)) localStorage.setItem(APPS_KEY, JSON.stringify(MOCK_APPLICATIONS));
  if (!localStorage.getItem(NOTIFS_KEY)) localStorage.setItem(NOTIFS_KEY, JSON.stringify([]));
};

initStorage();

const getItems = <T>(key: string): T[] => JSON.parse(localStorage.getItem(key) || '[]');
const setItems = <T>(key: string, items: T[]) => localStorage.setItem(key, JSON.stringify(items));

const API_URL = 'http://localhost:5000/api';

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
          cgpa: user.cgpa,
          skills: user.skills,
          resumeUrl: user.resumeUrl,
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
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const jobs = await response.json();
      return jobs.map((j: any) => ({ ...j, id: j._id }));
    } catch (error) {
      console.error('Get jobs error:', error);
      return [];
    }
  },
  
  postJob: async (job: Omit<Job, 'id' | 'postedDate' | 'companyName'>, companyName: string): Promise<Job> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(job),
      });
      if (!response.ok) throw new Error('Failed to post job');
      const newJob = await response.json();
      return { ...newJob, id: newJob._id };
    } catch (error) {
      console.error('Post job error:', error);
      throw error;
    }
  },

  stopRecruiting: async (jobId: string): Promise<Job> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/jobs/${jobId}/stop`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to stop recruiting');
      const updatedJob = await response.json();
      return { ...updatedJob, id: updatedJob._id };
    } catch (error) {
      console.error('Stop recruiting error:', error);
      throw error;
    }
  },

  updateJob: async (jobId: string, job: Partial<Job>): Promise<Job> => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(job),
      });
      if (!response.ok) throw new Error('Failed to update job');
      const updatedJob = await response.json();
      return { ...updatedJob, id: updatedJob._id };
    } catch (error) {
      console.error('Update job error:', error);
      throw error;
    }
  },

  getJobById: async (jobId: string): Promise<Job | null> => {
    try {
      const jobs = await Api.getJobs();
      return jobs.find(j => j.id === jobId) || null;
    } catch (error) {
      console.error('Get job by id error:', error);
      return null;
    }
  },

  // Applications

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
  }
};