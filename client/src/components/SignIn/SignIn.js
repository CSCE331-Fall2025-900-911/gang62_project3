import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import { useNavigate } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';
import AppTheme from '../../shared-theme/AppTheme';
import ColorModeSelect from '../../shared-theme/ColorModeSelect';
import { GoogleIcon } from './CustomIcons';
import OnScreenKeyboard from './OnScreenKeyboard';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  overflowY: 'auto',
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage:
      'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage:
        'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

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

const EN_TRANSLATIONS = {
  signInTitle: 'Sign in',
  usernameLabel: 'Username',
  passwordLabel: 'Password',
  signInButton: 'Sign in',
  toggleKeyboardShow: 'Show on-screen keyboard',
  toggleKeyboardHide: 'Hide on-screen keyboard',
  or: 'or',
  signInWithGoogle: 'Sign in with Google',
  continueAsGuest: 'Continue as guest',
  usernameRequired: 'Please enter a username.',
  passwordTooShort: 'Password must be at least 5 characters long.',
  invalidCredentials: 'Invalid username or password',
};

export default function SignIn({ onLogin, ...props }) {
  const navigate = useNavigate();
  const [usernameError, setUsernameError] = React.useState(false);
  const [usernameErrorMessage, setUsernameErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [showKeyboard, setShowKeyboard] = React.useState(false);
  const [language, setLanguage] = React.useState('EN');
  const translationsRef = React.useRef({});
  const [translatedTexts, setTranslatedTexts] = React.useState(EN_TRANSLATIONS);

  React.useEffect(() => {
    translationsRef.current = {};
  }, [language]);

  const translate = React.useCallback(
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
    [language]
  );

  React.useEffect(() => {
    const updateTranslations = async () => {
      if (language === 'EN') {
        setTranslatedTexts(EN_TRANSLATIONS);
        return;
      }

      const texts = { ...EN_TRANSLATIONS };
      const translated = {};
      for (const [key, value] of Object.entries(texts)) {
        translated[key] = await translate(value);
      }
      setTranslatedTexts(translated);
    };

    updateTranslations();
  }, [language, translate]);


  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    
    if (usernameError || passwordError) {
      return;
    }
    
    const data = new FormData(event.currentTarget);
    const username = data.get('username');
    const password = data.get('password');
    
    // local test credentials for different roles (non-OAuth).
    if (username === 'customer' && password === 'customer') {
      console.log('Login successful');
      if (onLogin) {
        onLogin({
          displayName: 'Customer Account',
          email: 'customer@example.com',
          photo: null,
          role: 'customer',
          isAdmin: false,
        });
      }
      navigate('/kiosk');
    } else if (username === 'admin' && password === 'admin') {
      console.log('Login successful');
      try {
        localStorage.setItem('token', 'local-admin-token');
      } catch (e) {
        console.warn('Failed to set local token', e);
      }
      if (onLogin) {
        onLogin({
          displayName: 'Admin Account',
          email: 'admin@example.com',
          photo: '/static/images/avatar/7.jpg',
          role: 'admin',
          isAdmin: true,
        });
      }
      navigate('/manager');
    } else if (username === 'cashier' && password === 'cashier') {
      console.log('Login successful');
      if (onLogin) {
        onLogin({
          displayName: 'Cashier Account',
          email: 'cashier@example.com',
          photo: null,
          role: 'cashier',
          isAdmin: false,
        });
      }
      navigate('/cashier');
    } else {
      setUsernameError(true);
      setUsernameErrorMessage(translatedTexts.invalidCredentials);
      setPasswordError(true);
      setPasswordErrorMessage(translatedTexts.invalidCredentials);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  const validateInputs = () => {
    const username = document.getElementById('username');
    const password = document.getElementById('password');

    let isValid = true;

    if (!username.value) {
      setUsernameError(true);
      setUsernameErrorMessage(translatedTexts.usernameRequired);
      isValid = false;
    } else {
      setUsernameError(false);
      setUsernameErrorMessage('');
    }

    if (!password.value || password.value.length < 5) {
      setPasswordError(true);
      setPasswordErrorMessage(translatedTexts.passwordTooShort);
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <SignInContainer
        direction="column"
        justifyContent="space-between"
        component="main"
        role="main"
        aria-labelledby="sign-in-heading"
      >
        <ColorModeSelect
          sx={{ position: 'fixed', top: '1rem', right: '1rem' }}
          aria-label="Color mode"
        />
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            id="sign-in-heading"
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            {translatedTexts.signInTitle}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              mt: 1,
              mb: 1,
            }}
          >
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="language-select-label">Language</InputLabel>
              <Select
                id="language-select"
                labelId="language-select-label"
                value={language}
                label="Language"
                onChange={(e) => setLanguage(e.target.value)}
                aria-label="Language"
              >
                {languages.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="username">{translatedTexts.usernameLabel}</FormLabel>
              <TextField
                error={usernameError}
                helperText={usernameErrorMessage}
                id="username"
                type="text"
                name="username"
                placeholder="username"
                autoComplete="username"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={usernameError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">{translatedTexts.passwordLabel}</FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="current-password"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={passwordError ? 'error' : 'primary'}
              />
            </FormControl>
            <ForgotPassword open={open} handleClose={handleClose} />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              onClick={validateInputs}
            >
              {translatedTexts.signInButton}
            </Button>
            <Button
              variant={showKeyboard ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setShowKeyboard((v) => !v)}
              aria-pressed={showKeyboard}
              aria-label="Toggle on-screen keyboard"
            >
              {showKeyboard
                ? translatedTexts.toggleKeyboardHide
                : translatedTexts.toggleKeyboardShow}
            </Button>
            </Box>
          {showKeyboard && (
            <Box sx={{ mt: 2, width: '100%' }}>
              <OnScreenKeyboard sx={{ width: '100%' }} />
            </Box>
          )}
          <Divider>{translatedTexts.or}</Divider>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleSignIn}
              startIcon={<GoogleIcon />}
            >
              {translatedTexts.signInWithGoogle}
            </Button>
      
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/kiosk')}
            >
              {translatedTexts.continueAsGuest}
            </Button>
          </Box>
        </Card>
      </SignInContainer>
    </AppTheme>
  );
}
