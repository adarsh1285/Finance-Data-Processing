const User = require('../models/User');
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
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { name, email, password, role_id } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists"
        });
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

      res.status(500).json({
        success: false,
        message: "Server Error"
      });
    }
  }
];