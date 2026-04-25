const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const Notification = require('../models/Notification');
const { protect, optionalProtect } = require('../middleware/auth');

const VALID_STATUSES = ['draft', 'published'];

// GET /api/blogs/trending — must be before /:id
router.get('/trending', async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published' })
      .sort({ views: -1 })
      .limit(10)
      .select('-content')
      .populate('author', 'username displayName profilePicture');
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/blogs/my/drafts — must be before /:id
router.get('/my/drafts', protect, async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user._id, status: 'draft' }).sort({
      updatedAt: -1,
    });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/blogs — list published blogs (paginated)
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const filter = { status: 'published' };
    if (req.query.category && typeof req.query.category === 'string') {
      filter.categories = req.query.category;
    }

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-content')
        .populate('author', 'username displayName profilePicture'),
      Blog.countDocuments(filter),
    ]);

    res.json({ blogs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/blogs/:id
router.get('/:id', optionalProtect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate(
      'author',
      'username displayName profilePicture bio'
    );
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const isOwner = req.user && blog.author._id.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';
    if (blog.status !== 'published' && !isOwner && !isAdmin) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment view count
    blog.views += 1;
    await blog.save();

    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/blogs — create blog
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, description, thumbnail, categories, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const resolvedStatus = VALID_STATUSES.includes(status) ? status : 'draft';

    const blog = await Blog.create({
      title,
      content,
      description,
      thumbnail,
      categories: Array.isArray(categories) ? categories : [],
      status: resolvedStatus,
      author: req.user._id,
    });

    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/blogs/:id — update blog
router.put('/:id', protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this blog' });
    }

    const { title, content, description, thumbnail, categories, status } = req.body;
    if (title !== undefined) blog.title = title;
    if (content !== undefined) blog.content = content;
    if (description !== undefined) blog.description = description;
    if (thumbnail !== undefined) blog.thumbnail = thumbnail;
    if (Array.isArray(categories)) blog.categories = categories;
    if (status !== undefined && VALID_STATUSES.includes(status)) blog.status = status;

    await blog.save();
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/blogs/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const isOwner = blog.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this blog' });
    }

    await blog.deleteOne();
    res.json({ message: 'Blog deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/blogs/:id/like
router.post('/:id/like', protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const userId = req.user._id;
    const alreadyLiked = blog.likes.map(String).includes(userId.toString());

    if (alreadyLiked) {
      blog.likes = blog.likes.filter((id) => id.toString() !== userId.toString());
      await blog.save();
      return res.json({ message: 'Like removed', likes: blog.likes.length });
    }

    blog.likes.push(userId);
    await blog.save();

    if (blog.author.toString() !== userId.toString()) {
      await Notification.create({
        recipient: blog.author,
        sender: userId,
        type: 'like',
        message: `${req.user.username} liked your blog "${blog.title}"`,
        link: `/blogs/${blog._id}`,
      });
    }

    res.json({ message: 'Blog liked', likes: blog.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
