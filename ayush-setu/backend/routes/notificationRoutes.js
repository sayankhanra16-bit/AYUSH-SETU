const express = require('express');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');
const router = express.Router();

router.get('/mine', auth, async (req, res, next) => { try { res.json(await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(20)); } catch (err) { next(err); } });
router.patch('/read', auth, async (req, res, next) => { try { await Notification.updateMany({ user: req.user.id, read: false }, { read: true }); res.json({ ok: true }); } catch (err) { next(err); } });
module.exports = router;
