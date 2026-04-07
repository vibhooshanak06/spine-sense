/**
 * Analytics Cache
 * Polls Firebase every 5 minutes for posture analytics data
 * Uses pre-computed /Stats node from spinesense.py, falls back to raw data computation
 */

const {
    fetchAllEntries,
    fetchStats,
    computeStats,
    buildHistory,
    buildHistoryFromResults,
    buildWeeklyTrend,
    buildWeeklyTrendFromResults
} = require('./helpers/postureHelper');

const { getDb } = require('./firebase');

let cache = {
    dashboard: null,
    trends: null,
    risk: null,
    lastRefreshed: null
};

let io = null;
let firebaseReady = false;

function checkFirebaseReady() {
    try {
        const db = getDb();
        if (db) {
            firebaseReady = true;
            return true;
        }
    } catch (err) {
        firebaseReady = false;
    }
    return false;
}

function buildDashboard(stats, entries = []) {
    const weekly = buildWeeklyTrend(entries) || [];
    const weeklyWithData = weekly.filter(d => d && d.postureScore !== null);
    
    const prevScore = weeklyWithData.length > 1
        ? weeklyWithData[weeklyWithData.length - 2].postureScore
        : (stats.postureScore || 0);
        
    const weeklyTrend = parseFloat(((stats.postureScore || 0) - prevScore).toFixed(1));

    return {
        currentPosture: stats.currentStatus || 'Unknown',
        postureScore: stats.postureScore || 0,
        dailyAverage: stats.dailyGoodPct || 0,
        weeklyTrend,
        riskLevel: stats.postureScore >= 75
            ? 'Low'
            : stats.postureScore >= 50
                ? 'Medium'
                : 'High',
        totalReadings: stats.totalReadings || 0,
        goodReadings: stats.totalGoodReadings || 0,
        badReadings: stats.totalBadReadings || 0,
        avgBackAngle: stats.avgBackAngle || 0,
        badDurationMins: stats.badDurationMins || 0,
        longestStreakMins: stats.longestStreakMins || 0,
        lastUpdated: stats.lastUpdated || new Date().toISOString(),
        weeklyTrendData: weekly
    };
}

function buildRisk(stats, entries = []) {
  const getRiskLevel = (score) => {
    if (score >= 70) return 'High';
    if (score >= 40) return 'Moderate';
    return 'Low';
  };

  const clampScore = (value) => Math.min(100, Math.max(0, Math.round(value || 0)));

  const parseEntryDate = (entry) => {
    const value = entry.timestamp || entry.createdAt || entry.date || entry.datetime || entry.time;
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime()) ? date : null;
  };

  const filterEntriesByRange = (entriesList, start, end) =>
    (entriesList || []).filter((entry) => {
      const date = parseEntryDate(entry);
      return date && date >= start && date <= end;
    });

  const buildPeriodRisk = (period, entriesList, range) => {
    const periodEntries = filterEntriesByRange(entriesList, range.start, range.end);
    const totalReadings = periodEntries.length || (period === 'daily' ? (stats.totalReadings || 0) : 0);

    const scores = periodEntries
      .map((entry) => Number(entry.postureScore ?? entry.score ?? 0))
      .filter((value) => !Number.isNaN(value));

    // FIXED: Corrected ternary logic for average score calculation
    const avgScore = scores.length > 0
      ? scores.reduce((sum, value) => sum + value, 0) / scores.length
      : (stats.postureScore ?? 0);

    const badCount = periodEntries.filter((entry) => (entry.postureScore ?? entry.score ?? 0) < 75).length;
    const badPct = totalReadings ? Number(((badCount / totalReadings) * 100).toFixed(1)) : 0;
    const goodPct = totalReadings ? Number((100 - badPct).toFixed(1)) : 0;

    const backRiskScore = clampScore(100 - Math.round(avgScore * 0.9));
    const neckRiskScore = clampScore(100 - Math.round(avgScore * 0.85) + Math.round(badPct * 0.1));
    const backRiskPct = Number((100 - backRiskScore).toFixed(1));
    const neckRiskPct = Number((100 - neckRiskScore).toFixed(1));
    const totalRiskScore = clampScore(Math.round((backRiskScore + neckRiskScore) / 2));
    const dominantRisk = getRiskLevel(Math.max(backRiskScore, neckRiskScore));
    const bothAffectedPct = Number((Math.min(backRiskPct, neckRiskPct) * 0.75).toFixed(1));

    const sideEffects = [];
    if (backRiskScore >= 70) sideEffects.push('Lumbar disc pressure');
    if (neckRiskScore >= 70) sideEffects.push('Cervical spondylosis risk');
    if (badPct >= 40) sideEffects.push('Persistent muscle spasms');
    if (badPct >= 30) sideEffects.push('Nerve compression (tingling/numbness)');
    if (totalRiskScore >= 70) sideEffects.push('Long-term postural deformity risk');

    const periodData = {
      period,
      totalReadings,
      totalRiskLevel: getRiskLevel(totalRiskScore),
      totalRiskScore,
      dominantRisk,
      backRiskScore,
      backRiskPct,
      backRiskLevel: getRiskLevel(backRiskScore),
      neckRiskScore,
      neckRiskPct,
      neckRiskLevel: getRiskLevel(neckRiskScore),
      totalAffectedPct: badPct,
      bothAffectedPct,
      goodPct,
      sideEffects: [...new Set(sideEffects)],
      lastUpdated: stats.lastUpdated || new Date().toISOString()
    };

    if (period === 'daily') {
      periodData.date = range.start.toISOString().slice(0, 10);
    } else if (period === 'weekly') {
      periodData.weekStart = range.start.toISOString().slice(0, 10);
      periodData.weekEnd = range.end.toISOString().slice(0, 10);
    } else if (period === 'monthly') {
      periodData.monthStart = range.start.toISOString().slice(0, 10);
      periodData.monthEnd = range.end.toISOString().slice(0, 10);
    } else if (period === 'yearly') {
      periodData.yearStart = range.start.toISOString().slice(0, 10);
      periodData.yearEnd = range.end.toISOString().slice(0, 10);
    }

    return periodData;
  };

  const now = new Date();
  const dailyStart = new Date(now);
  dailyStart.setHours(0, 0, 0, 0);
  const dailyEnd = new Date(now);
  dailyEnd.setHours(23, 59, 59, 999);

  const weeklyStart = new Date(dailyStart);
  weeklyStart.setDate(weeklyStart.getDate() - weeklyStart.getDay());
  const weeklyEnd = new Date(weeklyStart);
  weeklyEnd.setDate(weeklyEnd.getDate() + 6);
  weeklyEnd.setHours(23, 59, 59, 999);

  const monthlyStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const yearlyStart = new Date(now.getFullYear(), 0, 1);
  const yearlyEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

  const daily = buildPeriodRisk('daily', entries, { start: dailyStart, end: dailyEnd });
  const weekly = buildPeriodRisk('weekly', entries, { start: weeklyStart, end: weeklyEnd });
  const monthly = buildPeriodRisk('monthly', entries, { start: monthlyStart, end: monthlyEnd });
  const yearly = buildPeriodRisk('yearly', entries, { start: yearlyStart, end: yearlyEnd });

  const overallScore = clampScore(100 - (stats.postureScore ?? 0));
  const overallLevel = getRiskLevel(overallScore);

  const alerts = [];
  if (stats.badDurationMins > 20) {
    alerts.push({
      severity: 'error',
      message: `Poor posture for ${stats.badDurationMins} mins continuously`
    });
  }
  if (stats.avgBackAngle > 45) {
    alerts.push({
      severity: 'warning',
      message: `Avg spinal angle ${stats.avgBackAngle}° exceeds safe threshold (45°)`
    });
  }
  if (stats.dailyGoodPct < 50) {
    alerts.push({
      severity: 'warning',
      message: `Only ${stats.dailyGoodPct}% good posture today`
    });
  } else {
    alerts.push({
      severity: 'info',
      message: `${stats.dailyGoodPct}% good posture today — keep it up`
    });
  }

  return {
    overallRiskScore: overallScore,
    overallRiskLevel: overallLevel,
    daily,
    weekly,
    monthly,
    yearly,
    factors: [
      {
        factor: 'Prolonged Poor Posture',
        level: stats.longestStreakMins > 30 ? 'High' : stats.longestStreakMins > 15 ? 'Medium' : 'Low',
        score: Math.min(100, Math.round(((stats.longestStreakMins || 0) / 60) * 100))
      },
      {
        factor: 'Spinal Deviation',
        level: stats.avgBackAngle > 60 ? 'High' : stats.avgBackAngle > 45 ? 'Medium' : 'Low',
        score: Math.min(100, Math.round(((stats.avgBackAngle || 0) / 90) * 100))
      },
      {
        factor: 'Bad Posture Frequency',
        level: stats.totalBadReadings > stats.totalGoodReadings ? 'High' : 'Low',
        score: Math.min(100, Math.round(((stats.totalBadReadings || 0) / (stats.totalReadings || 1)) * 100))
      },
      {
        factor: 'Current Bad Streak',
        level: stats.badDurationMins > 20 ? 'High' : stats.badDurationMins > 10 ? 'Medium' : 'Low',
        score: Math.min(100, Math.round(((stats.badDurationMins || 0) / 60) * 100))
      }
    ],
    alerts
  };
}

async function refresh() {
    if (!checkFirebaseReady()) {
        console.log('[analyticsCache] Firebase not ready, skipping refresh');
        return;
    }

    try {
        const [rawStats, entries] = await Promise.all([
            fetchStats(),
            fetchAllEntries()
        ]);

        const stats = rawStats || computeStats(entries);

        if (!stats) {
            console.log('[analyticsCache] No data available yet');
            return;
        }

        const results = []; 
        const hourly = results.length > 0
            ? buildHistoryFromResults(results)
            : buildHistory(entries);

        const weekly = results.length > 0
            ? buildWeeklyTrendFromResults(results)
            : buildWeeklyTrend(entries);

        if (rawStats && !rawStats.totalReadings) {
            rawStats.totalReadings = entries.length;
            rawStats.totalGoodReadings = rawStats.totalGoodReadings ?? 0;
            rawStats.totalBadReadings = rawStats.totalBadReadings ?? 0;
        }

        cache.dashboard = buildDashboard(stats, entries);
        cache.trends = { weekly, hourly };
        cache.risk = buildRisk(stats, entries); 
        cache.lastRefreshed = new Date().toISOString();

        if (io) {
            io.emit('analytics_update', cache);
        }

        console.log(`[analyticsCache] Refreshed at ${cache.lastRefreshed} — score: ${stats.postureScore}, status: ${stats.currentStatus}`);
    } catch (err) {
        console.error('[analyticsCache] refresh error:', err.stack || err.message);
    }
}

function startPolling(socketIO) {
    io = socketIO;
    
    setTimeout(() => {
        if (checkFirebaseReady()) {
            console.log('[analyticsCache] Firebase connected, starting polling');
            refresh();
            setInterval(refresh, 5 * 60 * 1000);
        } else {
            console.log('[analyticsCache] Firebase not available, polling disabled');
        }
    }, 1000);
}

function getCache() {
    return cache;
}

module.exports = {
    startPolling,
    getCache,
    refresh
};