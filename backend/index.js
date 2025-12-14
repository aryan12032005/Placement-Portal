const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Job = require('./models/Job');
const { protect, admin, company } = require('./middleware/authMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');

    // Seed Admin
    const adminEmail = 'admin@gmail.com';
    const adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: 'admin@gmail.com',
        role: 'ADMIN',
        approved: true
      });
      console.log('Admin user seeded');
    } else if (!adminUser.approved) {
      adminUser.approved = true;
      await adminUser.save();
      console.log('Admin user approved');
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role, ...otherDetails } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Auto-approve students
    const approved = role === 'STUDENT';

    const user = await User.create({
      name,
      email,
      password,
      role,
      approved,
      ...otherDetails
    });

    if (user) {
      res.status(201).json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approved: user.approved,
        token: generateToken(user._id),
        rollNumber: user.rollNumber,
        branch: user.branch,
        cgpa: user.cgpa,
        skills: user.skills,
        resumeUrl: user.resumeUrl,
        companyName: user.companyName,
        industry: user.industry,
        website: user.website,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approved: user.approved,
        token: generateToken(user._id),
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
        companyName: user.companyName,
        industry: user.industry,
        website: user.website,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User Routes
app.get('/api/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/users/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Update all profile fields
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      user.linkedIn = req.body.linkedIn || user.linkedIn;
      user.rollNumber = req.body.rollNumber || user.rollNumber;
      user.branch = req.body.branch || user.branch;
      user.course = req.body.course || user.course;
      user.collegeName = req.body.collegeName || user.collegeName;
      user.graduationYear = req.body.graduationYear || user.graduationYear;
      user.educationStatus = req.body.educationStatus || user.educationStatus;
      user.cgpa = req.body.cgpa !== undefined ? req.body.cgpa : user.cgpa;
      user.skills = req.body.skills || user.skills;
      user.resumeUrl = req.body.resumeUrl !== undefined ? req.body.resumeUrl : user.resumeUrl;

      const updatedUser = await user.save();
      res.json({
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        approved: updatedUser.approved,
        phone: updatedUser.phone,
        linkedIn: updatedUser.linkedIn,
        rollNumber: updatedUser.rollNumber,
        branch: updatedUser.branch,
        course: updatedUser.course,
        collegeName: updatedUser.collegeName,
        graduationYear: updatedUser.graduationYear,
        educationStatus: updatedUser.educationStatus,
        cgpa: updatedUser.cgpa,
        skills: updatedUser.skills,
        resumeUrl: updatedUser.resumeUrl,
        companyName: updatedUser.companyName,
        industry: updatedUser.industry,
        website: updatedUser.website,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/users/:id/approve', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.approved = true;
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Job Routes
app.post('/api/jobs', protect, company, async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      companyId: req.user._id,
      companyName: req.user.name || req.user.companyName, // Fallback
    });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/jobs', protect, async (req, res) => {
  try {
    const jobs = await Job.find({}).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/jobs/:id', protect, company, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.companyId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this job' });
    }

    job.title = req.body.title || job.title;
    job.description = req.body.description || job.description;
    job.package = req.body.package || job.package;
    job.location = req.body.location || job.location;
    job.type = req.body.type || job.type;
    job.deadline = req.body.deadline || job.deadline;
    job.eligibility = req.body.eligibility || job.eligibility;
    job.rounds = req.body.rounds || job.rounds;

    const updatedJob = await job.save();
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/jobs/:id/stop', protect, company, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.companyId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this job' });
    }

    job.status = 'Stopped';
    const updatedJob = await job.save();
    res.json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
