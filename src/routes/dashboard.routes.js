const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/dashboard.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

// GET /api/dashboard - Get dashboard data (accessible by all roles)
router.get('/', authenticateToken, authorizeRoles('viewer', 'analyst', 'admin'), getDashboardData);

module.exports = router;
