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
  speak 
}) {
  if (activeStep === STEPS.length) {
    return null;
  }

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
          onFocus={() => speak('Go to the previous step')}
          sx={{ display: { xs: 'none', sm: 'flex' } }}
        >
          Previous
        </Button>
      )}
      {activeStep !== 0 && (
        <Button
          startIcon={<ChevronLeftRoundedIcon />}
          onClick={onBack}
          variant="outlined"
          fullWidth
          onFocus={() => speak('Go to the previous step')}
          sx={{ display: { xs: 'flex', sm: 'none' } }}
        >
          Previous
        </Button>
      )}
      <Button
        variant="contained"
        endIcon={<ChevronRightRoundedIcon />}
        onClick={onNext}
        onFocus={() => speak(
          activeStep === STEPS.length - 1
            ? 'Place your order'
            : 'Go to the next step'
        )}
        sx={{ width: { xs: '100%', sm: 'fit-content' } }}
        disabled={activeStep === STEPS.length - 1 && isSubmitting}
      >
        {activeStep === STEPS.length - 1 ? 'Place order' : 'Next'}
      </Button>
    </Box>
  );
}

