const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  package: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['Full Time', 'Internship'],
    required: true,
  },
  postedDate: {
    type: Date,
    default: Date.now,
  },
  deadline: {
    type: Date,
    required: true,
  },
  eligibility: {
    minCGPA: {
      type: Number,
      required: true,
    },
    branches: {
      type: [String],
      required: true,
    },
  },
  rounds: {
    type: [String],
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Stopped'],
    default: 'Active',
  },
}, {
  timestamps: true,
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
