const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Employee name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design', 'Product'],
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true,
  },
  skills: [{
    type: String,
    trim: true,
  }],
  performanceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  productivity: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  teamwork: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  communication: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  leadership: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  yearsOfExperience: {
    type: Number,
    default: 0,
    min: 0,
  },
  salary: {
    type: Number,
    default: 0,
    min: 0,
  },
  joiningDate: {
    type: Date,
    default: Date.now,
  },
  aiRecommendation: {
    type: String,
    default: '',
  },
  lastRecommendationDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on-leave'],
    default: 'active',
  },
}, { timestamps: true });

// Virtual for overall performance
employeeSchema.virtual('overallScore').get(function () {
  const scores = [this.performanceScore, this.productivity, this.teamwork, this.communication, this.leadership];
  const validScores = scores.filter(s => s > 0);
  if (validScores.length === 0) return 0;
  return Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
});

employeeSchema.set('toJSON', { virtuals: true });
employeeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Employee', employeeSchema);
