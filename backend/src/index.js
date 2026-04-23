// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Verify that the environment variable is loaded correctly
if (!process.env.MONGODB_URI) {
  console.error('FATAL ERROR: MONGODB_URI is not defined in the .env file.');
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in the .env file.');
  process.exit(1);
}

const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const blogRoutes = require('./routes/blogs');
const commentRoutes = require('./routes/comments');
const searchRoutes = require('./routes/search');
const aiRoutes = require('./routes/ai');
const analyticsRoutes = require('./routes/analytics');
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(helmet()); // Security headers
app.use(cors());   // Allows frontend to talk to backend
app.use(express.json()); // Parses incoming JSON

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Lekhak API is running...' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/blogs/:blogId/comments', commentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));