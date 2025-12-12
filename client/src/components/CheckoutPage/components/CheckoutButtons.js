import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { STEPS } from '../constants';

export default function CheckoutButtons({ 
  activeStep, 
  onBack, 
  onNext, 
  isSubmitting,
  speak,
  translate,
}) {
  if (activeStep === STEPS.length) {
    return null;
  }

  const [backText, setBackText] = React.useState('Previous');
  const [nextText, setNextText] = React.useState('Next');
  const [placeOrderText, setPlaceOrderText] = React.useState('Place order');
  const [ttsPrev, setTtsPrev] = React.useState('Go to the previous step');
  const [ttsNext, setTtsNext] = React.useState('Go to the next step');
  const [ttsPlaceOrder, setTtsPlaceOrder] = React.useState('Place your order');

  React.useEffect(() => {
    const updateTexts = async () => {
      if (!translate) {
        setBackText('Previous');
        setNextText('Next');
        setPlaceOrderText('Place order');
        setTtsPrev('Go to the previous step');
        setTtsNext('Go to the next step');
        setTtsPlaceOrder('Place your order');
        return;
      }

      setBackText(await translate('Previous'));
      setNextText(await translate('Next'));
      setPlaceOrderText(await translate('Place order'));
      setTtsPrev(await translate('Go to the previous step'));
      setTtsNext(await translate('Go to the next step'));
      setTtsPlaceOrder(await translate('Place your order'));
    };

    updateTexts();
  }, [translate]);

  return (
    <Box
      sx={[
        {
          display: 'flex',
          flexDirection: { xs: 'column-reverse', sm: 'row' },
          alignItems: 'end',
          gap: 2,
          pb: { xs: 12, sm: 8 },
          mt: { xs: 4, sm: 4 },
          flexShrink: 0,
          position: 'relative',
          zIndex: 1000,
        },
        activeStep !== 0
          ? { justifyContent: 'space-between' }
          : { justifyContent: 'flex-end' },
      ]}
    >
      {activeStep !== 0 && (
        <Button
          startIcon={<ChevronLeftRoundedIcon />}
          onClick={onBack}
          variant="text"
          onFocus={() => speak(ttsPrev)}
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        >
          {backText}
        </Button>
      )}
      {activeStep !== 0 && (
        <Button
          startIcon={<ChevronLeftRoundedIcon />}
          onClick={onBack}
          variant="outlined"
          fullWidth
          onFocus={() => speak(ttsPrev)}
          sx={{ display: { xs: 'flex', sm: 'none' } }}
        >
          {backText}
        </Button>
      )}
      <Button
        variant="contained"
        endIcon={<ChevronRightRoundedIcon />}
        onClick={onNext}
        onFocus={() => speak(
          activeStep === STEPS.length - 1
            ? ttsPlaceOrder
            : ttsNext
        )}
        sx={{ width: { xs: '100%', sm: 'fit-content' } }}
        disabled={activeStep === STEPS.length - 1 && isSubmitting}
      >
        {activeStep === STEPS.length - 1 ? placeOrderText : nextText}
      </Button>
    </Box>
  );
}

