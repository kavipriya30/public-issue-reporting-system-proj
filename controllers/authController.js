const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Generate JWT Token
const generateToken = (userId, email, role, name) => {
  return jwt.sign({ userId, email, role, name }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  });
};

// Register User
const registerUser = async (req, res) => {
  try {
    const { email, password, role, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      role: role || 'citizen',
      name: name || email.split('@')[0]
    });

    await user.save();

    const token = generateToken(user._id, user.email, user.role, user.name);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { id: user._id, email: user.email, role: user.role, name: user.name },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // For demo purposes - accept any credentials
    const isAdmin = email.toLowerCase().includes('admin');
    const demoUser = {
      _id: '65a5f1234567890123456789',
      email: email,
      role: isAdmin ? 'admin' : 'citizen',
      name: isAdmin ? 'Admin User' : 'Demo User'
    };

    const token = generateToken(demoUser._id, demoUser.email, demoUser.role, demoUser.name);
    res.json({
      success: true,
      message: 'Login successful',
      user: demoUser,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};