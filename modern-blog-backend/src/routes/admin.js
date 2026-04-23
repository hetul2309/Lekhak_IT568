const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const Report = require('../models/Report');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect, adminOnly);

// GET /api/admin/stats — overview stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalBlogs, totalComments, pendingReports] = await Promise.all([
      User.countDocuments(),
      Blog.countDocuments(),
      Comment.countDocuments({ isDeleted: false }),
      Report.countDocuments({ status: 'pending' }),
    ]);
    res.json({ totalUsers, totalBlogs, totalComments, pendingReports });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users — list all users
router.get('/users', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limit).select('-password'),
      User.countDocuments(),
    ]);

    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/users/:id/blacklist — toggle blacklist
router.put('/users/:id/blacklist', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isBlacklisted = !user.isBlacklisted;
    await user.save();
    res.json({
      message: user.isBlacklisted ? 'User blacklisted' : 'User un-blacklisted',
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/blogs — list all blogs
router.get('/blogs', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = {};
    const validBlogStatuses = ['draft', 'published'];
    if (req.query.status && validBlogStatuses.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-content')
        .populate('author', 'username email'),
      Blog.countDocuments(filter),
    ]);

    res.json({ blogs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/blogs/:id
router.delete('/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    await blog.deleteOne();
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/reports — list reports
router.get('/reports', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = {};
    const validReportStatuses = ['pending', 'reviewed', 'resolved', 'dismissed'];
    if (req.query.status && validReportStatuses.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('reporter', 'username email'),
      Report.countDocuments(filter),
    ]);

    res.json({ reports, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/reports/:id — update report status
router.put('/reports/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'reviewed', 'resolved', 'dismissed'];
    if (typeof status !== 'string' || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('reporter', 'username email');

    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
