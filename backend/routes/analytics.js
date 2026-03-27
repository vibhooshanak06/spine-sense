const express = require('express');
const router = express.Router();
const { getCache, refresh } = require('../analyticsCache');

// GET /api/analytics/dashboard
router.get('/dashboard', async (_req, res) => {
  try {
    let { dashboard } = getCache();
    if (!dashboard) {
      await refresh();
      dashboard = getCache().dashboard;
    }
    if (!dashboard) return res.json({ message: 'No data yet' });
    res.json(dashboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/trends
router.get('/trends', async (_req, res) => {
  try {
    let { trends } = getCache();
    if (!trends) {
      await refresh();
      trends = getCache().trends;
    }
    if (!trends) return res.json({ message: 'No data yet' });
    res.json(trends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/risk-assessment
router.get('/risk-assessment', async (_req, res) => {
  try {
    let { risk } = getCache();
    if (!risk) {
      await refresh();
      risk = getCache().risk;
    }
    if (!risk) return res.json({ message: 'No data yet' });
    res.json(risk);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
