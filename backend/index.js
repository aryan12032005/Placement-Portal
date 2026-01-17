const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const User = require('./models/User');
const Job = require('./models/Job');
const { protect, admin, company } = require('./middleware/authMiddleware');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const GOOGLE_CLIENT_ID = '54168296388-6k44kvp61sg35ldnfatuij2s64h2prq8.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY || '097d48565087bd7ace29252804036935';

app.use(cors());
app.use(express.json());

// ============================================================
// OPENROUTER AI-POWERED DATA EXTRACTION
// ============================================================

/**
 * Extract structured data from page content using OpenRouter LLM
 * @param {string} pageContent - The text content of the scraped page
 * @param {string} url - The original URL
 * @param {string} type - 'internship' or 'hackathon'
 * @returns {Object} Structured data extracted by the LLM
 */
async function extractWithAI(pageContent, url, type) {
  if (!OPENROUTER_API_KEY) {
    console.log('OpenRouter API key not configured, skipping AI extraction');
    return null;
  }

  try {
    // Truncate content to avoid token limits (keep first 12000 chars)
    const truncatedContent = pageContent.substring(0, 12000);
    
    // Build prompt based on type
    const prompt = type === 'hackathon' 
      ? buildHackathonPrompt(truncatedContent, url)
      : buildInternshipPrompt(truncatedContent, url);

    console.log('Calling OpenRouter AI for extraction...');
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'system',
            content: 'You are an expert data extraction assistant. Extract structured information from job/internship/hackathon postings. Always respond with valid JSON only, no markdown, no explanation. If a field cannot be determined, use null.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://placement-portal.local',
          'X-Title': 'Placement Portal Scraper'
        },
        timeout: 30000
      }
    );

    const aiResponse = response.data.choices[0]?.message?.content;
    if (!aiResponse) {
      console.log('No AI response received');
      return null;
    }

    console.log('Raw AI response:', aiResponse.substring(0, 500));

    // Parse JSON from AI response - handle various formats
    let extractedData = null;
    try {
      // Try to find JSON in the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*?\}(?=\s*$|\s*```|\s*\n\n)/);
      if (jsonMatch) {
        // Clean the JSON string
        let jsonStr = jsonMatch[0]
          .replace(/[\x00-\x1F\x7F]/g, ' ') // Remove control characters
          .replace(/,\s*}/g, '}') // Remove trailing commas
          .replace(/,\s*]/g, ']'); // Remove trailing commas in arrays
        extractedData = JSON.parse(jsonStr);
      } else {
        // Try parsing the whole response as JSON
        extractedData = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.log('JSON parse error, trying to extract fields manually:', parseError.message);
      // Try to extract key-value pairs manually using regex
      extractedData = extractFieldsManually(aiResponse, type);
    }
    
    if (!extractedData) {
      console.log('Could not parse data from AI response');
      return null;
    }

    console.log('AI extracted data:', extractedData);
    
    // Normalize the extracted data
    return normalizeAIExtractedData(extractedData, type, url);

  } catch (error) {
    console.error('OpenRouter AI extraction error:', error.message);
    if (error.response?.data) {
      console.error('API error details:', error.response.data);
    }
    return null;
  }
}

/**
 * Extract fields manually from AI response if JSON parsing fails
 */
function extractFieldsManually(text, type) {
  const extractField = (fieldName) => {
    const patterns = [
      new RegExp(`"${fieldName}"\\s*:\\s*"([^"]*)"`, 'i'),
      new RegExp(`"${fieldName}"\\s*:\\s*([\\d.]+)`, 'i'),
      new RegExp(`${fieldName}\\s*:\\s*"?([^",\\n]+)"?`, 'i'),
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    return null;
  };

  if (type === 'hackathon') {
    return {
      title: extractField('title'),
      organizer: extractField('organizer'),
      prize: extractField('prize'),
      registrationDeadline: extractField('registrationDeadline') || extractField('deadline'),
      startDate: extractField('startDate'),
      endDate: extractField('endDate'),
      mode: extractField('mode'),
      location: extractField('location'),
      description: extractField('description'),
      themes: extractField('themes'),
      eligibility: extractField('eligibility'),
      teamSize: extractField('teamSize'),
    };
  } else {
    return {
      title: extractField('title'),
      company: extractField('company'),
      location: extractField('location'),
      stipend: extractField('stipend'),
      duration: extractField('duration'),
      deadline: extractField('deadline'),
      startDate: extractField('startDate'),
      description: extractField('description'),
      skills: extractField('skills'),
      eligibility: extractField('eligibility'),
      openings: extractField('openings'),
      perks: extractField('perks'),
    };
  }
}

/**
 * Build prompt for internship data extraction
 */
function buildInternshipPrompt(content, url) {
  return `Extract the following information from this internship/job posting page content.

URL: ${url}

PAGE CONTENT:
${content}

Extract and return a JSON object with these exact fields:
{
  "title": "Job/Internship title (e.g., 'Web Development Intern at XYZ Company')",
  "company": "Company/Organization name",
  "location": "Location (city/remote/work from home)",
  "stipend": "Monthly stipend with currency (e.g., '₹15,000/month', '₹10,000 - ₹15,000/month', 'Unpaid')",
  "duration": "Duration (e.g., '3 months', '6 months')",
  "deadline": "Application deadline in YYYY-MM-DD format",
  "startDate": "Start date in YYYY-MM-DD format",
  "description": "Brief description of the role (2-3 sentences max)",
  "skills": "Required skills as comma-separated list",
  "eligibility": "Who can apply / eligibility criteria",
  "openings": "Number of openings",
  "perks": "Perks/benefits if mentioned"
}

CRITICAL RULES:
- If ANY field's information is NOT explicitly mentioned on the page, you MUST return "Not Disclosed" for that field
- Do NOT guess, assume, or make up any values
- For stipend, include currency symbol and format (e.g., '₹15,000/month')
- For dates, convert to YYYY-MM-DD format. If date not found, return "Not Disclosed"
- Return ONLY valid JSON, no other text`;
}

/**
 * Build prompt for hackathon data extraction
 */
function buildHackathonPrompt(content, url) {
  return `Extract the following information from this hackathon/competition page content.

URL: ${url}

PAGE CONTENT:
${content}

Extract and return a JSON object with these exact fields:
{
  "title": "Hackathon/Competition title",
  "organizer": "Organizing company/institution name",
  "prize": "Total prize pool with currency (e.g., '₹1,00,000' or '$5000')",
  "registrationDeadline": "Registration deadline in YYYY-MM-DD format",
  "startDate": "Event start date in YYYY-MM-DD format",
  "endDate": "Event end date in YYYY-MM-DD format",
  "mode": "Online/Offline/Hybrid",
  "location": "Location if offline, or 'Online' if virtual",
  "description": "Brief description of the hackathon (2-3 sentences)",
  "themes": "Themes/tracks as comma-separated list",
  "eligibility": "Who can participate / eligibility criteria",
  "teamSize": "Team size requirements (e.g., '1-4 members')",
  "stages": "Competition stages/rounds if mentioned"
}

CRITICAL RULES:
- If ANY field's information is NOT explicitly mentioned on the page, you MUST return "Not Disclosed" for that field
- Do NOT guess, assume, or make up any values
- For prize, include currency symbol. If not mentioned, return "Not Disclosed"
- For dates, convert to YYYY-MM-DD format. If date not found, return "Not Disclosed"
- Return ONLY valid JSON, no other text`;
}

/**
 * Normalize AI-extracted data to match our schema
 */
function normalizeAIExtractedData(data, type, url) {
  // Helper to check if value is valid (not null, not "Not Disclosed", not empty)
  const isValid = (val) => val && val !== 'Not Disclosed' && val !== 'null' && String(val).trim() !== '';
  
  // Format stipend to readable string
  const formatStipend = (stipend) => {
    if (!isValid(stipend)) return 'Not Disclosed';
    // If already formatted with currency, return as is
    if (String(stipend).includes('₹') || String(stipend).includes('$') || String(stipend).toLowerCase().includes('unpaid')) {
      return String(stipend);
    }
    // If numeric, format with currency
    const num = parseInt(String(stipend).replace(/[^0-9]/g, ''));
    if (num > 0) {
      return `₹${num.toLocaleString('en-IN')}/month`;
    }
    return 'Not Disclosed';
  };

  if (type === 'hackathon') {
    return {
      title: isValid(data.title) ? data.title : 'Not Disclosed',
      description: buildDescription(data, type),
      organizer: isValid(data.organizer) ? data.organizer : 'Not Disclosed',
      prize: isValid(data.prize) ? data.prize : 'Not Disclosed',
      deadline: parseAIDate(data.registrationDeadline) || 'Not Disclosed',
      startDate: parseAIDate(data.startDate) || 'Not Disclosed',
      endDate: parseAIDate(data.endDate) || 'Not Disclosed',
      mode: isValid(data.mode) ? data.mode : 'Not Disclosed',
      location: isValid(data.location) ? data.location : 'Not Disclosed',
      difficulty: 'Not Disclosed',
      tags: isValid(data.themes) ? data.themes : 'Not Disclosed',
      source: 'ai_extraction'
    };
  } else {
    // Internship
    return {
      title: isValid(data.title) ? data.title : 'Not Disclosed',
      description: buildDescription(data, type),
      organizer: isValid(data.company) ? data.company : 'Not Disclosed',
      location: isValid(data.location) ? data.location : 'Not Disclosed',
      package: formatStipend(data.stipend),
      deadline: parseAIDate(data.deadline) || 'Not Disclosed',
      branches: 'Not Disclosed',
      rounds: 'Not Disclosed',
      minCGPA: 'Not Disclosed',
      source: 'ai_extraction'
    };
  }
}

/**
 * Build a comprehensive description from extracted data
 */
function buildDescription(data, type) {
  const isValid = (val) => val && val !== 'Not Disclosed' && val !== 'null' && String(val).trim() !== '';
  
  let desc = isValid(data.description) ? data.description : '';
  
  if (type === 'hackathon') {
    if (isValid(data.themes)) desc += `\n\n**Themes:** ${data.themes}`;
    if (isValid(data.eligibility)) desc += `\n\n**Eligibility:** ${data.eligibility}`;
    if (isValid(data.teamSize)) desc += `\n\n**Team Size:** ${data.teamSize}`;
    if (isValid(data.stages)) desc += `\n\n**Stages:** ${data.stages}`;
  } else {
    if (isValid(data.skills)) desc += `\n\n**Skills Required:** ${data.skills}`;
    if (isValid(data.eligibility)) desc += `\n\n**Eligibility:** ${data.eligibility}`;
    if (isValid(data.duration)) desc += `\n\n**Duration:** ${data.duration}`;
    if (isValid(data.perks)) desc += `\n\n**Perks:** ${data.perks}`;
    if (isValid(data.openings) && parseInt(data.openings) > 1) desc += `\n\n**Openings:** ${data.openings}`;
  }
  
  return desc.trim() || 'Details not available. Please check the original posting for complete information.';
}

/**
 * Parse date from AI response (already in YYYY-MM-DD or various formats)
 */
function parseAIDate(dateStr) {
  if (!dateStr) return null;
  
  // If already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // Try to parse other formats
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime()) && date.getFullYear() > 2020) {
      return date.toISOString().split('T')[0];
    }
  } catch {}
  
  // Fall back to parseIndianDate
  return parseIndianDate(dateStr);
}

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
        profilePicture: user.profilePicture,
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
      user.profilePicture = req.body.profilePicture !== undefined ? req.body.profilePicture : user.profilePicture;

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
        profilePicture: updatedUser.profilePicture,
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

// ============================================================
// ROBUST URL SCRAPING WITH PUPPETEER + SITE-SPECIFIC PARSERS
// ============================================================

// Helper function to delay (replacement for deprecated page.waitForTimeout)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Site-specific parsers for accurate data extraction
const siteSpecificParsers = {
  // INTERNSHALA parser - COMPLETELY REWRITTEN FOR ACCURACY
  internshala: async (page, $, url, type) => {
    try {
      // Wait for page to load
      await page.waitForSelector('body', { timeout: 15000 });
      await delay(5000); // Extra time for dynamic content
      
      // Check if page is blocked
      const pageTitle = await page.title();
      const isBlocked = pageTitle.toLowerCase().includes('access denied') ||
                       pageTitle.toLowerCase().includes('blocked') ||
                       pageTitle.toLowerCase().includes('error') ||
                       pageTitle.toLowerCase().includes('crashed');
      
      if (isBlocked) {
        console.log('Internshala appears blocked, using cheerio fallback');
        return null; // Will trigger fallback
      }
      
      const data = await page.evaluate(() => {
        // Get full page text for regex matching
        const bodyText = document.body.innerText;
        const htmlText = document.body.innerHTML;
        
        // Check if this is an error page
        if (bodyText.includes('Uh oh') || bodyText.includes('crashed') || bodyText.length < 500) {
          return { error: true };
        }
        
        // Helper to find text after a label
        const findAfterLabel = (label, text) => {
          const regex = new RegExp(label + '[:\\s]*([^\\n]+)', 'i');
          const match = text.match(regex);
          return match ? match[1].trim() : '';
        };
        
        // TITLE - look for the main heading
        let title = '';
        const h1 = document.querySelector('h1');
        if (h1) title = h1.innerText.trim();
        if (!title) {
          const headingMatch = bodyText.match(/^([A-Za-z][^\n]{10,60})\n/m);
          if (headingMatch) title = headingMatch[1];
        }
        
        // COMPANY - usually after "at" in title or in company section
        let company = '';
        const companyLink = document.querySelector('a[href*="/company/"]');
        if (companyLink) company = companyLink.innerText.trim();
        if (!company) {
          const atMatch = title.match(/at\s+(.+)$/i);
          if (atMatch) company = atMatch[1].trim();
        }
        
        // STIPEND - Look for money patterns
        let stipend = '';
        // Pattern: ₹ 15,000 /month or Rs 15000 or 15,000/month
        const stipendPatterns = [
          /(?:Stipend|Salary|CTC)[:\s]*(?:₹|Rs\.?|INR)?\s*([\d,]+(?:\s*-\s*[\d,]+)?)\s*(?:\/month|per month|\/m|PM)?/i,
          /(?:₹|Rs\.?)\s*([\d,]+(?:\s*-\s*[\d,]+)?)\s*(?:\/month|per month|\/m)/i,
          /(?:₹|Rs\.?)\s*([\d,]+)\s*(?:lump\s*sum)?/i,
        ];
        for (const pattern of stipendPatterns) {
          const match = bodyText.match(pattern);
          if (match) {
            // Take the first number if it's a range
            let amount = match[1].replace(/,/g, '');
            if (amount.includes('-')) {
              amount = amount.split('-')[0].trim();
            }
            if (parseInt(amount) >= 1000) {
              stipend = amount;
              break;
            }
          }
        }
        
        // LOCATION
        let location = '';
        const locationPatterns = [
          /(?:Location|Place)[:\s]*([A-Za-z][A-Za-z\s,]+?)(?:\n|$|Work)/i,
          /(?:Work from home|Remote|WFH)/i,
          /(Mumbai|Delhi|Bangalore|Bengaluru|Hyderabad|Chennai|Pune|Kolkata|Noida|Gurgaon|Gurugram|Ahmedabad|Jaipur)/i,
        ];
        for (const pattern of locationPatterns) {
          const match = bodyText.match(pattern);
          if (match) {
            location = match[1] ? match[1].trim() : match[0].trim();
            break;
          }
        }
        if (bodyText.toLowerCase().includes('work from home') || bodyText.toLowerCase().includes('remote')) {
          if (!location) location = 'Work From Home';
        }
        
        // APPLY BY / DEADLINE - Critical field
        let applyBy = '';
        const applyByPatterns = [
          /Apply\s*[Bb]y[:\s]*(\d{1,2}['\s]+[A-Za-z]+['\s]*\d{2,4})/i,
          /Apply\s*[Bb]y[:\s]*(\d{1,2}\s+[A-Za-z]+)/i,
          /(?:Last Date|Deadline)[:\s]*(\d{1,2}['\s]+[A-Za-z]+['\s]*\d{2,4})/i,
          /(\d{1,2}['\s]+[A-Za-z]{3,}['\s]+\d{2,4})/,
        ];
        for (const pattern of applyByPatterns) {
          const match = bodyText.match(pattern);
          if (match) {
            applyBy = match[1].trim();
            break;
          }
        }
        
        // START DATE
        let startDate = '';
        const startPatterns = [
          /Start\s*[Dd]ate[:\s]*(\d{1,2}['\s]+[A-Za-z]+['\s]*\d{2,4})/i,
          /Starts?[:\s]*(\d{1,2}['\s]+[A-Za-z]+['\s]*\d{2,4})/i,
          /(?:Start|Starts)[:\s]*(\d{1,2}\s+[A-Za-z]+)/i,
          /Immediately/i,
        ];
        for (const pattern of startPatterns) {
          const match = bodyText.match(pattern);
          if (match) {
            startDate = match[1] ? match[1].trim() : 'Immediately';
            break;
          }
        }
        
        // DURATION
        let duration = '';
        const durationMatch = bodyText.match(/Duration[:\s]*(\d+\s*(?:Month|Months|Weeks?|Days?))/i);
        if (durationMatch) duration = durationMatch[1];
        
        // DESCRIPTION
        let description = '';
        // Look for About the internship/job section
        const aboutMatch = bodyText.match(/About the (?:internship|job|work)[:\s]*\n([\s\S]{50,500}?)(?:\n\n|\nSkill|\nWho can)/i);
        if (aboutMatch) description = aboutMatch[1].trim();
        
        // SKILLS
        let skills = '';
        const skillsMatch = bodyText.match(/(?:Skills? [Rr]equired|Key Skills)[:\s]*\n?([\s\S]{10,300}?)(?:\n\n|\nWho|\nNumber|\nPerks)/i);
        if (skillsMatch) skills = skillsMatch[1].trim();
        
        // WHO CAN APPLY
        let eligibility = '';
        const eligMatch = bodyText.match(/Who can apply[:\s]*\n?([\s\S]{10,400}?)(?:\n\n|\nPerks|\nNumber|\nSalary)/i);
        if (eligMatch) eligibility = eligMatch[1].trim();
        
        // OPENINGS
        let openings = '1';
        const openingsMatch = bodyText.match(/(?:Number of openings?|Openings?)[:\s]*(\d+)/i);
        if (openingsMatch) openings = openingsMatch[1];
        
        // PERKS
        let perks = '';
        const perksMatch = bodyText.match(/Perks[:\s]*\n?([\s\S]{5,200}?)(?:\n\n|\nNumber|\nAbout)/i);
        if (perksMatch) perks = perksMatch[1].trim();

        return { 
          title, company, location, stipend, duration, applyBy, startDate,
          description, skills, openings, eligibility, perks
        };
      });

      // Build a comprehensive description
      let fullDescription = '';
      if (data.description) fullDescription += data.description + '\n\n';
      if (data.skills) fullDescription += '**Skills Required:** ' + data.skills + '\n\n';
      if (data.eligibility) fullDescription += '**Who Can Apply:** ' + data.eligibility + '\n\n';
      if (data.duration) fullDescription += '**Duration:** ' + data.duration + '\n';
      if (data.openings !== '1') fullDescription += '**Openings:** ' + data.openings + '\n';
      if (data.perks) fullDescription += '**Perks:** ' + data.perks;
      
      if (!fullDescription.trim()) {
        fullDescription = `${data.title || 'Internship'} at ${data.company || 'the company'}. ${data.duration ? 'Duration: ' + data.duration + '. ' : ''}This is a great opportunity to gain hands-on experience and develop professional skills.`;
      }

      // If page returned error, use fallback
      if (data.error) {
        console.log('Internshala page blocked, returning null for fallback');
        return null;
      }

      console.log('Internshala extracted:', { 
        title: data.title, 
        stipend: data.stipend, 
        applyBy: data.applyBy, 
        location: data.location,
        startDate: data.startDate 
      });

      return {
        title: data.title || 'Internship Opportunity',
        description: fullDescription.substring(0, 1500),
        organizer: data.company || 'Company',
        location: data.location || 'Remote',
        package: data.stipend || '15000',
        deadline: parseIndianDate(data.applyBy) || generateFutureDate(14),
        branches: 'Computer Science, Information Technology, All Branches',
        rounds: 'Application Review, Technical Interview, HR Interview',
        minCGPA: 6.0,
      };
    } catch (e) {
      console.log('Internshala parser error:', e.message);
      return null;
    }
  },

  // UNSTOP / DARE2COMPETE parser - COMPLETELY REWRITTEN
  unstop: async (page, $, url, type) => {
    try {
      await page.waitForSelector('body', { timeout: 15000 });
      await delay(5000);
      
      // Check for blocking
      const pageTitle = await page.title();
      console.log('Unstop page title:', pageTitle);
      
      const data = await page.evaluate(() => {
        const bodyText = document.body.innerText;
        console.log('Body text length:', bodyText.length);
        
        // Check for blocked page
        if (bodyText.length < 500) {
          return { error: true };
        }
        
        // TITLE
        let title = '';
        const h1 = document.querySelector('h1');
        if (h1) title = h1.innerText.trim();
        
        // ORGANIZER
        let organizer = '';
        const orgPatterns = [
          /(?:Organized by|Hosted by|By)[:\s]*([A-Za-z][A-Za-z\s&]+?)(?:\n|$)/i,
          /(?:Company|Organization)[:\s]*([A-Za-z][A-Za-z\s&]+?)(?:\n|$)/i,
        ];
        for (const pattern of orgPatterns) {
          const match = bodyText.match(pattern);
          if (match) {
            organizer = match[1].trim();
            break;
          }
        }
        
        // PRIZE
        let prize = '';
        const prizePatterns = [
          /(?:Prize|Prizes|Reward|Worth)[:\s]*(?:₹|Rs\.?|INR)?\s*([\d,]+(?:\s*(?:Lakh|Lac|L|K|Cr|Crore|Lakhs))?)/i,
          /(?:₹|Rs\.?)\s*([\d,]+(?:\s*(?:Lakh|Lac|L|K))?)\s*(?:in prizes|worth|prize)/i,
          /Win\s*(?:₹|Rs\.?)?\s*([\d,]+(?:\s*(?:Lakh|Lac|L|K))?)/i,
        ];
        for (const pattern of prizePatterns) {
          const match = bodyText.match(pattern);
          if (match) {
            prize = '₹' + match[1].trim();
            break;
          }
        }
        
        // REGISTRATION DEADLINE
        let deadline = '';
        const deadlinePatterns = [
          /(?:Register by|Registration deadline|Registration ends|Apply by|Last date)[:\s]*(\d{1,2}['\s]+[A-Za-z]+['\s,]*\d{2,4})/i,
          /(?:Deadline)[:\s]*(\d{1,2}['\s]+[A-Za-z]+['\s,]*\d{2,4})/i,
        ];
        for (const pattern of deadlinePatterns) {
          const match = bodyText.match(pattern);
          if (match) {
            deadline = match[1].trim();
            break;
          }
        }
        
        // START DATE
        let startDate = '';
        const startPatterns = [
          /(?:Event starts|Starts on|Start date|Begins)[:\s]*(\d{1,2}['\s]+[A-Za-z]+['\s,]*\d{2,4})/i,
          /(\d{1,2}['\s]+[A-Za-z]+['\s,]*\d{2,4})\s*(?:to|-)\s*\d{1,2}/i,
        ];
        for (const pattern of startPatterns) {
          const match = bodyText.match(pattern);
          if (match) {
            startDate = match[1].trim();
            break;
          }
        }
        
        // END DATE
        let endDate = '';
        const endPatterns = [
          /(?:Event ends|Ends on|End date)[:\s]*(\d{1,2}['\s]+[A-Za-z]+['\s,]*\d{2,4})/i,
          /(?:to|-)\s*(\d{1,2}['\s]+[A-Za-z]+['\s,]*\d{2,4})/i,
        ];
        for (const pattern of endPatterns) {
          const match = bodyText.match(pattern);
          if (match) {
            endDate = match[1].trim();
            break;
          }
        }
        
        // MODE
        let mode = 'Online';
        if (bodyText.toLowerCase().includes('hybrid')) mode = 'Hybrid';
        else if (bodyText.toLowerCase().includes('offline') || bodyText.toLowerCase().includes('on-site') || bodyText.toLowerCase().includes('in-person')) mode = 'Offline';
        
        // DESCRIPTION
        let description = '';
        const aboutMatch = bodyText.match(/(?:About|Overview|Description)[:\s]*\n([\s\S]{50,800}?)(?:\n\n|\nEligibility|\nPrize|\nRound)/i);
        if (aboutMatch) description = aboutMatch[1].trim();
        
        // ELIGIBILITY
        let eligibility = '';
        const eligMatch = bodyText.match(/(?:Eligibility|Who can participate)[:\s]*\n?([\s\S]{10,300}?)(?:\n\n|\nPrize|\nRound|\nTimeline)/i);
        if (eligMatch) eligibility = eligMatch[1].trim();
        
        // STAGES/ROUNDS
        let stages = '';
        const stagesMatch = bodyText.match(/(?:Rounds|Stages|Phases)[:\s]*\n?([\s\S]{10,300}?)(?:\n\n|\nPrize|\nEligibility)/i);
        if (stagesMatch) stages = stagesMatch[1].trim();
        
        // PARTICIPANTS
        let participants = '';
        const partMatch = bodyText.match(/(\d+(?:,\d+)*)\+?\s*(?:Registered|Registrations|Participants|Teams)/i);
        if (partMatch) participants = partMatch[1];

        return { 
          title, organizer, prize, deadline, startDate, endDate, 
          mode, description, eligibility, stages, participants 
        };
      });

      // Check for error/blocked page
      if (data.error) {
        console.log('Unstop page blocked, returning null for fallback');
        return null;
      }

      // Build description
      let fullDescription = '';
      if (data.description) fullDescription += data.description + '\n\n';
      if (data.eligibility) fullDescription += '**Eligibility:** ' + data.eligibility + '\n\n';
      if (data.stages) fullDescription += '**Stages:** ' + data.stages + '\n\n';
      if (data.participants) fullDescription += '**Registered:** ' + data.participants + '+ participants';
      
      if (!fullDescription.trim()) {
        fullDescription = `${data.title || 'Opportunity'} - An exciting ${type === 'hackathon' ? 'hackathon' : 'opportunity'} organized by ${data.organizer || 'Unstop'}. Participate and showcase your skills!`;
      }

      console.log('Unstop extracted:', { 
        title: data.title, 
        prize: data.prize, 
        deadline: data.deadline, 
        startDate: data.startDate,
        endDate: data.endDate 
      });

      if (type === 'hackathon') {
        return {
          title: data.title || 'Hackathon Event',
          description: fullDescription.substring(0, 1500),
          organizer: data.organizer || 'Unstop',
          prize: data.prize || '₹50,000',
          deadline: parseIndianDate(data.deadline) || generateFutureDate(14),
          startDate: parseIndianDate(data.startDate) || generateFutureDate(21),
          endDate: parseIndianDate(data.endDate) || generateFutureDate(23),
          mode: data.mode || 'Online',
          location: data.mode === 'Offline' ? 'India' : 'Online',
          difficulty: 'Intermediate',
          tags: 'Technology, Innovation, Coding',
        };
      } else {
        return {
          title: data.title || 'Internship Opportunity',
          description: fullDescription.substring(0, 1500),
          organizer: data.organizer || 'Unstop',
          location: 'Remote',
          package: '15000',
          deadline: parseIndianDate(data.deadline) || generateFutureDate(14),
          branches: 'All Branches',
          rounds: 'Online Assessment, Interview',
          minCGPA: 6.0,
        };
      }
    } catch (e) {
      console.log('Unstop parser error:', e.message);
      return null;
    }
  },

  // DEVFOLIO parser - IMPROVED
  devfolio: async (page, $, url, type) => {
    try {
      await page.waitForSelector('h1, [class*="title"]', { timeout: 8000 }).catch(() => {});
      await delay(2000);
      
      const data = await page.evaluate(() => {
        const getText = (selector) => {
          const el = document.querySelector(selector);
          return el ? el.innerText.trim() : '';
        };
        const getAllText = (selector) => {
          return Array.from(document.querySelectorAll(selector)).map(el => el.innerText.trim()).filter(t => t);
        };

        const bodyText = document.body.innerText;
        
        const title = getText('h1');
        const description = getText('[class*="about"]') || getText('[class*="description"]') || getText('p');
        const organizer = getText('[class*="organizer"]') || getText('[class*="host"]');
        
        // Prizes
        let prizes = '';
        const prizeMatch = bodyText.match(/(?:Prize|Prizes|Reward)[:\s]*(?:₹|Rs\.?|\$)?\s*([\d,]+(?:\s*(?:Lakh|K|USD))?)/i);
        if (prizeMatch) prizes = prizeMatch[0];
        
        // Dates
        let deadline = '', startDate = '', endDate = '';
        const deadlineMatch = bodyText.match(/(?:Registration|Apply)\s*(?:ends?|deadline|by)[:\s]*(\d{1,2}[\s\-\/][A-Za-z]+[\s\-\/,]*\d{2,4})/i);
        if (deadlineMatch) deadline = deadlineMatch[1];
        
        const startMatch = bodyText.match(/(?:Starts?|Begins?)[:\s]*(\d{1,2}[\s\-\/][A-Za-z]+[\s\-\/,]*\d{2,4})/i);
        if (startMatch) startDate = startMatch[1];
        
        const endMatch = bodyText.match(/(?:Ends?|Submission)[:\s]*(\d{1,2}[\s\-\/][A-Za-z]+[\s\-\/,]*\d{2,4})/i);
        if (endMatch) endDate = endMatch[1];
        
        // Themes/tracks
        const themes = getAllText('[class*="theme"], [class*="track"]').join(', ');

        return { title, description, organizer, prizes, deadline, startDate, endDate, themes };
      });

      // Build description
      let fullDescription = data.description || '';
      if (data.themes) fullDescription += `\n\nThemes: ${data.themes}`;
      if (!fullDescription.trim()) {
        fullDescription = `${data.title} - A hackathon on Devfolio. Build innovative projects and compete for prizes!`;
      }

      return {
        title: data.title || 'Devfolio Hackathon',
        description: fullDescription.substring(0, 1500),
        organizer: data.organizer || 'Devfolio',
        prize: data.prizes || '₹50,000',
        deadline: parseIndianDate(data.deadline) || generateFutureDate(14),
        startDate: parseIndianDate(data.startDate) || generateFutureDate(21),
        endDate: parseIndianDate(data.endDate) || generateFutureDate(23),
        mode: 'Online',
        location: 'Online',
        difficulty: 'Intermediate',
        tags: data.themes || 'Web3, Blockchain, Open Source',
      };
    } catch (e) {
      console.log('Devfolio parser error:', e.message);
      return null;
    }
  },

  // DEVPOST parser - IMPROVED
  devpost: async (page, $, url, type) => {
    try {
      await page.waitForSelector('h1, [class*="title"]', { timeout: 8000 }).catch(() => {});
      await delay(2000);
      
      const data = await page.evaluate(() => {
        const getText = (selector) => {
          const el = document.querySelector(selector);
          return el ? el.innerText.trim() : '';
        };

        const bodyText = document.body.innerText;
        
        const title = getText('#challenge-title') || getText('h1');
        const description = getText('#challenge-description') || getText('.challenge-description') || getText('[class*="description"]');
        const organizer = getText('.host-name') || getText('[class*="host"]');
        
        // Prize
        let prize = '';
        const prizeMatch = bodyText.match(/\$\s*([\d,]+(?:\s*(?:K|USD|in prizes))?)/i);
        if (prizeMatch) prize = '$' + prizeMatch[1];
        
        // Dates
        let deadline = '';
        const deadlineMatch = bodyText.match(/(?:Submission|ends?)[:\s]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i);
        if (deadlineMatch) deadline = deadlineMatch[1];
        
        const participants = getText('.participant-count') || getText('[class*="participant"]');

        return { title, description, organizer, prize, deadline, participants };
      });

      let fullDescription = data.description || '';
      if (data.participants) fullDescription += `\n\n${data.participants} participants`;
      if (!fullDescription.trim()) {
        fullDescription = `${data.title} - A global virtual hackathon on Devpost. Build projects, win prizes!`;
      }

      return {
        title: data.title || 'Devpost Hackathon',
        description: fullDescription.substring(0, 1500),
        organizer: data.organizer || 'Devpost',
        prize: data.prize || '$10,000',
        deadline: parseIndianDate(data.deadline) || generateFutureDate(14),
        startDate: generateFutureDate(7),
        endDate: parseIndianDate(data.deadline) || generateFutureDate(21),
        mode: 'Online',
        location: 'Online',
        difficulty: 'Intermediate',
        tags: 'Virtual, Global, Innovation',
      };
    } catch (e) {
      console.log('Devpost parser error:', e.message);
      return null;
    }
  },

  // LINKEDIN parser
  linkedin: async (page, $, url, type) => {
    try {
      const data = await page.evaluate(() => {
        const getText = (selector) => {
          const el = document.querySelector(selector);
          return el ? el.innerText.trim() : '';
        };

        const title = getText('.job-title, .topcard__title, h1');
        const company = getText('.company-name, .topcard__org-name-link');
        const location = getText('.job-location, .topcard__flavor--bullet');
        const description = getText('.description__text, .show-more-less-html__markup');

        return { title, company, location, description };
      });

      return {
        title: data.title || 'LinkedIn Opportunity',
        description: data.description || 'Opportunity posted on LinkedIn',
        organizer: data.company || 'Company',
        location: data.location || 'Remote',
        package: '25000',
        deadline: generateFutureDate(14),
        branches: 'Computer Science, Information Technology',
        rounds: 'Resume Screening, Technical Interview, HR Interview',
        minCGPA: 7.0,
      };
    } catch (e) {
      console.log('LinkedIn parser error:', e.message);
      return null;
    }
  },

  // HACKEREARTH parser
  hackerearth: async (page, $, url, type) => {
    try {
      await page.waitForSelector('.challenge-title, h1', { timeout: 5000 }).catch(() => {});
      
      const data = await page.evaluate(() => {
        const getText = (selector) => {
          const el = document.querySelector(selector);
          return el ? el.innerText.trim() : '';
        };

        const title = getText('.challenge-title') || getText('h1');
        const description = getText('.challenge-description') || getText('.about-challenge');
        const organizer = getText('.company-name') || getText('.organizer');
        const prize = getText('.prize-money') || getText('.prizes');
        const deadline = getText('.end-date') || getText('.deadline');

        return { title, description, organizer, prize, deadline };
      });

      return {
        title: data.title || 'HackerEarth Challenge',
        description: data.description || 'Competitive programming challenge',
        organizer: data.organizer || 'HackerEarth',
        prize: data.prize || '₹2,00,000',
        deadline: parseIndianDate(data.deadline) || generateFutureDate(14),
        startDate: generateFutureDate(21),
        endDate: generateFutureDate(23),
        mode: 'Online',
        location: 'Online',
        difficulty: 'Advanced',
        tags: 'Competitive Programming, Algorithms, DSA',
      };
    } catch (e) {
      console.log('HackerEarth parser error:', e.message);
      return null;
    }
  },
};

// Helper to parse Indian date formats - IMPROVED
function parseIndianDate(dateStr) {
  if (!dateStr) return null;
  try {
    // Clean the date string
    let cleanDate = dateStr
      .replace(/['']/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
    
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const fullMonthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    
    // Format: "31 Dec 2025" or "31 December 2025" or "31 Dec '25" or "31st Dec 2025"
    let match = cleanDate.match(/(\d{1,2})(?:st|nd|rd|th)?\s*([a-zA-Z]+)\s*[',]?\s*(\d{2,4})/i);
    if (match) {
      const day = parseInt(match[1]);
      const monthStr = match[2].toLowerCase();
      let monthIndex = monthNames.findIndex(m => monthStr.startsWith(m));
      if (monthIndex === -1) {
        monthIndex = fullMonthNames.findIndex(m => monthStr.startsWith(m));
      }
      let year = parseInt(match[3]);
      if (year < 100) year += 2000;
      
      if (monthIndex !== -1 && day >= 1 && day <= 31) {
        const date = new Date(year, monthIndex, day);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
    }
    
    // Format: "Dec 31, 2025" or "December 31, 2025"
    match = cleanDate.match(/([a-zA-Z]+)\s*(\d{1,2})(?:st|nd|rd|th)?,?\s*(\d{2,4})/i);
    if (match) {
      const monthStr = match[1].toLowerCase();
      const day = parseInt(match[2]);
      let monthIndex = monthNames.findIndex(m => monthStr.startsWith(m));
      if (monthIndex === -1) {
        monthIndex = fullMonthNames.findIndex(m => monthStr.startsWith(m));
      }
      let year = parseInt(match[3]);
      if (year < 100) year += 2000;
      
      if (monthIndex !== -1 && day >= 1 && day <= 31) {
        const date = new Date(year, monthIndex, day);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
    }
    
    // Format: "31/12/2025" or "31-12-2025"
    match = cleanDate.match(/(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/);
    if (match) {
      const day = parseInt(match[1]);
      const month = parseInt(match[2]) - 1;
      let year = parseInt(match[3]);
      if (year < 100) year += 2000;
      
      if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
    }
    
    // Format: "2025-12-31" (ISO)
    match = cleanDate.match(/(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
    if (match) {
      const year = parseInt(match[1]);
      const month = parseInt(match[2]) - 1;
      const day = parseInt(match[3]);
      
      if (month >= 0 && month <= 11 && day >= 1 && day <= 31 && year > 2020) {
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
    }
    
    // Try standard Date parse as last resort
    const parsed = new Date(cleanDate);
    if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 2020) {
      return parsed.toISOString().split('T')[0];
    }
  } catch (e) {
    console.log('Date parse error:', e.message, 'for:', dateStr);
  }
  return null;
}

// Detect which site the URL belongs to
function detectSite(url) {
  const hostname = new URL(url).hostname.toLowerCase();
  if (hostname.includes('internshala')) return 'internshala';
  if (hostname.includes('unstop') || hostname.includes('dare2compete')) return 'unstop';
  if (hostname.includes('devfolio')) return 'devfolio';
  if (hostname.includes('devpost')) return 'devpost';
  if (hostname.includes('linkedin')) return 'linkedin';
  if (hostname.includes('hackerearth')) return 'hackerearth';
  return 'generic';
}

// Main scraping endpoint
app.post('/api/scrape', async (req, res) => {
  const { url, type } = req.body;

  if (!url) {
    return res.status(400).json({ message: 'URL is required' });
  }

  let browser = null;
  
  try {
    console.log(`Scraping URL: ${url}, Type: ${type}`);
    
    // Launch Puppeteer browser with stealth settings
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--window-size=1920,1080',
        '--start-maximized',
        '--disable-infobars',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });

    const page = await browser.newPage();
    
    // Make browser look more like a real user
    await page.evaluateOnNewDocument(() => {
      // Pass webdriver check
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
      // Pass chrome check
      window.chrome = { runtime: {} };
      // Pass permissions check
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters) => (
        parameters.name === 'notifications' ?
          Promise.resolve({ state: Notification.permission }) :
          originalQuery(parameters)
      );
      // Pass plugins check
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      // Pass languages check
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    });
    
    // Set realistic browser headers
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    });

    // Navigate to page
    await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 20000 
    });

    // Wait a bit for dynamic content
    await delay(2000);

    // Get page content for cheerio parsing
    const content = await page.content();
    const $ = cheerio.load(content);
    
    // Get text content for AI extraction
    const pageText = await page.evaluate(() => document.body.innerText);
    const pageTitle = await page.title();

    // Detect site and use specific parser
    const site = detectSite(url);
    console.log(`Detected site: ${site}`);

    let result = null;

    // ============================================================
    // PRIMARY: Try AI-powered extraction using OpenRouter
    // ============================================================
    if (OPENROUTER_API_KEY && pageText.length > 500) {
      console.log('Attempting AI-powered extraction...');
      result = await extractWithAI(pageText, url, type);
    }
    
    // ============================================================
    // FALLBACK 1: Try site-specific parser if AI extraction failed
    // ============================================================
    if (!result || !result.title) {
      console.log('AI extraction returned no result, trying site-specific parser...');
      if (siteSpecificParsers[site]) {
        result = await siteSpecificParsers[site](page, $, url, type);
      }
    }

    // ============================================================
    // FALLBACK 2: Use generic extraction
    // ============================================================
    if (!result || !result.title) {
      console.log('Using generic parser...');
      result = await genericExtraction(page, $, url, type);
    }
    
    // Check if we got actual content or just site name/blocked page
    const defaultTitles = ['hackathon event', 'internship opportunity', 'opportunity', 'event', 'job opportunity'];
    const isGenericResult = result && result.title && (
      result.title.toLowerCase() === site.toLowerCase() ||
      defaultTitles.includes(result.title.toLowerCase()) ||
      result.title.toLowerCase().includes('error') || 
      result.title.toLowerCase().includes('blocked') ||
      result.title.toLowerCase().includes('crashed') ||
      result.title.toLowerCase().includes('denied') ||
      result.title.length < 10 ||
      // If description mentions "no.1 platform" it's the generic site description
      (result.description && result.description.toLowerCase().includes("no.1"))
    );
    
    // ============================================================
    // FALLBACK 3: Use URL-based fallback
    // ============================================================
    if (!result || !result.title || isGenericResult) {
      console.log('Page appears blocked or generic, using URL-based fallback...');
      result = extractFromUrlFallback(url, type);
      if (result) result.source = 'url_fallback';
    }

    // Ensure all required fields have values
    result = ensureCompleteData(result, url, type);
    result.url = url;
    if (!result.source) result.source = site;

    await browser.close();
    console.log('Scraping successful:', result.title);
    
    res.json(result);

  } catch (error) {
    console.error('Scrape error:', error.message);
    
    if (browser) {
      await browser.close().catch(() => {});
    }
    
    // Fallback: extract from URL
    const fallbackData = extractFromUrlFallback(url, type);
    if (fallbackData) {
      fallbackData.source = 'fallback';
      return res.json(fallbackData);
    }
    
    res.status(500).json({ 
      message: 'Failed to fetch data from URL',
      error: error.message 
    });
  }
});

// Generic extraction using Puppeteer - IMPROVED
async function genericExtraction(page, $, url, type) {
  try {
    const data = await page.evaluate(() => {
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.innerText.trim() : '';
      };
      const getAllText = (selector) => {
        return Array.from(document.querySelectorAll(selector)).map(el => el.innerText.trim()).filter(t => t);
      };
      const getMeta = (name) => {
        const el = document.querySelector(`meta[property="${name}"], meta[name="${name}"]`);
        return el ? el.getAttribute('content') : '';
      };

      // Get all paragraphs for description
      const paragraphs = getAllText('p').filter(p => p.length > 50).slice(0, 3).join('\n\n');
      
      // Get list items that might be requirements/responsibilities
      const listItems = getAllText('li').filter(li => li.length > 20 && li.length < 200).slice(0, 5);
      
      // Get headings for context
      const headings = getAllText('h2, h3').slice(0, 5);

      return {
        title: getMeta('og:title') || getText('h1') || document.title,
        description: getMeta('og:description') || getMeta('description') || paragraphs,
        siteName: getMeta('og:site_name') || '',
        bodyText: document.body.innerText.substring(0, 15000),
        listItems: listItems,
        headings: headings,
      };
    });

    // Extract more data from body text
    const bodyText = data.bodyText || '';
    const orgName = data.siteName || extractOrgFromUrl(url);
    
    // Build comprehensive description
    let fullDescription = '';
    if (data.description) {
      fullDescription = data.description;
    }
    if (data.listItems && data.listItems.length > 0) {
      fullDescription += '\n\nKey Points:\n• ' + data.listItems.join('\n• ');
    }
    
    if (!fullDescription || fullDescription.length < 50) {
      // Generate a description from available data
      const title = cleanTitle(data.title);
      if (type === 'hackathon') {
        fullDescription = `${title} - An exciting hackathon opportunity hosted by ${orgName}. Participate to showcase your skills, collaborate with talented individuals, and compete for prizes. This is a great platform to learn, build innovative solutions, and network with industry professionals.`;
      } else {
        const location = extractLocationFromText(bodyText);
        const stipend = extractStipendFromText(bodyText);
        fullDescription = `${title} - An internship opportunity at ${orgName}. ${location !== 'Remote' ? 'Location: ' + location + '. ' : 'This is a remote opportunity. '}${stipend ? 'Stipend: ₹' + stipend + '/month. ' : ''}Gain hands-on experience, work on real projects, and develop professional skills that will boost your career.`;
      }
    }
    
    if (type === 'hackathon') {
      return {
        title: cleanTitle(data.title),
        description: fullDescription.substring(0, 1500),
        organizer: orgName,
        prize: extractPrizeFromText(bodyText) || '₹1,00,000',
        deadline: extractDateFromText(bodyText, 'deadline') || generateFutureDate(14),
        startDate: extractDateFromText(bodyText, 'start') || generateFutureDate(21),
        endDate: extractDateFromText(bodyText, 'end') || generateFutureDate(23),
        mode: extractModeFromText(bodyText),
        location: extractLocationFromText(bodyText),
        difficulty: 'Intermediate',
        tags: extractTagsFromText(bodyText),
      };
    } else {
      return {
        title: cleanTitle(data.title),
        description: fullDescription.substring(0, 1500),
        organizer: orgName,
        location: extractLocationFromText(bodyText),
        package: extractStipendFromText(bodyText) || '15000',
        deadline: extractDateFromText(bodyText, 'deadline') || generateFutureDate(14),
        branches: extractBranchesFromText(bodyText),
        rounds: extractRoundsFromText(bodyText),
        minCGPA: 6.0,
      };
    }
  } catch (e) {
    console.log('Generic extraction error:', e.message);
    return null;
  }
}

// Helper extraction functions
function extractOrgFromUrl(url) {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    const parts = hostname.split('.');
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  } catch {
    return 'Organization';
  }
}

function extractPrizeFromText(text) {
  const patterns = [
    /(?:prize|reward|win|worth)[:\s]*(?:₹|rs\.?|inr|\$)?\s*([\d,]+(?:\s*(?:lakh|lac|k|cr|crore))?)/gi,
    /(?:₹|rs\.?|inr)\s*([\d,]+(?:\s*(?:lakh|lac|k))?)/gi,
    /\$\s*([\d,]+)/gi,
  ];
  
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      const amount = match[1].replace(/,/g, '');
      const num = parseInt(amount);
      if (num >= 1000) {
        if (amount.toLowerCase().includes('lakh')) return `₹${num} Lakh`;
        if (num >= 100000) return `₹${(num/100000).toFixed(1)} Lakh`;
        return `₹${num.toLocaleString()}`;
      }
    }
  }
  return null;
}

function extractStipendFromText(text) {
  const patterns = [
    /(?:stipend|salary|ctc)[:\s]*(?:₹|rs\.?|inr)?\s*([\d,]+)/gi,
    /(?:₹|rs\.?|inr)\s*([\d,]+)\s*(?:per month|\/month|pm)/gi,
    /([\d,]+)\s*(?:per month|\/month|pm)/gi,
  ];
  
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      return match[1].replace(/,/g, '');
    }
  }
  return null;
}

function extractDateFromText(text, type) {
  const patterns = {
    deadline: [
      /(?:deadline|last date|apply by|register by)[:\s]*(\d{1,2}[\s\-\/](?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s\-\/,]*\d{2,4})/gi,
      /(?:deadline|last date|apply by)[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/gi,
    ],
    start: [
      /(?:starts?|begins?|start date)[:\s]*(\d{1,2}[\s\-\/](?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s\-\/,]*\d{2,4})/gi,
    ],
    end: [
      /(?:ends?|end date)[:\s]*(\d{1,2}[\s\-\/](?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s\-\/,]*\d{2,4})/gi,
    ],
  };
  
  for (const pattern of (patterns[type] || patterns.deadline)) {
    const match = pattern.exec(text);
    if (match) {
      return parseIndianDate(match[1]);
    }
  }
  return null;
}

function extractLocationFromText(text) {
  const cities = ['mumbai', 'bangalore', 'bengaluru', 'delhi', 'hyderabad', 'chennai', 'pune', 'kolkata', 'noida', 'gurgaon', 'gurugram', 'ahmedabad', 'jaipur'];
  const lowerText = text.toLowerCase();
  
  for (const city of cities) {
    if (lowerText.includes(city)) {
      return city.charAt(0).toUpperCase() + city.slice(1);
    }
  }
  
  if (lowerText.includes('remote') || lowerText.includes('work from home') || lowerText.includes('wfh')) {
    return 'Remote';
  }
  
  return 'Remote';
}

function extractModeFromText(text) {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('hybrid')) return 'Hybrid';
  if (lowerText.includes('offline') || lowerText.includes('on-site') || lowerText.includes('in-person') || lowerText.includes('venue')) return 'Offline';
  return 'Online';
}

function extractTagsFromText(text) {
  const tags = [];
  const lowerText = text.toLowerCase();
  const tagMap = {
    'ai': 'AI', 'artificial intelligence': 'AI', 'machine learning': 'ML', 'ml': 'ML',
    'web development': 'Web Development', 'web dev': 'Web Development', 'frontend': 'Web Development',
    'blockchain': 'Blockchain', 'web3': 'Web3', 'crypto': 'Blockchain',
    'mobile': 'Mobile Development', 'android': 'Mobile Development', 'ios': 'Mobile Development',
    'data science': 'Data Science', 'analytics': 'Data Science',
    'cybersecurity': 'Cybersecurity', 'security': 'Cybersecurity',
    'cloud': 'Cloud', 'aws': 'Cloud', 'azure': 'Cloud',
    'iot': 'IoT', 'internet of things': 'IoT',
    'open source': 'Open Source', 'opensource': 'Open Source',
    'fintech': 'Fintech', 'healthcare': 'Healthcare', 'edtech': 'EdTech',
  };
  
  for (const [keyword, tag] of Object.entries(tagMap)) {
    if (lowerText.includes(keyword) && !tags.includes(tag)) {
      tags.push(tag);
    }
  }
  
  return tags.slice(0, 5).join(', ') || 'Technology, Innovation';
}

function extractBranchesFromText(text) {
  const branches = [];
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('all branch') || lowerText.includes('any branch') || lowerText.includes('all stream')) {
    return 'All Branches';
  }
  if (lowerText.includes('computer') || lowerText.includes('cse') || lowerText.includes('software')) branches.push('Computer Science');
  if (lowerText.includes('information technology') || lowerText.includes(' it ') || lowerText.includes('i.t.')) branches.push('Information Technology');
  if (lowerText.includes('electronics') || lowerText.includes('ece') || lowerText.includes('electrical')) branches.push('Electronics');
  if (lowerText.includes('mechanical')) branches.push('Mechanical');
  if (lowerText.includes('civil')) branches.push('Civil');
  
  return branches.length > 0 ? branches.join(', ') : 'Computer Science, Information Technology';
}

function extractRoundsFromText(text) {
  const rounds = [];
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('online test') || lowerText.includes('aptitude') || lowerText.includes('assessment') || lowerText.includes('oa')) rounds.push('Online Assessment');
  if (lowerText.includes('coding') || lowerText.includes('dsa') || lowerText.includes('programming test')) rounds.push('Coding Round');
  if (lowerText.includes('technical interview') || lowerText.includes('tech round') || lowerText.includes('technical round')) rounds.push('Technical Interview');
  if (lowerText.includes('hr interview') || lowerText.includes('hr round')) rounds.push('HR Interview');
  if (lowerText.includes('group discussion') || lowerText.includes(' gd ')) rounds.push('Group Discussion');
  if (lowerText.includes('case study')) rounds.push('Case Study');
  
  return rounds.length > 0 ? rounds.join(', ') : 'Online Assessment, Technical Interview, HR Interview';
}

// Fallback extraction from URL - IMPROVED with better descriptions
function extractFromUrlFallback(url, type) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    const pathParts = urlObj.pathname.split('/').filter(p => p && p.length > 2);
    
    // Better title extraction from URL path
    // Look for the longest meaningful segment (usually the job/hackathon title)
    let title = '';
    for (const part of pathParts.reverse()) {
      // Skip common path segments
      if (['detail', 'internship', 'job', 'hackathon', 'hackathons', 'jobs', 'internships', 'opportunity', 'opportunities'].includes(part.toLowerCase())) continue;
      // Skip numeric IDs
      if (/^\d+$/.test(part)) continue;
      // Use this segment as title
      if (part.length > 10) {
        title = part
          .replace(/[-_]/g, ' ')
          .replace(/\d+$/, '') // Remove trailing numbers
          .replace(/at\s*$/, '') // Remove trailing "at"
          .trim();
        break;
      }
    }
    
    // Format title properly
    if (title) {
      title = title.split(' ').map(w => {
        if (w.length <= 2) return w.toLowerCase();
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      }).join(' ');
    }
    
    const orgParts = hostname.split('.');
    let organizer = orgParts[0].charAt(0).toUpperCase() + orgParts[0].slice(1);
    
    // Try to extract company name from URL (common pattern: "at-companyname")
    const atMatch = urlObj.pathname.match(/at[_-]([a-z0-9_-]+?)(?:\d+)?$/i);
    if (atMatch) {
      organizer = atMatch[1].replace(/[-_]/g, ' ').split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    
    let location = 'Remote';
    const urlLower = url.toLowerCase();
    if (urlLower.includes('mumbai')) location = 'Mumbai';
    else if (urlLower.includes('bangalore') || urlLower.includes('bengaluru')) location = 'Bangalore';
    else if (urlLower.includes('delhi') || urlLower.includes('noida') || urlLower.includes('gurgaon')) location = 'Delhi NCR';
    else if (urlLower.includes('hyderabad')) location = 'Hyderabad';
    else if (urlLower.includes('pune')) location = 'Pune';
    else if (urlLower.includes('chennai')) location = 'Chennai';
    else if (urlLower.includes('kolkata')) location = 'Kolkata';
    else if (urlLower.includes('ahmedabad')) location = 'Ahmedabad';
    
    if (type === 'hackathon') {
      const hackTitle = title || 'Not Disclosed';
      return {
        title: hackTitle,
        description: hackTitle !== 'Not Disclosed' 
          ? `${hackTitle} - Details extracted from URL. Please check the original page for complete information about themes, prizes, eligibility, and dates.`
          : 'Details not available. Please check the original posting for complete information.',
        organizer: organizer || 'Not Disclosed',
        prize: 'Not Disclosed',
        deadline: 'Not Disclosed',
        startDate: 'Not Disclosed',
        endDate: 'Not Disclosed',
        mode: 'Not Disclosed',
        location: location !== 'Remote' ? location : 'Not Disclosed',
        difficulty: 'Not Disclosed',
        tags: 'Not Disclosed',
      };
    } else {
      const internTitle = title || 'Not Disclosed';
      return {
        title: internTitle,
        description: internTitle !== 'Not Disclosed'
          ? `${internTitle}${organizer ? ' at ' + organizer : ''}. ${location !== 'Remote' ? 'Location: ' + location + '. ' : ''}Details extracted from URL. Please check the original posting for complete information about stipend, duration, and eligibility.`
          : 'Details not available. Please check the original posting for complete information.',
        organizer: organizer || 'Not Disclosed',
        location: location !== 'Remote' ? location : 'Not Disclosed',
        package: 'Not Disclosed',
        deadline: 'Not Disclosed',
        minCGPA: 'Not Disclosed',
        branches: 'Not Disclosed',
        rounds: 'Not Disclosed',
      };
    }
  } catch {
    return null;
  }
}

// Ensure all required fields exist (but use 'Not Disclosed' instead of fake data)
function ensureCompleteData(data, url, type) {
  if (!data) data = {};
  
  // Only ensure the fields exist, but use 'Not Disclosed' for missing values
  const requiredFields = type === 'hackathon' 
    ? ['title', 'description', 'organizer', 'prize', 'deadline', 'startDate', 'endDate', 'mode', 'location', 'difficulty', 'tags']
    : ['title', 'description', 'organizer', 'location', 'package', 'deadline', 'minCGPA', 'branches', 'rounds'];
  
  for (const field of requiredFields) {
    if (!data[field] || data[field] === null || data[field] === 'null') {
      data[field] = 'Not Disclosed';
    }
  }
  
  return data;
}

function cleanTitle(title) {
  if (!title) return '';
  return title
    .replace(/\s*[-|–—]\s*.*$/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 100);
}

function generateFutureDate(daysFromNow) {
  const date = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
  return date.toISOString().split('T')[0];
}

// ============================================================
// INTERNSHIP EXTRACTION API - Vercel Compatible
// ============================================================

/**
 * Clean HTML content by removing scripts, styles, and unnecessary tags
 * @param {string} html - Raw HTML content
 * @returns {string} - Cleaned text content
 */
function cleanHtmlContent(html) {
  const $ = cheerio.load(html);
  
  // Remove script, style, noscript, iframe, svg, and other non-content tags
  $('script, style, noscript, iframe, svg, link, meta, header, footer, nav, aside, form, button, input, select, textarea, [hidden]').remove();
  
  // Remove comments
  $('*').contents().filter(function() {
    return this.type === 'comment';
  }).remove();
  
  // Remove empty elements
  $('*').each(function() {
    if ($(this).text().trim() === '' && $(this).children().length === 0) {
      $(this).remove();
    }
  });
  
  // Get text content
  let text = $('body').text();
  
  // Clean up whitespace
  text = text
    .replace(/[\t]+/g, ' ')           // Replace tabs with space
    .replace(/\n\s*\n/g, '\n')        // Remove multiple newlines
    .replace(/  +/g, ' ')              // Remove multiple spaces
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
  
  return text;
}

/**
 * Fetch webpage content using ScraperAPI (handles JS rendering)
 * @param {string} url - URL to fetch
 * @returns {Promise<{html: string, text: string}>}
 */
async function fetchWebpageContent(url) {
  console.log(`[Scraper] Fetching URL: ${url}`);
  
  // Check if it's an Unstop URL - they need special handling
  const isUnstop = url.includes('unstop.com');
  
  // Try ScraperAPI first, fallback to Puppeteer if it fails
  let html = '';
  
  try {
    // Use ScraperAPI with render=true for JavaScript-heavy sites
    let scraperUrl = `https://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(url)}&render=true&country_code=in`;
    
    console.log(`[ScraperAPI] Attempting fetch...`);
    
    const response = await axios.get(scraperUrl, {
      timeout: 60000,
      maxRedirects: 5,
    });
    
    html = response.data;
    console.log(`[ScraperAPI] Success! HTML length: ${html.length}`);
    
  } catch (scraperError) {
    console.log(`[ScraperAPI] Failed: ${scraperError.message}. Trying Puppeteer fallback...`);
    
    // Fallback to Puppeteer for local scraping
    try {
      html = await fetchWithPuppeteer(url, isUnstop);
    } catch (puppeteerError) {
      console.error(`[Puppeteer] Also failed: ${puppeteerError.message}`);
      throw new Error(`Both ScraperAPI and Puppeteer failed. ScraperAPI: ${scraperError.message}`);
    }
  }
  
  if (!html || html.length < 100) {
    throw new Error('Failed to fetch meaningful content from the page');
  }
  
  const text = cleanHtmlContent(html);
  
  // For Unstop, try to extract key data from specific elements
  let extractedData = '';
  if (isUnstop) {
    extractedData = extractUnstopSpecificData(html);
  }
  
  const finalText = extractedData ? `${extractedData}\n\n${text}` : text;
  
  console.log(`[Scraper] Final text length: ${finalText.length} chars`);
  
  return { html, text: finalText };
}

/**
 * Fetch webpage using Puppeteer (local headless browser)
 */
async function fetchWithPuppeteer(url, waitForDynamic = false) {
  console.log(`[Puppeteer] Launching browser for: ${url}`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080',
    ]
  });
  
  try {
    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to the page
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // For dynamic sites, wait a bit more and scroll to load lazy content
    if (waitForDynamic) {
      console.log(`[Puppeteer] Waiting for dynamic content...`);
      
      // Wait for potential dynamic content
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 3000)));
      
      // Scroll to trigger lazy loading
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 300;
          const timer = setInterval(() => {
            window.scrollBy(0, distance);
            totalHeight += distance;
            if (totalHeight >= document.body.scrollHeight || totalHeight > 3000) {
              clearInterval(timer);
              resolve();
            }
          }, 100);
        });
      });
      
      // Wait a bit more after scrolling
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));
    }
    
    const html = await page.content();
    console.log(`[Puppeteer] Got HTML: ${html.length} chars`);
    
    return html;
    
  } finally {
    await browser.close();
  }
}

/**
 * Extract Unstop-specific data from HTML before cleaning
 * Unstop uses specific class names for stipend, deadline, etc.
 */
function extractUnstopSpecificData(html) {
  const $ = cheerio.load(html);
  const data = [];
  
  // Try multiple selectors for stipend
  const stipendSelectors = [
    '.stipend-amt', '.stipend', '.compensation', 
    '[class*="stipend"]', '[class*="compensation"]',
    '.opportunity_stats span', '.stats-item',
    '.job-stipend', '.salary-range'
  ];
  
  for (const selector of stipendSelectors) {
    const text = $(selector).text().trim();
    if (text && (text.includes('₹') || text.includes('K') || text.includes('Month') || text.includes('LPA'))) {
      data.push(`STIPEND: ${text}`);
      break;
    }
  }
  
  // Try to find deadline
  const deadlineSelectors = [
    '.apply-by', '.deadline', '[class*="deadline"]',
    '.registration-deadline', '.end-date',
    'span:contains("Days Left")', '.days-left'
  ];
  
  for (const selector of deadlineSelectors) {
    const text = $(selector).text().trim();
    if (text && (text.includes('Day') || text.includes('Jan') || text.includes('Feb') || text.includes('202'))) {
      data.push(`DEADLINE: ${text}`);
      break;
    }
  }
  
  // Look for any text containing stipend amount pattern
  $('body').find('*').each(function() {
    const text = $(this).clone().children().remove().end().text().trim();
    // Match patterns like "₹15K", "15K/Month", "₹15,000", "15000/month"
    if (text && /₹?\s*\d+[,\d]*\s*[kK]?\s*[/-]?\s*(Month|month|LPA|lpa)/i.test(text)) {
      if (!data.some(d => d.includes('STIPEND'))) {
        data.push(`STIPEND_FOUND: ${text}`);
      }
    }
    // Match deadline patterns
    if (text && /\d+\s*Days?\s*Left/i.test(text)) {
      if (!data.some(d => d.includes('DEADLINE'))) {
        data.push(`DAYS_LEFT: ${text}`);
      }
    }
  });
  
  // Also get the page title and company
  const title = $('h1').first().text().trim() || $('[class*="title"]').first().text().trim();
  const company = $('.company-name, .organizer, [class*="company"]').first().text().trim();
  
  if (title) data.push(`TITLE: ${title}`);
  if (company) data.push(`COMPANY: ${company}`);
  
  console.log('[Unstop Extractor] Found data:', data);
  
  return data.join('\n');
}

/**
 * Extract internship data using OpenRouter AI
 * @param {string} pageText - Cleaned page text
 * @param {string} url - Original URL
 * @returns {Promise<Object>} - Structured internship data
 */
async function extractInternshipWithAI(pageText, url) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured');
  }
  
  // Token optimization: Limit text to ~8000 chars (~2000 tokens)
  // This prevents token overflow while keeping enough context
  const MAX_CHARS = 8000;
  let truncatedText = pageText;
  
  if (pageText.length > MAX_CHARS) {
    // Smart truncation: Keep beginning and end (important info often at both ends)
    const halfSize = Math.floor(MAX_CHARS / 2);
    truncatedText = pageText.substring(0, halfSize) + 
                    '\n\n[... content truncated ...]\n\n' + 
                    pageText.substring(pageText.length - halfSize);
  }
  
  const systemPrompt = `You are a precise data extraction assistant specializing in internship/job postings. Extract information from webpage content.

CRITICAL RULES:
- Return ONLY valid JSON, no markdown, no explanations, no code blocks
- If a field is not explicitly mentioned, return "Not mentioned"
- Do NOT guess or assume values
- Prefer explicit values from the page
- If multiple internships exist, extract only the MAIN/PRIMARY one

FIELD-SPECIFIC INSTRUCTIONS:
- STIPEND: Look for keywords like "stipend", "salary", "compensation", "₹", "Rs", "INR", "K/Month", "15K", "20K", "per month", "/month", "lpa", "CTC". Include the full amount with currency. Examples: "₹15K/Month", "₹15,000/month", "₹15K - 20K/Month"
- DEADLINE: Look for "apply by", "last date", "deadline", "applications close", "apply before", "X Days Left". If you see "X Days Left", calculate the date from today (${new Date().toISOString().split('T')[0]}).
- LOCATION: Look for city names, "remote", "work from home", "WFH", "hybrid", "on-site", "office location".
- ELIGIBILITY: Look for "who can apply", "requirements", "qualifications", "skills required", "experience", "education".`;

  const userPrompt = `Extract internship/job details from this webpage. Pay special attention to STIPEND and DEADLINE fields.

URL: ${url}
TODAY'S DATE: ${new Date().toISOString().split('T')[0]}

PAGE CONTENT:
${truncatedText}

IMPORTANT EXTRACTION RULES:
1. STIPEND: Look for patterns like:
   - "₹15K/Month - 20K/Month" → extract as "₹15,000 - ₹20,000/month"
   - "15K/Month" → extract as "₹15,000/month"
   - "STIPEND_FOUND: ₹ 15K/Month - 20K/Month" → extract the amount
   - Any amount with ₹, K, Month, LPA
   
2. DEADLINE: Look for patterns like:
   - "13 Days Left" → calculate date as today + 13 days
   - "DAYS_LEFT: 13 Days Left" → calculate date as today + 13 days
   - "Apply by 30 Jan 2026" → use that date
   - Any specific date format

Return ONLY this JSON structure (no other text):
{
  "title": "Internship/Job title",
  "stipend": "Monthly stipend with currency (e.g., '₹15,000 - ₹20,000/month') or 'Unpaid' or 'Not mentioned'",
  "deadline": "Application deadline date in YYYY-MM-DD format (e.g., '2026-01-30') or 'Not mentioned'",
  "location": "City name or 'Remote' or 'Work from home' or 'Not mentioned'",
  "eligibility": "Who can apply / requirements or 'Not mentioned'"
}`;

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'google/gemini-2.0-flash-001',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,  // Low temperature for consistent extraction
      max_tokens: 500,   // Limit output tokens
    },
    {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://placement-portal.vercel.app',
        'X-Title': 'Placement Portal Internship Extractor'
      },
      timeout: 30000
    }
  );
  
  const aiResponse = response.data.choices[0]?.message?.content;
  
  if (!aiResponse) {
    throw new Error('No response from AI');
  }
  
  // Parse JSON from response (handle various formats)
  let parsed;
  try {
    // Remove markdown code blocks if present
    let cleanResponse = aiResponse
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();
    
    // Find JSON object
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      parsed = JSON.parse(cleanResponse);
    }
  } catch (parseError) {
    console.error('JSON parse error:', parseError.message);
    console.error('Raw response:', aiResponse);
    throw new Error('Failed to parse AI response as JSON');
  }
  
  // Ensure all required fields exist with proper defaults
  return {
    title: parsed.title || 'Not mentioned',
    stipend: parsed.stipend || 'Not mentioned',
    deadline: parsed.deadline || 'Not mentioned',
    location: parsed.location || 'Not mentioned',
    eligibility: parsed.eligibility || 'Not mentioned'
  };
}

/**
 * Extract hackathon data using OpenRouter AI
 * @param {string} pageText - Cleaned page text
 * @param {string} url - Original URL
 * @returns {Promise<Object>} - Structured hackathon data
 */
async function extractHackathonWithAI(pageText, url) {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured');
  }
  
  const MAX_CHARS = 10000;
  let truncatedText = pageText;
  
  if (pageText.length > MAX_CHARS) {
    const halfSize = Math.floor(MAX_CHARS / 2);
    truncatedText = pageText.substring(0, halfSize) + 
                    '\n\n[... content truncated ...]\n\n' + 
                    pageText.substring(pageText.length - halfSize);
  }
  
  const systemPrompt = `You are a precise data extraction assistant specializing in hackathon/competition events. Extract information from webpage content.

CRITICAL RULES:
- Return ONLY valid JSON, no markdown, no explanations, no code blocks
- If a field is not explicitly mentioned, return "Not mentioned"
- Do NOT guess or assume values
- Prefer explicit values from the page
- If multiple hackathons exist, extract only the MAIN/PRIMARY one

FIELD-SPECIFIC INSTRUCTIONS:
- TITLE: The name of the hackathon/competition
- ORGANIZER: Company or organization hosting the event
- PRIZE: Total prize pool with currency (₹, $, etc.)
- DEADLINE: Registration deadline date
- START_DATE/END_DATE: Event dates
- MODE: Online, Offline, or Hybrid
- LOCATION: Venue for offline events
- TAGS: Themes like AI/ML, Web Dev, Blockchain, etc.`;

  const userPrompt = `Extract hackathon/competition details from this webpage.

URL: ${url}

PAGE CONTENT:
${truncatedText}

Return ONLY this JSON structure (no other text):
{
  "title": "Hackathon/Competition name",
  "organizer": "Organizing company/institution",
  "description": "Brief description (2-3 sentences max)",
  "prize": "Prize pool with currency (e.g., '₹1,00,000' or '$5000') or 'Not mentioned'",
  "deadline": "Registration deadline (e.g., '25 Dec 2025') or 'Not mentioned'",
  "startDate": "Event start date (e.g., '2025-01-15') or 'Not mentioned'",
  "endDate": "Event end date (e.g., '2025-01-17') or 'Not mentioned'",
  "mode": "Online or Offline or Hybrid or 'Not mentioned'",
  "location": "Venue/city for offline events or 'Not mentioned'",
  "difficulty": "Beginner or Intermediate or Advanced or 'Not mentioned'",
  "tags": "Comma-separated themes (e.g., 'AI/ML, Web Development, Open Source') or 'Not mentioned'",
  "eligibility": "Who can participate or 'Not mentioned'"
}`;

  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'google/gemini-2.0-flash-001',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1,
      max_tokens: 800,
    },
    {
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://placement-portal.vercel.app',
        'X-Title': 'Placement Portal Hackathon Extractor'
      },
      timeout: 30000
    }
  );
  
  const aiResponse = response.data.choices[0]?.message?.content;
  
  if (!aiResponse) {
    throw new Error('No response from AI');
  }
  
  let parsed;
  try {
    let cleanResponse = aiResponse
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();
    
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      parsed = JSON.parse(cleanResponse);
    }
  } catch (parseError) {
    console.error('JSON parse error:', parseError.message);
    throw new Error('Failed to parse AI response as JSON');
  }
  
  return {
    title: parsed.title || 'Not mentioned',
    organizer: parsed.organizer || 'Not mentioned',
    description: parsed.description || 'Not mentioned',
    prize: parsed.prize || 'Not mentioned',
    deadline: parsed.deadline || 'Not mentioned',
    startDate: parsed.startDate || 'Not mentioned',
    endDate: parsed.endDate || 'Not mentioned',
    mode: parsed.mode || 'Online',
    location: parsed.location || 'Not mentioned',
    difficulty: parsed.difficulty || 'Intermediate',
    tags: parsed.tags || 'Not mentioned',
    eligibility: parsed.eligibility || 'Not mentioned'
  };
}

/**
 * POST /api/extract-internship
 * Extract internship details from any public URL
 * 
 * Request body: { "url": "https://example.com/internship" }
 * Response: { "title": "", "stipend": "", "deadline": "", "location": "", "eligibility": "" }
 */
app.post('/api/extract-internship', async (req, res) => {
  const { url } = req.body;
  
  // Validate URL
  if (!url) {
    return res.status(400).json({ 
      error: 'URL is required',
      message: 'Please provide a valid internship page URL'
    });
  }
  
  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ 
      error: 'Invalid URL',
      message: 'Please provide a valid URL starting with http:// or https://'
    });
  }
  
  // Check for OpenRouter API key
  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ 
      error: 'Configuration error',
      message: 'OpenRouter API key not configured on server'
    });
  }
  
  try {
    console.log(`[Extract Internship] Fetching URL: ${url}`);
    
    // Step 1: Fetch webpage content
    const { text: pageText, html: rawHtml } = await fetchWebpageContent(url);
    
    // Use raw HTML as fallback if text extraction yields too little
    let contentToProcess = pageText;
    if (!pageText || pageText.length < 50) {
      console.log(`[Extract Internship] Text too short (${pageText?.length || 0}), using raw HTML`);
      // Truncate raw HTML to avoid token overflow
      contentToProcess = rawHtml.substring(0, 15000);
    }
    
    if (!contentToProcess || contentToProcess.length < 50) {
      return res.status(422).json({
        error: 'Insufficient content',
        message: 'Could not extract meaningful content from the page. The page might be protected or require JavaScript.'
      });
    }
    
    console.log(`[Extract Internship] Processing ${contentToProcess.length} chars of content`);
    
    // Step 2: Extract data using AI
    const internshipData = await extractInternshipWithAI(contentToProcess, url);
    
    console.log(`[Extract Internship] Successfully extracted:`, internshipData);
    
    // Return the structured data
    return res.json(internshipData);
    
  } catch (error) {
    console.error('[Extract Internship] Error:', error.message);
    
    // Handle specific error types
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(502).json({
        error: 'Connection failed',
        message: 'Could not connect to the provided URL. Please check if the URL is correct.'
      });
    }
    
    if (error.response?.status === 403 || error.response?.status === 401) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'The webpage is protected and cannot be accessed.'
      });
    }
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'Page not found',
        message: 'The internship page was not found. Please check the URL.'
      });
    }
    
    if (error.message.includes('timeout')) {
      return res.status(504).json({
        error: 'Timeout',
        message: 'Request timed out. The server took too long to respond.'
      });
    }
    
    if (error.message.includes('OpenRouter') || error.message.includes('AI')) {
      return res.status(503).json({
        error: 'AI service error',
        message: 'Could not process the page with AI. Please try again later.'
      });
    }
    
    return res.status(500).json({
      error: 'Extraction failed',
      message: error.message || 'An unexpected error occurred while extracting internship data.'
    });
  }
});

/**
 * POST /api/extract-hackathon
 * Extract hackathon details from any public URL using ScraperAPI + OpenRouter
 * 
 * Request body: { "url": "https://example.com/hackathon" }
 */
app.post('/api/extract-hackathon', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ 
      error: 'URL is required',
      message: 'Please provide a valid hackathon page URL'
    });
  }
  
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ 
      error: 'Invalid URL',
      message: 'Please provide a valid URL starting with http:// or https://'
    });
  }
  
  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({ 
      error: 'Configuration error',
      message: 'OpenRouter API key not configured on server'
    });
  }
  
  try {
    console.log(`[Extract Hackathon] Fetching URL: ${url}`);
    
    // Step 1: Fetch webpage content using ScraperAPI
    const { text: pageText, html: rawHtml } = await fetchWebpageContent(url);
    
    // Use raw HTML as fallback if text extraction yields too little
    let contentToProcess = pageText;
    if (!pageText || pageText.length < 50) {
      console.log(`[Extract Hackathon] Text too short (${pageText?.length || 0}), using raw HTML`);
      contentToProcess = rawHtml.substring(0, 15000);
    }
    
    if (!contentToProcess || contentToProcess.length < 50) {
      return res.status(422).json({
        error: 'Insufficient content',
        message: 'Could not extract meaningful content from the page.'
      });
    }
    
    console.log(`[Extract Hackathon] Processing ${contentToProcess.length} chars of content`);
    
    // Step 2: Extract data using AI
    const hackathonData = await extractHackathonWithAI(pageText, url);
    
    console.log(`[Extract Hackathon] Successfully extracted:`, hackathonData);
    
    return res.json(hackathonData);
    
  } catch (error) {
    console.error('[Extract Hackathon] Error:', error.message);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(502).json({
        error: 'Connection failed',
        message: 'Could not connect to the provided URL.'
      });
    }
    
    if (error.response?.status === 403 || error.response?.status === 401) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'The webpage is protected and cannot be accessed.'
      });
    }
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'Page not found',
        message: 'The hackathon page was not found. Please check the URL.'
      });
    }
    
    if (error.message.includes('timeout')) {
      return res.status(504).json({
        error: 'Timeout',
        message: 'Request timed out. The server took too long to respond.'
      });
    }
    
    return res.status(500).json({
      error: 'Extraction failed',
      message: error.message || 'An unexpected error occurred while extracting hackathon data.'
    });
  }
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
