import * as React from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useColorScheme } from '@mui/material/styles';

import { inputsCustomizations } from './customizations/inputs';
import { dataDisplayCustomizations } from './customizations/dataDisplay';
import { feedbackCustomizations } from './customizations/feedback';
import { navigationCustomizations } from './customizations/navigation';
import { surfacesCustomizations } from './customizations/surfaces';
import { colorSchemes, typography, shadows, shape } from './themePrimitives';

// High contrast theme configuration
const createHighContrastTheme = (components) => createTheme({
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
  typography,
  shadows,
  shape,
  components,
});

function AppTheme(props) {
  const { children, disableCustomTheme, themeComponents } = props;
  
  const theme = React.useMemo(() => {
    return disableCustomTheme
      ? {}
      : createTheme({
          // For more details about CSS variables configuration, see https://mui.com/material-ui/customization/css-theme-variables/configuration/
          cssVariables: {
            colorSchemeSelector: 'data-mui-color-scheme',
            cssVarPrefix: 'template',
          },
          colorSchemes, // Recently added in v6 for building light & dark mode app, see https://mui.com/material-ui/customization/palette/#color-schemes
          typography,
          shadows,
          shape,
          components: {
            ...inputsCustomizations,
            ...dataDisplayCustomizations,
            ...feedbackCustomizations,
            ...navigationCustomizations,
            ...surfacesCustomizations,
            ...themeComponents,
          },
        });
  }, [disableCustomTheme, themeComponents]);
  
  const highContrastTheme = React.useMemo(() => {
    return createHighContrastTheme({
      ...inputsCustomizations,
      ...dataDisplayCustomizations,
      ...feedbackCustomizations,
      ...navigationCustomizations,
      ...surfacesCustomizations,
      ...themeComponents,
    });
  }, [themeComponents]);
  
  if (disableCustomTheme) {
    return <React.Fragment>{children}</React.Fragment>;
  }
  
  return (
    <ThemeProvider theme={theme} disableTransitionOnChange>
      <HighContrastThemeOverride highContrastTheme={highContrastTheme}>
        {children}
      </HighContrastThemeOverride>
    </ThemeProvider>
  );
}

// Component to override theme when highContrast mode is selected
function HighContrastThemeOverride({ children, highContrastTheme }) {
  const { mode } = useColorScheme() || {};
  
  if (mode === 'highContrast') {
    return (
      <ThemeProvider theme={highContrastTheme}>
        {children}
      </ThemeProvider>
    );
  }
  
  return <React.Fragment>{children}</React.Fragment>;
}

AppTheme.propTypes = {
  children: PropTypes.node,
  /**
   * This is for the docs site. You can ignore it or remove it.
   */
  disableCustomTheme: PropTypes.bool,
  themeComponents: PropTypes.object,
};

export default AppTheme;
