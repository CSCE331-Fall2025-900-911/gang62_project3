import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import MuiCard from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import SimCardRoundedIcon from '@mui/icons-material/SimCardRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';

const Card = styled(MuiCard)(({ theme }) => ({
  border: '1px solid',
  borderColor: (theme.vars || theme).palette.divider,
  width: '100%',
  '&:hover': {
    background:
      'linear-gradient(to bottom right, hsla(210, 100%, 97%, 0.5) 25%, hsla(210, 100%, 90%, 0.3) 100%)',
    borderColor: 'primary.light',
    boxShadow: '0px 2px 8px hsla(0, 0%, 0%, 0.1)',
    ...theme.applyStyles('dark', {
      background:
        'linear-gradient(to right bottom, hsla(210, 100%, 12%, 0.2) 25%, hsla(210, 100%, 16%, 0.2) 100%)',
      borderColor: 'primary.dark',
      boxShadow: '0px 1px 8px hsla(210, 100%, 25%, 0.5) ',
    }),
  },
  [theme.breakpoints.up('md')]: {
    flexGrow: 1,
    maxWidth: `calc(50% - ${theme.spacing(1)})`,
  },
  variants: [
    {
      props: ({ selected }) => selected,
      style: {
        borderColor: (theme.vars || theme).palette.primary.light,
        ...theme.applyStyles('dark', {
          borderColor: (theme.vars || theme).palette.primary.dark,
        }),
      },
    },
  ],
}));

const PaymentContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  width: '100%',
  height: 375,
  padding: theme.spacing(3),
  borderRadius: `calc(${theme.shape.borderRadius}px + 4px)`,
  border: '1px solid ',
  borderColor: (theme.vars || theme).palette.divider,
  background:
    'linear-gradient(to bottom right, hsla(220, 35%, 97%, 0.3) 25%, hsla(220, 20%, 88%, 0.3) 100%)',
  boxShadow: '0px 4px 8px hsla(210, 0%, 0%, 0.05)',
  [theme.breakpoints.up('xs')]: {
    height: 300,
  },
  [theme.breakpoints.up('sm')]: {
    height: 350,
  },
  ...theme.applyStyles('dark', {
    background:
      'linear-gradient(to right bottom, hsla(220, 30%, 6%, 0.2) 25%, hsla(220, 20%, 25%, 0.2) 100%)',
    boxShadow: '0px 4px 8px hsl(220, 35%, 0%)',
  }),
}));

const FormGrid = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

const EN_TEXTS = {
  cardOptionLabel: 'Card',
  cryptoOptionLabel: 'Crypto wallet',
  creditCardHeading: 'Credit card',
  cardNumberLabel: 'Card number',
  cardNumberPlaceholder: '0000 0000 0000 0000',
  cvvLabel: 'CVV',
  cvvPlaceholder: '123',
  cardNameLabel: 'Name',
  cardNamePlaceholder: 'John Smith',
  expiryLabel: 'Expiration date',
  expiryPlaceholder: 'MM/YY',
  saveCardLabel: 'Remember credit card details for next time',
  warningText: 'Your order will be processed once we receive the crypto payment.',
  cryptoWalletHeading: 'Crypto wallet',
  cryptoDescription: 'Please send the payment to the crypto wallet address shown below.',
  networkLabel: 'Network:',
  networkValue: 'Ethereum (ERC-20)',
  walletAddressLabel: 'Wallet address:',
  acceptedTokensLabel: 'Accepted tokens:',
  acceptedTokensValue: 'ETH, USDT, USDC',
  ttsCreditSelected: 'Credit card selected',
  ttsCryptoSelected: 'Crypto wallet selected',
  ttsCardNumber: 'Enter card number',
  ttsCVV: 'Enter CVV',
  ttsCardName: 'Enter name on card',
  ttsExpiry: 'Enter expiration date',
};

export default function PaymentForm({
  paymentType,
  setPaymentType,
  cardNumber,
  setCardNumber,
  cvv,
  setCvv,
  expirationDate,
  setExpirationDate,
  cardName,
  setCardName,
  ttsEnabled,
  language = 'EN',
  translate,
}) {
  const [texts, setTexts] = React.useState(EN_TEXTS);

  React.useEffect(() => {
    let cancelled = false;

    const updateTexts = async () => {
      if (!translate || language === 'EN') {
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

  const speak = React.useCallback((text) => {
    if (ttsEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  }, [ttsEnabled]);

  const handlePaymentTypeChange = (event) => {
    setPaymentType(event.target.value);
    if (event.target.value === 'creditCard') speak(texts.ttsCreditSelected);
    else if (event.target.value === 'bankTransfer') speak(texts.ttsCryptoSelected);
  };

  const handleCardNumberChange = (event) => {
    const value = event.target.value.replace(/\D/g, '');
    const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    if (value.length <= 16) {
      setCardNumber(formattedValue);
    }
  };

  const handleCvvChange = (event) => {
    const value = event.target.value.replace(/\D/g, '');
    if (value.length <= 3) {
      setCvv(value);
    }
  };

  const handleExpirationDateChange = (event) => {
    const value = event.target.value.replace(/\D/g, '');
    const formattedValue = value.replace(/(\d{2})(?=\d{2})/, '$1/');
    if (value.length <= 4) {
      setExpirationDate(formattedValue);
    }
  };

  return (
    <Stack spacing={{ xs: 3, sm: 6 }} useFlexGap>
      <FormControl component="fieldset" fullWidth>
        <RadioGroup
          aria-label="Payment options"
          name="paymentType"
          value={paymentType}
          onChange={handlePaymentTypeChange}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}
        >
          <Card selected={paymentType === 'creditCard'}>
            <CardActionArea
              onClick={() => {
                setPaymentType('creditCard');
                speak(texts.ttsCreditSelected);
              }}
              sx={{
                '.MuiCardActionArea-focusHighlight': {
                  backgroundColor: 'transparent',
                },
                '&:focus-visible': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CreditCardRoundedIcon
                  fontSize="small"
                  sx={[
                    (theme) => ({
                      color: 'grey.400',
                      ...theme.applyStyles('dark', {
                        color: 'grey.600',
                      }),
                    }),
                    paymentType === 'creditCard' && {
                      color: 'primary.main',
                    },
                  ]}
                />
                <Typography sx={{ fontWeight: 'medium' }}>{texts.cardOptionLabel}</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
          <Card selected={paymentType === 'bankTransfer'}>
            <CardActionArea
              onClick={() => {
                setPaymentType('bankTransfer');
                speak(texts.ttsCryptoSelected);
              }}
              sx={{
                '.MuiCardActionArea-focusHighlight': {
                  backgroundColor: 'transparent',
                },
                '&:focus-visible': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccountBalanceWalletRoundedIcon
                  fontSize="small"
                  sx={[
                    (theme) => ({
                      color: 'grey.400',
                      ...theme.applyStyles('dark', {
                        color: 'grey.600',
                      }),
                    }),
                    paymentType === 'bankTransfer' && {
                      color: 'primary.main',
                    },
                  ]}
                />
                <Typography sx={{ fontWeight: 'medium' }}>{texts.cryptoOptionLabel}</Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </RadioGroup>
      </FormControl>
      {paymentType === 'creditCard' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <PaymentContainer>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="subtitle2">{texts.creditCardHeading}</Typography>
              <CreditCardRoundedIcon sx={{ color: 'text.secondary' }} />
            </Box>
            <SimCardRoundedIcon
              sx={{
                fontSize: { xs: 48, sm: 56 },
                transform: 'rotate(90deg)',
                color: 'text.secondary',
              }}
            />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                gap: 2,
              }}
            >
              <FormGrid sx={{ flexGrow: 1 }}>
                <FormLabel htmlFor="card-number" required>
                  {texts.cardNumberLabel}
                </FormLabel>
                <OutlinedInput
                  id="card-number"
                  autoComplete="card-number"
                  placeholder={texts.cardNumberPlaceholder}
                  required
                  size="small"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  onFocus={() => speak(texts.ttsCardNumber)}
                />
              </FormGrid>
              <FormGrid sx={{ maxWidth: '20%' }}>
                <FormLabel htmlFor="cvv" required>
                  {texts.cvvLabel}
                </FormLabel>
                <OutlinedInput
                  id="cvv"
                  autoComplete="CVV"
                  placeholder={texts.cvvPlaceholder}
                  required
                  size="small"
                  value={cvv}
                  onChange={handleCvvChange}
                  onFocus={() => speak(texts.ttsCVV)}
                />
              </FormGrid>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormGrid sx={{ flexGrow: 1 }}>
                <FormLabel htmlFor="card-name" required>
                  {texts.cardNameLabel}
                </FormLabel>
                <OutlinedInput
                  id="card-name"
                  autoComplete="card-name"
                  placeholder={texts.cardNamePlaceholder}
                  required
                  size="small"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  onFocus={() => speak(texts.ttsCardName)}
                />
              </FormGrid>
              <FormGrid sx={{ flexGrow: 1 }}>
                <FormLabel htmlFor="card-expiration" required>
                  {texts.expiryLabel}
                </FormLabel>
                <OutlinedInput
                  id="card-expiration"
                  autoComplete="card-expiration"
                  placeholder={texts.expiryPlaceholder}
                  required
                  size="small"
                  value={expirationDate}
                  onChange={handleExpirationDateChange}
                  onFocus={() => speak(texts.ttsExpiry)}
                />
              </FormGrid>
            </Box>
          </PaymentContainer>
          <FormControlLabel
            control={<Checkbox name="saveCard" />}
            label={texts.saveCardLabel}
          />
        </Box>
      )}
      {paymentType === 'bankTransfer' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Alert severity="warning" icon={<WarningRoundedIcon />}>
            {texts.warningText}
          </Alert>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
            {texts.cryptoWalletHeading}
          </Typography>
          <Typography variant="body1" gutterBottom>
            {texts.cryptoDescription}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {texts.networkLabel}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {texts.networkValue}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {texts.walletAddressLabel}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 'medium', 
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                bgcolor: 'background.paper',
                p: 1,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {texts.acceptedTokensLabel}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {texts.acceptedTokensValue}
            </Typography>
          </Box>
        </Box>
      )}
    </Stack>
  );
}
