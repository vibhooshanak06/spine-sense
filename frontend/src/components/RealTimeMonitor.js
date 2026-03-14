import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, LinearProgress, Grid, Paper, Fade } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const RealTimeMonitor = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [sensorData, setSensorData] = useState({
    spinalAngle: 0,
    shoulderAlignment: 90,
    headPosition: 90,
    postureStatus: 'Loading...',
    confidence: 95,
  });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('posture_update', (entry) => {
      const angle1 = entry?.sensor1?.angle ?? 0;
      const angle2 = entry?.sensor2?.angle ?? 0;
      const isBad = angle1 > 20 || angle2 > 20;
      const score = Math.max(0, Math.min(100, 100 - Math.round(((angle1 + angle2) / 2) * 100 / 45)));
      setSensorData({
        spinalAngle: parseFloat(angle1.toFixed(1)),
        shoulderAlignment: Math.max(60, 100 - Math.round((angle1 / 45) * 40)),
        headPosition: Math.max(60, 100 - Math.round((angle2 / 45) * 40)),
        postureStatus: isBad ? (score < 40 ? 'Poor' : 'Fair') : (score > 85 ? 'Excellent' : 'Good'),
        confidence: 95,
      });
    });

    socket.on('stats_update', (stats) => {
      const isBad = stats.currentStatus === 'Bad';
      setSensorData(prev => ({
        ...prev,
        spinalAngle: stats.avgBackAngle ?? prev.spinalAngle,
        postureStatus: isBad ? 'Poor' : (stats.postureScore > 85 ? 'Excellent' : 'Good'),
      }));
    });

    return () => socket.disconnect();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Excellent': return { main: '#10B981', glow: 'rgba(16,185,129,0.4)' };
      case 'Good': return { main: '#06B6D4', glow: 'rgba(6,182,212,0.4)' };
      case 'Fair': return { main: '#F59E0B', glow: 'rgba(245,158,11,0.4)' };
      case 'Poor': return { main: '#EF4444', glow: 'rgba(239,68,68,0.4)' };
      default: return { main: '#8B5CF6', glow: 'rgba(139,92,246,0.4)' };
    }
  };

  const getProgressColor = (value) => {
    if (value >= 90) return { main: '#10B981', glow: 'rgba(16,185,129,0.4)' };
    if (value >= 80) return { main: '#06B6D4', glow: 'rgba(6,182,212,0.4)' };
    if (value >= 70) return { main: '#F59E0B', glow: 'rgba(245,158,11,0.4)' };
    return { main: '#EF4444', glow: 'rgba(239,68,68,0.4)' };
  };

  const MetricCard = ({ title, value, unit, progress, color }) => (
    <Fade in>
      <Paper sx={{
        p: 3, textAlign: 'center',
        border: `1px solid ${color.main}40`, borderRadius: 4,
        position: 'relative', overflow: 'hidden',
        '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color.main },
        '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 20px 40px ${color.glow}` },
        transition: 'all 0.3s ease',
      }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 2, color: color.main }}>
          {value}{unit}
        </Typography>
        {progress !== undefined && (
          <LinearProgress variant="determinate" value={progress}
            sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { background: color.main } }} />
        )}
      </Paper>
    </Fade>
  );

  const statusColor = getStatusColor(sensorData.postureStatus);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Chip
          label={isConnected ? 'Live Connected' : 'Connecting...'}
          sx={{ background: isConnected ? '#10B981' : '#F59E0B', color: '#fff', fontWeight: 700 }}
        />
        <Chip
          label={`Status: ${sensorData.postureStatus}`}
          sx={{ background: statusColor.main, color: '#fff', fontWeight: 800 }}
        />
      </Box>

      <Grid container spacing={3} sx={{ flexGrow: 1, mb: 3 }}>
        <Grid item xs={6} md={3}>
          <MetricCard title="Spinal Angle" value={sensorData.spinalAngle} unit="°"
            progress={Math.max(0, 100 - (sensorData.spinalAngle / 45) * 100)}
            color={sensorData.spinalAngle < 15 ? getProgressColor(95) : sensorData.spinalAngle < 25 ? getProgressColor(75) : getProgressColor(50)} />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricCard title="Shoulder Align" value={sensorData.shoulderAlignment} unit="%"
            progress={sensorData.shoulderAlignment} color={getProgressColor(sensorData.shoulderAlignment)} />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricCard title="Head Position" value={sensorData.headPosition} unit="%"
            progress={sensorData.headPosition} color={getProgressColor(sensorData.headPosition)} />
        </Grid>
        <Grid item xs={6} md={3}>
          <MetricCard title="Confidence" value={sensorData.confidence} unit="%"
            progress={sensorData.confidence} color={{ main: '#8B5CF6', glow: 'rgba(139,92,246,0.4)' }} />
        </Grid>
      </Grid>

      <Box sx={{ textAlign: 'center' }}>
        <Box sx={{
          width: 120, height: 120, borderRadius: '50%', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: statusColor.main,
          boxShadow: `0 0 60px ${statusColor.glow}`,
          animation: 'statusPulse 3s ease-in-out infinite',
          '@keyframes statusPulse': {
            '0%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.05)' },
            '100%': { transform: 'scale(1)' },
          },
        }}>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900 }}>
            {sensorData.postureStatus[0]}
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ color: statusColor.main, fontWeight: 800, mt: 2 }}>
          {sensorData.postureStatus} Posture
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: statusColor.main, animation: 'pulse 2s infinite',
            '@keyframes pulse': { '0%': { opacity: 1 }, '50%': { opacity: 0.5 }, '100%': { opacity: 1 } } }} />
          {isConnected ? 'Live Monitoring Active' : 'Connecting to sensor...'}
        </Typography>
      </Box>
    </Box>
  );
};

export default RealTimeMonitor;
