const express = require('express');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const Opportunity = require('../models/Opportunity');
const StudentProfile = require('../models/StudentProfile');
const router = express.Router();

router.get('/skill-gap', auth, role('institution'), async (req, res, next) => {
  try {
    // Demand: count how many times each skill is requested across all opportunities
    const demand = await Opportunity.aggregate([
      { $unwind: '$requiredSkills' },
      { $group: { _id: '$requiredSkills.name', demand: { $sum: 1 } } },
    ]);

    // Supply: count how many students have each skill
    const supply = await StudentProfile.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills.name', supply: { $sum: 1 } } },
    ]);

    const supplyMap = Object.fromEntries(supply.map((s) => [s._id, s.supply]));
    const result = demand.map((d) => ({
      skill: d._id,
      demand: d.demand,
      supply: supplyMap[d._id] || 0,
    })).sort((a, b) => b.demand - a.demand);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Simple headline numbers for the institution dashboard stat cards
router.get('/summary', auth, role('institution'), async (req, res, next) => {
  try {
    const totalStudents = await StudentProfile.countDocuments();
    const totalOpportunities = await Opportunity.countDocuments();
    res.json({ totalStudents, totalOpportunities });
  } catch (err) {
    next(err);
  }
});

router.get('/departments', auth, role('institution'), async (req, res, next) => {
  try {
    const departments = await StudentProfile.aggregate([
      { $match: { department: { $nin: ['', null] } } },
      { $group: { _id: '$department', students: { $sum: 1 } } },
      { $sort: { students: -1, _id: 1 } },
    ]);
    res.json(departments.map((item) => ({ department: item._id, students: item.students })));
  } catch (err) { next(err); }
});

module.exports = router;
