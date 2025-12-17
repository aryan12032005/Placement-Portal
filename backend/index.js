const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const cheerio = require('cheerio');
const User = require('./models/User');
const Job = require('./models/Job');
const { protect, admin, company } = require('./middleware/authMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const GOOGLE_CLIENT_ID = '54168296388-6k44kvp61sg35ldnfatuij2s64h2prq8.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

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

// Google Auth
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;

  try {
    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // User exists, log them in
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
        profilePicture: user.profilePicture || picture,
      });
    } else {
      // Create new user with STUDENT role (auto-approved)
      user = await User.create({
        name,
        email,
        password: googleId + Date.now(), // Random password since they use Google auth
        role: 'STUDENT',
        approved: true,
        googleId,
        profilePicture: picture,
      });

      res.status(201).json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approved: user.approved,
        token: generateToken(user._id),
        profilePicture: picture,
      });
    }
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ message: 'Google authentication failed' });
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

// Get all students (for companies to view applicant details)
app.get('/api/users/students', protect, async (req, res) => {
  try {
    const users = await User.find({ role: 'STUDENT' }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID
app.get('/api/users/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
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

// URL Scraping endpoint for internships and hackathons
app.post('/api/scrape', async (req, res) => {
  const { url, type } = req.body; // type: 'internship' or 'hackathon'

  if (!url) {
    return res.status(400).json({ message: 'URL is required' });
  }

  // Helper to extract info from URL when scraping fails
  const extractFromUrl = (url, type) => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace('www.', '');
      const pathParts = urlObj.pathname.split('/').filter(p => p && p.length > 2);
      
      // Extract title from URL path
      let title = pathParts[pathParts.length - 1] || pathParts[0] || '';
      title = title.replace(/[-_]/g, ' ').replace(/\d+$/, '').trim();
      title = title.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      
      // Get organizer from hostname
      const orgParts = hostname.split('.');
      const organizer = orgParts[0].charAt(0).toUpperCase() + orgParts[0].slice(1);
      
      // Determine location from URL hints
      let location = 'Remote';
      const urlLower = url.toLowerCase();
      if (urlLower.includes('mumbai')) location = 'Mumbai';
      else if (urlLower.includes('bangalore') || urlLower.includes('bengaluru')) location = 'Bangalore';
      else if (urlLower.includes('delhi') || urlLower.includes('noida') || urlLower.includes('gurgaon')) location = 'Delhi NCR';
      else if (urlLower.includes('hyderabad')) location = 'Hyderabad';
      else if (urlLower.includes('pune')) location = 'Pune';
      else if (urlLower.includes('chennai')) location = 'Chennai';
      
      const baseResult = {
        title: title || (type === 'hackathon' ? 'Hackathon Event' : 'Internship Opportunity'),
        description: `Opportunity from ${organizer}. Please verify details on the original page.`,
        organizer: organizer,
        url: url,
      };
      
      if (type === 'hackathon') {
        return {
          ...baseResult,
          deadline: generateFutureDate(14),
          startDate: generateFutureDate(21),
          endDate: generateFutureDate(23),
          prize: '₹1,00,000',
          mode: 'Online',
          location: location,
          difficulty: 'Intermediate',
          tags: 'Technology, Innovation',
        };
      } else {
        return {
          ...baseResult,
          deadline: generateFutureDate(14),
          package: '15000',
          location: location,
          minCGPA: 6.0,
          branches: 'Computer Science, Information Technology',
          rounds: 'Online Assessment, Technical Interview, HR Interview',
        };
      }
    } catch {
      return null;
    }
  };

  try {
    // Fetch the page with a browser-like user agent
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 8000,
    });

    const $ = cheerio.load(response.data);

    // Extract metadata from Open Graph and meta tags
    const getMetaContent = (selectors) => {
      for (const selector of selectors) {
        const content = $(selector).attr('content') || $(selector).text();
        if (content && content.trim()) return content.trim();
      }
      return '';
    };

    // Get title from various sources
    const title = getMetaContent([
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
      'title',
      'h1',
    ]) || $('h1').first().text().trim() || $('title').text().trim();

    // Get description
    const description = getMetaContent([
      'meta[property="og:description"]',
      'meta[name="description"]',
      'meta[name="twitter:description"]',
    ]) || $('p').first().text().trim().substring(0, 500);

    // Get organization/company name
    const organizer = getMetaContent([
      'meta[property="og:site_name"]',
      'meta[name="author"]',
    ]) || extractOrganizer(url, $);

    // Extract dates from page content
    const pageText = $('body').text();
    const dates = extractDates(pageText);

    // Extract prize/stipend information
    const prizeInfo = extractPrizeOrStipend(pageText, type);

    // Extract location
    const location = extractLocation(pageText, $);

    // Extract mode (online/offline/hybrid)
    const mode = extractMode(pageText);

    // Build response based on type
    let result = {
      title: cleanTitle(title),
      description: description.substring(0, 1000),
      organizer: organizer,
      url: url,
    };

    if (type === 'hackathon') {
      result = {
        ...result,
        deadline: dates.deadline || dates.registrationEnd || generateFutureDate(14),
        startDate: dates.startDate || generateFutureDate(21),
        endDate: dates.endDate || generateFutureDate(23),
        prize: prizeInfo.prize || 'Exciting prizes',
        mode: mode,
        location: location,
        difficulty: 'Intermediate',
        tags: extractTags(pageText, $),
      };
    } else {
      // internship
      result = {
        ...result,
        deadline: dates.deadline || generateFutureDate(14),
        package: prizeInfo.stipend || '15000',
        location: location || 'Remote',
        minCGPA: 6.0,
        branches: extractBranches(pageText),
        rounds: extractRounds(pageText),
      };
    }

    res.json(result);
  } catch (error) {
    console.error('Scrape error:', error.message);
    
    // Fallback: extract data from URL when scraping fails
    const fallbackData = extractFromUrl(url, type);
    if (fallbackData) {
      return res.json(fallbackData);
    }
    
    res.status(500).json({ 
      message: 'Failed to fetch data from URL',
      error: error.message 
    });
  }
});

// Helper functions for scraping
function extractOrganizer(url, $) {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    // Check for company names in the page
    const logoAlt = $('img[alt*="logo"], img[class*="logo"]').attr('alt') || '';
    if (logoAlt) return logoAlt.replace(/logo/i, '').trim();
    
    // Extract from hostname
    const parts = hostname.split('.');
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  } catch {
    return 'Organization';
  }
}

function extractDates(text) {
  const dates = {};
  const datePatterns = [
    // Common date formats
    /(?:deadline|last date|apply by|register by|registration ends?)[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/gi,
    /(?:deadline|last date|apply by)[:\s]*(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*,?\s*\d{2,4})/gi,
    /(?:starts?|begins?|start date)[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/gi,
    /(?:starts?|begins?)[:\s]*(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*,?\s*\d{2,4})/gi,
    /(?:ends?|end date)[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/gi,
  ];

  for (const pattern of datePatterns) {
    const match = pattern.exec(text);
    if (match) {
      try {
        const parsed = new Date(match[1]);
        if (!isNaN(parsed.getTime())) {
          if (pattern.source.includes('deadline') || pattern.source.includes('last') || pattern.source.includes('apply')) {
            dates.deadline = parsed.toISOString().split('T')[0];
          } else if (pattern.source.includes('start') || pattern.source.includes('begin')) {
            dates.startDate = parsed.toISOString().split('T')[0];
          } else if (pattern.source.includes('end')) {
            dates.endDate = parsed.toISOString().split('T')[0];
          }
        }
      } catch {}
    }
  }
  return dates;
}

function extractPrizeOrStipend(text, type) {
  const result = { prize: '', stipend: '' };
  
  // Prize patterns (for hackathons)
  const prizePatterns = [
    /(?:prize|reward|win)[:\s]*(?:₹|rs\.?|inr)?\s*([\d,]+(?:\s*(?:lakh|lac|k|cr|crore))?)/gi,
    /(?:₹|rs\.?|inr)\s*([\d,]+(?:\s*(?:lakh|lac|k|cr|crore))?)\s*(?:prize|reward|worth)/gi,
    /prize\s*(?:pool|money)?[:\s]*(?:₹|rs\.?|inr|\$)?\s*([\d,]+)/gi,
    /worth\s*(?:₹|rs\.?|inr|\$)?\s*([\d,]+)/gi,
  ];

  // Stipend patterns (for internships)
  const stipendPatterns = [
    /(?:stipend|salary|compensation|ctc)[:\s]*(?:₹|rs\.?|inr)?\s*([\d,]+)/gi,
    /(?:₹|rs\.?|inr)\s*([\d,]+)\s*(?:per month|\/month|pm|stipend)/gi,
    /([\d,]+)\s*(?:per month|\/month|pm)/gi,
  ];

  if (type === 'hackathon') {
    for (const pattern of prizePatterns) {
      const match = pattern.exec(text);
      if (match) {
        result.prize = formatPrize(match[1]);
        break;
      }
    }
  } else {
    for (const pattern of stipendPatterns) {
      const match = pattern.exec(text);
      if (match) {
        result.stipend = match[1].replace(/,/g, '');
        break;
      }
    }
  }
  
  return result;
}

function formatPrize(amount) {
  const num = parseInt(amount.replace(/,/g, ''));
  if (amount.toLowerCase().includes('lakh') || amount.toLowerCase().includes('lac')) {
    return `₹${num} Lakh`;
  } else if (amount.toLowerCase().includes('cr')) {
    return `₹${num} Crore`;
  } else if (num >= 100000) {
    return `₹${(num/100000).toFixed(1)} Lakh`;
  } else if (num >= 1000) {
    return `₹${num.toLocaleString()}`;
  }
  return `₹${amount}`;
}

function extractLocation(text, $) {
  const locationPatterns = [
    /(?:location|venue|place)[:\s]*([\w\s,]+(?:india|usa|remote|online|bangalore|mumbai|delhi|hyderabad|chennai|pune|kolkata|noida|gurgaon|gurugram))/gi,
    /(?:bangalore|mumbai|delhi|hyderabad|chennai|pune|kolkata|noida|gurgaon|gurugram|remote|online|work from home)/gi,
  ];
  
  for (const pattern of locationPatterns) {
    const match = pattern.exec(text);
    if (match) {
      return match[1] ? match[1].trim() : match[0].trim();
    }
  }
  
  // Check meta tags
  const geoLocation = $('meta[name="geo.placename"]').attr('content');
  if (geoLocation) return geoLocation;
  
  return 'Remote';
}

function extractMode(text) {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('hybrid')) return 'Hybrid';
  if (lowerText.includes('offline') || lowerText.includes('on-site') || lowerText.includes('in-person')) return 'Offline';
  if (lowerText.includes('online') || lowerText.includes('virtual') || lowerText.includes('remote')) return 'Online';
  return 'Online';
}

function extractTags(text, $) {
  const commonTags = ['AI', 'ML', 'Web Development', 'Mobile', 'Blockchain', 'IoT', 'Cloud', 'Cybersecurity', 'Data Science', 'Open Source', 'Fintech', 'Healthcare', 'EdTech', 'Gaming'];
  const foundTags = [];
  const lowerText = text.toLowerCase();
  
  for (const tag of commonTags) {
    if (lowerText.includes(tag.toLowerCase())) {
      foundTags.push(tag);
    }
  }
  
  // Also check keywords meta
  const keywords = $('meta[name="keywords"]').attr('content');
  if (keywords) {
    const keywordTags = keywords.split(',').slice(0, 3).map(k => k.trim());
    foundTags.push(...keywordTags);
  }
  
  return foundTags.slice(0, 5).join(', ') || 'Technology, Innovation';
}

function extractBranches(text) {
  const branches = [];
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('computer') || lowerText.includes('cse') || lowerText.includes('software')) {
    branches.push('Computer Science');
  }
  if (lowerText.includes('information technology') || lowerText.includes(' it ')) {
    branches.push('Information Technology');
  }
  if (lowerText.includes('electronics') || lowerText.includes('ece') || lowerText.includes('electrical')) {
    branches.push('Electronics');
  }
  if (lowerText.includes('mechanical')) {
    branches.push('Mechanical');
  }
  if (lowerText.includes('all branch') || lowerText.includes('any branch') || lowerText.includes('all stream')) {
    return 'All Branches';
  }
  
  return branches.length > 0 ? branches.join(', ') : 'Computer Science, Information Technology';
}

function extractRounds(text) {
  const rounds = [];
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('online test') || lowerText.includes('aptitude') || lowerText.includes('assessment')) {
    rounds.push('Online Assessment');
  }
  if (lowerText.includes('coding') || lowerText.includes('technical test')) {
    rounds.push('Coding Round');
  }
  if (lowerText.includes('technical interview') || lowerText.includes('tech round')) {
    rounds.push('Technical Interview');
  }
  if (lowerText.includes('hr interview') || lowerText.includes('hr round')) {
    rounds.push('HR Interview');
  }
  if (lowerText.includes('group discussion') || lowerText.includes('gd')) {
    rounds.push('Group Discussion');
  }
  
  return rounds.length > 0 ? rounds.join(', ') : 'Online Assessment, Technical Interview, HR Interview';
}

function cleanTitle(title) {
  return title
    .replace(/\s*[-|]\s*.*$/, '') // Remove site name suffix
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 100);
}

function generateFutureDate(daysFromNow) {
  const date = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
  return date.toISOString().split('T')[0];
}

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
