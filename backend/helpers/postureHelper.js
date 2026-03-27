const { getDb } = require('../firebase');

const IST_OFFSET = 5.5 * 60 * 60 * 1000; // IST = UTC+5:30

function getTodayIST() {
  const now = new Date(Date.now() + IST_OFFSET);
  return now.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

/**
 * A PostureData entry is valid if:
 * - timestamp is a real date string (not "0" or empty)
 * - at least one sensor has a non-zero adc reading
 */
function isValidEntry(e) {
  const ts = e.timestamp || '';
  if (!ts || ts === '0' || ts.length < 10) return false;
  const adc1 = e.sensor1?.adc ?? 0;
  const adc2 = e.sensor2?.adc ?? 0;
  return adc1 > 0 || adc2 > 0;
}

/**
 * Good posture: both sensor angles are below the threshold.
 * Based on real data: angle close to 0 = straight (good), angle near 90 = bent (bad).
 * Threshold: 45° — matches the Python script's logic.
 */
const GOOD_ANGLE_THRESHOLD = 45;

function isGoodPosture(e) {
  const a1 = e.sensor1?.angle ?? 0;
  const a2 = e.sensor2?.angle ?? 0;
  return a1 < GOOD_ANGLE_THRESHOLD && a2 < GOOD_ANGLE_THRESHOLD;
}

/**
 * Fetch all valid PostureData entries from Firebase
 */
async function fetchAllEntries() {
  const db = getDb();
  const snap = await db.ref('/PostureData').get();
  if (!snap.exists()) return [];
  return Object.values(snap.val()).filter(isValidEntry);
}

/**
 * Fetch latest PostureResult entries (flex sensor data)
 */
// async function fetchPostureResults() {
//   const db = getDb();
//   const snap = await db.ref('/PostureResult').get();
//   if (!snap.exists()) return [];
//   return Object.values(snap.val()).filter(e => e.timestamp && e.timestamp > 0);
// }

/**
 * Fetch the pre-computed /Stats node written by spinesense.py
 */
async function fetchStats() {
  const db = getDb();
  const snap = await db.ref('/Stats').get();
  if (!snap.exists()) return null;
  return snap.val();
}

/**
 * Fetch the latest single posture entry from /LatestPosture
 */
async function fetchLatestPosture() {
  const db = getDb();
  const snap = await db.ref('/LatestPosture').get();
  if (!snap.exists()) return null;
  return snap.val();
}

/**
 * Compute stats from raw PostureData entries (filtered).
 * Falls back to all entries if no data for today.
 */
function computeStats(allEntries) {
  const todayIST = getTodayIST();
  let entries = allEntries.filter(e => (e.timestamp || '').startsWith(todayIST));
  if (entries.length === 0) entries = allEntries;

  const total = entries.length;
  if (total === 0) return null;

  const sorted = [...entries].sort((a, b) =>
    (a.timestamp || '').localeCompare(b.timestamp || '')
  );

  const latest = sorted[sorted.length - 1];
  const angle1 = latest?.sensor1?.angle ?? 0;
  const angle2 = latest?.sensor2?.angle ?? 0;

  // Score: 100 = perfect posture (both angles near 0), 0 = worst (both at 90°)
  const avgLatestAngle = (angle1 + angle2) / 2;
  const postureScore = Math.max(0, Math.min(100,
    Math.round(100 - (avgLatestAngle / 90) * 100)
  ));

  const goodCount = entries.filter(isGoodPosture).length;
  const dailyGoodPct = Math.round((goodCount / total) * 100);

  // Current continuous bad streak (from most recent reading backwards)
  let badStreakCount = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (!isGoodPosture(sorted[i])) badStreakCount++;
    else break;
  }
  // Each reading is ~6 seconds apart based on real data; group into minutes
  const badDurationMins = Math.round((badStreakCount * 6) / 60);

  // Longest bad streak
  let longest = 0, current = 0;
  for (const e of sorted) {
    if (!isGoodPosture(e)) { current++; longest = Math.max(longest, current); }
    else current = 0;
  }
  const longestStreakMins = Math.round((longest * 6) / 60);

  const totalBad = entries.filter(e => !isGoodPosture(e)).length;

  const avgBackAngle = parseFloat(
    (entries.reduce((s, e) => s + (e.sensor1?.angle ?? 0), 0) / total).toFixed(1)
  );

  const isBad = !isGoodPosture(latest);

  return {
    postureScore,
    dailyGoodPct,
    badDurationMins,
    longestStreakMins,
    totalBadReadings: totalBad,
    totalGoodReadings: goodCount,
    avgBackAngle,
    currentStatus: isBad ? 'Bad' : 'Good',
    latestAngle1: parseFloat(angle1.toFixed(1)),
    latestAngle2: parseFloat(angle2.toFixed(1)),
    totalReadings: total,
    lastUpdated: new Date(Date.now() + IST_OFFSET).toISOString().replace('T', ' ').slice(0, 19),
  };
}

/**
 * Build posture history for chart — hourly buckets for today.
 * Uses PostureResult (flex data) if available, falls back to PostureData.
 */
function buildHistory(allEntries) {
  const todayIST = getTodayIST();
  const entries = allEntries.filter(e => (e.timestamp || '').startsWith(todayIST));
  const sorted = [...entries].sort((a, b) =>
    (a.timestamp || '').localeCompare(b.timestamp || '')
  );

  const hourMap = {};
  for (const e of sorted) {
    const hour = (e.timestamp || '').slice(11, 13) + ':00';
    if (!hourMap[hour]) hourMap[hour] = [];
    hourMap[hour].push(e);
  }

  return Object.entries(hourMap).map(([hour, group]) => {
    const avgA1 = group.reduce((s, e) => s + (e.sensor1?.angle ?? 0), 0) / group.length;
    const avgA2 = group.reduce((s, e) => s + (e.sensor2?.angle ?? 0), 0) / group.length;
    const avgAngle = (avgA1 + avgA2) / 2;
    const score = Math.max(0, Math.min(100, Math.round(100 - (avgAngle / 90) * 100)));
    const goodPct = Math.round((group.filter(isGoodPosture).length / group.length) * 100);
    return {
      hour,
      postureScore: score,
      goodPct,
      avgAngle: parseFloat(avgA1.toFixed(1)),
      count: group.length,
    };
  });
}

/**
 * Build hourly history from PostureResult (flex sensor) data for today.
 * posture field: "normal" = good, "bad" = bad.
 */
function buildHistoryFromResults(results) {
  const todayMs = new Date(getTodayIST()).getTime();
  const tomorrowMs = todayMs + 86400000;

  const todayResults = results.filter(r => {
    const ts = r.timestamp * 1000;
    return ts >= todayMs && ts < tomorrowMs;
  });

  const hourMap = {};
  for (const r of todayResults) {
    const d = new Date(r.timestamp * 1000 + IST_OFFSET);
    const hour = String(d.getUTCHours()).padStart(2, '0') + ':00';
    if (!hourMap[hour]) hourMap[hour] = [];
    hourMap[hour].push(r);
  }

  return Object.entries(hourMap).map(([hour, group]) => {
    const goodCount = group.filter(r => r.posture === 'normal').length;
    const goodPct = Math.round((goodCount / group.length) * 100);
    const avgFlex = group.reduce((s, r) => s + (r.flex1 + r.flex2) / 2, 0) / group.length;
    const score = Math.max(0, Math.min(100, Math.round(100 - (avgFlex / 90) * 100)));
    return { hour, postureScore: score, goodPct, avgAngle: parseFloat(avgFlex.toFixed(1)), count: group.length };
  });
}

/**
 * Build weekly trend (last 7 days daily averages) from PostureData.
 */
function buildWeeklyTrend(allEntries) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() + IST_OFFSET - i * 86400000);
    days.push(d.toISOString().slice(0, 10));
  }

  return days.map(date => {
    const dayEntries = allEntries.filter(e => (e.timestamp || '').startsWith(date));
    if (dayEntries.length === 0) return { date, postureScore: null, goodPct: null };
    const total = dayEntries.length;
    const avgA1 = dayEntries.reduce((s, e) => s + (e.sensor1?.angle ?? 0), 0) / total;
    const avgA2 = dayEntries.reduce((s, e) => s + (e.sensor2?.angle ?? 0), 0) / total;
    const avgAngle = (avgA1 + avgA2) / 2;
    const score = Math.max(0, Math.min(100, Math.round(100 - (avgAngle / 90) * 100)));
    const goodCount = dayEntries.filter(isGoodPosture).length;
    return { date, postureScore: score, goodPct: Math.round((goodCount / total) * 100) };
  });
}

/**
 * Build weekly trend from PostureResult data.
 */
function buildWeeklyTrendFromResults(results) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() + IST_OFFSET - i * 86400000);
    days.push({ date: d.toISOString().slice(0, 10), startMs: d.getTime() - IST_OFFSET });
  }

  return days.map(({ date, startMs }) => {
    const endMs = startMs + 86400000;
    const dayResults = results.filter(r => {
      const ts = r.timestamp * 1000;
      return ts >= startMs && ts < endMs;
    });
    if (dayResults.length === 0) return { date, postureScore: null, goodPct: null };
    const goodCount = dayResults.filter(r => r.posture === 'normal').length;
    const goodPct = Math.round((goodCount / dayResults.length) * 100);
    const avgFlex = dayResults.reduce((s, r) => s + (r.flex1 + r.flex2) / 2, 0) / dayResults.length;
    const score = Math.max(0, Math.min(100, Math.round(100 - (avgFlex / 90) * 100)));
    return { date, postureScore: score, goodPct };
  });
}

module.exports = {
  fetchAllEntries, fetchStats, fetchLatestPosture,
  computeStats, buildHistory, buildHistoryFromResults,
  buildWeeklyTrend, buildWeeklyTrendFromResults, getTodayIST,
};
