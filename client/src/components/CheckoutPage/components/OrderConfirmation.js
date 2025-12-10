import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ReceiptCard from './ReceiptCard';

export default function OrderConfirmation({ 
  receiptItems, 
  receiptSubtotal, 
  receiptExtras,
  fromDashboard,
  dashboardType,
}) {
  const navigate = useNavigate();

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
      <Typography variant="h5">Thank you for your order!</Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        Your drinks are being prepared. Please watch the screen or listen
        for your name when your order is ready for pickup.
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
        Start a new order
      </Button>
    </Stack>
  );
}

