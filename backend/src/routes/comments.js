const express = require('express');
const router = express.Router({ mergeParams: true });
const Comment = require('../models/Comment');
const Blog = require('../models/Blog');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// GET /api/blogs/:blogId/comments
router.get('/', async (req, res) => {
  try {
    const comments = await Comment.find({
      blog: req.params.blogId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .populate('author', 'username displayName profilePicture');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/blogs/:blogId/comments
router.post('/', protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const blog = await Blog.findById(req.params.blogId);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const comment = await Comment.create({
      blog: req.params.blogId,
      author: req.user._id,
      content: content.trim(),
    });

    if (blog.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: blog.author,
        sender: req.user._id,
        type: 'comment',
        message: `${req.user.username} commented on your blog "${blog.title}"`,
        link: `/blogs/${blog._id}`,
      });
    }

    await comment.populate('author', 'username displayName profilePicture');
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/blogs/:blogId/comments/:commentId
router.delete('/:commentId', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const isOwner = comment.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    comment.isDeleted = true;
    await comment.save();
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
