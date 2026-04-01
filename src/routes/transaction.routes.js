const express = require('express');
const { authenticateToken } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const transactionController = require('../controllers/transaction.controller');

const router = express.Router();

// All transaction routes are admin-only
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  transactionController.createTransaction
);

router.get(
  '/',
  authenticateToken,
  authorizeRoles('admin', 'analyst'),
  transactionController.getTransactions
);

router.get(
  '/filter',
  authenticateToken,
  authorizeRoles('admin', 'analyst'),
  transactionController.filterTransactions
);

router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'analyst'),
  transactionController.getTransactionById
);

router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  transactionController.updateTransaction
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  transactionController.deleteTransaction
);

module.exports = router;
