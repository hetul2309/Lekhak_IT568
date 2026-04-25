const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const googleAuth = async (req, res) => {
  try {
    // Support both 'token' (new requirement) and 'tokenId' (backward compatibility with frontend)
    const token = req.body.token || req.body.tokenId;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Google ID token is required' });
    }

    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Invalid Google ID token' });
    }

    const { email, name } = ticket.getPayload();
    const lowercaseEmail = String(email).toLowerCase();

    let user = await User.findOne({ email: lowercaseEmail });

    if (!user) {
      // Generate a unique username from their email prefix
      let baseUsername = lowercaseEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
      let username = baseUsername;
      let usernameExists = await User.findOne({ username });
      let counter = 1;
      
      while (usernameExists) {
        username = `${baseUsername}${counter}`;
        usernameExists = await User.findOne({ username });
        counter++;
      }

      user = await User.create({
        username,
        email: lowercaseEmail,
        displayName: name || username,
        password: crypto.randomBytes(16).toString('hex'), // Random secure string to pass Mongoose minlength validation
        authProvider: 'google',
      });
    }

    if (user.isBlacklisted) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended' });
    }

    // Return success format alongside the token for the frontend session
    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        authProvider: user.authProvider,
      },
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during Google authentication' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email: String(email).toLowerCase() });
    
    // Always return success to prevent email enumeration (security requirement)
    if (!user) {
      return res.status(200).json({ success: true, message: 'If an account exists, a reset link has been sent.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 mins expiry
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Password Reset Request - Lekhak',
      text: `You requested a password reset. Click the link to reset your password: ${resetLink}\n\nThis link will expire in 15 minutes.`,
      html: `<p>You requested a password reset.</p><p>Click this <a href="${resetLink}">link</a> to reset your password.</p><p>This link will expire in 15 minutes.</p>`
    });

    return res.status(200).json({ success: true, message: 'If an account exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ success: false, message: 'New password is required' });

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  googleAuth,
  forgotPassword,
  resetPassword
};