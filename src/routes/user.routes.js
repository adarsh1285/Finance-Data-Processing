const express = require('express');
const { authenticateToken } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.get('/', authenticateToken, authorizeRoles('admin'), userController.getUsers);
router.post('/', authenticateToken, authorizeRoles('admin'), userController.createUser);
router.put('/:id', authenticateToken, authorizeRoles('admin'), userController.updateUser);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), userController.deleteUser);

module.exports = router;
