import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PostureAnalysis from './pages/PostureAnalysis';
import RiskAssessment from './pages/RiskAssessment';
import Rehabilitation from './pages/Rehabilitation';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

const buildTheme = (darkMode) => createTheme({
  palette: {
    mode: darkMode ? 'dark' : 'light',
    primary: { main: '#4F46E5', light: '#6366F1', dark: '#3730A3', contrastText: '#FFFFFF' },
    secondary: { main: '#10B981', light: '#34D399', dark: '#059669', contrastText: '#FFFFFF' },
    background: {
      default: darkMode ? '#0F172A' : '#F8FAFC',
      paper: darkMode ? '#1E293B' : '#FFFFFF',
    },
    text: {
      primary: darkMode ? '#F1F5F9' : '#0F172A',
      secondary: darkMode ? '#94A3B8' : '#64748B',
    },
    success: { main: '#10B981', light: '#34D399', dark: '#059669' },
    warning: { main: '#F59E0B', light: '#FBBF24', dark: '#D97706' },
    error: { main: '#EF4444', light: '#F87171', dark: '#DC2626' },
    info: { main: '#3B82F6', light: '#60A5FA', dark: '#2563EB' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, fontSize: '2.5rem', lineHeight: 1.2 },
    h4: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.3 },
    h6: { fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.4 },
    body1: { fontSize: '0.875rem', lineHeight: 1.5, fontWeight: 400 },
    body2: { fontSize: '0.75rem', lineHeight: 1.4, fontWeight: 500 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: darkMode ? '1px solid #334155' : '1px solid #E2E8F0',
          boxShadow: darkMode
            ? '0 1px 3px 0 rgba(0,0,0,0.3)'
            : '0 1px 3px 0 rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': { transform: 'translateY(-2px)' },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, textTransform: 'none', fontWeight: 500,
          fontSize: '0.875rem', padding: '8px 16px', boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: darkMode ? '#1E293B' : '#FFFFFF',
          color: darkMode ? '#F1F5F9' : '#0F172A',
          boxShadow: darkMode ? '0 1px 3px 0 rgba(0,0,0,0.3)' : '0 1px 3px 0 rgba(0,0,0,0.1)',
          borderBottom: darkMode ? '1px solid #334155' : '1px solid #E2E8F0',
          height: 44,
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '44px !important',
          paddingLeft: '16px !important',
          paddingRight: '16px !important',
          '@media (min-width:600px)': { minHeight: '44px !important' },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: darkMode ? '#1E293B' : '#FFFFFF',
          borderRight: darkMode ? '1px solid #334155' : '1px solid #E2E8F0',
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 20, fontWeight: 500, fontSize: '0.75rem' } },
    },
  },
});

// Wraps protected pages — redirects to /login if not authenticated
const ProtectedLayout = ({ darkMode, toggleDarkMode, toggleSidebar, sidebarOpen }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} toggleSidebar={toggleSidebar} />
      <Sidebar open={sidebarOpen} />
      <Box
        component="main"
        sx={{
          flexGrow: 1, p: 1, mt: 4,
          ml: sidebarOpen ? '200px' : '0px',
          transition: 'margin-left 0.3s ease-in-out',
          backgroundColor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analysis" element={<PostureAnalysis />} />
          <Route path="/risk" element={<RiskAssessment />} />
          <Route path="/rehabilitation" element={<Rehabilitation />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Box>
    </Box>
  );
};

const AppContent = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const theme = buildTheme(darkMode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <ProtectedLayout
                darkMode={darkMode}
                toggleDarkMode={() => setDarkMode(d => !d)}
                toggleSidebar={() => setSidebarOpen(s => !s)}
                sidebarOpen={sidebarOpen}
              />
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
