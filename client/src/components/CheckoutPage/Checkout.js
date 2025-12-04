import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Typography from '@mui/material/Typography';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AddressForm from './AddressForm';
import Info from '../Kiosk/Info';
import InfoMobile from '../Kiosk/InfoMobile';
import PaymentForm from './PaymentForm';
import Review from './Review';
import AppTheme from '../../shared-theme/AppTheme';
import ColorModeIconDropdown from '../../shared-theme/ColorModeIconDropdown';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const KIOSK_EMPLOYEE_ID = 1; // Default employee for kiosk orders
const WALK_IN_CUSTOMER_ID = 1; // Default "walk-in" customer

const steps = ['Name', 'Payment details', 'Review your order'];
function getStepContent(step, orderItems, orderTotal, formData) {
  switch (step) {
    case 0:
      return <AddressForm 
        firstName={formData.firstName}
        setFirstName={formData.setFirstName}
        lastName={formData.lastName}
        setLastName={formData.setLastName}
        phoneNumber={formData.phoneNumber}
        setPhoneNumber={formData.setPhoneNumber}
      />;
    case 1:
      return <PaymentForm 
        paymentType={formData.paymentType}
        setPaymentType={formData.setPaymentType}
        cardNumber={formData.cardNumber}
        setCardNumber={formData.setCardNumber}
        cvv={formData.cvv}
        setCvv={formData.setCvv}
        expirationDate={formData.expirationDate}
        setExpirationDate={formData.setExpirationDate}
        cardName={formData.cardName}
        setCardName={formData.setCardName}
      />;
    case 2:
      return <Review 
        orderItems={orderItems} 
        orderTotal={orderTotal}
        firstName={formData.firstName}
        lastName={formData.lastName}
        phoneNumber={formData.phoneNumber}
        paymentType={formData.paymentType}
        cardNumber={formData.cardNumber}
        cardName={formData.cardName}
        expirationDate={formData.expirationDate}
      />;
    default:
      throw new Error('Unknown step');
  }
}
export default function Checkout({ orderItems = [], setOrderItems, orderTotal = 0, setOrderTotal, ...props }) {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Address form state
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  
  // Payment form state
  const [paymentType, setPaymentType] = React.useState('creditCard');
  const [cardNumber, setCardNumber] = React.useState('');
  const [cvv, setCvv] = React.useState('');
  const [expirationDate, setExpirationDate] = React.useState('');
  const [cardName, setCardName] = React.useState('');
  const handleNext = async () => {
    const isLastStep = activeStep === steps.length - 1;

    // If not on the final "Review / Place order" step, just advance the stepper
    if (!isLastStep) {
      setActiveStep((prev) => prev + 1);
      return;
    }

    // On the final step, submit the order to the backend
    if (!orderItems || orderItems.length === 0) {
      alert('Your cart is empty. Please add items before placing an order.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Aggregate quantities by menu item ID
      const quantityById = {};
      orderItems.forEach((item) => {
        if (!item || typeof item.id === 'undefined') return;
        const idKey = String(item.id);
        quantityById[idKey] = (quantityById[idKey] || 0) + 1;
      });

      const itemsPayload = Object.entries(quantityById).map(([id, quantity]) => ({
        id: Number(id),
        quantity,
      }));

      if (itemsPayload.length === 0) {
        alert('Unable to submit order: no valid items found.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/submit-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeID: KIOSK_EMPLOYEE_ID,
          customerID: WALK_IN_CUSTOMER_ID,
          items: itemsPayload,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to submit order';
        try {
          const data = await response.json();
          if (data && data.error) {
            errorMessage = data.error;
          }
        } catch (err) {
          // Ignore JSON parse errors and fall back to default message
        }
        throw new Error(errorMessage);
      }

      // Order submitted successfully: advance to confirmation screen and clear cart
      setActiveStep((prev) => prev + 1);
      setOrderItems([]);
      setOrderTotal(0);
      alert('Your order has been placed! Thank you.');
    } catch (error) {
      console.error('Error submitting kiosk order:', error);
      alert(`Failed to place order: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };
  
  const handleDeleteItem = (index) => {
    const newOrderItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(newOrderItems);
  };

  const handleEditItem = (index, updatedItem) => {
    const newOrderItems = [...orderItems];
    newOrderItems[index] = updatedItem;
    setOrderItems(newOrderItems);
  };

  React.useEffect(() => {
    // Recalculate total when orderItems changes
    const total = orderItems.reduce((sum, item) => sum + item.price, 0);
    setOrderTotal(total);
  }, [orderItems, setOrderTotal]);
  
  const formattedTotal = `$${orderTotal.toFixed(2)}`;
  
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ position: 'fixed', top: '1rem', right: '1rem' }}>
        <ColorModeIconDropdown />
      </Box>
      <Box sx={{ position: 'fixed', top: '1rem', left: '1rem' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate('/kiosk')}
          sx={{ fontWeight: 'medium' }}
        >
          Back to Kiosk
        </Button>
      </Box>

      <Grid
        container
        sx={{
          height: {
            xs: '100%',
            sm: 'calc(100dvh - var(--template-frame-height, 0px))',
          },
          mt: {
            xs: 4,
            sm: 0,
          },
        }}
      >
        <Grid
          size={{ xs: 12, sm: 5, lg: 4 }}
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            backgroundColor: 'background.paper',
            borderRight: { sm: 'none', md: '1px solid' },
            borderColor: { sm: 'none', md: 'divider' },
            alignItems: 'start',
            pt: 16,
            px: 10,
            gap: 4,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              width: '100%',
              maxWidth: 500,
            }}
          >
            <Info 
              totalPrice={formattedTotal} 
              orderItems={orderItems}
              onDelete={handleDeleteItem}
              onEdit={handleEditItem}
            />
          </Box>
        </Grid>
        <Grid
          size={{ sm: 12, md: 7, lg: 8 }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '100%',
            width: '100%',
            backgroundColor: { xs: 'transparent', sm: 'background.default' },
            alignItems: 'start',
            pt: { xs: 0, sm: 16 },
            px: { xs: 2, sm: 10 },
            gap: { xs: 4, md: 8 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: { sm: 'space-between', md: 'flex-end' },
              alignItems: 'center',
              width: '100%',
              maxWidth: { sm: '100%', md: 600 },
            }}
          >
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                flexGrow: 1,
              }}
            >
              <Stepper
                id="desktop-stepper"
                activeStep={activeStep}
                sx={{ width: '100%', height: 40 }}
              >
                {steps.map((label) => (
                  <Step
                    sx={{ ':first-child': { pl: 0 }, ':last-child': { pr: 0 } }}
                    key={label}
                  >
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </Box>
          <Card sx={{ display: { xs: 'flex', md: 'none' }, width: '100%' }}>
            <CardContent
              sx={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <Typography variant="subtitle2" gutterBottom>
                  Selected products
                </Typography>
                <Typography variant="body1">
                  {formattedTotal}
                </Typography>
              </div>
              <InfoMobile 
                totalPrice={formattedTotal} 
                orderItems={orderItems}
                onDelete={handleDeleteItem}
                onEdit={handleEditItem}
              />
            </CardContent>
          </Card>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              width: '100%',
              maxWidth: { sm: '100%', md: 600 },
              maxHeight: '720px',
              gap: { xs: 5, md: 'none' },
            }}
          >
            <Stepper
              id="mobile-stepper"
              activeStep={activeStep}
              alternativeLabel
              sx={{ display: { sm: 'flex', md: 'none' } }}
            >
              {steps.map((label) => (
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
            {activeStep === steps.length ? (
              <Stack spacing={2} useFlexGap>
                <Typography variant="h1">🧋</Typography>
                <Typography variant="h5">Thank you for your order!</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Your drinks are being prepared. Please watch the screen or listen
                  for your name when your order is ready for pickup.
                </Typography>
                <Button
                  variant="contained"
                  sx={{ alignSelf: 'start', width: { xs: '100%', sm: 'auto' } }}
                  onClick={() => navigate('/kiosk')}
                >
                  Start a new order
                </Button>
              </Stack>
            ) : (
              <React.Fragment>
                {getStepContent(activeStep, orderItems, orderTotal, {
                  firstName, setFirstName,
                  lastName, setLastName,
                  phoneNumber, setPhoneNumber,
                  paymentType, setPaymentType,
                  cardNumber, setCardNumber,
                  cvv, setCvv,
                  expirationDate, setExpirationDate,
                  cardName, setCardName
                })}
                <Box
                  sx={[
                    {
                      display: 'flex',
                      flexDirection: { xs: 'column-reverse', sm: 'row' },
                      alignItems: 'end',
                      flexGrow: 1,
                      gap: 1,
                      pb: { xs: 12, sm: 0 },
                      mt: { xs: 2, sm: 0 },
                      mb: '60px',
                    },
                    activeStep !== 0
                      ? { justifyContent: 'space-between' }
                      : { justifyContent: 'flex-end' },
                  ]}
                >
                  {activeStep !== 0 && (
                    <Button
                      startIcon={<ChevronLeftRoundedIcon />}
                      onClick={handleBack}
                      variant="text"
                      sx={{ display: { xs: 'none', sm: 'flex' } }}
                    >
                      Previous
                    </Button>
                  )}
                  {activeStep !== 0 && (
                    <Button
                      startIcon={<ChevronLeftRoundedIcon />}
                      onClick={handleBack}
                      variant="outlined"
                      fullWidth
                      sx={{ display: { xs: 'flex', sm: 'none' } }}
                    >
                      Previous
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    endIcon={<ChevronRightRoundedIcon />}
                    onClick={handleNext}
                    sx={{ width: { xs: '100%', sm: 'fit-content' } }}
                    disabled={activeStep === steps.length - 1 && isSubmitting}
                  >
                    {activeStep === steps.length - 1 ? 'Place order' : 'Next'}
                  </Button>
                </Box>
              </React.Fragment>
            )}
          </Box>
        </Grid>
      </Grid>
    </AppTheme>
  );
}
