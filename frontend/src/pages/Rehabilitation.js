import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  LinearProgress,
  Avatar,
  Paper,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  CheckCircle,
  FitnessCenter,
  Timer,
  TrendingUp,
  Assignment,
} from '@mui/icons-material';

const Rehabilitation = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [exerciseTimer, setExerciseTimer] = useState(0);
  const [isExercising, setIsExercising] = useState(false);

  const exercises = [
    {
      name: 'Neck Stretches',
      duration: '5 minutes',
      description: 'Gentle neck rotations and side bends',
      completed: true,
    },
    {
      name: 'Shoulder Rolls',
      duration: '3 minutes',
      description: 'Forward and backward shoulder movements',
      completed: true,
    },
    {
      name: 'Spinal Extension',
      duration: '10 minutes',
      description: 'Back extension exercises to improve posture',
      completed: false,
    },
    {
      name: 'Core Strengthening',
      duration: '15 minutes',
      description: 'Planks and core stability exercises',
      completed: false,
    },
  ];

  const progress = {
    weeklyGoal: 150, // minutes
    completed: 95,
    streak: 7,
    totalSessions: 24,
  };

  const handleExerciseStart = () => {
    setIsExercising(true);
    // Timer logic would go here
  };

  const handleExercisePause = () => {
    setIsExercising(false);
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
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
        Rehabilitation Program
      </Typography>

      <Grid container spacing={3}>
        {/* Progress Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                <TrendingUp sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h6" gutterBottom>
                Weekly Progress
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(progress.completed / progress.weeklyGoal) * 100}
                sx={{ height: 8, borderRadius: 4, mb: 2 }}
              />
              <Typography variant="body2" color="text.secondary">
                {progress.completed} / {progress.weeklyGoal} minutes
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
              <Typography variant="h6" gutterBottom>
                Current Streak
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {progress.streak}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                days in a row
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
              <Typography variant="h6" gutterBottom>
                Total Sessions
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                {progress.totalSessions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Exercise Plan */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Today's Exercise Plan
              </Typography>
              <Stepper activeStep={activeStep} orientation="vertical">
                {exercises.map((exercise, index) => (
                  <Step key={index} completed={exercise.completed}>
                    <StepLabel>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{exercise.name}</Typography>
                        <Chip
                          label={exercise.duration}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        {exercise.completed && (
                          <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                        )}
                      </Box>
                    </StepLabel>
                    <StepContent>
                      <Typography color="text.secondary" sx={{ mb: 2 }}>
                        {exercise.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          startIcon={isExercising ? <Pause /> : <PlayArrow />}
                          onClick={isExercising ? handleExercisePause : handleExerciseStart}
                          size="small"
                        >
                          {isExercising ? 'Pause' : 'Start'}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => setActiveStep(index + 1)}
                          size="small"
                        >
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

        {/* Exercise Timer */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Exercise Timer
              </Typography>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  border: '4px solid',
                  borderColor: isExercising ? 'primary.main' : 'grey.300',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                  position: 'relative',
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {Math.floor(exerciseTimer / 60)}:{(exerciseTimer % 60).toString().padStart(2, '0')}
                </Typography>
                {isExercising && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -2,
                      left: -2,
                      right: -2,
                      bottom: -2,
                      borderRadius: '50%',
                      border: '2px solid',
                      borderColor: 'primary.main',
                      animation: 'pulse 2s infinite',
                    }}
                  />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                {isExercising ? 'Exercise in progress' : 'Ready to start'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Exercise Library */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Exercise Library
              </Typography>
              <Grid container spacing={2}>
                {[
                  { name: 'Wall Angels', category: 'Posture', difficulty: 'Beginner' },
                  { name: 'Cat-Cow Stretch', category: 'Flexibility', difficulty: 'Beginner' },
                  { name: 'Thoracic Extension', category: 'Mobility', difficulty: 'Intermediate' },
                  { name: 'Dead Bug', category: 'Core', difficulty: 'Intermediate' },
                ].map((exercise, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <FitnessCenter sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                      <Typography variant="subtitle1" gutterBottom>
                        {exercise.name}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1 }}>
                        <Chip label={exercise.category} size="small" color="primary" />
                        <Chip label={exercise.difficulty} size="small" variant="outlined" />
                      </Box>
                      <Button size="small" variant="outlined">
                        View Details
                      </Button>
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