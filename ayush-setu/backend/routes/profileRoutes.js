const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const StudentProfile = require('../models/StudentProfile');
const { extractSkillsFromResume } = require('../utils/resumeParser');
const router = express.Router();

// Ensure uploads/ exists at boot (works even on a fresh clone)
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir });

// GET my profile (creates an empty one on first call)
router.get('/me', auth, role('student'), async (req, res, next) => {
  try {
    let profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) profile = await StudentProfile.create({ user: req.user.id });
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

// PUT update profile (targetRole, education, skills array)
router.put('/me', auth, role('student'), async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

// Demo verification endpoint. Production can replace the submitted score with a proctored quiz or certificate-provider result.
router.post('/verify-skill', auth, role('student'), async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim().toLowerCase();
    const score = Number(req.body.score);
    if (!name || !Number.isFinite(score) || score < 0 || score > 100) return res.status(400).json({ message: 'Provide a valid skill and assessment score.' });
    if (score < 60) return res.status(400).json({ message: 'A score of 60 or above is required for verification.' });
    const profile = await StudentProfile.findOne({ user: req.user.id });
    const skill = profile?.skills.find((item) => item.name.toLowerCase() === name);
    if (!skill) return res.status(404).json({ message: 'Add this skill to your profile before verifying it.' });
    skill.source = 'verified';
    await profile.save();
    res.json(profile);
  } catch (err) { next(err); }
});

// POST upload resume -> auto-suggest skills (no external API needed)
router.post('/resume', auth, role('student'), upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const suggestedSkills = await extractSkillsFromResume(req.file.path);
    res.json({ suggestedSkills });
  } catch (err) {
    next(err);
  } finally {
    // clean up the temp file after parsing so uploads/ doesn't fill up during the demo
    if (req.file) fs.unlink(req.file.path, () => {});
  }
});

module.exports = router;
