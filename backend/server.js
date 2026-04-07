/**
 * SpineSense Backend Server
 * Main Express server with Socket.IO for real-time posture monitoring
 */

require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const { initFirebase, getDb } = require('./firebase');
const { initDb } = require('./db');
const authMiddleware = require('./middleware/auth');
const { startPolling, getCache } = require('./analyticsCache');

const authRoutes = require('./routes/auth');
const postureRoutes = require('./routes/posture');
const analyticsRoutes = require('./routes/analytics');
const usersRoutes = require('./routes/users');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());

initFirebase();
initDb().catch(err => console.error('DB init error:', err));

startPolling(io);

app.use('/api/auth', authRoutes);
app.use('/api/posture', authMiddleware, postureRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/users', authMiddleware, usersRoutes);

app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        time: new Date().toISOString()
    });
});

io.on('connection', (socket) => {
    const db = getDb();
    const cached = getCache();
    if (cached.dashboard) {
        socket.emit('analytics_update', cached);
    }
    if (!db) {
        console.warn("Firebase not initialized. Skipping posture listener.");
        return;
    }
    const postureRef = db.ref('/PostureResult');
    const postureHandler = postureRef.limitToLast(1).on('child_added', (snap) => {
        const entry = snap.val();
        if (entry && (entry.sensor1?.adc > 0 || entry.sensor2?.adc > 0)) {
            socket.emit('posture_update', entry);
        }
    });

    const latestRef = db.ref('/LatestPosture');
    const latestHandler = latestRef.on('value', (snap) => {
        if (snap.exists()) {
            socket.emit('latest_posture', snap.val());
        }
    });

    const statsRef = db.ref('/Stats');
    const statsHandler = statsRef.on('value', (snap) => {
        if (snap.exists()) {
            socket.emit('stats_update', snap.val());
        }
    });

    socket.on('disconnect', () => {
        postureRef.off('child_added', postureHandler);
        latestRef.off('value', latestHandler);
        statsRef.off('value', statsHandler);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
