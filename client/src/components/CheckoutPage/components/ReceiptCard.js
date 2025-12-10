import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { TAX_RATE } from '../constants';

export default function ReceiptCard({ receiptItems, receiptSubtotal, receiptExtras }) {
  const receiptTax = receiptSubtotal * TAX_RATE;
  const receiptTotal = receiptSubtotal + receiptTax;

  if (receiptItems.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mt: 1 }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Receipt
        </Typography>
        {receiptItems.map((item, index) => (
          <Box
            key={`${item.id}-${index}`}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: 0.5,
            }}
          >
            <Typography variant="body2">{item.name}</Typography>
            <Typography variant="body2">
              ${item.price.toFixed(2)}
            </Typography>
          </Box>
        ))}
        {receiptExtras && (
          <Box sx={{ mt: 1 }}>
            {receiptExtras.bag > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 0.5,
                }}
              >
                <Typography variant="body2">Bag</Typography>
                <Typography variant="body2">x{receiptExtras.bag}</Typography>
              </Box>
            )}
            {receiptExtras.cupHolder > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 0.5,
                }}
              >
                <Typography variant="body2">Cup holder</Typography>
                <Typography variant="body2">x{receiptExtras.cupHolder}</Typography>
              </Box>
            )}
            {receiptExtras.extraStraws > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 0.5,
                }}
              >
                <Typography variant="body2">Extra straws</Typography>
                <Typography variant="body2">x{receiptExtras.extraStraws}</Typography>
              </Box>
            )}
            {receiptExtras.napkins > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 0.5,
                }}
              >
                <Typography variant="body2">Napkins</Typography>
                <Typography variant="body2">x{receiptExtras.napkins}</Typography>
              </Box>
            )}
          </Box>
        )}
        <Box
          sx={{
            mt: 1,
            pt: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: 0.5,
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Subtotal
            </Typography>
            <Typography variant="body2">
              ${receiptSubtotal.toFixed(2)}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: 0.5,
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Tax ({(TAX_RATE * 100).toFixed(2)}%)
            </Typography>
            <Typography variant="body2">
              ${receiptTax.toFixed(2)}
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 0.5,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              Total
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              ${receiptTotal.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

