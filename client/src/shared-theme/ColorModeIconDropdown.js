import * as React from 'react';
import DarkModeIcon from '@mui/icons-material/DarkModeRounded';
import LightModeIcon from '@mui/icons-material/LightModeRounded';
import ContrastIcon from '@mui/icons-material/ContrastRounded';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useColorScheme } from '@mui/material/styles';

const BASE_MODE_LABELS = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
  highContrast: 'High Contrast',
};

export default function ColorModeIconDropdown({ translate, ...props }) {
  const { mode, systemMode, setMode } = useColorScheme();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [modeLabels, setModeLabels] = React.useState(BASE_MODE_LABELS);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleMode = (targetMode) => () => {
    setMode(targetMode);
    handleClose();
  };

  React.useEffect(() => {
    let cancelled = false;
    const updateLabels = async () => {
      if (!translate) {
        setModeLabels(BASE_MODE_LABELS);
        return;
      }
      const next = {};
      for (const [key, value] of Object.entries(BASE_MODE_LABELS)) {
        next[key] = await translate(value);
      }
      if (!cancelled) setModeLabels(next);
    };
    updateLabels();
    return () => {
      cancelled = true;
    };
  }, [translate]);

  if (!mode) {
    return (
      <Box
        data-screenshot="toggle-mode"
        sx={(theme) => ({
          verticalAlign: 'bottom',
          display: 'inline-flex',
          width: '2.25rem',
          height: '2.25rem',
          borderRadius: (theme.vars || theme).shape.borderRadius,
          border: '1px solid',
          borderColor: (theme.vars || theme).palette.divider,
        })}
      />
    );
  }

  const resolvedMode = systemMode || mode;
  const icon = {
    light: <LightModeIcon />,
    dark: <DarkModeIcon />,
    highContrast: <ContrastIcon />,
  }[resolvedMode];
  return (
    <React.Fragment>
      <IconButton
        data-screenshot="toggle-mode"
        onClick={handleClick}
        disableRipple
        size="small"
        aria-label="Toggle color mode"
        aria-controls={open ? 'color-scheme-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        {...props}
      >
        {icon}
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            variant: 'outlined',
            elevation: 0,
            sx: {
              my: '4px',
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem selected={mode === 'system'} onClick={handleMode('system')}>
          {modeLabels.system}
        </MenuItem>
        <MenuItem selected={mode === 'light'} onClick={handleMode('light')}>
          {modeLabels.light}
        </MenuItem>
        <MenuItem selected={mode === 'dark'} onClick={handleMode('dark')}>
          {modeLabels.dark}
        </MenuItem>
        <MenuItem selected={mode === 'highContrast'} onClick={handleMode('highContrast')}>
          {modeLabels.highContrast}
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
