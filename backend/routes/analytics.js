const express = require('express');
const router = express.Router();
const {
  fetchAllEntries, fetchStats, computeStats, buildHistory, buildWeeklyTrend
} = require('../helpers/postureHelper');

// GET /api/analytics/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    let stats = await fetchStats();
    const entries = await fetchAllEntries();
    if (!stats) stats = computeStats(entries);
    if (!stats) return res.json({ message: 'No data yet' });

    const weekly = buildWeeklyTrend(entries);
    const weeklyAvg = weekly.filter(d => d.postureScore !== null);
    const prevWeekScore = weeklyAvg.length > 1
      ? weeklyAvg[weeklyAvg.length - 2].postureScore
      : stats.postureScore;
    const weeklyTrend = parseFloat((stats.postureScore - prevWeekScore).toFixed(1));

    res.json({
      currentPosture: stats.currentStatus === 'Bad' ? 'Poor' : 'Good',
      postureScore: stats.postureScore,
      dailyAverage: stats.dailyGoodPct,
      weeklyTrend,
      riskLevel: stats.postureScore >= 75 ? 'Low' : stats.postureScore >= 50 ? 'Medium' : 'High',
      totalReadings: stats.totalReadings,
      goodReadings: stats.totalGoodReadings,
      badReadings: stats.totalBadReadings,
      avgBackAngle: stats.avgBackAngle,
      badDurationMins: stats.badDurationMins,
      longestStreakMins: stats.longestStreakMins,
      lastUpdated: stats.lastUpdated,
      weeklyTrendData: weekly,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/trends
router.get('/trends', async (req, res) => {
  try {
    const entries = await fetchAllEntries();
    const weekly = buildWeeklyTrend(entries);
    const hourly = buildHistory(entries);
    res.json({ weekly, hourly });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analytics/risk-assessment
router.get('/risk-assessment', async (req, res) => {
  try {
    let stats = await fetchStats();
    const entries = await fetchAllEntries();
    if (!stats) stats = computeStats(entries);
    if (!stats) return res.json({ message: 'No data yet' });

    const score = stats.postureScore;
    const overallRisk = score >= 75 ? 'Low' : score >= 50 ? 'Medium' : 'High';
    const riskScore = 100 - score;

    res.json({
      overallRiskScore: riskScore,
      overallRiskLevel: overallRisk,
      factors: [
        {
          factor: 'Prolonged Poor Posture',
          level: stats.longestStreakMins > 30 ? 'High' : stats.longestStreakMins > 15 ? 'Medium' : 'Low',
          score: Math.min(100, Math.round((stats.longestStreakMins / 60) * 100)),
        },
        {
          factor: 'Spinal Deviation',
          level: stats.avgBackAngle > 25 ? 'High' : stats.avgBackAngle > 15 ? 'Medium' : 'Low',
          score: Math.min(100, Math.round((stats.avgBackAngle / 45) * 100)),
        },
        {
          factor: 'Bad Posture Frequency',
          level: stats.totalBadReadings > stats.totalGoodReadings ? 'High' : 'Low',
          score: Math.min(100, Math.round((stats.totalBadReadings / (stats.totalReadings || 1)) * 100)),
        },
        {
          factor: 'Current Bad Streak',
          level: stats.badDurationMins > 20 ? 'High' : stats.badDurationMins > 10 ? 'Medium' : 'Low',
          score: Math.min(100, Math.round((stats.badDurationMins / 60) * 100)),
        },
      ],
      alerts: [
        ...(stats.badDurationMins > 20
          ? [{ severity: 'error', message: `Poor posture for ${stats.badDurationMins} mins continuously` }]
          : []),
        ...(stats.avgBackAngle > 25
          ? [{ severity: 'warning', message: `Avg spinal angle ${stats.avgBackAngle}° exceeds safe threshold (25°)` }]
          : []),
        ...(stats.dailyGoodPct < 50
          ? [{ severity: 'warning', message: `Only ${stats.dailyGoodPct}% good posture today` }]
          : [{ severity: 'info', message: `${stats.dailyGoodPct}% good posture today — keep it up` }]),
      ],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
