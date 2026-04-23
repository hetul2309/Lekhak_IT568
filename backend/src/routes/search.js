const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const User = require('../models/User');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/search?q=keyword&type=blogs|users|all&page=1&limit=10
router.get('/', async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({ message: 'Query parameter "q" is required' });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const regex = new RegExp(escapeRegex(q.trim()), 'i');
    const results = {};

    if (type === 'blogs' || type === 'all') {
      results.blogs = await Blog.find({
        status: 'published',
        $or: [
          { title: regex },
          { description: regex },
          { categories: regex },
        ],
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-content')
        .populate('author', 'username displayName profilePicture');
    }

    if (type === 'users' || type === 'all') {
      results.users = await User.find({
        $or: [{ username: regex }, { displayName: regex }],
        isBlacklisted: false,
      })
        .skip(skip)
        .limit(limit)
        .select('username displayName profilePicture bio');
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
