import React, { useState, useEffect } from 'react';
import { Box, Typography, Chip, LinearProgress, Grid, Paper, Fade } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const RealTimeMonitor = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [sensorData, setSensorData] = useState({
    spinalAngle: 8,
    shoulderAlignment: 96,
    headPosition: 94,
    postureStatus: 'Excellent',
    confidence: 98,
  });

  const [isConnected, setIsConnected] = useState(true);
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setSensorData(prev => ({
        spinalAngle: Math.max(0, Math.min(45, prev.spinalAngle + (Math.random() - 0.5) * 3)),
        shoulderAlignment: Math.max(70, Math.min(100, prev.shoulderAlignment + (Math.random() - 0.5) * 4)),
        headPosition: Math.max(70, Math.min(100, prev.headPosition + (Math.random() - 0.5) * 3)),
        postureStatus: Math.random() > 0.2 ? 'Excellent' : Math.random() > 0.5 ? 'Good' : 'Fair',
        confidence: Math.max(85, Math.min(100, prev.confidence + (Math.random() - 0.5) * 2)),
      }));
      setPulseKey(prev => prev + 1);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Excellent': return { main: '#10B981', glow: 'rgba(16, 185, 129, 0.4)' };
      case 'Good': return { main: '#06B6D4', glow: 'rgba(6, 182, 212, 0.4)' };
      case 'Fair': return { main: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)' };
      case 'Poor': return { main: '#EF4444', glow: 'rgba(239, 68, 68, 0.4)' };
      default: return { main: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.4)' };
    }
  };

  const getProgressColor = (value) => {
    if (value >= 90) return { main: '#10B981', glow: 'rgba(16, 185, 129, 0.4)' };
    if (value >= 80) return { main: '#06B6D4', glow: 'rgba(6, 182, 212, 0.4)' };
    if (value >= 70) return { main: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)' };
    return { main: '#EF4444', glow: 'rgba(239, 68, 68, 0.4)' };
  };

  const MetricCard = ({ title, value, unit, progress, color, delay = 0 }) => (
    <Fade in={true} style={{ transitionDelay: `${delay}ms` }}>
      <Paper 
        sx={{ 
          p: 3, 
          textAlign: 'center',
          background: isDark
            ? 'linear-gradient(145deg, rgba(26, 26, 46, 0.6) 0%, rgba(22, 33, 62, 0.6) 100%)'
            : 'linear-gradient(145deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.8) 100%)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${color.main}40`,
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: `linear-gradient(90deg, ${color.main}, ${color.main}80)`,
            boxShadow: `0 0 20px ${color.glow}`,
          },
          '&:hover': {
            transform: 'translateY(-4px) scale(1.02)',
            boxShadow: `0 20px 40px ${color.glow}, 0 0 0 1px ${color.main}30`,
            border: `1px solid ${color.main}60`,
          },
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'text.secondary',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 1.2,
            fontSize: '0.7rem',
            mb: 1,
            display: 'block',
          }}
        >
          {title}
        </Typography>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 800,
            mb: 2,
            background: `linear-gradient(135deg, ${color.main} 0%, ${color.main}80 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: isDark ? `0 0 30px ${color.glow}` : 'none',
            fontSize: '2rem',
          }}
        >
          {value}{unit}
        </Typography>
        {progress !== undefined && (
          <Box sx={{ position: 'relative' }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: isDark 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(0, 0, 0, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${color.main} 0%, ${color.main}80 100%)`,
                  boxShadow: `0 0 20px ${color.glow}`,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`,
                    animation: 'shimmer 2s infinite',
                    '@keyframes shimmer': {
                      '0%': { transform: 'translateX(-100%)' },
                      '100%': { transform: 'translateX(100%)' },
                    },
                  },
                },
              }}
            />
            <Typography 
              variant="caption" 
              sx={{ 
                position: 'absolute',
                right: 0,
                top: -20,
                color: color.main,
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              {Math.round(progress)}%
            </Typography>
          </Box>
        )}
      </Paper>
    </Fade>
  );

  const statusColor = getStatusColor(sensorData.postureStatus);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Connection Status */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Chip
          label={isConnected ? 'Sensors Connected' : 'Disconnected'}
          sx={{
            background: isConnected 
              ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
              : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
            color: '#FFFFFF',
            fontWeight: 700,
            boxShadow: isConnected 
              ? '0 4px 20px rgba(16, 185, 129, 0.4)'
              : '0 4px 20px rgba(239, 68, 68, 0.4)',
            border: 'none',
            '& .MuiChip-label': {
              px: 2,
            },
          }}
          size="medium"
        />
        <Chip
          label={`Status: ${sensorData.postureStatus}`}
          sx={{
            background: `linear-gradient(135deg, ${statusColor.main} 0%, ${statusColor.main}80 100%)`,
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.9rem',
            boxShadow: `0 4px 20px ${statusColor.glow}`,
            border: 'none',
            '& .MuiChip-label': {
              px: 2,
            },
          }}
          size="medium"
        />
      </Box>

      {/* Real-time Metrics */}
      <Grid container spacing={3} sx={{ flexGrow: 1, mb: 3 }}>
        <Grid item xs={6} md={3}>
          <MetricCard
            title="Spinal Angle"
            value={sensorData.spinalAngle.toFixed(1)}
            unit="°"
            progress={Math.max(0, 100 - (sensorData.spinalAngle / 45) * 100)}
            color={sensorData.spinalAngle < 15 ? getProgressColor(95) : sensorData.spinalAngle < 25 ? getProgressColor(75) : getProgressColor(50)}
            delay={0}
          />
        </Grid>
        
        <Grid item xs={6} md={3}>
          <MetricCard
            title="Shoulder Align"
            value={sensorData.shoulderAlignment.toFixed(0)}
            unit="%"
            progress={sensorData.shoulderAlignment}
            color={getProgressColor(sensorData.shoulderAlignment)}
            delay={100}
          />
        </Grid>
        
        <Grid item xs={6} md={3}>
          <MetricCard
            title="Head Position"
            value={sensorData.headPosition.toFixed(0)}
            unit="%"
            progress={sensorData.headPosition}
            color={getProgressColor(sensorData.headPosition)}
            delay={200}
          />
        </Grid>
        
        <Grid item xs={6} md={3}>
          <MetricCard
            title="Confidence"
            value={sensorData.confidence.toFixed(0)}
            unit="%"
            progress={sensorData.confidence}
            color={{ main: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.4)' }}
            delay={300}
          />
        </Grid>
      </Grid>

      {/* Central Status Indicator */}
      <Box sx={{ textAlign: 'center', position: 'relative' }}>
        <Box
          key={pulseKey}
          sx={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${statusColor.main} 0%, ${statusColor.main}80 100%)`,
            boxShadow: `0 0 60px ${statusColor.glow}, inset 0 0 60px rgba(255, 255, 255, 0.1)`,
            border: '4px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            position: 'relative',
            overflow: 'hidden',
            animation: 'statusPulse 3s ease-in-out infinite',
            '@keyframes statusPulse': {
              '0%': {
                transform: 'scale(1)',
                boxShadow: `0 0 60px ${statusColor.glow}, inset 0 0 60px rgba(255, 255, 255, 0.1)`,
              },
              '50%': {
                transform: 'scale(1.05)',
                boxShadow: `0 0 80px ${statusColor.glow}, inset 0 0 80px rgba(255, 255, 255, 0.2)`,
              },
              '100%': {
                transform: 'scale(1)',
                boxShadow: `0 0 60px ${statusColor.glow}, inset 0 0 60px rgba(255, 255, 255, 0.1)`,
              },
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              borderRadius: '50%',
              background: `conic-gradient(from 0deg, ${statusColor.main}, transparent, ${statusColor.main})`,
              animation: 'rotate 4s linear infinite',
              zIndex: -1,
              '@keyframes rotate': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '200%',
              height: '200%',
              background: `radial-gradient(circle, ${statusColor.glow} 0%, transparent 70%)`,
              transform: 'translate(-50%, -50%)',
              zIndex: -2,
              animation: 'glow 2s ease-in-out infinite alternate',
              '@keyframes glow': {
                '0%': { opacity: 0.5 },
                '100%': { opacity: 1 },
              },
            },
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#FFFFFF', 
              fontWeight: 900,
              textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
              fontSize: '2rem',
            }}
          >
            {sensorData.postureStatus[0]}
          </Typography>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: statusColor.main,
              fontWeight: 800,
              textShadow: isDark ? `0 0 20px ${statusColor.glow}` : 'none',
              mb: 0.5,
            }}
          >
            {sensorData.postureStatus} Posture
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${statusColor.main} 0%, ${statusColor.main}80 100%)`,
                boxShadow: `0 0 12px ${statusColor.glow}`,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { opacity: 1, transform: 'scale(1)' },
                  '50%': { opacity: 0.7, transform: 'scale(1.2)' },
                  '100%': { opacity: 1, transform: 'scale(1)' },
                },
              }}
            />
            Live Monitoring Active
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default RealTimeMonitor;