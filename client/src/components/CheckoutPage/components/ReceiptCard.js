import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { TAX_RATE } from '../constants';

const EN_TEXTS = {
  receiptTitle: 'Receipt',
  subtotalLabel: 'Subtotal',
  taxLabel: 'Tax',
  totalLabel: 'Total',
  extrasBag: 'Bag',
  extrasCupHolder: 'Cup holder',
  extrasExtraStraws: 'Extra straws',
  extrasNapkins: 'Napkins',
};

export default function ReceiptCard({
  receiptItems = [],
  receiptSubtotal = 0,
  receiptExtras,
  language = 'EN',
  translate,
}) {
  const receiptTax = receiptSubtotal * TAX_RATE;
  const receiptTotal = receiptSubtotal + receiptTax;
  const [texts, setTexts] = React.useState(EN_TEXTS);
  const [translatedNames, setTranslatedNames] = React.useState({});
  const nameTranslationsRef = React.useRef({});

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

  React.useEffect(() => {
    let cancelled = false;

    const updateNames = async () => {
      if (!translate || language === 'EN') {
        nameTranslationsRef.current = {};
        setTranslatedNames({});
        return;
      }

      const currentMap = { ...nameTranslationsRef.current };
      await Promise.all(
        receiptItems.map(async (item) => {
          const key = item?.name;
          if (!key) return;
          if (!currentMap[key]) currentMap[key] = await translate(key);
        }),
      );

      if (cancelled) return;
      nameTranslationsRef.current = currentMap;
      setTranslatedNames(currentMap);
    };

    updateNames();

    return () => {
      cancelled = true;
    };
  }, [receiptItems, language, translate]);

  if (receiptItems.length === 0) {
    return null;
  }

  return (
    <Card sx={{ mt: 1 }}>
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
          {texts.receiptTitle}
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
            <Typography variant="body2">
              {translate && language !== 'EN'
                ? translatedNames[item.name] || item.name
                : item.name}
            </Typography>
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
                <Typography variant="body2">{texts.extrasBag}</Typography>
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
                <Typography variant="body2">{texts.extrasCupHolder}</Typography>
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
                <Typography variant="body2">{texts.extrasExtraStraws}</Typography>
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
                <Typography variant="body2">{texts.extrasNapkins}</Typography>
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
              {texts.subtotalLabel}
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
              {texts.taxLabel} ({(TAX_RATE * 100).toFixed(2)}%)
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
              {texts.totalLabel}
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

