const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

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

module.exports = {
  googleAuth
};