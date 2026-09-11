const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: { type: String, required: true },
  type: { type: String, enum: ['internship', 'job'], default: 'internship' },
  description: { type: String, default: '' },
  location: { type: String, default: 'Remote' },
  requiredSkills: [{
    name: { type: String, required: true },
    weight: { type: Number, default: 1 }, // importance of this skill
  }],
  deadline: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Opportunity', opportunitySchema);
