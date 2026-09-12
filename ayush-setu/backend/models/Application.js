const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  matchScore: { type: Number, default: 0 },
  matchedSkills: [String],
  missingSkills: [String],
  status: {
    type: String,
    enum: ['applied', 'shortlisted', 'rejected', 'selected'],
    default: 'applied',
  },
  interviewAt: { type: Date },
  interviewNotes: { type: String, default: '' },
}, { timestamps: true });

// Prevent a student from applying twice to the same opportunity
applicationSchema.index({ student: 1, opportunity: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
//hello