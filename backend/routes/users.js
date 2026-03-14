const express = require('express');
const router = express.Router();
const { fetchAllEntries, fetchStats, computeStats } = require('../helpers/postureHelper');

// GET /api/users/dashboard-stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    let stats = await fetchStats();
    const entries = await fetchAllEntries();
    if (!stats) stats = computeStats(entries);
    if (!stats) return res.json({ message: 'No data yet' });

    const totalMins = stats.totalReadings * 5;
    const goodMins = Math.round((stats.dailyGoodPct / 100) * totalMins);

    res.json({
      postureScore: stats.postureScore,
      currentStatus: stats.currentStatus,
      dailyGoodPct: stats.dailyGoodPct,
      totalTime: `${Math.floor(totalMins / 60)}h ${totalMins % 60}m`,
      goodPostureTime: `${Math.floor(goodMins / 60)}h ${goodMins % 60}m`,
      sessionsToday: Math.max(1, Math.round(stats.totalReadings / 12)),
      riskLevel: stats.postureScore >= 75 ? 'Low' : stats.postureScore >= 50 ? 'Medium' : 'High',
      weeklyTrend: 0,
      lastUpdated: stats.lastUpdated,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/profile
router.get('/profile', (req, res) => {
  res.json({ name: 'SpineSense User', email: 'user@spinesense.com', device: 'SpineSense v1' });
});

// GET /api/users/settings
router.get('/settings', (req, res) => {
  res.json({ notifications: true, alertThreshold: 20, dataInterval: 5 });
});

module.exports = router;
