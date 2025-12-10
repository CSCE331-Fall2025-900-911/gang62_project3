import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Fab from '@mui/material/Fab';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

const SCALE_LEVELS = [1, 1.25, 1.5, 1.75, 2];
const DEFAULT_ACTIVE_INDEX = 1; // 125%

function ScreenMagnifier() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [scaleIndex, setScaleIndex] = useState(0);

  const isEnabled = scaleIndex > 0;
  const currentScale = useMemo(() => SCALE_LEVELS[scaleIndex], [scaleIndex]);

  useEffect(() => {
    const appliedScale = isEnabled ? currentScale : 1;
    document.documentElement.style.setProperty('--screen-magnifier-scale', String(appliedScale));
    document.body.classList.toggle('screen-magnifier-active', isEnabled && appliedScale > 1);

    return () => {
      document.documentElement.style.removeProperty('--screen-magnifier-scale');
      document.body.classList.remove('screen-magnifier-active');
    };
  }, [currentScale, isEnabled]);

  const toggleEnable = () => {
    setScaleIndex((prev) => (prev > 0 ? 0 : Math.max(prev, DEFAULT_ACTIVE_INDEX)));
  };

  const increaseScale = () => {
    setScaleIndex((prev) => {
      if (prev === 0) return DEFAULT_ACTIVE_INDEX;
      return Math.min(prev + 1, SCALE_LEVELS.length - 1);
    });
  };

  const decreaseScale = () => {
    setScaleIndex((prev) => {
      if (prev <= DEFAULT_ACTIVE_INDEX) return 0;
      return Math.max(DEFAULT_ACTIVE_INDEX, prev - 1);
    });
  };

  const resetScale = () => setScaleIndex(0);

  const handleFabClick = () => {
    setPanelOpen((prev) => {
      const nextState = !prev;
      if (nextState && scaleIndex === 0) {
        setScaleIndex(DEFAULT_ACTIVE_INDEX);
      }
      return nextState;
    });
  };
  const magnifierUi = (
    <Box
      sx={{
        position: 'fixed',
        right: { xs: 16, sm: 24 },
        bottom: { xs: 16, sm: 24 },
        zIndex: 1400,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        alignItems: 'flex-end'
      }}
    >
      <Collapse in={panelOpen} orientation="vertical">
        <Paper
          elevation={6}
          sx={{
            width: 280,
            p: 2,
            borderRadius: 2,
            backdropFilter: 'blur(8px)'
          }}
        >
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Screen magnifier
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {Math.round(currentScale * 100)}%
              </Typography>
            </Box>

            <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
              <IconButton
                aria-label="Decrease zoom"
                onClick={decreaseScale}
                disabled={!isEnabled}
                size="small"
              >
                <RemoveIcon />
              </IconButton>
              <IconButton
                aria-label="Reset zoom"
                onClick={resetScale}
                disabled={!isEnabled}
                size="small"
              >
                <RestartAltIcon />
              </IconButton>
              <IconButton
                aria-label="Increase zoom"
                onClick={increaseScale}
                size="small"
              >
                <AddIcon />
              </IconButton>
            </Stack>

            <Divider />

            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Magnifier {isEnabled ? 'on' : 'off'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Applies scaled view across the selected interface
                </Typography>
              </Box>
              <Switch
                checked={isEnabled}
                onChange={toggleEnable}
                inputProps={{ 'aria-label': 'Toggle screen magnifier' }}
                color="primary"
              />
            </Stack>
          </Stack>
        </Paper>
      </Collapse>

      <Tooltip title="Screen magnifier" placement="left">
        <Fab
          aria-label="Open screen magnifier controls"
          onClick={handleFabClick}
          sx={{
            bgcolor: '#1976d2',
            color: '#fff',
            '&:hover': { bgcolor: '#115293' }
          }}
        >
          <ZoomInIcon />
        </Fab>
      </Tooltip>
    </Box>
  );

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(magnifierUi, document.body);
}

export default ScreenMagnifier;
