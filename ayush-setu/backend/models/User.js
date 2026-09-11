const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['student', 'industry', 'institution', 'academician'],
    default: 'student',
  },
  organization: { type: String, default: '' }, // company or institute name
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
