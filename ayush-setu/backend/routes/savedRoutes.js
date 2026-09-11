const express = require('express');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const SavedOpportunity = require('../models/SavedOpportunity');
const router = express.Router();

router.get('/mine', auth, role('student'), async (req, res, next) => {
  try { res.json(await SavedOpportunity.find({ student: req.user.id }).populate('opportunity').sort({ createdAt: -1 })); } catch (err) { next(err); }
});
router.post('/:opportunityId', auth, role('student'), async (req, res, next) => {
  try { res.status(201).json(await SavedOpportunity.create({ student: req.user.id, opportunity: req.params.opportunityId })); } catch (err) { next(err); }
});
router.delete('/:opportunityId', auth, role('student'), async (req, res, next) => {
  try { await SavedOpportunity.findOneAndDelete({ student: req.user.id, opportunity: req.params.opportunityId }); res.status(204).end(); } catch (err) { next(err); }
});
module.exports = router;
