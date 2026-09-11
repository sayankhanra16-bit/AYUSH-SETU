const express = require('express');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const Application = require('../models/Application');
const Opportunity = require('../models/Opportunity');
const StudentProfile = require('../models/StudentProfile');
const Notification = require('../models/Notification');
const { calculateMatch } = require('../utils/matchEngine');
const router = express.Router();

// GET my applications (student) — placed before '/:id'-style routes are needed here,
// but kept consistent with the opportunity routes' ordering convention.
router.get('/mine', auth, role('student'), async (req, res, next) => {
  try {
    const apps = await Application.find({ student: req.user.id })
      .populate('opportunity')
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    next(err);
  }
});

// GET applicants for one opportunity, ranked by score (industry)
router.get('/for/:opportunityId', auth, role('industry'), async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.opportunityId);
    if (!opportunity) return res.status(404).json({ message: 'Opportunity not found' });
    if (String(opportunity.postedBy) !== req.user.id) {
      return res.status(403).json({ message: 'You did not post this opportunity' });
    }
    const apps = await Application.find({ opportunity: req.params.opportunityId })
      .populate('student', 'name email')
      .sort({ matchScore: -1 });
    res.json(apps);
  } catch (err) {
    next(err);
  }
});

// POST apply (student) -> auto-calculates match score
router.post('/:opportunityId', auth, role('student'), async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findById(req.params.opportunityId);
    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (!opportunity || !profile) return res.status(404).json({ message: 'Not found' });

    const existing = await Application.findOne({ student: req.user.id, opportunity: opportunity._id });
    if (existing) return res.status(400).json({ message: 'You already applied to this opportunity' });

    const { score, matched, missing } = calculateMatch(profile.skills, opportunity.requiredSkills);

    const application = await Application.create({
      student: req.user.id,
      opportunity: opportunity._id,
      matchScore: score,
      matchedSkills: matched,
      missingSkills: missing,
    });
    res.status(201).json(application);
  } catch (err) {
    next(err);
  }
});

// PATCH update status (industry: shortlist / select / reject)
router.patch('/:id/status', auth, role('industry'), async (req, res, next) => {
  try {
    const allowed = ['applied', 'shortlisted', 'rejected', 'selected'];
    if (!allowed.includes(req.body.status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const existingApplication = await Application.findById(req.params.id)
      .populate('opportunity', 'postedBy');
    if (!existingApplication) return res.status(404).json({ message: 'Application not found' });
    if (!existingApplication.opportunity || String(existingApplication.opportunity.postedBy) !== req.user.id) {
      return res.status(403).json({ message: 'You can only update applicants for your own opportunities' });
    }

    const app = await Application.findByIdAndUpdate(
      req.params.id, { status: req.body.status }, { new: true }
    );
    await Notification.create({ user: app.student, type: 'application', message: `Your application status is now: ${req.body.status}.` });
    res.json(app);
  } catch (err) {
    next(err);
  }
});

// Schedule an interview and share notes with the student.
router.patch('/:id/interview', auth, role('industry'), async (req, res, next) => {
  try {
    const app = await Application.findById(req.params.id).populate('opportunity', 'postedBy title');
    if (!app) return res.status(404).json({ message: 'Application not found' });
    if (!app.opportunity || String(app.opportunity.postedBy) !== req.user.id) return res.status(403).json({ message: 'You can only schedule interviews for your own opportunities' });
    app.interviewAt = req.body.interviewAt || undefined;
    app.interviewNotes = String(req.body.interviewNotes || '').slice(0, 1000);
    await app.save();
    if (app.interviewAt) await Notification.create({ user: app.student, type: 'interview', message: `Interview scheduled for ${app.opportunity.title} on ${app.interviewAt.toLocaleString()}.` });
    res.json(app);
  } catch (err) { next(err); }
});

module.exports = router;
