import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useColorScheme } from '@mui/material/styles';

// High contrast theme configuration
const highContrastTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      light: '#0000FF',
      main: '#0000FF',
      dark: '#0000CC',
      contrastText: '#FFFFFF',
    },
    secondary: {
      light: '#0066CC',
      main: '#0066CC',
      dark: '#004499',
      contrastText: '#FFFFFF',
    },
    info: {
      light: '#0066CC',
      main: '#0066CC',
      dark: '#004499',
      contrastText: '#FFFFFF',
    },
    warning: {
      light: '#FFCC00',
      main: '#FFAA00',
      dark: '#FF8800',
      contrastText: '#000000',
    },
    error: {
      light: '#FF0000',
      main: '#CC0000',
      dark: '#990000',
      contrastText: '#FFFFFF',
    },
    success: {
      light: '#00CC00',
      main: '#009900',
      dark: '#006600',
      contrastText: '#FFFFFF',
    },
    grey: {
      50: '#FFFFFF',
      100: '#F5F5F5',
      200: '#E0E0E0',
      300: '#BDBDBD',
      400: '#9E9E9E',
      500: '#757575',
      600: '#616161',
      700: '#424242',
      800: '#212121',
      900: '#000000',
    },
    divider: '#000000',
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000',
      secondary: '#000000',
      disabled: '#757575',
    },
    action: {
      active: '#000000',
      hover: 'rgba(0, 0, 0, 0.15)',
      selected: 'rgba(0, 0, 0, 0.2)',
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
});

export function HighContrastWrapper({ children, originalTheme }) {
  const { mode } = useColorScheme() || {};
  
  // Use high contrast theme when mode is 'highContrast', otherwise use original theme
  const activeTheme = mode === 'highContrast' ? highContrastTheme : originalTheme;
  
  return (
    <ThemeProvider theme={activeTheme}>
      {children}
    </ThemeProvider>
  );
}
