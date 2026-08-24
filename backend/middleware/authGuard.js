const jwt = require('jsonwebtoken');
const Member = require('../models/Member');

const JWT_SECRET = process.env.JWT_SECRET || 'fitzone_super_secret_jwt_key_2026';

/**
 * Authentication Guard Middleware
 * Validates Bearer token in Authorization header and attaches member to req.member
 */
const authGuard = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Missing or invalid Authorization Bearer header',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Bearer token is empty',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Invalid or expired token',
      });
    }

    const member = await Member.findById(decoded.id || decoded._id);
    if (!member) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Member not found with this token',
      });
    }

    req.member = member;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authGuard;
