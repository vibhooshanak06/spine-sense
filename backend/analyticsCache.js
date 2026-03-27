/**
 * analyticsCache.js
 * Polls Firebase every 5 minutes. Prefers the pre-computed /Stats node
 * written by spinesense.py. Falls back to computing from raw PostureData.
 * Also uses /PostureResult (flex sensor) for trend charts when available.
 */
const {
  fetchAllEntries, fetchStats,
  computeStats, buildHistory, buildHistoryFromResults,
  buildWeeklyTrend, buildWeeklyTrendFromResults,
} = require('./helpers/postureHelper');

let cache = {
  dashboard: null,
  trends: null,
  risk: null,
  lastRefreshed: null,
};

let _io = null;

function buildDashboard(stats, entries) {
  const weekly = buildWeeklyTrend(entries);
  const weeklyWithData = weekly.filter(d => d.postureScore !== null);
  const prevScore = weeklyWithData.length > 1
    ? weeklyWithData[weeklyWithData.length - 2].postureScore
    : stats.postureScore;
  const weeklyTrend = parseFloat((stats.postureScore - prevScore).toFixed(1));

  return {
    currentPosture: stats.currentStatus,
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
  };
}

function buildRisk(stats) {
  const score = stats.postureScore;
  const overallRisk = score >= 75 ? 'Low' : score >= 50 ? 'Medium' : 'High';

  const alerts = [];
  if (stats.badDurationMins > 20)
    alerts.push({ severity: 'error', message: `Poor posture for ${stats.badDurationMins} mins continuously` });
  if (stats.avgBackAngle > 45)
    alerts.push({ severity: 'warning', message: `Avg spinal angle ${stats.avgBackAngle}° exceeds safe threshold (45°)` });
  if (stats.dailyGoodPct < 50)
    alerts.push({ severity: 'warning', message: `Only ${stats.dailyGoodPct}% good posture today` });
  else
    alerts.push({ severity: 'info', message: `${stats.dailyGoodPct}% good posture today — keep it up` });

  return {
    overallRiskScore: 100 - score,
    overallRiskLevel: overallRisk,
    factors: [
      {
        factor: 'Prolonged Poor Posture',
        level: stats.longestStreakMins > 30 ? 'High' : stats.longestStreakMins > 15 ? 'Medium' : 'Low',
        score: Math.min(100, Math.round((stats.longestStreakMins / 60) * 100)),
      },
      {
        factor: 'Spinal Deviation',
        level: stats.avgBackAngle > 60 ? 'High' : stats.avgBackAngle > 45 ? 'Medium' : 'Low',
        score: Math.min(100, Math.round((stats.avgBackAngle / 90) * 100)),
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
    alerts,
  };
}

async function refresh() {
  try {
    // Fetch all data sources in parallel
    const [rawStats, entries] = await Promise.all([
      fetchStats(),
      fetchAllEntries(),
    ]);

    // Use pre-computed Stats if available, otherwise compute from raw data
    const stats = rawStats || computeStats(entries);
    if (!stats) {
      console.log('[analyticsCache] No data available yet');
      return;
    }

    // Prefer PostureResult for charts if it has data, else use PostureData
    const hourly = results.length > 0
      ? buildHistoryFromResults(results)
      : buildHistory(entries);

    const weekly = results.length > 0
      ? buildWeeklyTrendFromResults(results)
      : buildWeeklyTrend(entries);

    // If Stats came from Firebase, patch totalReadings from raw entries
    if (rawStats && !rawStats.totalReadings) {
      rawStats.totalReadings = entries.length;
      rawStats.totalGoodReadings = rawStats.totalGoodReadings ?? 0;
      rawStats.totalBadReadings = rawStats.totalBadReadings ?? 0;
    }

    cache.dashboard = buildDashboard(stats, entries);
    cache.trends = { weekly, hourly };
    cache.risk = buildRisk(stats);
    cache.lastRefreshed = new Date().toISOString();

    if (_io) _io.emit('analytics_update', cache);
    console.log(`[analyticsCache] Refreshed at ${cache.lastRefreshed} — score: ${stats.postureScore}, status: ${stats.currentStatus}`);
  } catch (err) {
    console.error('[analyticsCache] refresh error:', err.message);
  }
}

function startPolling(io) {
  _io = io;
  refresh(); // immediate first run
  setInterval(refresh, 5 * 60 * 1000); // every 5 minutes
}

function getCache() {
  return cache;
}

module.exports = { startPolling, getCache, refresh };
