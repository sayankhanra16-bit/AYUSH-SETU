const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  targetRole: { type: String, default: '' }, // e.g. 'Full Stack Developer'
  skills: [{
    name: { type: String, required: true },
    level: { type: Number, min: 1, max: 5, default: 3 },
    source: { type: String, enum: ['self', 'resume', 'verified'], default: 'self' },
  }],
  education: { type: String, default: '' },
  department: { type: String, default: '' },
  resumeUrl: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
