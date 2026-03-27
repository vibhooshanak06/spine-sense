require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { initFirebase, getDb } = require('./firebase');
const { initDb } = require('./db');
const authMiddleware = require('./middleware/auth');
const { startPolling } = require('./analyticsCache');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());

// Init Firebase
initFirebase();
initDb().catch(err => console.error('DB init error:', err));

// Start 5-minute analytics polling from Firebase
startPolling(io);

// Public routes
app.use('/api/auth', require('./routes/auth'));

// Protected routes
app.use('/api/posture', authMiddleware, require('./routes/posture'));
app.use('/api/analytics', authMiddleware, require('./routes/analytics'));
app.use('/api/users', authMiddleware, require('./routes/users'));

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── WebSocket: stream live Firebase changes ───────────────────────────────────
io.on('connection', (socket) => {
  const db = getDb();

  // Send cached analytics immediately on connect
  const { getCache } = require('./analyticsCache');
  const cached = getCache();
  if (cached.dashboard) socket.emit('analytics_update', cached);

  // Stream latest PostureData entry
  const postureRef = db.ref('/PostureData');
  const postureHandler = postureRef.limitToLast(1).on('child_added', (snap) => {
    const entry = snap.val();
    // Only emit valid entries
    if (entry && (entry.sensor1?.adc > 0 || entry.sensor2?.adc > 0)) {
      socket.emit('posture_update', entry);
    }
  });

  // Stream /LatestPosture (flex sensor real-time)
  const latestRef = db.ref('/LatestPosture');
  const latestHandler = latestRef.on('value', (snap) => {
    if (snap.exists()) socket.emit('latest_posture', snap.val());
  });

  // Stream /Stats updates from spinesense.py
  const statsRef = db.ref('/Stats');
  const statsHandler = statsRef.on('value', (snap) => {
    if (snap.exists()) socket.emit('stats_update', snap.val());
  });

  socket.on('disconnect', () => {
    postureRef.off('child_added', postureHandler);
    latestRef.off('value', latestHandler);
    statsRef.off('value', statsHandler);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT);
