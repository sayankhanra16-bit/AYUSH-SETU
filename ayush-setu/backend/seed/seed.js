// Populates the database with demo data so the app isn't empty on stage.
// Run with: npm run seed   (make sure .env is set up first)
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');
const { calculateMatch } = require('../utils/matchEngine');

async function seed() {
  await connectDB();
  console.log('Clearing old demo data...');
  await Promise.all([
    User.deleteMany({}),
    StudentProfile.deleteMany({}),
    Opportunity.deleteMany({}),
    Application.deleteMany({}),
  ]);

  const password = await bcrypt.hash('password123', 10);

  console.log('Creating users...');
  const [student1, student2, industry1, institution1] = await Promise.all([
    User.create({ name: 'Aditi Sharma', email: 'student1@demo.com', password, role: 'student' }),
    User.create({ name: 'Rohan Verma', email: 'student2@demo.com', password, role: 'student' }),
    User.create({ name: 'TechNova Solutions', email: 'industry1@demo.com', password, role: 'industry', organization: 'TechNova Solutions' }),
    User.create({ name: 'AIIA Admin', email: 'institution1@demo.com', password, role: 'institution', organization: 'All India Institute of Ayurveda' }),
  ]);

  console.log('Creating student profiles...');
  const profile1 = await StudentProfile.create({
    user: student1._id,
    targetRole: 'Full Stack Developer',
    education: 'B.Tech Computer Science, 3rd Year',
    skills: [
      { name: 'javascript', level: 4, source: 'self' },
      { name: 'react', level: 3, source: 'self' },
      { name: 'node.js', level: 3, source: 'self' },
      { name: 'mongodb', level: 2, source: 'self' },
    ],
  });
  await StudentProfile.create({
    user: student2._id,
    targetRole: 'Backend Developer',
    education: 'B.Tech IT, Final Year',
    skills: [
      { name: 'python', level: 4, source: 'self' },
      { name: 'sql', level: 3, source: 'self' },
      { name: 'git', level: 3, source: 'self' },
    ],
  });

  console.log('Creating opportunities...');
  const opp1 = await Opportunity.create({
    title: 'Frontend Developer Intern',
    postedBy: industry1._id,
    companyName: 'TechNova Solutions',
    type: 'internship',
    location: 'Remote',
    description: 'Work on our React-based student dashboard.',
    requiredSkills: [
      { name: 'javascript', weight: 2 },
      { name: 'react', weight: 2 },
      { name: 'css', weight: 1 },
    ],
  });
  await Opportunity.create({
    title: 'Backend Developer Intern',
    postedBy: industry1._id,
    companyName: 'TechNova Solutions',
    type: 'internship',
    location: 'Bengaluru (Hybrid)',
    description: 'Build and maintain REST APIs.',
    requiredSkills: [
      { name: 'node.js', weight: 2 },
      { name: 'mongodb', weight: 2 },
      { name: 'docker', weight: 1 },
    ],
  });

  console.log('Creating a sample application...');
  const { score, matched, missing } = calculateMatch(profile1.skills, opp1.requiredSkills);
  await Application.create({
    student: student1._id,
    opportunity: opp1._id,
    matchScore: score,
    matchedSkills: matched,
    missingSkills: missing,
  });

  console.log('\nSeed complete. Demo logins (password for all: password123):');
  console.log('  Student:     student1@demo.com');
  console.log('  Industry:    industry1@demo.com');
  console.log('  Institution: institution1@demo.com');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
