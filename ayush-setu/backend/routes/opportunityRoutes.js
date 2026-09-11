const express = require('express');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const Opportunity = require('../models/Opportunity');
const router = express.Router();

// POST create (industry only)
router.post('/', auth, role('industry'), async (req, res, next) => {
  try {
    const opp = await Opportunity.create({ ...req.body, postedBy: req.user.id });
    res.status(201).json(opp);
  } catch (err) {
    next(err);
  }
});

// GET list (any logged-in user) with optional ?skill= filter
router.get('/', auth, async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.skill) filter['requiredSkills.name'] = new RegExp(req.query.skill, 'i');
    const opportunities = await Opportunity.find(filter).sort({ createdAt: -1 });
    res.json(opportunities);
  } catch (err) {
    next(err);
  }
});

// GET opportunities posted by the logged-in industry user
// NOTE: this route must come before '/:id' or Express will try to treat
// 'mine' as an ObjectId and crash the /:id route.
router.get('/mine/list', auth, role('industry'), async (req, res, next) => {
  try {
    const opportunities = await Opportunity.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
    res.json(opportunities);
  } catch (err) {
    next(err);
  }
});

// GET single opportunity
router.get('/:id', auth, async (req, res, next) => {
  try {
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) return res.status(404).json({ message: 'Not found' });
    res.json(opp);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
