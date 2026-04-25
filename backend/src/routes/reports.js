const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { protect } = require('../middleware/auth');

// POST /api/reports — submit a report
router.post('/', protect, async (req, res) => {
  try {
    const { targetType, targetId, reason } = req.body;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ message: 'targetType, targetId, and reason are required' });
    }

    const validTypes = ['blog', 'comment', 'user'];
    if (!validTypes.includes(targetType)) {
      return res.status(400).json({ message: 'Invalid targetType' });
    }

    const modelMap = { blog: 'Blog', comment: 'Comment', user: 'User' };

    const report = await Report.create({
      reporter: req.user._id,
      targetType,
      targetId,
      targetModel: modelMap[targetType],
      reason: reason.trim(),
    });

    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
