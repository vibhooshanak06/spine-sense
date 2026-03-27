import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button,
  Stepper, Step, StepLabel, StepContent, Chip,
  LinearProgress, Avatar, Paper, CircularProgress, Alert,
} from '@mui/material';
import { PlayArrow, Pause, CheckCircle, FitnessCenter, TrendingUp, Assignment } from '@mui/icons-material';
import { analyticsAPI } from '../services/api';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const EXERCISES = [
  { name: 'Neck Stretches', duration: 5, description: 'Gentle neck rotations and side bends to relieve tension.' },
  { name: 'Shoulder Rolls', duration: 3, description: 'Forward and backward shoulder movements to loosen stiffness.' },
  { name: 'Spinal Extension', duration: 10, description: 'Back extension exercises to improve spinal alignment.' },
  { name: 'Core Strengthening', duration: 15, description: 'Planks and core stability exercises for posture support.' },
];

const LIBRARY = [
  { name: 'Wall Angels', category: 'Posture', difficulty: 'Beginner' },
  { name: 'Cat-Cow Stretch', category: 'Flexibility', difficulty: 'Beginner' },
  { name: 'Thoracic Extension', category: 'Mobility', difficulty: 'Intermediate' },
  { name: 'Dead Bug', category: 'Core', difficulty: 'Intermediate' },
];

const Rehabilitation = () => {
  const [stats, setStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState({});
  const [isExercising, setIsExercising] = useState(false);
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    Promise.all([analyticsAPI.getDashboard(), analyticsAPI.getTrends()])
      .then(([dash, trends]) => {
        setStats(dash);
        setWeeklyData(Array.isArray(trends?.weekly) ? trends.weekly : []);
      })
      .catch(() => setError('Could not load posture data.'))
      .finally(() => setLoading(false));

    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socket.on('analytics_update', (data) => {
      if (data.dashboard) setStats(data.dashboard);
      if (data.trends?.weekly) setWeeklyData(data.trends.weekly);
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (isExercising) {
      intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isExercising]);

  const handleStart = () => { setTimer(0); setIsExercising(true); };
  const handlePause = () => setIsExercising(false);
  const handleComplete = (index) => {
    setIsExercising(false);
    setTimer(0);
    setCompleted(prev => ({ ...prev, [index]: true }));
    setActiveStep(index + 1);
  };

  const completedCount = Object.keys(completed).length;
  const totalExerciseMins = Object.keys(completed).reduce((s, i) => s + EXERCISES[i].duration, 0);
  const weeklyGoalMins = 150;
  const badMins = stats?.badDurationMins ?? 0;

  // Consecutive days from end of weekly data where goodPct >= 50%
  const goodStreak = (() => {
    let s = 0;
    for (let i = weeklyData.length - 1; i >= 0; i--) {
      if ((weeklyData[i]?.goodPct ?? 0) >= 50) s++;
      else break;
    }
    return s;
  })();

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Rehabilitation Program
      </Typography>

      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      {badMins > 20 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Poor posture detected for {badMins} minutes continuously. Start your rehab exercises now.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                <TrendingUp sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h6" gutterBottom>Session Progress</Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (totalExerciseMins / weeklyGoalMins) * 100)}
                sx={{ height: 8, borderRadius: 4, mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                {totalExerciseMins} / {weeklyGoalMins} minutes this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'success.main', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                <CheckCircle sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h6" gutterBottom>Good Posture Streak</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'success.main' }}>{goodStreak}</Typography>
              <Typography variant="body2" color="text.secondary">
                days ({stats?.dailyAverage ?? 0}% good posture today)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'info.main', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                <Assignment sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h6" gutterBottom>Exercises Completed</Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'info.main' }}>{completedCount}</Typography>
              <Typography variant="body2" color="text.secondary">of {EXERCISES.length} today</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Today's Exercise Plan</Typography>
              <Stepper activeStep={activeStep} orientation="vertical">
                {EXERCISES.map((exercise, index) => (
                  <Step key={index} completed={!!completed[index]}>
                    <StepLabel>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{exercise.name}</Typography>
                        <Chip label={`${exercise.duration} min`} size="small" color="primary" variant="outlined" />
                        {completed[index] && <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />}
                      </Box>
                    </StepLabel>
                    <StepContent>
                      <Typography color="text.secondary" sx={{ mb: 2 }}>{exercise.description}</Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          startIcon={isExercising ? <Pause /> : <PlayArrow />}
                          onClick={isExercising ? handlePause : handleStart}
                          size="small"
                        >
                          {isExercising ? 'Pause' : 'Start'}
                        </Button>
                        <Button variant="outlined" onClick={() => handleComplete(index)} size="small">
                          Complete
                        </Button>
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>Exercise Timer</Typography>
              <Box sx={{
                width: 120, height: 120, borderRadius: '50%',
                border: '4px solid', borderColor: isExercising ? 'primary.main' : 'grey.300',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 2,
              }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {isExercising ? 'Exercise in progress' : 'Ready to start'}
              </Typography>
              {stats && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Current posture score: {stats.postureScore}%
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Exercise Library</Typography>
              <Grid container spacing={2}>
                {LIBRARY.map((ex, i) => (
                  <Grid item xs={12} sm={6} md={3} key={i}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <FitnessCenter sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="subtitle1" gutterBottom>{ex.name}</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1 }}>
                        <Chip label={ex.category} size="small" color="primary" />
                        <Chip label={ex.difficulty} size="small" variant="outlined" />
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Rehabilitation;


