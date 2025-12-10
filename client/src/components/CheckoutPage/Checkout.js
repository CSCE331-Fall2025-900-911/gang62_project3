import * as React from 'react';
import { useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Info from '../Kiosk/Info';
import InfoMobile from '../Kiosk/InfoMobile';
import AppTheme from '../../shared-theme/AppTheme';
import { STEPS } from './constants';
import { useTTS } from './hooks/useTTS';
import { useOrderState } from './hooks/useOrderState';
import { useFormState } from './hooks/useFormState';
import { submitOrder } from './utils/orderUtils';
import { getStepContent } from './utils/getStepContent';
import CheckoutHeader from './components/CheckoutHeader';
import { DesktopStepper, MobileStepper } from './components/CheckoutStepper';
import CheckoutButtons from './components/CheckoutButtons';
import OrderConfirmation from './components/OrderConfirmation';

export default function Checkout({ 
  orderItems: orderItemsProp = [], 
  setOrderItems: setOrderItemsProp, 
  orderTotal: orderTotalProp = 0, 
  setOrderTotal: setOrderTotalProp, 
  ttsEnabled, 
  ...props 
}) {
  const location = useLocation();
  const [activeStep, setActiveStep] = React.useState(0);
  
  // Get navigation context from location state
  const navigationContext = location.state || { fromDashboard: false };
  const { fromDashboard, dashboardType, orderItems: stateOrderItems, orderTotal: stateOrderTotal } = navigationContext;
  
  // Use custom hooks for state management
  const { effectiveOrderItems, effectiveSetOrderItems, effectiveOrderTotal, effectiveSetOrderTotal } = useOrderState(
    orderItemsProp,
    orderTotalProp,
    setOrderItemsProp,
    setOrderTotalProp,
    fromDashboard,
    stateOrderItems,
    stateOrderTotal
  );

  const formData = useFormState();
  const { speak } = useTTS(ttsEnabled);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [receiptItems, setReceiptItems] = React.useState([]);
  const [receiptSubtotal, setReceiptSubtotal] = React.useState(0);
  const [extras, setExtras] = React.useState({
    bag: 0,
    cupHolder: 0,
    extraStraws: 0,
    napkins: 0,
  });
  const [receiptExtras, setReceiptExtras] = React.useState(null);

  // TTS announcements for each step
  React.useEffect(() => {
    if (activeStep === 0) speak("Please enter your name and phone number.");
    else if (activeStep === 1) speak("Please enter your payment details.");
    else if (activeStep === 2) speak("Please review your order.");
  }, [activeStep, speak]);

  const handleNext = async () => {
    const isLastStep = activeStep === STEPS.length - 1;

    // If not on the final "Review / Place order" step, just advance the stepper
    if (!isLastStep) {
      setActiveStep((prev) => prev + 1);
      return;
    }

    // On the final step, submit the order to the backend
    if (!effectiveOrderItems || effectiveOrderItems.length === 0) {
      alert('Your cart is empty. Please add items before placing an order.');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitOrder(effectiveOrderItems, extras);

      // Order submitted successfully: advance to confirmation screen and clear cart
      setReceiptItems(effectiveOrderItems);
      setReceiptSubtotal(effectiveOrderTotal);
      setReceiptExtras(extras);
      setActiveStep((prev) => prev + 1);
      effectiveSetOrderItems([]);
      effectiveSetOrderTotal(0);
      setExtras({
        bag: 0,
        cupHolder: 0,
        extraStraws: 0,
        napkins: 0,
      });
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
    const newOrderItems = effectiveOrderItems.filter((_, i) => i !== index);
    effectiveSetOrderItems(newOrderItems);
  };

  const handleEditItem = (index, updatedItem) => {
    const newOrderItems = [...effectiveOrderItems];
    newOrderItems[index] = updatedItem;
    effectiveSetOrderItems(newOrderItems);
  };

  React.useEffect(() => {
    // Recalculate total when orderItems changes
    const total = effectiveOrderItems.reduce((sum, item) => sum + (item.price || 0), 0);
    effectiveSetOrderTotal(total);
  }, [effectiveOrderItems, effectiveSetOrderTotal]);

  const formattedTotal = `$${effectiveOrderTotal.toFixed(2)}`;
  
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <CheckoutHeader 
        fromDashboard={fromDashboard}
        dashboardType={dashboardType}
        effectiveOrderItems={effectiveOrderItems}
        effectiveOrderTotal={effectiveOrderTotal}
      />

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
              overflow: 'auto',
              minHeight: 0,
            }}
          >
            <Info 
              totalPrice={formattedTotal} 
              orderItems={effectiveOrderItems}
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
              <DesktopStepper activeStep={activeStep} />
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
                orderItems={effectiveOrderItems}
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
              gap: { xs: 5, md: 'none' },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                maxHeight: '720px',
                overflow: 'auto',
                minHeight: 0,
              }}
            >
              <MobileStepper activeStep={activeStep} />
              {activeStep === STEPS.length ? (
                <OrderConfirmation 
                  receiptItems={receiptItems}
                  receiptSubtotal={receiptSubtotal}
                  receiptExtras={receiptExtras}
                  fromDashboard={fromDashboard}
                  dashboardType={dashboardType}
                />
              ) : (
                getStepContent(
                  activeStep, 
                  effectiveOrderItems, 
                  effectiveOrderTotal, 
                  formData, 
                  { extras, setExtras }, 
                  ttsEnabled
                )
              )}
            </Box>
            <CheckoutButtons
              activeStep={activeStep}
              onBack={handleBack}
              onNext={handleNext}
              isSubmitting={isSubmitting}
              speak={speak}
            />
          </Box>
        </Grid>
      </Grid>
    </AppTheme>
  );
}
