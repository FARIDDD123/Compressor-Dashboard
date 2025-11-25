/**
 * Industrial Theme - Inspired by Turbin Generator Dashboard
 * Green-Black Professional Theme for Gas Turbine Monitoring
 */

import { createTheme } from '@mui/material/styles';

export const industrialTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8BC34A', // Light Green
      dark: '#689F38',
      light: '#9CCC65',
      contrastText: '#000000',
    },
    secondary: {
      main: '#CDDC39', // Lime
      dark: '#AFB42B',
      light: '#DCE775',
    },
    background: {
      default: '#000000',
      paper: '#1a1a1a',
      sidebar: '#7CB342', // Green Sidebar
      sidebarHover: '#689F38',
      sidebarActive: '#558B2F',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0BEC5',
      disabled: '#616161',
    },
    error: {
      main: '#F44336',
    },
    warning: {
      main: '#FF9800',
    },
    info: {
      main: '#2196F3',
    },
    success: {
      main: '#4CAF50',
    },
    gauge: {
      background: '#1a1a1a',
      border: '#4CAF50',
      needle: '#FF5722',
      text: '#FFFFFF',
      scale: '#8BC34A',
    },
    chart: {
      grid: '#333333',
      line1: '#8BC34A',
      line2: '#FF5722',
      line3: '#2196F3',
      line4: '#FFEB3B',
      area: 'rgba(139, 195, 74, 0.2)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#8BC34A',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#8BC34A',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#FFFFFF',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#FFFFFF',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#FFFFFF',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#8BC34A',
    },
    body1: {
      fontSize: '0.95rem',
      color: '#FFFFFF',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#B0BEC5',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#7CB342',
          color: '#FFFFFF',
          borderRight: '2px solid #558B2F',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#689F38',
          },
          '&.Mui-selected': {
            backgroundColor: '#558B2F',
            '&:hover': {
              backgroundColor: '#558B2F',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1a1a1a',
          border: '1px solid #333333',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          border: '1px solid #4CAF50',
          borderRadius: '8px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
        },
        contained: {
          backgroundColor: '#8BC34A',
          color: '#000000',
          '&:hover': {
            backgroundColor: '#689F38',
          },
        },
        outlined: {
          borderColor: '#8BC34A',
          color: '#8BC34A',
          '&:hover': {
            borderColor: '#689F38',
            backgroundColor: 'rgba(139, 195, 74, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#4CAF50',
            },
            '&:hover fieldset': {
              borderColor: '#8BC34A',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#8BC34A',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1a1a',
          borderBottom: '2px solid #8BC34A',
        },
      },
    },
  },
  shape: {
    borderRadius: 4,
  },
  spacing: 8,
});

export default industrialTheme;

