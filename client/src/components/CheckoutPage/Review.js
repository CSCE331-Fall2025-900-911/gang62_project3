import * as React from 'react';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

export default function Review({ 
  orderItems = [], 
  orderTotal = 0,
  firstName = '',
  lastName = '',
  phoneNumber = '',
  paymentType = 'creditCard',
  cardNumber = '',
  cardName = '',
  expirationDate = '',
  extras,
  setExtras,
}) {
  const TAX_RATE = 0.0825; // 8.25% tax rate
  const subtotal = orderTotal;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  
  // Format card number to show last 4 digits
  const maskedCardNumber = cardNumber ? `xxxx-xxxx-xxxx-${cardNumber.replace(/\s/g, '').slice(-4)}` : 'Not provided';
  const fullName = `${firstName} ${lastName}`.trim() || 'Not provided';
  
  const payments = [
    { name: 'Payment type:', detail: paymentType === 'creditCard' ? 'Credit Card' : 'Crypto Wallet' },
    ...(paymentType === 'creditCard' ? [
      { name: 'Card holder:', detail: cardName || 'Not provided' },
      { name: 'Card number:', detail: maskedCardNumber },
      { name: 'Expiry date:', detail: expirationDate || 'Not provided' },
    ] : [
      { name: 'Wallet:', detail: '0x742d...0bEb8' },
      { name: 'Network:', detail: 'Ethereum (ERC-20)' },
    ])
  ];

  return (
    <Stack spacing={2}>
      <List disablePadding>
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText 
            primary="Products" 
            secondary={`${orderItems.length} ${orderItems.length === 1 ? 'item' : 'items'} selected`} 
          />
          <Typography variant="body2">${subtotal.toFixed(2)}</Typography>
        </ListItem>
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary="Tax" secondary={`${(TAX_RATE * 100).toFixed(2)}%`} />
          <Typography variant="body2">${tax.toFixed(2)}</Typography>
        </ListItem>
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary="Total" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            ${total.toFixed(2)}
          </Typography>
        </ListItem>
      </List>
      <Divider />
      <Stack
        direction="column"
        divider={<Divider flexItem />}
        spacing={2}
        sx={{ my: 2 }}
      >
        <div>
          <Typography variant="subtitle2" gutterBottom>
            Customer details
          </Typography>
          <Typography gutterBottom>{fullName}</Typography>
          {phoneNumber && (
            <Typography gutterBottom sx={{ color: 'text.secondary' }}>
              Phone: {phoneNumber}
            </Typography>
          )}
        </div>
        <div>
          <Typography variant="subtitle2" gutterBottom>
            Payment details
          </Typography>
          <Grid container>
            {payments.map((payment) => (
              <React.Fragment key={payment.name}>
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  sx={{ width: '100%', mb: 1 }}
                >
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {payment.name}
                  </Typography>
                  <Typography variant="body2">{payment.detail}</Typography>
                </Stack>
              </React.Fragment>
            ))}
          </Grid>
        </div>
        {extras && setExtras && (
          <div>
            <Typography variant="subtitle2" gutterBottom>
              Extras
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { key: 'bag', label: 'Bag' },
                { key: 'cupHolder', label: 'Cup holder' },
                { key: 'extraStraws', label: 'Extra straws' },
                { key: 'napkins', label: 'Napkins' },
              ].map((item) => (
                <Box
                  key={item.key}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Typography variant="body1" sx={{ flexGrow: 1 }}>
                    {item.label}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      setExtras({
                        ...extras,
                        [item.key]: Math.max(0, (extras[item.key] || 0) - 1),
                      })
                    }
                  >
                    -
                  </Button>
                  <Typography sx={{ minWidth: 24, textAlign: 'center' }}>
                    {extras[item.key] || 0}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      setExtras({
                        ...extras,
                        [item.key]: (extras[item.key] || 0) + 1,
                      })
                    }
                  >
                    +
                  </Button>
                </Box>
              ))}
            </Box>
          </div>
        )}
      </Stack>
    </Stack>
  );
}
