import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ColorModeIconDropdown from '../../../shared-theme/ColorModeIconDropdown';

export default function CheckoutHeader({ 
  fromDashboard, 
  dashboardType, 
  effectiveOrderItems, 
  effectiveOrderTotal 
}) {
  const navigate = useNavigate();

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
      <Box sx={{ position: 'fixed', top: '1rem', right: '1rem' }}>
        <ColorModeIconDropdown />
      </Box>
      <Box sx={{ position: 'fixed', top: '1rem', left: '1rem' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={handleBack}
          sx={{ fontWeight: 'medium' }}
        >
          {fromDashboard ? 'Back to Dashboard' : 'Back to Kiosk'}
        </Button>
      </Box>
    </>
  );
}

