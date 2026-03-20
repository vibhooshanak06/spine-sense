require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { initFirebase, getDb } = require('./firebase');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());

// Init Firebase
initFirebase();

// Routes
app.use('/api/posture', require('./routes/posture'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/users', require('./routes/users'));

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── WebSocket: stream live Firebase /PostureData changes ──────────────────────
io.on('connection', (socket) => {

  const db = getDb();
  const ref = db.ref('/PostureData');

  // Send latest entry on connect
  ref.limitToLast(1).get().then(snap => {
    if (snap.exists()) {
      const entries = Object.values(snap.val());
      socket.emit('posture_update', entries[0]);
    }
  });

  // Listen for new entries and push to this client
  const handler = ref.limitToLast(1).on('child_added', (snap) => {
    socket.emit('posture_update', snap.val());
  });

  // Also stream /Stats updates
  const statsRef = db.ref('/Stats');
  const statsHandler = statsRef.on('value', (snap) => {
    if (snap.exists()) socket.emit('stats_update', snap.val());
  });

  socket.on('disconnect', () => {
    ref.off('child_added', handler);
    statsRef.off('value', statsHandler);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT);
