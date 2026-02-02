import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import PostureAnalysis from './pages/PostureAnalysis';
import RiskAssessment from './pages/RiskAssessment';
import Rehabilitation from './pages/Rehabilitation';
import Settings from './pages/Settings';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#4F46E5', // Indigo
        light: '#6366F1',
        dark: '#3730A3',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#10B981', // Emerald
        light: '#34D399',
        dark: '#059669',
        contrastText: '#FFFFFF',
      },
      background: {
        default: darkMode ? '#0F172A' : '#F8FAFC',
        paper: darkMode ? '#1E293B' : '#FFFFFF',
      },
      text: {
        primary: darkMode ? '#F1F5F9' : '#0F172A',
        secondary: darkMode ? '#94A3B8' : '#64748B',
      },
      success: {
        main: '#10B981',
        light: '#34D399',
        dark: '#059669',
      },
      warning: {
        main: '#F59E0B',
        light: '#FBBF24',
        dark: '#D97706',
      },
      error: {
        main: '#EF4444',
        light: '#F87171',
        dark: '#DC2626',
      },
      info: {
        main: '#3B82F6',
        light: '#60A5FA',
        dark: '#2563EB',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
        lineHeight: 1.2,
        color: darkMode ? '#F1F5F9' : '#0F172A',
      },
      h4: {
        fontWeight: 600,
        fontSize: '1.5rem',
        lineHeight: 1.3,
        color: darkMode ? '#F1F5F9' : '#0F172A',
      },
      h6: {
        fontWeight: 600,
        fontSize: '1.125rem',
        lineHeight: 1.4,
      },
      body1: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
        fontWeight: 400,
      },
      body2: {
        fontSize: '0.75rem',
        lineHeight: 1.4,
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            background: darkMode 
              ? '#1E293B'
              : '#FFFFFF',
            border: darkMode 
              ? '1px solid #334155'
              : '1px solid #E2E8F0',
            boxShadow: darkMode
              ? '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)'
              : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: darkMode
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
            padding: '8px 16px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          contained: {
            '&:hover': {
              transform: 'translateY(-1px)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode ? '#1E293B' : '#FFFFFF',
            color: darkMode ? '#F1F5F9' : '#0F172A',
            boxShadow: darkMode
              ? '0 1px 3px 0 rgba(0, 0, 0, 0.3)'
              : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            borderBottom: darkMode 
              ? '1px solid #334155'
              : '1px solid #E2E8F0',
            height: 44, // Minimal height
          },
        },
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            minHeight: '44px !important', // Minimal height
            paddingLeft: '16px !important',
            paddingRight: '16px !important',
            '@media (min-width:600px)': {
              minHeight: '44px !important',
              paddingLeft: '16px !important',
              paddingRight: '16px !important',
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: darkMode ? '#1E293B' : '#FFFFFF',
            borderRight: darkMode 
              ? '1px solid #334155'
              : '1px solid #E2E8F0',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            fontWeight: 500,
            fontSize: '0.75rem',
          },
        },
      },
    },
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex' }}>
          <Navbar 
            darkMode={darkMode} 
            toggleDarkMode={toggleDarkMode}
            toggleSidebar={toggleSidebar}
          />
          <Sidebar open={sidebarOpen} />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 1, // Minimal padding for tighter layout
              mt: 4, // Minimal margin-top to 4 (32px)
              ml: sidebarOpen ? '200px' : '0px', // Reduced from 260px to 200px
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
      </Router>
    </ThemeProvider>
  );
};

export default App;