import React from 'react';
import { Box, Button } from '@mui/material';

// Minimal on-screen keyboard for accessibility purposes
export default function OnScreenKeyboard({ sx }) {
  const rows = [
    ['1','2','3','4','5','6','7','8','9','0'],
    ['q','w','e','r','t','y','u','i','o','p'],
    ['a','s','d','f','g','h','j','k','l'],
    ['z','x','c','v','b','n','m'],
  ];

  const sendToActiveInput = (key) => {
    const el = document.activeElement;
    if (!(el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'))) return;

    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    let newValue = el.value || '';

    if (key === 'Backspace') {
      if (start === end && start > 0) {
        newValue = newValue.slice(0, start - 1) + newValue.slice(end);
        el.value = newValue;
        el.setSelectionRange(start - 1, start - 1);
      } else {
        newValue = newValue.slice(0, start) + newValue.slice(end);
        el.value = newValue;
        el.setSelectionRange(start, start);
      }
    } else if (key === 'Space') {
      newValue = newValue.slice(0, start) + ' ' + newValue.slice(end);
      el.value = newValue;
      el.setSelectionRange(start + 1, start + 1);
    } else if (key === 'Clear') {
      el.value = '';
      el.setSelectionRange(0, 0);
    } else {
      // regular character
      newValue = newValue.slice(0, start) + key + newValue.slice(end);
      el.value = newValue;
      const caret = start + key.length;
      el.setSelectionRange(caret, caret);
    }

    // notify react
    const event = new Event('input', { bubbles: true });
    el.dispatchEvent(event);
    el.focus();
  };

  return (
    <Box
      role="group"
      aria-label="On-screen keyboard"
      sx={{
        display: 'grid',
        gap: 1,
        p: 1,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        boxShadow: 1,
        ...sx,
      }}
    >
      {rows.map((row, idx) => (
        <Box key={idx} sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          {row.map((k) => (
            <Button
              key={k}
              variant="outlined"
              size="small"
              onClick={() => sendToActiveInput(k)}
              aria-label={`Type ${k}`}
              sx={{ minWidth: 36 }}
            >
              {k}
            </Button>
          ))}
        </Box>
      ))}
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
        <Button variant="outlined" size="small" onClick={() => sendToActiveInput('Backspace')} aria-label="Backspace">
          ⌫
        </Button>
        <Button variant="outlined" size="small" onClick={() => sendToActiveInput('Space')} aria-label="Space">
          Space
        </Button>
        <Button variant="outlined" size="small" color="error" onClick={() => sendToActiveInput('Clear')} aria-label="Clear input">
          Clear
        </Button>
      </Box>
    </Box>
  );
}
