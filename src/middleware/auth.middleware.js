const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Role = require('../models/role.model');

exports.authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader && authHeader.split(' ')[0] === 'Bearer' ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token missing.'
      });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    if (!payload || !payload.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload'
      });
    }

    let user;
    try {
      user = await User.findById(payload.id).populate('role_id');
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid user ID in token'
        });
      }
      throw error;
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token user'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'User account is not active'
      });
    }

    if (!user.role_id) {
      return res.status(403).json({
        success: false,
        message: 'User role not found'
      });
    }

    const userRoleName = user.role_id.role_name || null;

    req.user = {
      id: user._id,
      role_id: user.role_id,
      role_name: userRoleName,
      email: user.email
    };

    next();
  } catch (err) {
    console.error('Authentication middleware error', err);
    res.status(500).json({
      success: false,
      message: 'Internal server error in authentication'
    });
  }
};