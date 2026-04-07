import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, Button, CircularProgress, Alert,
  LinearProgress, Divider, Stack, useTheme
} from '@mui/material';
import {
  Analytics, Download, Timeline,
  WarningAmber as WarningIcon,
  CheckCircleOutline as SafeIcon,
  Timeline as TrendIcon,
  AccessibilityNew as BodyIcon,
  Update as UpdateIcon
} from '@mui/icons-material';
import PostureChart from '../components/PostureChart';
import { postureAPI, analyticsAPI } from '../services/api';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const PostureAnalysis = () => {
  const [tabValue, setTabValue] = useState(0);
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [trends, setTrends] = useState(null);
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    async function load() {
      try {
        const [sum, hist, trend, riskData] = await Promise.all([
          postureAPI.getSummary('daily'),
          postureAPI.getHistory(),
          analyticsAPI.getTrends(),
          analyticsAPI.getRiskAssessment(),
        ]);
        setSummary(sum);
        setHistory(Array.isArray(hist) ? hist : []);
        setTrends(trend);
        setRisk(riskData);
      } catch (err) {
        setError('Failed to load posture data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();

    const socket = io(SOCKET_URL, { transports: ['websocket'] });

    socket.on('analytics_update', (data) => {
      if (data.trends) setTrends(data.trends);
      if (data.trends?.hourly) setHistory(data.trends.hourly);
      if (data.risk) setRisk(data.risk);
      if (data.dashboard) {
        setSummary(prev => prev ? {
          ...prev,
          postureScore: data.dashboard.postureScore,
          dailyGoodPct: data.dashboard.dailyAverage,
          totalBadReadings: data.dashboard.badReadings,
          totalGoodReadings: data.dashboard.goodReadings,
          avgBackAngle: data.dashboard.avgBackAngle,
          badDurationMins: data.dashboard.badDurationMins,
          longestStreakMins: data.dashboard.longestStreakMins,
          alerts: data.dashboard.badReadings,
          lastUpdated: data.dashboard.lastUpdated
        } : prev);
      }
    });

    return () => socket.disconnect();
  }, []);

  const getStatusColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return theme.palette.error.main;
      case 'moderate':
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.text.secondary;
    }
  };

  const formatDateRange = (obj) => {
    if (!obj) return '--';
    if (obj.date) return obj.date;
    if (obj.weekStart) return `${obj.weekStart} - ${obj.weekEnd}`;
    if (obj.monthStart) return `${obj.monthStart} - ${obj.monthEnd}`;
    return '--';
  };

  const RiskScoreCard = ({ label, score, level, percentage }) => (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
        <Typography variant="body2" fontWeight="600">{label}</Typography>
        <Typography variant="caption" sx={{ color: getStatusColor(level), fontWeight: 'bold' }}>
          {level?.toUpperCase()} ({score})
        </Typography>
      </Stack>
      <LinearProgress 
        variant="determinate" 
        value={score} 
        sx={{ 
          height: 8, 
          borderRadius: 5,
          backgroundColor: theme.palette.grey[200],
          '& .MuiLinearProgress-bar': { backgroundColor: getStatusColor(level) }
        }} 
      />
      <Typography variant="caption" color="text.secondary">
        Impact: {percentage}% of readings
      </Typography>
    </Box>
  );

  const renderPeriodDashboard = (periodKey, periodData) => {
    if (!periodData) return null;

    return (
      <Grid item xs={12} key={periodKey} sx={{ mb: 3 }}>
        <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', borderLeft: `6px solid ${getStatusColor(periodData.totalRiskLevel)}` }}>
          <CardContent>
            <Grid container spacing={3}>
              {/* Left Column: Summary */}
              <Grid item xs={12} md={3}>
                <Stack spacing={1}>
                  <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.5, fontWeight: 'bold' }}>
                    {periodKey.toUpperCase()} VIEW
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: getStatusColor(periodData.totalRiskLevel) }}>
                    {periodData.totalRiskLevel}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                    <UpdateIcon fontSize="small" /> {new Date(periodData.lastUpdated).toLocaleTimeString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Range: {formatDateRange(periodData)}
                  </Typography>
                  <Chip 
                    icon={<TrendIcon />} 
                    label={`${periodData.totalReadings} Samples`} 
                    variant="outlined" 
                    size="small" 
                    sx={{ mt: 1, width: 'fit-content' }}
                  />
                </Stack>
              </Grid>

              {/* Middle Column: Detailed Scores */}
              <Grid item xs={12} md={5}>
                <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BodyIcon fontSize="small" /> Anatomical Risk Breakdown
                </Typography>
                <RiskScoreCard 
                  label="Back (Lumbar/Thoracic)" 
                  score={periodData.backRiskScore} 
                  level={periodData.backRiskLevel} 
                  percentage={periodData.backRiskPct}
                />
                <RiskScoreCard 
                  label="Neck (Cervical)" 
                  score={periodData.neckRiskScore} 
                  level={periodData.neckRiskLevel} 
                  percentage={periodData.neckRiskPct}
                />
                <Box sx={{ mt: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="caption" display="block">
                    <b>Combined Stress:</b> {periodData.bothAffectedPct}% of the time both regions were under strain.
                  </Typography>
                </Box>
              </Grid>

              {/* Right Column: Side Effects/Warnings */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: theme.palette.error.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon fontSize="small" /> Potential Health Risks
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {periodData.sideEffects?.map((effect, idx) => (
                    <Chip 
                      key={idx} 
                      label={effect} 
                      size="small" 
                      color="error" 
                      variant="soft" 
                      sx={{ fontSize: '0.7rem', bgcolor: theme.palette.error.light + '20' }} 
                    />
                  ))}
                  {!periodData.sideEffects?.length && (
                    <Typography variant="body2" color="success.main" display="flex" alignItems="center" gap={1}>
                      <SafeIcon /> No immediate risks detected
                    </Typography>
                  )}
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary">
                  Dominant Risk Factor: <b>{periodData.dominantRisk}</b>
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    );
  };

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
    <Box sx={{ minHeight: '100vh', p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary' }}>Posture Analysis</Typography>
          {summary?.lastUpdated && (
            <Typography variant="caption" color="text.secondary">
              Last updated: {new Date(summary.lastUpdated).toLocaleString()}
            </Typography>
          )}
        </Box>
        <Button variant="contained" startIcon={<Download />} sx={{ borderRadius: 2 }}>Export Report</Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={3}>
        {risk?.alerts && risk.alerts.length > 0 && (
          <Grid item xs={12}>
            {risk.alerts.map((alert, idx) => (
              <Alert key={idx} severity={alert.severity} sx={{ mb: 1, borderRadius: 2 }}>
                {alert.message}
              </Alert>
            ))}
          </Grid>
        )}

        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Analytics sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {summary?.postureScore ?? '--'}%
              </Typography>
              <Typography variant="body2" color="text.secondary">Posture Score</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Timeline sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {summary?.goodPostureTime ?? '--'}
              </Typography>
              <Typography variant="body2" color="text.secondary">Good Posture Time</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Analytics sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {summary?.alerts ?? '--'}
              </Typography>
              <Typography variant="body2" color="text.secondary">Bad Readings</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Timeline sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {summary?.avgBackAngle ?? '--'}°
              </Typography>
              <Typography variant="body2" color="text.secondary">Avg Back Angle</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Daily Good %</Typography>
              <Typography variant="h6">{summary?.dailyGoodPct ?? '--'}%</Typography>
              <Typography variant="caption" color="text.secondary">
                {summary?.totalGoodReadings ?? 0} good samples
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Longest Streak</Typography>
              <Typography variant="h6">{summary?.longestStreakMins ?? '--'} mins</Typography>
              <Typography variant="caption" color="text.secondary">
                Current bad duration: {summary?.badDurationMins ?? 0} mins
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Total Session</Typography>
              <Typography variant="h6">{summary?.totalTime ?? '--'}</Typography>
              <Typography variant="caption" color="text.secondary">
                Total readings: {summary?.totalReadings ?? 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ borderRadius: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ px: 2 }}>
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
                  <TableContainer component={Paper} variant="outlined" sx={{ mt: 2, borderRadius: 2 }}>
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
                            <TableCell>{row.avgAngle}°</TableCell>
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


