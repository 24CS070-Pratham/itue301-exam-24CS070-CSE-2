const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Member = require('../models/Member');

const JWT_SECRET = process.env.JWT_SECRET || 'fitzone_super_secret_jwt_key_2026';

// Helper to generate JWT
const generateToken = (member) => {
  return jwt.sign(
    {
      id: member._id,
      _id: member._id,
      email: member.email,
      role: member.role || 'Member',
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate member and return JWT token + member info
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: ['Please provide email and password'],
      });
    }

    // Find member by email
    const member = await Member.findOne({ email: email.toLowerCase().trim() });
    if (!member) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        errors: ['Invalid credentials'],
      });
    }

    // Compare password (supports both bcrypt hashed passwords and demo fallback)
    const isMatch =
      member.password.startsWith('$2a$') || member.password.startsWith('$2b$')
        ? await bcrypt.compare(password, member.password)
        : member.password === password;

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        errors: ['Invalid credentials'],
      });
    }

    const token = generateToken(member);

    return res.status(200).json({
      success: true,
      token,
      member: {
        _id: member._id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        membershipType: member.membershipType,
        role: member.role || 'Member',
      },
      role: member.role || 'Member',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new member
 * @access  Public
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, phone, membershipType, role } = req.body;

    const validationErrors = [];
    if (!name || !name.trim()) {
      validationErrors.push('Full name is required');
    }
    if (!email || !email.trim()) {
      validationErrors.push('Email address is required');
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      validationErrors.push('Please provide a valid email address');
    }
    if (!password) {
      validationErrors.push('Password is required');
    } else if (password.length < 6) {
      validationErrors.push('Password must be at least 6 characters long');
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    // Check if member already exists
    const normalizedEmail = email.toLowerCase().trim();
    const existingMember = await Member.findOne({ email: normalizedEmail });
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'A member with this email address already exists',
        errors: ['An account with this email is already registered. Please sign in instead.'],
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const validMembershipTypes = ['basic', 'premium', 'platinum'];
    const selectedMembership = validMembershipTypes.includes(membershipType)
      ? membershipType
      : 'basic';

    const newMember = new Member({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : '',
      membershipType: selectedMembership,
      role: role === 'Admin' ? 'Admin' : 'Member',
    });

    const savedMember = await newMember.save();
    const token = generateToken(savedMember);

    return res.status(201).json({
      success: true,
      token,
      member: {
        _id: savedMember._id,
        name: savedMember.name,
        email: savedMember.email,
        phone: savedMember.phone,
        membershipType: savedMember.membershipType,
        role: savedMember.role || 'Member',
      },
      role: savedMember.role || 'Member',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
