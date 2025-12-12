import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const SCALE_LEVELS = [1, 1.25, 1.5, 1.75, 2];
const DEFAULT_ACTIVE_INDEX = 1; // 125%

const EN_TEXTS = {
  title: 'Screen magnifier',
  tooltipTitle: 'Screen magnifier',
  magnifierOn: 'Magnifier on',
  magnifierOff: 'Magnifier off',
  description: 'Applies scaled view across the selected interface',
  ariaDecreaseZoom: 'Decrease zoom',
  ariaResetZoom: 'Reset zoom',
  ariaIncreaseZoom: 'Increase zoom',
  ariaToggleMagnifier: 'Toggle screen magnifier',
  ariaOpenControls: 'Open screen magnifier controls',
};

function getInitialLanguage() {
  try {
    return localStorage.getItem('language') || 'EN';
  } catch (e) {
    return 'EN';
  }
}

function ScreenMagnifier() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [scaleIndex, setScaleIndex] = useState(0);
  const [language, setLanguage] = useState(getInitialLanguage);
  const translationsRef = useRef({});
  const [texts, setTexts] = useState(EN_TEXTS);

  const isEnabled = scaleIndex > 0;
  const currentScale = useMemo(() => SCALE_LEVELS[scaleIndex], [scaleIndex]);

  useEffect(() => {
    translationsRef.current = {};
  }, [language]);

  const translate = useCallback(
    async (text) => {
      if (language === 'EN' || !text) return text;
      if (translationsRef.current[text]) return translationsRef.current[text];

      try {
        const response = await fetch(`${API_BASE_URL}/api/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetLang: language }),
        });
        const data = await response.json();
        const translated = data.translatedText || text;
        translationsRef.current[text] = translated;
        return translated;
      } catch (err) {
        return text;
      }
    },
    [language],
  );

  // Keep in sync with language selector (same-tab + cross-tab)
  useEffect(() => {
    const handleStorage = (e) => {
      if (e?.key !== 'language') return;
      setLanguage(e.newValue || 'EN');
    };
    const handleAppLanguageChanged = (e) => {
      const next = e?.detail;
      if (!next) return;
      setLanguage(String(next));
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('app-language-changed', handleAppLanguageChanged);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('app-language-changed', handleAppLanguageChanged);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const updateTexts = async () => {
      if (language === 'EN') {
        if (!cancelled) setTexts(EN_TEXTS);
        return;
      }

      const translated = {};
      for (const [key, value] of Object.entries(EN_TEXTS)) {
        translated[key] = await translate(value);
      }
      if (!cancelled) setTexts(translated);
    };

    updateTexts();

    return () => {
      cancelled = true;
    };
  }, [language, translate]);

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
                {texts.title}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {Math.round(currentScale * 100)}%
              </Typography>
            </Box>

            <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
              <IconButton
                aria-label={texts.ariaDecreaseZoom}
                onClick={decreaseScale}
                disabled={!isEnabled}
                size="small"
              >
                <RemoveIcon />
              </IconButton>
              <IconButton
                aria-label={texts.ariaResetZoom}
                onClick={resetScale}
                disabled={!isEnabled}
                size="small"
              >
                <RestartAltIcon />
              </IconButton>
              <IconButton
                aria-label={texts.ariaIncreaseZoom}
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
                  {isEnabled ? texts.magnifierOn : texts.magnifierOff}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {texts.description}
                </Typography>
              </Box>
              <Switch
                checked={isEnabled}
                onChange={toggleEnable}
                inputProps={{ 'aria-label': texts.ariaToggleMagnifier }}
                color="primary"
              />
            </Stack>
          </Stack>
        </Paper>
      </Collapse>

      <Tooltip title={texts.tooltipTitle} placement="left">
        <Fab
          aria-label={texts.ariaOpenControls}
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
