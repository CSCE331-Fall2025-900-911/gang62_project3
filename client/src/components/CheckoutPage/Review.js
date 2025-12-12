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

const EN_TEXTS = {
  subtotalLabel: 'Subtotal',
  taxLabel: 'Tax',
  totalLabel: 'Total',
  taxRateSuffix: '%',
  customerDetailsTitle: 'Customer details',
  phonePrefix: 'Phone:',
  paymentDetailsTitle: 'Payment details',
  paymentTypeLabel: 'Payment type:',
  paymentTypeCard: 'Credit Card',
  paymentTypeCrypto: 'Crypto Wallet',
  cardHolderLabel: 'Card holder:',
  cardNumberLabel: 'Card number:',
  expiryLabel: 'Expiry date:',
  walletLabel: 'Wallet:',
  networkLabel: 'Network:',
  networkValue: 'Ethereum (ERC-20)',
  notProvided: 'Not provided',
  extrasTitle: 'Extras',
  extrasBag: 'Bag',
  extrasCupHolder: 'Cup holder',
  extrasExtraStraws: 'Extra straws',
  extrasNapkins: 'Napkins',
  sizePrefix: 'Size:',
  sugarPrefix: 'Sugar:',
  icePrefix: 'Ice:',
  tempPrefix: 'Temp:',
  toppingsPrefix: 'Toppings:',
};

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

  const TAX_RATE = 0.0825; // 8.25% tax rate
  const subtotal = orderTotal;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  React.useEffect(() => {
    let speechText = `Order summary. Total is ${total.toFixed(2)} dollars. Your Order has ${orderItems.length} ${orderItems.length === 1 ? 'item' : 'items'}. `;
    
    orderItems.forEach(item => {
      speechText += `${item.name}, ${item.price.toFixed(2)} dollars. `;
    });

    speak(speechText);
  }, [total, speak, orderItems]);
  
  // Format card number to show last 4 digits
  const maskedCardNumber = cardNumber ? `xxxx-xxxx-xxxx-${cardNumber.replace(/\s/g, '').slice(-4)}` : texts.notProvided;
  const fullName = `${firstName} ${lastName}`.trim() || texts.notProvided;
  
  const payments = [
    {
      name: texts.paymentTypeLabel,
      detail: paymentType === 'creditCard' ? texts.paymentTypeCard : texts.paymentTypeCrypto,
    },
    ...(paymentType === 'creditCard'
      ? [
          {
            name: texts.cardHolderLabel,
            detail: cardName || texts.notProvided,
          },
          { name: texts.cardNumberLabel, detail: maskedCardNumber },
          {
            name: texts.expiryLabel,
            detail: expirationDate || texts.notProvided,
          },
        ]
      : [
          { name: texts.walletLabel, detail: '0x742d...0bEb8' },
          { name: texts.networkLabel, detail: texts.networkValue },
        ]),
  ];

  return (
    <Stack spacing={2}>
      <List disablePadding>
        {orderItems.map((item, index) => (
          <ListItem key={index} sx={{ py: 1, px: 0 }}>
            <ListItemText 
              primary={item.name} 
              secondary={
                <React.Fragment>
                  <Typography variant="caption" display="block" color="text.secondary">
                    {texts.sizePrefix} {item.size} | {texts.sugarPrefix} {item.sugarLevel}
                    {item.temperature !== 'hot' && ` | ${texts.icePrefix} ${item.iceLevel}`}
                  </Typography>
                  {item.temperature && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      {texts.tempPrefix} {item.temperature}
                    </Typography>
                  )}
                  {item.toppings && item.toppings.length > 0 && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      {texts.toppingsPrefix} {item.toppings.join(', ')}
                    </Typography>
                  )}
                </React.Fragment>
              } 
            />
            <Typography variant="body2">${item.price.toFixed(2)}</Typography>
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary={texts.subtotalLabel} />
          <Typography variant="body2">${subtotal.toFixed(2)}</Typography>
        </ListItem>
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText
            primary={texts.taxLabel}
            secondary={`${(TAX_RATE * 100).toFixed(2)}${texts.taxRateSuffix}`}
          />
          <Typography variant="body2">${tax.toFixed(2)}</Typography>
        </ListItem>
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary={texts.totalLabel} />
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
            {texts.customerDetailsTitle}
          </Typography>
          <Typography gutterBottom>{fullName}</Typography>
          {phoneNumber && (
              <Typography gutterBottom sx={{ color: 'text.secondary' }}>
                {texts.phonePrefix} {phoneNumber}
              </Typography>
          )}
        </div>
        <div>
          <Typography variant="subtitle2" gutterBottom>
            {texts.paymentDetailsTitle}
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
              {texts.extrasTitle}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                { key: 'bag', label: texts.extrasBag },
                { key: 'cupHolder', label: texts.extrasCupHolder },
                { key: 'extraStraws', label: texts.extrasExtraStraws },
                { key: 'napkins', label: texts.extrasNapkins },
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
