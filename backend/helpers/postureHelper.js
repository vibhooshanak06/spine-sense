const { getDb } = require('../firebase');

const IST_OFFSET = 5.5 * 60 * 60 * 1000; // IST = UTC+5:30

function getTodayIST() {
  const now = new Date(Date.now() + IST_OFFSET);
  return now.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

/**
 * Fetch all PostureData entries from Firebase and return raw array
 */
async function fetchAllEntries() {
  const db = getDb();
  const snap = await db.ref('/PostureData').get();
  if (!snap.exists()) return [];
  const data = snap.val();
  return Object.values(data);
}

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
 * Compute stats from raw PostureData (same logic as spinesense.py)
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

  const postureScore = Math.max(0, Math.min(100,
    100 - Math.round(((angle1 + angle2) / 2) * 100 / 45)
  ));

  const goodCount = entries.filter(
    e => (e.sensor1?.angle ?? 0) <= 20 && (e.sensor2?.angle ?? 0) <= 20
  ).length;
  const dailyGoodPct = Math.round((goodCount / total) * 100);

  // Current bad streak
  let badStreakCount = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const e = sorted[i];
    if ((e.sensor1?.angle ?? 0) > 20 || (e.sensor2?.angle ?? 0) > 20) {
      badStreakCount++;
    } else break;
  }
  const badDurationMins = Math.round((badStreakCount * 5) / 60);

  // Longest bad streak
  let longest = 0, current = 0;
  for (const e of sorted) {
    if ((e.sensor1?.angle ?? 0) > 20 || (e.sensor2?.angle ?? 0) > 20) {
      current++;
      longest = Math.max(longest, current);
    } else current = 0;
  }
  const longestStreakMins = Math.round((longest * 5) / 60);

  const totalBad = entries.filter(
    e => (e.sensor1?.angle ?? 0) > 20 || (e.sensor2?.angle ?? 0) > 20
  ).length;

  const avgBackAngle = parseFloat(
    (entries.reduce((s, e) => s + (e.sensor1?.angle ?? 0), 0) / total).toFixed(1)
  );

  const isBad = angle1 > 20 || angle2 > 20;

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
 * Build posture history for chart (hourly buckets for today)
 */
function buildHistory(allEntries) {
  const todayIST = getTodayIST();
  const entries = allEntries.filter(e => (e.timestamp || '').startsWith(todayIST));
  const sorted = [...entries].sort((a, b) =>
    (a.timestamp || '').localeCompare(b.timestamp || '')
  );

  // Group by hour
  const hourMap = {};
  for (const e of sorted) {
    const hour = (e.timestamp || '').slice(11, 13) + ':00';
    if (!hourMap[hour]) hourMap[hour] = [];
    hourMap[hour].push(e);
  }

  return Object.entries(hourMap).map(([hour, group]) => {
    const avgA1 = group.reduce((s, e) => s + (e.sensor1?.angle ?? 0), 0) / group.length;
    const avgA2 = group.reduce((s, e) => s + (e.sensor2?.angle ?? 0), 0) / group.length;
    const score = Math.max(0, Math.min(100,
      100 - Math.round(((avgA1 + avgA2) / 2) * 100 / 45)
    ));
    const goodPct = Math.round(
      (group.filter(e => (e.sensor1?.angle ?? 0) <= 20 && (e.sensor2?.angle ?? 0) <= 20).length / group.length) * 100
    );
    return { hour, postureScore: score, goodPct, avgAngle: parseFloat(avgA1.toFixed(1)), count: group.length };
  });
}

/**
 * Build weekly trend (last 7 days daily averages)
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
    const score = Math.max(0, Math.min(100,
      100 - Math.round(((avgA1 + avgA2) / 2) * 100 / 45)
    ));
    const goodCount = dayEntries.filter(
      e => (e.sensor1?.angle ?? 0) <= 20 && (e.sensor2?.angle ?? 0) <= 20
    ).length;
    return { date, postureScore: score, goodPct: Math.round((goodCount / total) * 100) };
  });
}

module.exports = { fetchAllEntries, fetchStats, computeStats, buildHistory, buildWeeklyTrend, getTodayIST };
