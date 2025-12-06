import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
} from '@mui/material';

const CheckoutPanel = ({ totalAmount, cartItemCount, onProcessPayment, onNewSale, formatPrice }) => {
  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h5" fontWeight="bold" sx={{paddingRight: 2}}>
            Total: {formatPrice(totalAmount)}
          </Typography>
          { totalAmount > 0 &&
            <Box sx={{ display: 'flex', gap: 2, width: '100%'}}>
                <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={onProcessPayment}
                >
                Process Payment
                </Button>
                <Button
                variant="outlined"
                size="large"
                onClick={onNewSale}
                disabled={cartItemCount === 0}
                >
                New Sale
                </Button>
            </Box>
            }
        </Box>
      </CardContent>
    </Card>
  );
};

export default CheckoutPanel;
