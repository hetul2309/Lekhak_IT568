const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const { protect } = require('../middleware/auth');

// GET /api/analytics/:userId — get stats for a user
router.get('/:userId', protect, async (req, res) => {
  try {
    if (
      req.user._id.toString() !== req.params.userId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view these analytics' });
    }

    const [publishedBlogs, draftBlogs] = await Promise.all([
      Blog.find({ author: req.params.userId, status: 'published' }),
      Blog.countDocuments({ author: req.params.userId, status: 'draft' }),
    ]);

    const totalViews = publishedBlogs.reduce((sum, b) => sum + b.views, 0);
    const totalLikes = publishedBlogs.reduce((sum, b) => sum + b.likes.length, 0);

    const totalComments = await Comment.countDocuments({
      blog: { $in: publishedBlogs.map((b) => b._id) },
      isDeleted: false,
    });

    const topBlogs = [...publishedBlogs]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map((b) => ({
        _id: b._id,
        title: b.title,
        views: b.views,
        likes: b.likes.length,
        createdAt: b.createdAt,
      }));

    res.json({
      totalPublished: publishedBlogs.length,
      totalDrafts: draftBlogs,
      totalViews,
      totalLikes,
      totalComments,
      topBlogs,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
