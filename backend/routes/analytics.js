/**
 * Analytics Routes
 * Maps HTTP requests to controller functions
 */

const express = require('express');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();

router.get('/dashboard', analyticsController.getDashboard);
router.get('/trends', analyticsController.getTrends);
router.get('/risk-assessment', analyticsController.getRiskAssessment);

module.exports = router;
