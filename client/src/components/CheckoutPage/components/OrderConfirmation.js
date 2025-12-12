import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ReceiptCard from './ReceiptCard';

const EN_TEXTS = {
  thankYouTitle: 'Thank you for your order!',
  preparingText:
    'Your drinks are being prepared. Please watch the screen or listen for your name when your order is ready for pickup.',
  newOrderButton: 'Start a new order',
};

export default function OrderConfirmation({ 
  receiptItems, 
  receiptSubtotal, 
  receiptExtras,
  fromDashboard,
  dashboardType,
  language = 'EN',
  translate,
}) {
  const navigate = useNavigate();
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

  const handleNewOrder = () => {
    if (fromDashboard && dashboardType) {
      const dashboardPath = dashboardType === 'cashier' ? '/cashier' : '/manager';
      navigate(dashboardPath, { 
        state: { 
          activePage: 'Kiosk', 
          cartOpen: false 
        } 
      });
    } else {
      navigate('/kiosk');
    }
  };

  return (
    <Stack spacing={2} useFlexGap>
      <Typography variant="h1">🧋</Typography>
      <Typography variant="h5">{texts.thankYouTitle}</Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        {texts.preparingText}
      </Typography>
      <ReceiptCard 
        receiptItems={receiptItems}
        receiptSubtotal={receiptSubtotal}
        receiptExtras={receiptExtras}
      />
      <Button
        variant="contained"
        sx={{ alignSelf: 'start', width: { xs: '100%', sm: 'auto' } }}
        onClick={handleNewOrder}
      >
        {texts.newOrderButton}
      </Button>
    </Stack>
  );
}

