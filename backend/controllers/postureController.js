/**
 * Posture Controller
 * Handles posture data, current status, history, and summary
 */

const { getCache, refresh } = require('../analyticsCache');
const {
    fetchAllEntries,
    fetchStats,
    computeStats,
    getTodayIST
} = require('../helpers/postureHelper');
const { getDb } = require('../firebase');

async function getCurrent(_req, res) {
    try {
        let { dashboard } = getCache();

        if (!dashboard) {
            await refresh();
            dashboard = getCache().dashboard;
        }

        if (!dashboard) {
            return res.json({ message: 'No data yet', data: null });
        }

        res.json({
            spinalAngle: dashboard.avgBackAngle,
            postureStatus: dashboard.currentPosture,
            postureScore: dashboard.postureScore,
            shoulderAlignment: Math.max(0, Math.min(100, Math.round(100 - (dashboard.avgBackAngle / 90) * 100))),
            lastUpdated: dashboard.lastUpdated
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getHistory(_req, res) {
    try {
        let { trends } = getCache();

        if (!trends) {
            await refresh();
            trends = getCache().trends;
        }

        res.json(trends?.hourly ?? []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getSummary(req, res) {
    try {
        const { period } = req.params;
        let { dashboard } = getCache();

        if (!dashboard) {
            await refresh();
            dashboard = getCache().dashboard;
        }

        if (!dashboard) {
            const entries = await fetchAllEntries();
            let stats = await fetchStats();

            if (!stats) {
                stats = computeStats(entries);
            }

            if (!stats) {
                return res.json({ message: 'No data', data: null });
            }

            const todayIST = getTodayIST();
            const todayEntries = entries.filter(e => (e.timestamp || '').startsWith(todayIST));
            const totalMins = todayEntries.length * 0.1;
            const goodMins = Math.round((stats.dailyGoodPct / 100) * totalMins);

            return res.json({
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
                alerts: stats.totalBadReadings
            });
        }

        const totalReadings = (dashboard.goodReadings ?? 0) + (dashboard.badReadings ?? 0);
        const totalMins = Math.round(totalReadings * 0.1);
        const goodMins = Math.round((dashboard.dailyAverage / 100) * totalMins);

        res.json({
            period,
            postureScore: dashboard.postureScore,
            dailyGoodPct: dashboard.dailyAverage,
            goodPostureTime: `${Math.floor(goodMins / 60)}h ${goodMins % 60}m`,
            totalTime: `${Math.floor(totalMins / 60)}h ${totalMins % 60}m`,
            badDurationMins: dashboard.badDurationMins,
            longestStreakMins: dashboard.longestStreakMins,
            totalBadReadings: dashboard.badReadings,
            totalGoodReadings: dashboard.goodReadings,
            avgBackAngle: dashboard.avgBackAngle,
            alerts: dashboard.badReadings
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function submitData(req, res) {
    try {
        const db = getDb();
        
        if (!db) {
            return res.status(503).json({ error: 'Firebase not available' });
        }

        const entry = {
            ...req.body,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19)
        };

        await db.ref('/PostureResult').push(entry);

        res.json({ success: true, entry });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getCurrent,
    getHistory,
    getSummary,
    submitData
};
