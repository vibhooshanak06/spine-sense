/**
 * Posture Routes
 * Maps HTTP requests to controller functions
 */

const express = require('express');
const postureController = require('../controllers/postureController');

const router = express.Router();

router.get('/current', postureController.getCurrent);
router.get('/history', postureController.getHistory);
router.get('/summary/:period', postureController.getSummary);
router.post('/data', postureController.submitData);

module.exports = router;
