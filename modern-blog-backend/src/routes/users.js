const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const Blog = require('../models/Blog');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// GET /api/users/me/bookmarks — own bookmarked blogs (must be before /:id)
router.get('/me/bookmarks', apiLimiter, protect, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id).select('bookmarks');
    const blogs = await Blog.find({ _id: { $in: user.bookmarks }, status: 'published' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-content')
      .populate('author', 'username displayName profilePicture');

    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/me/saved — alias for frontend compatibility
router.get('/me/saved', apiLimiter, protect, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id).select('bookmarks');
    const blogs = await Blog.find({ _id: { $in: user.bookmarks }, status: 'published' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-content')
      .populate('author', 'username displayName profilePicture');

    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users/me/bookmark/:blogId — toggle bookmark on a blog
router.post('/me/bookmark/:blogId', apiLimiter, protect, async (req, res) => {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findById(blogId).select('_id status');
    if (!blog || blog.status !== 'published') {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const removed = await User.updateOne(
      { _id: req.user._id, bookmarks: blog._id },
      { $pull: { bookmarks: blog._id } }
    );

    if (removed.modifiedCount === 0) {
      await User.updateOne({ _id: req.user._id }, { $addToSet: { bookmarks: blog._id } });
      return res.json({ message: 'Blog bookmarked', saved: true });
    }

    res.json({ message: 'Bookmark removed', saved: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users/me/saved/:blogId — alias for frontend compatibility
router.post('/me/saved/:blogId', apiLimiter, protect, async (req, res) => {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findById(blogId).select('_id status');
    if (!blog || blog.status !== 'published') {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const removed = await User.updateOne(
      { _id: req.user._id, bookmarks: blog._id },
      { $pull: { bookmarks: blog._id } }
    );

    if (removed.modifiedCount === 0) {
      await User.updateOne({ _id: req.user._id }, { $addToSet: { bookmarks: blog._id } });
      return res.json({ message: 'Blog saved successfully', saved: true });
    }

    res.json({ message: 'Blog removed from saved posts', saved: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/:id — public profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -isBlacklisted');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/:id — update own profile
router.put('/:id', protect, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Not allowed to update another user\'s profile' });
    }

    const { displayName, bio, profilePicture } = req.body;
    const updateData = {};
    if (typeof displayName === 'string') updateData.displayName = displayName.trim();
    if (typeof bio === 'string') updateData.bio = bio.trim();
    if (typeof profilePicture === 'string') updateData.profilePicture = profilePicture.trim();

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users/:id/follow
router.post('/:id/follow', protect, async (req, res) => {
  try {
    const targetId = req.params.id;
    const currentUserId = req.user._id.toString();

    if (targetId === currentUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: 'User not found' });

    const alreadyFollowing = target.followers.map(String).includes(currentUserId);

    if (alreadyFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(targetId, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(currentUserId, { $pull: { following: target._id } });
      return res.json({ message: 'Unfollowed successfully' });
    }

    // Follow
    await User.findByIdAndUpdate(targetId, { $addToSet: { followers: req.user._id } });
    await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: target._id } });

    await Notification.create({
      recipient: target._id,
      sender: req.user._id,
      type: 'follow',
      message: `${req.user.username} started following you`,
    });

    res.json({ message: 'Followed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/:id/blogs — public list of user's published blogs
router.get('/:id/blogs', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const blogs = await Blog.find({ author: req.params.id, status: 'published' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-content');

    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
