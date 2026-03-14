const express = require('express');
const router = express.Router();
const { fetchAllEntries, fetchStats, computeStats, buildHistory, getTodayIST } = require('../helpers/postureHelper');

// GET /api/posture/current — latest sensor reading + computed status
router.get('/current', async (req, res) => {
  try {
    // Prefer pre-computed /Stats from spinesense.py, fall back to live compute
    let stats = await fetchStats();
    if (!stats) {
      const entries = await fetchAllEntries();
      stats = computeStats(entries);
    }
    if (!stats) return res.json({ message: 'No data yet', data: null });

    res.json({
      spinalAngle: stats.latestAngle1 ?? stats.avgBackAngle,
      neckAngle: stats.latestAngle2 ?? 0,
      postureStatus: stats.currentStatus === 'Bad' ? 'Poor' : 'Good',
      postureScore: stats.postureScore,
      shoulderAlignment: Math.max(60, 100 - Math.round((stats.avgBackAngle / 45) * 40)),
      confidence: 95,
      lastUpdated: stats.lastUpdated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/posture/history — hourly breakdown for today
router.get('/history', async (req, res) => {
  try {
    const entries = await fetchAllEntries();
    const history = buildHistory(entries);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/posture/summary/:period — daily | weekly | monthly
router.get('/summary/:period', async (req, res) => {
  try {
    const { period } = req.params;
    const entries = await fetchAllEntries();
    const stats = computeStats(entries);
    if (!stats) return res.json({ message: 'No data', data: null });

    const todayIST = getTodayIST();
    const todayEntries = entries.filter(e => (e.timestamp || '').startsWith(todayIST));
    const totalMins = todayEntries.length * 5; // each reading ~5 min interval
    const goodMins = Math.round((stats.dailyGoodPct / 100) * totalMins);

    res.json({
      period,
      postureScore: stats.postureScore,
      dailyGoodPct: stats.dailyGoodPct,
      goodPostureTime: `${Math.floor(goodMins / 60)}h ${goodMins % 60}m`,
      totalTime: `${Math.floor(totalMins / 60)}h ${totalMins % 60}m`,
      badDurationMins: stats.badDurationMins,
      longestStreakMins: stats.longestStreakMins,
      totalBadReadings: stats.totalBadReadings,
      totalGoodReadings: stats.totalGoodReadings,
      avgBackAngle: stats.avgBackAngle,
      alerts: stats.totalBadReadings,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/posture/data — receive sensor push (optional, for direct IoT posting)
router.post('/data', async (req, res) => {
  try {
    const { getDb } = require('../firebase');
    const db = getDb();
    const entry = {
      ...req.body,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    await db.ref('/PostureData').push(entry);
    res.json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
