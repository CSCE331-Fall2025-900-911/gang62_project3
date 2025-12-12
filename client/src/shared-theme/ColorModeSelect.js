import * as React from 'react';
import { useColorScheme } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

const BASE_MODE_LABELS = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
  highContrast: 'High Contrast',
};

export default function ColorModeSelect({ translate, ...props }) {
  const { mode, setMode } = useColorScheme();
  const [modeLabels, setModeLabels] = React.useState(BASE_MODE_LABELS);

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
    return null;
  }

  return (
    <Select
      value={mode}
      onChange={(event) => setMode(event.target.value)}
      SelectDisplayProps={{
        'data-screenshot': 'toggle-mode',
        'aria-label': 'Color mode',
      }}
      {...props}
    >
      <MenuItem value="system">{modeLabels.system}</MenuItem>
      <MenuItem value="light">{modeLabels.light}</MenuItem>
      <MenuItem value="dark">{modeLabels.dark}</MenuItem>
      <MenuItem value="highContrast">{modeLabels.highContrast}</MenuItem>
    </Select>
  );
}
