const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

exports.register = [
  // Validation rules
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  body('role_id')
    .notEmpty()
    .withMessage('Role ID is required')
    .isMongoId()
    .withMessage('Invalid role ID format'),

  // Controller logic
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 400;
        error.errors = errors.array();
        return next(error);
      }

      const { name, email, password, role_id } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        const error = new Error('User already exists');
        error.statusCode = 400;
        return next(error);
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role_id
      });

      // Generate JWT
      const token = jwt.sign(
        {
          id: user._id,
          role: user.role_id
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Response
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role_id: user.role_id,
          status: user.status,
          created_at: user.created_at
        }
      });

    } catch (error) {
      console.error(error);
      next(error);
    }
  }
];

exports.login = [
  // Validation rules
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  // Controller logic
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 400;
        error.errors = errors.array();
        return next(error);
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });

      if (!user) {
        const err = new Error('Invalid credentials');
        err.statusCode = 401;
        return next(err);
      }

      // Check if user is active
      if (user.status !== 'active') {
        const err = new Error('Account is not active');
        err.statusCode = 401;
        return next(err);
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        const err = new Error('Invalid credentials');
        err.statusCode = 401;
        return next(err);
      }

      // Generate JWT
      const token = jwt.sign(
        {
          id: user._id,
          role: user.role_id
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Response
      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role_id: user.role_id,
          status: user.status,
          created_at: user.created_at
        }
      });

    } catch (error) {
      console.error(error);
      next(error);
    }
  }
];