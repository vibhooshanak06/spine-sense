import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  IconButton,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Refresh,
  Person,
  Timer,
  Analytics,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Error,
} from '@mui/icons-material';

const Dashboard = () => {
  const [postureData, setPostureData] = useState({
    currentPosture: 'Good',
    postureScore: 85,
    dailyAverage: 78,
    weeklyTrend: 5.2,
    sessionsToday: 8,
    totalTime: '6h 45m',
    riskLevel: 'Low',
  });

  // Circular Progress Component
  const CircularProgress = ({ value, size = 120, strokeWidth = 8, color = '#4F46E5', label, sublabel }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
      <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.5s ease-in-out',
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
            }}
          />
        </svg>
        <Box
          sx={{
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, color: color }}>
            {value}%
          </Typography>
          {label && (
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
              {label}
            </Typography>
          )}
          {sublabel && (
            <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
              {sublabel}
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  // Metric Card Component
  const MetricCard = ({ title, value, subtitle, icon, color = 'primary', trend }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: `${color}.main`, mr: 2, width: 48, height: 48 }}>
            {icon}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>
              {value}
            </Typography>
          </Box>
        </Box>
        
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {subtitle}
          </Typography>
        )}
        
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {trend > 0 ? (
              <TrendingUp sx={{ color: 'success.main', mr: 0.5, fontSize: 20 }} />
            ) : (
              <TrendingDown sx={{ color: 'error.main', mr: 0.5, fontSize: 20 }} />
            )}
            <Typography 
              variant="body2" 
              sx={{ 
                color: trend > 0 ? 'success.main' : 'error.main',
                fontWeight: 600,
              }}
            >
              {Math.abs(trend)}% from last week
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const recentSessions = [
    { name: 'Morning Session', startTime: '9:00 AM', endTime: '9:32 AM', duration: '32 min', status: 'Good', score: 92 },
    { name: 'Work Session', startTime: '10:15 AM', endTime: '11:23 AM', duration: '1h 8min', status: 'Fair', score: 78 },
    { name: 'Afternoon Break', startTime: '2:30 PM', endTime: '2:45 PM', duration: '15 min', status: 'Excellent', score: 95 },
    { name: 'Evening Session', startTime: '4:00 PM', endTime: '5:30 PM', duration: '1h 30min', status: 'Good', score: 88 },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Excellent': return 'success';
      case 'Good': return 'info';
      case 'Fair': return 'warning';
      case 'Poor': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box
    component="main"
    sx={{
      ml: '-200px',   // 👈 move page LEFT (adjust value)
      mt: '6px',    // navbar height
      p: 2,          // slightly tighter padding
      minHeight: '100vh',
      backgroundColor: 'background.default',
    }}
  >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}> {/* Minimal margin bottom */}
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back! Here's your posture overview for today.
          </Typography>
        </Box>
        <IconButton 
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' }
          }}
        >
          <Refresh />
        </IconButton>
      </Box>

      <Grid container spacing={1.5}> {/* Minimal spacing */}
        {/* Metric Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Current Status"
            value={postureData.currentPosture}
            icon={<Person />}
            color="primary"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Daily Score"
            value={`${postureData.postureScore}%`}
            subtitle={`Average: ${postureData.dailyAverage}%`}
            icon={<Analytics />}
            color="success"
            trend={postureData.weeklyTrend}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Time"
            value={postureData.totalTime}
            subtitle={`${postureData.sessionsToday} sessions`}
            icon={<Timer />}
            color="info"
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Risk Level"
            value={postureData.riskLevel}
            icon={<Warning />}
            color={postureData.riskLevel === 'Low' ? 'success' : 'warning'}
          />
        </Grid>

        {/* Circular Progress Charts */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Today's Posture Metrics
              </Typography>
              <Grid container spacing={4} sx={{ textAlign: 'center' }}>
                <Grid item xs={12} sm={4}>
                  <CircularProgress 
                    value={85} 
                    color="#4F46E5" 
                    label="Posture Score"
                    sublabel="85/100"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CircularProgress 
                    value={92} 
                    color="#10B981" 
                    label="Alignment"
                    sublabel="Excellent"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <CircularProgress 
                    value={78} 
                    color="#F59E0B" 
                    label="Activity"
                    sublabel="Good"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Quick Stats
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Sessions Today
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    8
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Best Session
                  </Typography>
                  <Chip label="95%" color="success" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Improvement
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUp sx={{ color: 'success.main', mr: 0.5, fontSize: 16 }} />
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                      +5.2%
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Weekly Goal
                  </Typography>
                  <Box sx={{ width: 60 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={75} 
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Sessions Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Recent Sessions
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Session</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Start Time</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>End Time</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentSessions.map((session, index) => (
                      <TableRow key={index} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{session.name}</TableCell>
                        <TableCell>{session.startTime}</TableCell>
                        <TableCell>{session.endTime}</TableCell>
                        <TableCell>{session.duration}</TableCell>
                        <TableCell>
                          <Chip
                            label={session.status}
                            color={getStatusColor(session.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{session.score}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;