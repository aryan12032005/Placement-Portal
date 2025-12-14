import { User, UserRole, Job, Application, JobType, ApplicationStatus } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Admin User',
    email: 'admin@uni.edu',
    role: UserRole.ADMIN,
    approved: true
  },
  {
    id: 'u2',
    name: 'Tech Corp',
    email: 'hr@techcorp.com',
    role: UserRole.COMPANY,
    companyName: 'Tech Corp',
    industry: 'Software',
    website: 'https://techcorp.com',
    approved: true
  },
  {
    id: 'u3',
    name: 'John Doe',
    email: 'john@student.uni.edu',
    role: UserRole.STUDENT,
    rollNumber: 'CS2024001',
    branch: 'Computer Science',
    cgpa: 8.5,
    skills: ['React', 'Node.js', 'Python'],
    approved: true
  }
];

export const MOCK_JOBS: Job[] = [
  {
    id: 'j1',
    companyId: 'u2',
    companyName: 'Tech Corp',
    title: 'Software Engineer I',
    description: 'We are looking for a skilled SDE with React knowledge.',
    package: 12.5,
    location: 'Bangalore',
    type: JobType.FULL_TIME,
    postedDate: new Date().toISOString(),
    deadline: new Date(Date.now() + 86400000 * 10).toISOString(),
    eligibility: {
      minCGPA: 7.0,
      branches: ['Computer Science', 'Information Technology']
    },
    rounds: ['Online Test', 'Technical Interview', 'HR Interview']
  }
];

export const MOCK_APPLICATIONS: Application[] = [];
