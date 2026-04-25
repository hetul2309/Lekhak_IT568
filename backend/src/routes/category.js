const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect, adminOnly } = require('../middleware/auth');

const toSlug = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

router.use(protect, adminOnly);

// GET /api/category/get-all-category
router.get('/get-all-category', async (_req, res) => {
  try {
    const category = await Category.find().sort({ name: 1 });
    res.json({ category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/category/add-category
router.post('/add-category', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const slug = toSlug(name);
    const exists = await Category.findOne({ $or: [{ name: name.trim() }, { slug }] });
    if (exists) {
      return res.status(409).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      description: typeof description === 'string' ? description.trim() : '',
    });

    res.status(201).json({ category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/category/edit-category/:id
router.patch('/edit-category/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (typeof name === 'string' && name.trim()) {
      const slug = toSlug(name);
      const exists = await Category.findOne({
        _id: { $ne: category._id },
        $or: [{ name: name.trim() }, { slug }],
      });
      if (exists) {
        return res.status(409).json({ message: 'Category already exists' });
      }

      category.name = name.trim();
      category.slug = slug;
    }

    if (typeof description === 'string') {
      category.description = description.trim();
    }

    await category.save();
    res.json({ category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/category/delete-category/:id
router.delete('/delete-category/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.deleteOne();
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;