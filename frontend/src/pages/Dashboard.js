import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, Avatar,
  IconButton, LinearProgress, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert,
} from '@mui/material';
import { Refresh, Person, Timer, Analytics, TrendingUp, TrendingDown, Warning } from '@mui/icons-material';
import { analyticsAPI, postureAPI } from '../services/api';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const Dashboard = () => {
  const [dashData, setDashData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [dash, hist] = await Promise.all([
        analyticsAPI.getDashboard(),
        postureAPI.getHistory(),
      ]);
      setDashData(dash);
      setHistory(Array.isArray(hist) ? hist : []);
    } catch (err) {
      setError('Could not reach backend. Make sure the server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const socket = io(SOCKET_URL, { transports: ['websocket'] });

    // Full analytics refresh every 5 minutes from cache
    socket.on('analytics_update', (data) => {
      if (data.dashboard) setDashData(data.dashboard);
      if (data.trends?.hourly) setHistory(data.trends.hourly);
    });

    // Live posture entry from Firebase listener
    socket.on('stats_update', (stats) => {
      setDashData(prev => prev ? {
        ...prev,
        postureScore: stats.postureScore,
        currentPosture: stats.currentStatus,
        dailyAverage: stats.dailyGoodPct,
        riskLevel: stats.postureScore >= 75 ? 'Low' : stats.postureScore >= 50 ? 'Medium' : 'High',
        lastUpdated: stats.lastUpdated,
        avgBackAngle: stats.avgBackAngle ?? prev.avgBackAngle,
        badDurationMins: stats.badDurationMins ?? prev.badDurationMins,
      } : prev);
    });

    // Real-time flex sensor update
    socket.on('latest_posture', (latest) => {
      if (!latest) return;
      setDashData(prev => prev ? {
        ...prev,
        currentPosture: latest.posture,
      } : prev);
    });

    return () => socket.disconnect();
  }, [loadData]);

  const CircularScore = ({ value, size = 120, strokeWidth = 8, color = '#4F46E5', label }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - ((value || 0) / 100) * circumference;
    return (
      <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#E5E7EB" strokeWidth={strokeWidth} fill="transparent" />
          <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="transparent"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
        </svg>
        <Box sx={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color }}>{value ?? '--'}%</Typography>
          {label && <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>{label}</Typography>}
        </Box>
      </Box>
    );
  };

  const MetricCard = ({ title, value, subtitle, icon, color = 'primary', trend }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.main`, mr: 2, width: 48, height: 48 }}>{icon}</Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 500 }}>{title}</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>{value}</Typography>
          </Box>
        </Box>
        {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{subtitle}</Typography>}
        {trend !== undefined && trend !== null && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {trend >= 0
              ? <TrendingUp sx={{ color: 'success.main', mr: 0.5, fontSize: 20 }} />
              : <TrendingDown sx={{ color: 'error.main', mr: 0.5, fontSize: 20 }} />}
            <Typography variant="body2" sx={{ color: trend >= 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
              {Math.abs(trend)}% from last week
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="main" sx={{ ml: '-200px', mt: '6px', p: 2, minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Dashboard</Typography>
          <Typography variant="body1" color="text.secondary">
            {dashData?.lastUpdated ? `Last updated: ${dashData.lastUpdated}` : 'Live posture overview'}
          </Typography>
        </Box>
        <IconButton onClick={loadData} sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}>
          <Refresh />
        </IconButton>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={1.5}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard title="Current Status" value={dashData?.currentPosture ?? '--'} icon={<Person />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Posture Score"
            value={dashData?.postureScore != null ? `${dashData.postureScore}%` : '--'}
            subtitle={`Daily good posture: ${dashData?.dailyAverage ?? '--'}%`}
            icon={<Analytics />}
            color="success"
            trend={dashData?.weeklyTrend}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Avg Back Angle"
            value={dashData?.avgBackAngle != null ? `${dashData.avgBackAngle}°` : '--'}
            subtitle={`Bad streak: ${dashData?.badDurationMins ?? 0} mins`}
            icon={<Timer />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Risk Level"
            value={dashData?.riskLevel ?? '--'}
            icon={<Warning />}
            color={dashData?.riskLevel === 'Low' ? 'success' : dashData?.riskLevel === 'Medium' ? 'warning' : 'error'}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Today's Posture Metrics</Typography>
              <Grid container spacing={4} sx={{ textAlign: 'center' }}>
                <Grid item xs={12} sm={4}>
                  <CircularScore value={dashData?.postureScore} color="#4F46E5" label="Posture Score" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CircularScore value={dashData?.dailyAverage} color="#10B981" label="Good Posture %" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CircularScore
                    value={dashData?.totalReadings ? Math.round((dashData.goodReadings / dashData.totalReadings) * 100) : null}
                    color="#F59E0B"
                    label="Good Readings"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Quick Stats</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Total Readings</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{dashData?.totalReadings ?? '--'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Good Readings</Typography>
                  <Chip label={dashData?.goodReadings ?? '--'} color="success" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Bad Readings</Typography>
                  <Chip label={dashData?.badReadings ?? '--'} color="error" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">Longest Bad Streak</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{dashData?.longestStreakMins ?? 0} mins</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Daily Goal</Typography>
                  <LinearProgress variant="determinate" value={dashData?.dailyAverage ?? 0} sx={{ height: 6, borderRadius: 3 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Today's Hourly Breakdown</Typography>
              {history.length === 0 ? (
                <Typography color="text.secondary">No hourly data available yet.</Typography>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Hour</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Posture Score</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Good Posture %</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Avg Back Angle</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Readings</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {history.map((row, i) => (
                        <TableRow key={i} hover>
                          <TableCell sx={{ fontWeight: 500 }}>{row.hour}</TableCell>
                          <TableCell>{row.postureScore}%</TableCell>
                          <TableCell>{row.goodPct}%</TableCell>
                          <TableCell>{row.avgAngle}°</TableCell>
                          <TableCell>{row.count}</TableCell>
                          <TableCell>
                            <Chip
                              label={row.postureScore >= 75 ? 'Good' : row.postureScore >= 50 ? 'Fair' : 'Poor'}
                              color={row.postureScore >= 75 ? 'success' : row.postureScore >= 50 ? 'warning' : 'error'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
