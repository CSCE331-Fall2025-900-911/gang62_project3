import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ColorModeIconDropdown from '../../../shared-theme/ColorModeIconDropdown';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';

const languages = [
  { code: 'EN', name: 'English' },
  { code: 'ES', name: 'Español' },
  { code: 'FR', name: 'Français' },
  { code: 'DE', name: 'Deutsch' },
  { code: 'IT', name: 'Italiano' },
  { code: 'PT', name: 'Português' },
  { code: 'JA', name: '日本語' },
  { code: 'ZH', name: '中文' },
];

export default function CheckoutHeader({ 
  fromDashboard, 
  dashboardType, 
  effectiveOrderItems, 
  effectiveOrderTotal,
  language,
  setLanguage,
  translate,
}) {
  const navigate = useNavigate();

  const [backText, setBackText] = React.useState(
    fromDashboard ? 'Back to Dashboard' : 'Back to Kiosk'
  );
  const [languageLabel, setLanguageLabel] = React.useState('Language');

  React.useEffect(() => {
    const updateBackText = async () => {
      const base = fromDashboard ? 'Back to Dashboard' : 'Back to Kiosk';
      if (!translate) {
        setBackText(base);
        return;
      }
      setBackText(await translate(base));
    };

    updateBackText();
  }, [fromDashboard, translate]);

  React.useEffect(() => {
    const updateLanguageLabel = async () => {
      const base = 'Language';
      if (!translate) {
        setLanguageLabel(base);
        return;
      }
      setLanguageLabel(await translate(base));
    };
    updateLanguageLabel();
  }, [translate]);

  const handleBack = () => {
    if (fromDashboard && dashboardType) {
      const dashboardPath = dashboardType === 'cashier' ? '/cashier' : '/manager';
      navigate(dashboardPath, { 
        state: { 
          activePage: 'Kiosk', 
          cartOpen: false,
          orderItems: effectiveOrderItems,
          orderTotal: effectiveOrderTotal
        } 
      });
    } else {
      navigate('/kiosk');
    }
  };

  return (
    <>
      <Box sx={{ position: 'fixed', top: '1rem', right: '1rem', display: 'flex', gap: 2 }}>
        <ColorModeIconDropdown translate={translate} />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id="checkout-language-label">{languageLabel}</InputLabel>
          <Select
            labelId="checkout-language-label"
            id="checkout-language-select"
            value={language}
            label={languageLabel}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {languages.map((lang) => (
              <MenuItem key={lang.code} value={lang.code}>
                {lang.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ position: 'fixed', top: '1rem', left: '1rem' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={handleBack}
          sx={{ fontWeight: 'medium' }}
        >
          {backText}
        </Button>
      </Box>
    </>
  );
}

