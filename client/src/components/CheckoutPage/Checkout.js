import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

// Menu item IDs for accessories and packaging (must match data/menu_items.csv)
const STRAW_ITEM_ID = 46;
const NAPKIN_ITEM_ID = 47;
const SMALL_CUP_ITEM_ID = 48;
const MEDIUM_CUP_ITEM_ID = 49;
const LARGE_CUP_ITEM_ID = 50;
const BAG_ITEM_ID = 51;
const CUP_HOLDER_ITEM_ID = 52;

const CUP_SIZE_BY_KEY = {
  small: SMALL_CUP_ITEM_ID,
  medium: MEDIUM_CUP_ITEM_ID,
  large: LARGE_CUP_ITEM_ID,
};

const steps = ['Name', 'Payment details', 'Review your order'];
function getStepContent(step, orderItems, orderTotal, formData, extrasState, ttsEnabled) {
  switch (step) {
    case 0:
      return <AddressForm 
        firstName={formData.firstName}
        setFirstName={formData.setFirstName}
        lastName={formData.lastName}
        setLastName={formData.setLastName}
        phoneNumber={formData.phoneNumber}
        setPhoneNumber={formData.setPhoneNumber}
        ttsEnabled={ttsEnabled}
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
        ttsEnabled={ttsEnabled}
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
        extras={extrasState.extras}
        setExtras={extrasState.setExtras}
        ttsEnabled={ttsEnabled}
      />;
    default:
      throw new Error('Unknown step');
  }
}
export default function Checkout({ orderItems: orderItemsProp = [], setOrderItems: setOrderItemsProp, orderTotal: orderTotalProp = 0, setOrderTotal: setOrderTotalProp, ttsEnabled, ...props }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStep, setActiveStep] = React.useState(0);
  
  // Get navigation context from location state
  const navigationContext = location.state || { fromDashboard: false };
  const { fromDashboard, dashboardType, orderItems: stateOrderItems, orderTotal: stateOrderTotal } = navigationContext;
  
  // Use order items from navigation state if in dashboard mode, otherwise use props
  const orderItems = fromDashboard && stateOrderItems ? stateOrderItems : orderItemsProp;
  const orderTotal = fromDashboard && stateOrderTotal !== undefined ? stateOrderTotal : orderTotalProp;
  
  // For dashboard mode, we need to handle state updates differently
  // Since we can't directly update dashboard state from here, we'll use local state
  // and sync back when navigating
  const [localOrderItems, setLocalOrderItems] = React.useState(orderItems);
  const [localOrderTotal, setLocalOrderTotal] = React.useState(orderTotal);
  
  // Update local state when orderItems from props/state change
  React.useEffect(() => {
    setLocalOrderItems(orderItems);
    setLocalOrderTotal(orderTotal);
  }, [orderItems, orderTotal]);
  
  // Use local state for dashboard mode, props for standalone mode
  const effectiveOrderItems = fromDashboard ? localOrderItems : orderItems;
  const effectiveSetOrderItems = fromDashboard ? setLocalOrderItems : setOrderItemsProp;
  const effectiveOrderTotal = fromDashboard ? localOrderTotal : orderTotal;
  const effectiveSetOrderTotal = fromDashboard ? setLocalOrderTotal : setOrderTotalProp;
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

  const speak = React.useCallback((text) => {
    if (ttsEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  }, [ttsEnabled]);

  React.useEffect(() => {
    if (activeStep === 0) speak("Please enter your name and phone number.");
    else if (activeStep === 1) speak("Please enter your payment details.");
    else if (activeStep === 2) speak("Please review your order.");
  }, [activeStep, speak]);
  
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
  const TAX_RATE = 0.0825; // Match tax used in Review component

  const handleNext = async () => {
    const isLastStep = activeStep === steps.length - 1;

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

      // Aggregate quantities by menu item ID, including cups/straws and extras
      const quantityById = {};

      const incrementQuantity = (id, amount = 1) => {
        if (!id || amount <= 0) return;
        const key = String(id);
        quantityById[key] = (quantityById[key] || 0) + amount;
      };

      // Drinks from the kiosk
      effectiveOrderItems.forEach((item) => {
        if (!item || typeof item.id === 'undefined') return;
        // Base drink
        incrementQuantity(item.id);

        // One cup per drink, based on selected size (default to medium)
        const sizeKey = (item.size || 'medium').toLowerCase();
        const cupId = CUP_SIZE_BY_KEY[sizeKey] || CUP_SIZE_BY_KEY.medium;
        incrementQuantity(cupId);

        // One straw per drink
        incrementQuantity(STRAW_ITEM_ID);
      });

      // Extras chosen at checkout
      if (extras.bag > 0) {
        incrementQuantity(BAG_ITEM_ID, extras.bag);
      }
      if (extras.cupHolder > 0) {
        incrementQuantity(CUP_HOLDER_ITEM_ID, extras.cupHolder);
      }
      if (extras.extraStraws > 0) {
        incrementQuantity(STRAW_ITEM_ID, extras.extraStraws);
      }
      if (extras.napkins > 0) {
        incrementQuantity(NAPKIN_ITEM_ID, extras.napkins);
      }

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
  const receiptTax = receiptSubtotal * TAX_RATE;
  const receiptTotal = receiptSubtotal + receiptTax;
  
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
          onClick={() => {
            if (fromDashboard && dashboardType) {
              // Navigate back to dashboard with Kiosk page active, side menu shown (cart closed)
              const dashboardPath = dashboardType === 'cashier' ? '/cashier' : '/manager';
              navigate(dashboardPath, { 
                state: { 
                  activePage: 'Kiosk', 
                  cartOpen: false,
                  orderItems: effectiveOrderItems,
                  orderTotal: effectiveOrderTotal
                } 
              });
            } else {
              // Navigate back to standalone kiosk
              navigate('/kiosk');
            }
          }}
          sx={{ fontWeight: 'medium' }}
        >
          {fromDashboard ? 'Back to Dashboard' : 'Back to Kiosk'}
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
                {receiptItems.length > 0 && (
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
                )}
                <Button
                  variant="contained"
                  sx={{ alignSelf: 'start', width: { xs: '100%', sm: 'auto' } }}
                  onClick={() => {
                    if (fromDashboard && dashboardType) {
                      // Navigate back to dashboard with Kiosk page active
                      const dashboardPath = dashboardType === 'cashier' ? '/cashier' : '/manager';
                      navigate(dashboardPath, { 
                        state: { 
                          activePage: 'Kiosk', 
                          cartOpen: false 
                        } 
                      });
                    } else {
                      navigate('/kiosk');
                    }
                  }}
                >
                  Start a new order
                </Button>
              </Stack>
            ) : (
              <React.Fragment>
                {getStepContent(activeStep, effectiveOrderItems, effectiveOrderTotal, {
                  firstName, setFirstName,
                  lastName, setLastName,
                  phoneNumber, setPhoneNumber,
                  paymentType, setPaymentType,
                  cardNumber, setCardNumber,
                  cvv, setCvv,
                  expirationDate, setExpirationDate,
                  cardName, setCardName,
                }, {
                  extras,
                  setExtras,
                }, ttsEnabled)}
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
                      onFocus={() => speak('Go to the previous step')}
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
                      onFocus={() => speak('Go to the previous step')}
                      sx={{ display: { xs: 'flex', sm: 'none' } }}
                    >
                      Previous
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    endIcon={<ChevronRightRoundedIcon />}
                    onClick={handleNext}
                    onFocus={() => speak(
                      activeStep === steps.length - 1
                        ? 'Place your order'
                        : 'Go to the next step'
                    )}
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
