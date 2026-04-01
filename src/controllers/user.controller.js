const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { body, validationResult } = require('express-validator');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').populate('role_id', 'role_name');
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password').populate('role_id', 'role_name');

    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      return next(err);
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

exports.createUser = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role_id').notEmpty().withMessage('role_id is required'),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const err = new Error('Validation failed');
        err.statusCode = 400;
        err.errors = errors.array();
        return next(err);
      }

      const { name, email, password, role_id, status } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        const err = new Error('User already exists');
        err.statusCode = 409;
        return next(err);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role_id,
        status: status || 'active'
      });

      const savedUser = await newUser.save();

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { ...savedUser.toObject(), password: undefined }
      });
    } catch (err) {
      next(err);
    }
  }
];

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const update = { ...req.body };

    if (update.password) {
      update.password = await bcrypt.hash(update.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
      context: 'query'
    }).select('-password');

    if (!updatedUser) {
      const err = new Error('User not found');
      err.statusCode = 404;
      return next(err);
    }

    res.json({ success: true, message: 'User updated successfully', data: updatedUser });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      const err = new Error('User not found');
      err.statusCode = 404;
      return next(err);
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};
