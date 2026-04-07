/**
 * User Routes
 * Maps HTTP requests to controller functions
 */

const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/dashboard-stats', userController.getDashboardStats);
router.get('/profile', userController.getProfile);
router.get('/settings', userController.getSettings);

module.exports = router;
