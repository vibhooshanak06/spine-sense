import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, Button, CircularProgress, Alert,
} from '@mui/material';
import { Analytics, Download, Timeline } from '@mui/icons-material';
import PostureChart from '../components/PostureChart';
import { postureAPI, analyticsAPI } from '../services/api';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const PostureAnalysis = () => {
  const [tabValue, setTabValue] = useState(0);
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [sum, hist, trend] = await Promise.all([
          postureAPI.getSummary('daily'),
          postureAPI.getHistory(),
          analyticsAPI.getTrends(),
        ]);
        setSummary(sum);
        setHistory(Array.isArray(hist) ? hist : []);
        setTrends(trend);
      } catch (err) {
        setError('Failed to load posture data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();

    const socket = io(SOCKET_URL, { transports: ['websocket'] });

    // Refresh trends and history every 5 minutes from cache broadcast
    socket.on('analytics_update', (data) => {
      if (data.trends) setTrends(data.trends);
      if (data.trends?.hourly) setHistory(data.trends.hourly);
      if (data.dashboard) {
        setSummary(prev => prev ? {
          ...prev,
          postureScore: data.dashboard.postureScore,
          goodPostureTime: prev.goodPostureTime,
          alerts: data.dashboard.badReadings,
        } : prev);
      }
    });

    return () => socket.disconnect();
  }, []);

  const getPostureColor = (score) => {
    if (score >= 75) return 'success';
    if (score >= 50) return 'warning';
    return 'error';
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Posture Analysis</Typography>
        <Button variant="contained" startIcon={<Download />} sx={{ borderRadius: 2 }}>Export Report</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Analytics sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {summary?.postureScore ?? '--'}%
              </Typography>
              <Typography color="text.secondary">Posture Score</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Timeline sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {summary?.goodPostureTime ?? '--'}
              </Typography>
              <Typography color="text.secondary">Good Posture Time</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Analytics sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                {summary?.alerts ?? '--'}
              </Typography>
              <Typography color="text.secondary">Bad Posture Readings</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
                <Tab label="Daily Analysis" />
                <Tab label="Weekly Trends" />
                <Tab label="Detailed Log" />
              </Tabs>
            </Box>
            <CardContent>
              {tabValue === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Today's Posture Analysis</Typography>
                  <PostureChart data={trends?.hourly} type="hourly" />
                </Box>
              )}
              {tabValue === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Weekly Posture Trends</Typography>
                  <PostureChart data={trends?.weekly} type="weekly" />
                </Box>
              )}
              {tabValue === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Hourly Posture Log</Typography>
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Hour</TableCell>
                          <TableCell>Posture Score</TableCell>
                          <TableCell>Good Posture %</TableCell>
                          <TableCell>Avg Back Angle</TableCell>
                          <TableCell>Readings</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {history.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center">No data available</TableCell>
                          </TableRow>
                        ) : history.map((row, i) => (
                          <TableRow key={i}>
                            <TableCell>{row.hour}</TableCell>
                            <TableCell>{row.postureScore}%</TableCell>
                            <TableCell>{row.goodPct}%</TableCell>
                            <TableCell>{row.avgAngle}Â°</TableCell>
                            <TableCell>{row.count}</TableCell>
                            <TableCell>
                              <Chip
                                label={row.postureScore >= 75 ? 'Good' : row.postureScore >= 50 ? 'Fair' : 'Poor'}
                                color={getPostureColor(row.postureScore)}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PostureAnalysis;


