import { User, Job, Application, UserRole, ApplicationStatus, Notification, Announcement, SupportTicket, SupportMessage } from '../types';
import { MOCK_USERS, MOCK_JOBS, MOCK_APPLICATIONS } from './mockData';

// Keys for localStorage
const USERS_KEY = 'uniplace_users';
const JOBS_KEY = 'uniplace_jobs';
const APPS_KEY = 'uniplace_apps';
const NOTIFS_KEY = 'uniplace_notifs';
const HACKATHONS_KEY = 'uniplace_hackathons';
const COURSES_KEY = 'uniplace_courses';
const RESOURCES_KEY = 'uniplace_resources';
const ANNOUNCEMENTS_KEY = 'uniplace_announcements';
const SUPPORT_TICKETS_KEY = 'uniplace_support_tickets';

// Default courses with real YouTube links
const DEFAULT_COURSES = [
  {
    id: 'c1',
    title: 'Complete Web Development Bootcamp 2024',
    description: 'Learn HTML, CSS, JavaScript, React, Node.js and become a full-stack developer with hands-on projects',
    instructor: 'Dr. Angela Yu',
    duration: '65 hours',
    lessons: 480,
    level: 'Beginner',
    category: 'Web Development',
    thumbnail: 'https://img.youtube.com/vi/nu_pCVPKzTk/maxresdefault.jpg',
    youtubeUrl: 'https://www.youtube.com/watch?v=nu_pCVPKzTk',
    youtubePlaylist: 'https://www.youtube.com/playlist?list=PLu0W_9lII9agq5TBKswU-fRdtTUqhnDZH',
    rating: 4.8,
    students: 850000,
    isFree: true,
    tags: ['HTML', 'CSS', 'JavaScript', 'React'],
    status: 'Active'
  },
  {
    id: 'c2',
    title: 'Data Structures & Algorithms Complete Course',
    description: 'Master DSA concepts with 200+ coding problems and interview preparation by Striver',
    instructor: 'Striver (Raj Vikramaditya)',
    duration: '45 hours',
    lessons: 250,
    level: 'Intermediate',
    category: 'Programming',
    thumbnail: 'https://img.youtube.com/vi/0bHoB32fuj0/maxresdefault.jpg',
    youtubeUrl: 'https://www.youtube.com/watch?v=0bHoB32fuj0',
    youtubePlaylist: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz',
    rating: 4.9,
    students: 420000,
    isFree: true,
    tags: ['DSA', 'Algorithms', 'Coding', 'Interview'],
    status: 'Active'
  },
  {
    id: 'c3',
    title: 'Machine Learning Full Course',
    description: 'Learn Machine Learning from scratch with Python - Complete Tutorial for Beginners',
    instructor: 'Krish Naik',
    duration: '44 hours',
    lessons: 320,
    level: 'Intermediate',
    category: 'AI/ML',
    thumbnail: 'https://img.youtube.com/vi/JxgmHe2NyeY/maxresdefault.jpg',
    youtubeUrl: 'https://www.youtube.com/watch?v=JxgmHe2NyeY',
    youtubePlaylist: 'https://www.youtube.com/playlist?list=PLZoTAELRMXVPBTrWtJkn3wWQxZkmTXGwe',
    rating: 4.7,
    students: 950000,
    isFree: true,
    tags: ['Python', 'Machine Learning', 'AI', 'Data Science'],
    status: 'Active'
  },
  {
    id: 'c4',
    title: 'React JS Full Course 2024',
    description: 'Learn React from scratch - Components, Hooks, Redux, and build real projects',
    instructor: 'Chai aur Code',
    duration: '28 hours',
    lessons: 180,
    level: 'Beginner',
    category: 'Web Development',
    thumbnail: 'https://img.youtube.com/vi/FxgM9k1rg0Q/maxresdefault.jpg',
    youtubeUrl: 'https://www.youtube.com/watch?v=FxgM9k1rg0Q',
    youtubePlaylist: 'https://www.youtube.com/playlist?list=PLu71SKxNbfoDqgPchmvIsL4hTnJIrtige',
    rating: 4.8,
    students: 280000,
    isFree: true,
    tags: ['React', 'JavaScript', 'Frontend', 'Hooks'],
    status: 'Active'
  },
  {
    id: 'c5',
    title: 'Python for Beginners - Full Course',
    description: 'Learn Python programming from scratch - Complete beginner to advanced tutorial',
    instructor: 'CodeWithHarry',
    duration: '15 hours',
    lessons: 120,
    level: 'Beginner',
    category: 'Programming',
    thumbnail: 'https://img.youtube.com/vi/gfDE2a7MKjA/maxresdefault.jpg',
    youtubeUrl: 'https://www.youtube.com/watch?v=gfDE2a7MKjA',
    youtubePlaylist: 'https://www.youtube.com/playlist?list=PLu0W_9lII9agICnT8t4iYVSZ3eykIAOME',
    rating: 4.8,
    students: 560000,
    isFree: true,
    tags: ['Python', 'Programming', 'Beginner'],
    status: 'Active'
  },
  {
    id: 'c6',
    title: 'SQL Complete Tutorial',
    description: 'Master SQL queries, database design, and PostgreSQL from scratch',
    instructor: 'Apna College',
    duration: '22 hours',
    lessons: 150,
    level: 'Beginner',
    category: 'Database',
    thumbnail: 'https://img.youtube.com/vi/hlGoQC332VM/maxresdefault.jpg',
    youtubeUrl: 'https://www.youtube.com/watch?v=hlGoQC332VM',
    youtubePlaylist: 'https://www.youtube.com/playlist?list=PLfqMhTWNBTe0PY9xunOzsP5kmYIz2Hu7i',
    rating: 4.7,
    students: 380000,
    isFree: true,
    tags: ['SQL', 'Database', 'MySQL', 'PostgreSQL'],
    status: 'Active'
  },
  {
    id: 'c7',
    title: 'Java + DSA Complete Course',
    description: 'Learn Java programming with Data Structures & Algorithms - Placement ready',
    instructor: 'Kunal Kushwaha',
    duration: '60 hours',
    lessons: 400,
    level: 'Beginner',
    category: 'Programming',
    thumbnail: 'https://img.youtube.com/vi/rZ41y93P2Qo/maxresdefault.jpg',
    youtubeUrl: 'https://www.youtube.com/watch?v=rZ41y93P2Qo',
    youtubePlaylist: 'https://www.youtube.com/playlist?list=PL9gnSGHSqcnr_DxHsP7AW9ftq0AtAyYqJ',
    rating: 4.9,
    students: 720000,
    isFree: true,
    tags: ['Java', 'DSA', 'Programming', 'Placement'],
    status: 'Active'
  },
  {
    id: 'c8',
    title: 'System Design Complete Course',
    description: 'Learn System Design for interviews - Low Level and High Level Design',
    instructor: 'Gaurav Sen',
    duration: '25 hours',
    lessons: 100,
    level: 'Advanced',
    category: 'System Design',
    thumbnail: 'https://img.youtube.com/vi/xpDnVSmNFX0/maxresdefault.jpg',
    youtubeUrl: 'https://www.youtube.com/watch?v=xpDnVSmNFX0',
    youtubePlaylist: 'https://www.youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX',
    rating: 4.9,
    students: 450000,
    isFree: true,
    tags: ['System Design', 'Interview', 'Architecture'],
    status: 'Active'
  }
];

// Default resources with real links
const DEFAULT_RESOURCES = [
  { id: 'r1', title: 'Resume Building Guide 2025', type: 'video', category: 'Career', duration: '25 min', url: 'https://www.youtube.com/watch?v=Tt08KmFfIYQ', isNew: true },
  { id: 'r2', title: 'Technical Interview Preparation', type: 'video', category: 'Interview', duration: '2 hours', url: 'https://www.youtube.com/watch?v=F8xQ5joVLBg', isNew: true },
  { id: 'r3', title: 'Git & GitHub Complete Tutorial', type: 'video', category: 'Tools', duration: '1 hour', url: 'https://www.youtube.com/watch?v=apGV9Kg7ics', isNew: false },
  { id: 'r4', title: 'System Design Interview Guide', type: 'article', category: 'Interview', url: 'https://github.com/donnemartin/system-design-primer', isNew: false },
  { id: 'r5', title: 'DSA Sheet by Striver', type: 'link', category: 'DSA', url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2', isNew: true },
  { id: 'r6', title: 'LinkedIn Profile Tips', type: 'video', category: 'Career', duration: '15 min', url: 'https://www.youtube.com/watch?v=zd4ALKv8Das', isNew: true },
  { id: 'r7', title: 'Soft Skills for Interviews', type: 'video', category: 'Interview', duration: '30 min', url: 'https://www.youtube.com/watch?v=HG68Ymazo18', isNew: false },
  { id: 'r8', title: 'LeetCode Problem Patterns', type: 'link', category: 'DSA', url: 'https://seanprashad.com/leetcode-patterns/', isNew: false },
  { id: 'r9', title: 'Roadmap.sh Developer Roadmaps', type: 'link', category: 'Career', url: 'https://roadmap.sh/', isNew: true },
  { id: 'r10', title: 'CS50 Harvard Course', type: 'video', category: 'Programming', duration: '24 hours', url: 'https://www.youtube.com/watch?v=8mAITcNt710', isNew: false }
];

// Default announcements
const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann1',
    title: 'Welcome to InternHub!',
    message: 'Explore internship opportunities, participate in hackathons, and enhance your skills with our curated courses. Good luck with your placement journey! 🚀',
    type: 'info',
    createdAt: new Date().toISOString(),
    createdBy: 'Admin',
    isActive: true,
    readBy: []
  },
  {
    id: 'ann2',
    title: 'New Internships Added',
    message: 'We have added 5 new internship opportunities from top companies including Google, Microsoft, and Amazon. Apply before the deadline!',
    type: 'success',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    createdBy: 'Admin',
    isActive: true,
    readBy: []
  },
  {
    id: 'ann3',
    title: 'Google Summer of Code 2025 Registration Open',
    message: 'GSoC 2025 registrations are now open! Don\'t miss this opportunity to work with top open source organizations. Deadline: April 2, 2025.',
    type: 'urgent',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    createdBy: 'Admin',
    isActive: true,
    readBy: []
  }
];

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
  if (!localStorage.getItem(COURSES_KEY)) localStorage.setItem(COURSES_KEY, JSON.stringify(DEFAULT_COURSES));
  if (!localStorage.getItem(RESOURCES_KEY)) localStorage.setItem(RESOURCES_KEY, JSON.stringify(DEFAULT_RESOURCES));
  if (!localStorage.getItem(ANNOUNCEMENTS_KEY)) localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(DEFAULT_ANNOUNCEMENTS));
  if (!localStorage.getItem(SUPPORT_TICKETS_KEY)) localStorage.setItem(SUPPORT_TICKETS_KEY, JSON.stringify([]));
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

  // Courses
  getCourses: async (): Promise<any[]> => {
    return getItems<any>(COURSES_KEY);
  },

  postCourse: async (course: any): Promise<any> => {
    const courses = getItems<any>(COURSES_KEY);
    const newCourse = {
      ...course,
      id: `c${Date.now()}`,
      rating: 0,
      students: 0,
      isFree: course.isFree ?? true,
      tags: course.tags ? (typeof course.tags === 'string' ? course.tags.split(',').map((t: string) => t.trim()) : course.tags) : [],
      status: 'Active'
    };
    courses.unshift(newCourse);
    setItems(COURSES_KEY, courses);
    return newCourse;
  },

  updateCourse: async (id: string, updates: any): Promise<any> => {
    const courses = getItems<any>(COURSES_KEY);
    const index = courses.findIndex(c => c.id === id);
    if (index !== -1) {
      courses[index] = { 
        ...courses[index], 
        ...updates,
        tags: updates.tags ? (typeof updates.tags === 'string' ? updates.tags.split(',').map((t: string) => t.trim()) : updates.tags) : courses[index].tags
      };
      setItems(COURSES_KEY, courses);
      return courses[index];
    }
    throw new Error('Course not found');
  },

  deleteCourse: async (id: string): Promise<void> => {
    const courses = getItems<any>(COURSES_KEY);
    const filtered = courses.filter(c => c.id !== id);
    setItems(COURSES_KEY, filtered);
  },

  // Resources
  getResources: async (): Promise<any[]> => {
    return getItems<any>(RESOURCES_KEY);
  },

  postResource: async (resource: any): Promise<any> => {
    const resources = getItems<any>(RESOURCES_KEY);
    const newResource = {
      ...resource,
      id: `r${Date.now()}`,
      isNew: true
    };
    resources.unshift(newResource);
    setItems(RESOURCES_KEY, resources);
    return newResource;
  },

  updateResource: async (id: string, updates: any): Promise<any> => {
    const resources = getItems<any>(RESOURCES_KEY);
    const index = resources.findIndex(r => r.id === id);
    if (index !== -1) {
      resources[index] = { ...resources[index], ...updates };
      setItems(RESOURCES_KEY, resources);
      return resources[index];
    }
    throw new Error('Resource not found');
  },

  deleteResource: async (id: string): Promise<void> => {
    const resources = getItems<any>(RESOURCES_KEY);
    const filtered = resources.filter(r => r.id !== id);
    setItems(RESOURCES_KEY, filtered);
  },

  // ============================================================
  // ANNOUNCEMENTS API
  // ============================================================

  getAnnouncements: async (): Promise<Announcement[]> => {
    return getItems<Announcement>(ANNOUNCEMENTS_KEY);
  },

  getActiveAnnouncements: async (): Promise<Announcement[]> => {
    const announcements = getItems<Announcement>(ANNOUNCEMENTS_KEY);
    return announcements.filter(a => a.isActive);
  },

  postAnnouncement: async (announcement: Partial<Announcement>): Promise<Announcement> => {
    const announcements = getItems<Announcement>(ANNOUNCEMENTS_KEY);
    const newAnnouncement: Announcement = {
      id: `ann${Date.now()}`,
      title: announcement.title || '',
      message: announcement.message || '',
      type: announcement.type || 'info',
      createdAt: new Date().toISOString(),
      createdBy: announcement.createdBy || 'Admin',
      expiresAt: announcement.expiresAt,
      isActive: true,
      readBy: []
    };
    announcements.unshift(newAnnouncement);
    setItems(ANNOUNCEMENTS_KEY, announcements);
    return newAnnouncement;
  },

  updateAnnouncement: async (id: string, updates: Partial<Announcement>): Promise<Announcement> => {
    const announcements = getItems<Announcement>(ANNOUNCEMENTS_KEY);
    const index = announcements.findIndex(a => a.id === id);
    if (index !== -1) {
      announcements[index] = { ...announcements[index], ...updates };
      setItems(ANNOUNCEMENTS_KEY, announcements);
      return announcements[index];
    }
    throw new Error('Announcement not found');
  },

  markAnnouncementRead: async (announcementId: string, userId: string): Promise<void> => {
    const announcements = getItems<Announcement>(ANNOUNCEMENTS_KEY);
    const index = announcements.findIndex(a => a.id === announcementId);
    if (index !== -1 && !announcements[index].readBy.includes(userId)) {
      announcements[index].readBy.push(userId);
      setItems(ANNOUNCEMENTS_KEY, announcements);
    }
  },

  deleteAnnouncement: async (id: string): Promise<void> => {
    const announcements = getItems<Announcement>(ANNOUNCEMENTS_KEY);
    const filtered = announcements.filter(a => a.id !== id);
    setItems(ANNOUNCEMENTS_KEY, filtered);
  },

  // ============================================================
  // SUPPORT TICKETS API
  // ============================================================

  getSupportTickets: async (): Promise<SupportTicket[]> => {
    return getItems<SupportTicket>(SUPPORT_TICKETS_KEY);
  },

  getStudentTickets: async (studentId: string): Promise<SupportTicket[]> => {
    const tickets = getItems<SupportTicket>(SUPPORT_TICKETS_KEY);
    return tickets.filter(t => t.studentId === studentId);
  },

  createSupportTicket: async (ticket: Partial<SupportTicket>): Promise<SupportTicket> => {
    const tickets = getItems<SupportTicket>(SUPPORT_TICKETS_KEY);
    const newTicket: SupportTicket = {
      id: `ticket${Date.now()}`,
      studentId: ticket.studentId || '',
      studentName: ticket.studentName || '',
      studentEmail: ticket.studentEmail || '',
      subject: ticket.subject || '',
      category: ticket.category || 'general',
      status: 'open',
      priority: ticket.priority || 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: ticket.messages || []
    };
    tickets.unshift(newTicket);
    setItems(SUPPORT_TICKETS_KEY, tickets);
    return newTicket;
  },

  addMessageToTicket: async (ticketId: string, message: Partial<SupportMessage>): Promise<SupportTicket> => {
    const tickets = getItems<SupportTicket>(SUPPORT_TICKETS_KEY);
    const index = tickets.findIndex(t => t.id === ticketId);
    if (index !== -1) {
      const newMessage: SupportMessage = {
        id: `msg${Date.now()}`,
        ticketId,
        senderId: message.senderId || '',
        senderName: message.senderName || '',
        senderRole: message.senderRole || UserRole.STUDENT,
        message: message.message || '',
        createdAt: new Date().toISOString()
      };
      tickets[index].messages.push(newMessage);
      tickets[index].updatedAt = new Date().toISOString();
      setItems(SUPPORT_TICKETS_KEY, tickets);
      return tickets[index];
    }
    throw new Error('Ticket not found');
  },

  updateTicketStatus: async (ticketId: string, status: SupportTicket['status']): Promise<SupportTicket> => {
    const tickets = getItems<SupportTicket>(SUPPORT_TICKETS_KEY);
    const index = tickets.findIndex(t => t.id === ticketId);
    if (index !== -1) {
      tickets[index].status = status;
      tickets[index].updatedAt = new Date().toISOString();
      setItems(SUPPORT_TICKETS_KEY, tickets);
      return tickets[index];
    }
    throw new Error('Ticket not found');
  },

  deleteTicket: async (id: string): Promise<void> => {
    const tickets = getItems<SupportTicket>(SUPPORT_TICKETS_KEY);
    const filtered = tickets.filter(t => t.id !== id);
    setItems(SUPPORT_TICKETS_KEY, filtered);
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