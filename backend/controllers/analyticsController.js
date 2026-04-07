/**
 * Analytics Controller
 * Handles dashboard data, trends, and risk assessment
 */

const { getCache, refresh } = require('../analyticsCache');

async function getDashboard(_req, res) {
    try {
        let { dashboard } = getCache();

        if (!dashboard) {
            await refresh();
            dashboard = getCache().dashboard;
        }

        if (!dashboard) {
            return res.json({ message: 'No data yet' });
        }

        res.json(dashboard);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getTrends(_req, res) {
    try {
        let { trends } = getCache();

        if (!trends) {
            await refresh();
            trends = getCache().trends;
        }

        if (!trends) {
            return res.json({ message: 'No data yet' });
        }

        res.json(trends);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getRiskAssessment(_req, res) {
    try {
        let { risk } = getCache();

        if (!risk) {
            await refresh();
            risk = getCache().risk;
        }

        if (!risk) {
            return res.json({ message: 'No data yet' });
        }

        res.json(risk);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getDashboard,
    getTrends,
    getRiskAssessment
};
