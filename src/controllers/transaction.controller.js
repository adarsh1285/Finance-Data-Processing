const Transaction = require('../models/transaction.model');
const User = require('../models/user.model');
const { body, validationResult } = require('express-validator');

// 📝 CREATE TRANSACTION
exports.createTransaction = [
  body('user_id').notEmpty().withMessage('User ID is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('type').isIn(['income', 'expense', 'transfer']).withMessage('Type must be income, expense, or transfer'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('notes').trim().optional(),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const err = new Error('Validation failed');
        err.statusCode = 400;
        err.errors = errors.array();
        return next(err);
      }

      const { user_id, amount, type, category, date, notes } = req.body;

      // Verify user exists
      const userExists = await User.findById(user_id);
      if (!userExists) {
        const err = new Error('User not found');
        err.statusCode = 404;
        return next(err);
      }

      const newTransaction = new Transaction({
        user_id,
        amount,
        type,
        category,
        date,
        notes: notes || '',
      });

      const savedTransaction = await newTransaction.save();

      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: savedTransaction,
      });
    } catch (err) {
      next(err);
    }
  }
];

// 📖 VIEW ALL TRANSACTIONS
exports.getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find()
      .populate('user_id', 'name email')
      .sort({ date: -1 });

    res.json({
      success: true,
      data: transactions,
      total: transactions.length,
    });
  } catch (err) {
    next(err);
  }
};

// 📖 VIEW SINGLE TRANSACTION
exports.getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id).populate('user_id', 'name email');

    if (!transaction) {
      const err = new Error('Transaction not found');
      err.statusCode = 404;
      return next(err);
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (err) {
    next(err);
  }
};

// 🔍 FILTER TRANSACTIONS
exports.filterTransactions = async (req, res, next) => {
  try {
    const { user_id, type, category, startDate, endDate, minAmount, maxAmount } = req.query;

    let filterQuery = {};

    // Filter by user
    if (user_id) {
      filterQuery.user_id = user_id;
    }

    // Filter by type
    if (type) {
      filterQuery.type = type;
    }

    // Filter by category
    if (category) {
      filterQuery.category = { $regex: category, $options: 'i' }; // case-insensitive
    }

    // Filter by date range
    if (startDate || endDate) {
      filterQuery.date = {};
      if (startDate) {
        filterQuery.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filterQuery.date.$lte = new Date(endDate);
      }
    }

    // Filter by amount range
    if (minAmount || maxAmount) {
      filterQuery.amount = {};
      if (minAmount) {
        filterQuery.amount.$gte = parseFloat(minAmount);
      }
      if (maxAmount) {
        filterQuery.amount.$lte = parseFloat(maxAmount);
      }
    }

    const transactions = await Transaction.find(filterQuery)
      .populate('user_id', 'name email')
      .sort({ date: -1 });

    res.json({
      success: true,
      data: transactions,
      total: transactions.length,
      filters: filterQuery,
    });
  } catch (err) {
    next(err);
  }
};

// ✏️ UPDATE TRANSACTION
exports.updateTransaction = [
  body('amount').optional().isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
  body('type').optional().isIn(['income', 'expense', 'transfer']).withMessage('Type must be income, expense, or transfer'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty if provided'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('notes').optional().trim(),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const err = new Error('Validation failed');
        err.statusCode = 400;
        err.errors = errors.array();
        return next(err);
      }

      const { id } = req.params;
      const update = { ...req.body };

      const updatedTransaction = await Transaction.findByIdAndUpdate(
        id,
        update,
        {
          new: true,
          runValidators: true,
          context: 'query',
        }
      ).populate('user_id', 'name email');

      if (!updatedTransaction) {
        const err = new Error('Transaction not found');
        err.statusCode = 404;
        return next(err);
      }

      res.json({
        success: true,
        message: 'Transaction updated successfully',
        data: updatedTransaction,
      });
    } catch (err) {
      next(err);
    }
  }
];

// 🗑️ DELETE TRANSACTION
exports.deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedTransaction = await Transaction.findByIdAndDelete(id);

    if (!deletedTransaction) {
      const err = new Error('Transaction not found');
      err.statusCode = 404;
      return next(err);
    }

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
      data: deletedTransaction,
    });
  } catch (err) {
    next(err);
  }
};
