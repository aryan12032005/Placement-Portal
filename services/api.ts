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

export const Api = {
  // Auth & User
  login: async (email: string): Promise<User | null> => {
    const users = getItems<User>(USERS_KEY);
    return users.find(u => u.email === email) || null;
  },
  
  register: async (user: Omit<User, 'id' | 'approved'>): Promise<User> => {
    const users = getItems<User>(USERS_KEY);
    const newUser: User = { ...user, id: `u${Date.now()}`, approved: false }; // Auto-approve logic can be added
    if (user.role === UserRole.STUDENT) newUser.approved = true; // Auto approve students for demo
    
    users.push(newUser);
    setItems(USERS_KEY, users);
    return newUser;
  },

  updateUser: async (user: User): Promise<User> => {
    const users = getItems<User>(USERS_KEY);
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      setItems(USERS_KEY, users);
    }
    return user;
  },

  getAllUsers: async (): Promise<User[]> => getItems<User>(USERS_KEY),

  // Jobs
  getJobs: async (): Promise<Job[]> => getItems<Job>(JOBS_KEY),
  
  postJob: async (job: Omit<Job, 'id' | 'postedDate' | 'companyName'>, companyName: string): Promise<Job> => {
    const jobs = getItems<Job>(JOBS_KEY);
    const newJob: Job = {
      ...job,
      id: `j${Date.now()}`,
      postedDate: new Date().toISOString(),
      companyName
    };
    jobs.push(newJob);
    setItems(JOBS_KEY, jobs);
    return newJob;
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