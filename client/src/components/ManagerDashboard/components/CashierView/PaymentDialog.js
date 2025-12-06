import React from 'react';
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

const PaymentDialog = ({ open, onClose, totalAmount, onPaymentSubmit, formatPrice }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle>Payment Method</DialogTitle>
      <DialogContent>
        <Typography>
          Select payment method for {formatPrice(totalAmount)}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => onPaymentSubmit('Cash')}
          variant="contained"
        >
          Cash
        </Button>
        <Button
          onClick={() => onPaymentSubmit('Card')}
          variant="contained"
        >
          Card
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentDialog;
