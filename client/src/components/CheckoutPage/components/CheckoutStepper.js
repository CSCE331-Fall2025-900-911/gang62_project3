import * as React from 'react';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import { STEPS } from '../constants';

export function DesktopStepper({ activeStep, stepLabels = STEPS }) {
  return (
    <Stepper
      id="desktop-stepper"
      activeStep={activeStep}
      sx={{ width: '100%', height: 40 }}
    >
      {stepLabels.map((label) => (
        <Step
          sx={{ ':first-child': { pl: 0 }, ':last-child': { pr: 0 } }}
          key={label}
        >
          <StepLabel>{label}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

export function MobileStepper({ activeStep, stepLabels = STEPS }) {
  return (
    <Stepper
      id="mobile-stepper"
      activeStep={activeStep}
      alternativeLabel
      sx={{ display: { sm: 'flex', md: 'none' } }}
    >
      {stepLabels.map((label) => (
        <Step
          sx={{
            ':first-child': { pl: 0 },
            ':last-child': { pr: 0 },
            '& .MuiStepConnector-root': { top: { xs: 6, sm: 12 } },
          }}
          key={label}
        >
          <StepLabel
            sx={{ '.MuiStepLabel-labelContainer': { maxWidth: '70px' } }}
          >
            {label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

