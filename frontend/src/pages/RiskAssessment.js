import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Alert,
  Chip, Paper, CircularProgress as MuiSpinner,
  LinearProgress, Divider, Stack, useTheme
} from '@mui/material';
import {
  WarningAmber as WarningIcon,
  CheckCircleOutline as SafeIcon,
  Timeline as TrendIcon,
  AccessibilityNew as BodyIcon,
  Update as UpdateIcon
} from '@mui/icons-material';
import { analyticsAPI } from '../services/api';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const RiskAssessment = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    analyticsAPI.getRiskAssessment()
      .then((result) => setData(result?.risk ?? result))
      .catch(() => setError('Failed to load risk data.'))
      .finally(() => setLoading(false));

    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socket.on('analytics_update', (update) => {
      setData(update?.risk ?? update);
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
      <Grid item xs={12} key={periodKey}>
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
                    <UpdateIcon fontSize="small" /> {periodData.lastUpdated}
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

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <MuiSpinner />
    </Box>
  );

  const periodKeys = ['daily', 'weekly', 'monthly'].filter(k => k in data);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1200px', margin: '0 auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary' }}>Posture Risk</Typography>
          <Typography variant="body1" color="text.secondary">Long-term spinal health monitoring</Typography>
        </Box>
        <Chip label="Live Feed" color="error" size="small" variant="filled" sx={{ mb: 1, fontWeight: 'bold' }} />
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={4}>
        {periodKeys.map((key) => renderPeriodDashboard(key, data[key]))}
      </Grid>

      {/* Optional: Simple legend for the user */}
      <Paper sx={{ mt: 6, p: 2, textAlign: 'center', bgcolor: 'transparent' }} elevation={0} variant="outlined">
        <Typography variant="caption" color="text.secondary">
          Scores are calculated based on spinal angle deviation, duration of poor posture, and frequency of bad readings. 
          High Risk levels suggest immediate ergonomic adjustments are required.
        </Typography>
      </Paper>
    </Box>
  );
};

export default RiskAssessment;