// src/models/Blog.js
const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true, // This will be the HTML from the rich text editor
    },
    description: {
      type: String,
      default: '', // The AI-generated card description
    },
    aiSummary: {
      type: String,
      default: '', // The AI-generated TL;DR for readers
    },
    thumbnail: {
      type: String,
      default: '', 
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categories: {
      type: [String],
      default: [], // Can be manually selected or AI-categorized
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);