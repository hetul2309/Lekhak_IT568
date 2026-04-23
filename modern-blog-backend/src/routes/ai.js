const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const Blog = require('../models/Blog');
const { protect } = require('../middleware/auth');

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { message: 'Too many AI requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Basic keyword-to-category mapping for AI categorization
const CATEGORY_KEYWORDS = {
  Technology: ['tech', 'software', 'code', 'programming', 'developer', 'javascript', 'python', 'ai', 'machine learning', 'web', 'app', 'api'],
  Science: ['science', 'research', 'study', 'biology', 'chemistry', 'physics', 'space', 'nasa', 'experiment'],
  Health: ['health', 'fitness', 'nutrition', 'wellness', 'mental', 'exercise', 'diet', 'medical', 'yoga'],
  Business: ['business', 'startup', 'entrepreneur', 'finance', 'investment', 'marketing', 'strategy', 'revenue'],
  Travel: ['travel', 'trip', 'journey', 'explore', 'adventure', 'destination', 'tour', 'vacation'],
  Food: ['food', 'recipe', 'cooking', 'cuisine', 'restaurant', 'meal', 'eat', 'chef'],
  Lifestyle: ['lifestyle', 'productivity', 'self-improvement', 'minimalism', 'habits', 'mindset'],
  Art: ['art', 'design', 'creative', 'photography', 'music', 'film', 'culture', 'literature'],
  Education: ['education', 'learning', 'school', 'university', 'study', 'knowledge', 'course', 'teaching'],
  Politics: ['politics', 'government', 'policy', 'democracy', 'election', 'law', 'rights'],
};

const categorizeText = (text) => {
  const lower = text.toLowerCase();
  const matched = [];
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      matched.push(category);
    }
  }
  return matched.length > 0 ? matched : ['General'];
};

const summarizeText = (text, maxLength = 200) => {
  if (typeof text !== 'string') return '';
  // Strip HTML tags by splitting on '<' and removing the tag portion (up to '>')
  // This avoids regex backtracking on long inputs
  const capped = text.length > 5000 ? text.slice(0, 5000) : text;
  const plain = capped
    .split('<')
    .map((segment, i) => {
      if (i === 0) return segment;
      const closeIdx = segment.indexOf('>');
      return closeIdx === -1 ? '' : segment.slice(closeIdx + 1);
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= maxLength) return plain;
  const truncated = plain.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
};

// POST /api/ai/categorize
router.post('/categorize', aiLimiter, protect, async (req, res) => {
  try {
    const { title, content, description } = req.body;
    if (!title && !content) {
      return res.status(400).json({ message: 'Title or content is required for categorization' });
    }

    const textToAnalyze = `${title || ''} ${description || ''} ${content || ''}`;
    const categories = categorizeText(textToAnalyze);

    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ai/summarize
router.post('/summarize', aiLimiter, protect, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Content is required for summarization' });
    }

    const summary = summarizeText(content);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ai/auto-tag/:blogId — auto-categorize and save to a blog
router.post('/auto-tag/:blogId', aiLimiter, protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.blogId);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this blog' });
    }

    const textToAnalyze = `${blog.title} ${blog.description} ${blog.content}`;
    const categories = categorizeText(textToAnalyze);
    const summary = summarizeText(blog.content);

    blog.categories = categories;
    blog.aiSummary = summary;
    await blog.save();

    res.json({ categories, summary });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
