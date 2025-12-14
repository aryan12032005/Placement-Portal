const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['STUDENT', 'COMPANY', 'ADMIN'],
    default: 'STUDENT',
  },
  approved: {
    type: Boolean,
    default: false,
  },
  // Student specific
  rollNumber: String,
  branch: String,
  course: String,
  collegeName: String,
  graduationYear: Number,
  educationStatus: {
    type: String,
    enum: ['Pursuing', 'Graduated', 'Undergraduate'],
    default: 'Pursuing'
  },
  cgpa: Number,
  skills: [String],
  resumeUrl: String,
  phone: String,
  linkedIn: String,
  // Company specific
  companyName: String,
  industry: String,
  website: String,
}, {
  timestamps: true,
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
