const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { getCache } = require('../analyticsCache');

// GET /api/users/dashboard-stats — from analytics cache
router.get('/dashboard-stats', (_req, res) => {
  const { dashboard } = getCache();
  if (!dashboard) return res.json({ message: 'No data yet' });

  const totalMins = (dashboard.totalReadings ?? 0) * 5;
  const goodMins = Math.round(((dashboard.dailyAverage ?? 0) / 100) * totalMins);

  res.json({
    postureScore: dashboard.postureScore,
    currentStatus: dashboard.currentPosture,
    dailyGoodPct: dashboard.dailyAverage,
    totalTime: `${Math.floor(totalMins / 60)}h ${totalMins % 60}m`,
    goodPostureTime: `${Math.floor(goodMins / 60)}h ${goodMins % 60}m`,
    sessionsToday: Math.max(1, Math.round((dashboard.totalReadings ?? 0) / 12)),
    riskLevel: dashboard.riskLevel,
    weeklyTrend: dashboard.weeklyTrend,
    lastUpdated: dashboard.lastUpdated,
  });
});

// GET /api/users/profile — real user from MySQL via JWT
router.get('/profile', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/settings
router.get('/settings', (_req, res) => {
  res.json({ notifications: true, alertThreshold: 20, dataInterval: 5 });
});

module.exports = router;
