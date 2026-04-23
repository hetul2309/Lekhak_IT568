// src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true, // We will hash this later with bcrypt
    },
    displayName: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: 'I love writing!',
    },
    profilePicture: {
      type: String,
      default: 'https://via.placeholder.com/150', // Default image
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }],
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isBlacklisted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

module.exports = mongoose.model('User', userSchema);
