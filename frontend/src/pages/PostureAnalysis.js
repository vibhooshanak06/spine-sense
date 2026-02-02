import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  DatePicker,
} from '@mui/material';
import { Analytics, Download, Timeline } from '@mui/icons-material';
import PostureChart from '../components/PostureChart';

const PostureAnalysis = () => {
  const [tabValue, setTabValue] = useState(0);
  
  const analysisData = [
    { time: '09:00', posture: 'Good', duration: '45 min', angle: '12°', risk: 'Low' },
    { time: '10:30', posture: 'Fair', duration: '30 min', angle: '18°', risk: 'Medium' },
    { time: '12:00', posture: 'Poor', duration: '15 min', angle: '28°', risk: 'High' },
    { time: '14:15', posture: 'Good', duration: '60 min', angle: '10°', risk: 'Low' },
    { time: '16:00', posture: 'Fair', duration: '25 min', angle: '20°', risk: 'Medium' },
  ];

  const getPostureColor = (posture) => {
    switch (posture) {
      case 'Good': return 'success';
      case 'Fair': return 'warning';
      case 'Poor': return 'error';
      default: return 'default';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'success';
      case 'Medium': return 'warning';
      case 'High': return 'error';
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Posture Analysis
        </Typography>
        <Button
          variant="contained"
          startIcon={<Download />}
          sx={{ borderRadius: 2 }}
        >
          Export Report
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Analytics sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                85%
              </Typography>
              <Typography color="text.secondary">
                Average Posture Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Timeline sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                6.5h
              </Typography>
              <Typography color="text.secondary">
                Good Posture Time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Analytics sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                12
              </Typography>
              <Typography color="text.secondary">
                Posture Alerts Today
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Analysis Tabs */}
        <Grid item xs={12}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                <Tab label="Daily Analysis" />
                <Tab label="Weekly Trends" />
                <Tab label="Detailed Log" />
              </Tabs>
            </Box>
            
            <CardContent>
              {tabValue === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Today's Posture Analysis
                  </Typography>
                  <PostureChart />
                </Box>
              )}
              
              {tabValue === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Weekly Posture Trends
                  </Typography>
                  <PostureChart />
                </Box>
              )}
              
              {tabValue === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Detailed Posture Log
                  </Typography>
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Time</TableCell>
                          <TableCell>Posture Status</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Spinal Angle</TableCell>
                          <TableCell>Risk Level</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {analysisData.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.time}</TableCell>
                            <TableCell>
                              <Chip
                                label={row.posture}
                                color={getPostureColor(row.posture)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{row.duration}</TableCell>
                            <TableCell>{row.angle}</TableCell>
                            <TableCell>
                              <Chip
                                label={row.risk}
                                color={getRiskColor(row.risk)}
                                size="small"
                                variant="outlined"
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