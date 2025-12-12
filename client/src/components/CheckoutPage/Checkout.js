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

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function getInitialLanguage() {
  try {
    return localStorage.getItem('language') || 'EN';
  } catch (e) {
    return 'EN';
  }
}

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
  const [language, setLanguage] = React.useState(getInitialLanguage);
  const translationsRef = React.useRef({});
  const [stepLabels, setStepLabels] = React.useState(STEPS);

  const translate = React.useCallback(
    async (text) => {
      if (language === 'EN' || !text) return text;
      if (translationsRef.current[text]) return translationsRef.current[text];

      try {
        const response = await fetch(`${API_BASE_URL}/api/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetLang: language }),
        });
        const data = await response.json();
        const translated = data.translatedText || text;
        translationsRef.current[text] = translated;
        return translated;
      } catch (err) {
        return text;
      }
    },
    [language]
  );

  const [translatedTexts, setTranslatedTexts] = React.useState({
    step0Tts: 'Please enter your name and phone number.',
    step1Tts: 'Please enter your payment details.',
    step2Tts: 'Please review your order.',
    emptyCartAlert: 'Your cart is empty. Please add items before placing an order.',
    orderPlacedAlert: 'Your order has been placed! Thank you.',
    orderPlaceFailedPrefix: 'Failed to place order:',
    selectedProducts: 'Selected products',
  });

  React.useEffect(() => {
    translationsRef.current = {};
  }, [language]);

  React.useEffect(() => {
    const updateTranslations = async () => {
      if (language === 'EN') {
        setTranslatedTexts({
          step0Tts: 'Please enter your name and phone number.',
          step1Tts: 'Please enter your payment details.',
          step2Tts: 'Please review your order.',
          emptyCartAlert: 'Your cart is empty. Please add items before placing an order.',
          orderPlacedAlert: 'Your order has been placed! Thank you.',
          orderPlaceFailedPrefix: 'Failed to place order:',
          selectedProducts: 'Selected products',
        });
        return;
      }

      const base = {
        step0Tts: 'Please enter your name and phone number.',
        step1Tts: 'Please enter your payment details.',
        step2Tts: 'Please review your order.',
        emptyCartAlert: 'Your cart is empty. Please add items before placing an order.',
        orderPlacedAlert: 'Your order has been placed! Thank you.',
        orderPlaceFailedPrefix: 'Failed to place order:',
        selectedProducts: 'Selected products',
      };

      const translated = {};
      for (const [key, value] of Object.entries(base)) {
        translated[key] = await translate(value);
      }
      setTranslatedTexts(translated);
    };

    updateTranslations();
  }, [language, translate]);

  React.useEffect(() => {
    const updateStepLabels = async () => {
      if (!translate || language === 'EN') {
        setStepLabels(STEPS);
        return;
      }
      const translated = [];
      for (const label of STEPS) {
        translated.push(await translate(label));
      }
      setStepLabels(translated);
    };

    updateStepLabels();
  }, [language, translate]);
  
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
    if (activeStep === 0) speak(translatedTexts.step0Tts);
    else if (activeStep === 1) speak(translatedTexts.step1Tts);
    else if (activeStep === 2) speak(translatedTexts.step2Tts);
  }, [activeStep, speak, translatedTexts]);

  const handleNext = async () => {
    const isLastStep = activeStep === STEPS.length - 1;

    // If not on the final "Review / Place order" step, just advance the stepper
    if (!isLastStep) {
      setActiveStep((prev) => prev + 1);
      return;
    }

    // On the final step, submit the order to the backend
    if (!effectiveOrderItems || effectiveOrderItems.length === 0) {
      alert(translatedTexts.emptyCartAlert);
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
      alert(translatedTexts.orderPlacedAlert);
    } catch (error) {
      console.error('Error submitting kiosk order:', error);
      alert(`${translatedTexts.orderPlaceFailedPrefix} ${error.message}`);
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

  const handleLanguageChange = (value) => {
    setLanguage(value);
    try {
      localStorage.setItem('language', value);
      window.dispatchEvent(new CustomEvent('app-language-changed', { detail: value }));
    } catch (e) {
      // ignore storage errors
    }
  };
  
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <CheckoutHeader 
        fromDashboard={fromDashboard}
        dashboardType={dashboardType}
        effectiveOrderItems={effectiveOrderItems}
        effectiveOrderTotal={effectiveOrderTotal}
        language={language}
        setLanguage={handleLanguageChange}
        translate={translate}
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
              language={language}
              translate={translate}
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
              <DesktopStepper activeStep={activeStep} stepLabels={stepLabels} />
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
                  {translatedTexts.selectedProducts}
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
                language={language}
                translate={translate}
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
              <MobileStepper activeStep={activeStep} stepLabels={stepLabels} />
              {activeStep === STEPS.length ? (
                <OrderConfirmation 
                  receiptItems={receiptItems}
                  receiptSubtotal={receiptSubtotal}
                  receiptExtras={receiptExtras}
                  fromDashboard={fromDashboard}
                  dashboardType={dashboardType}
                  language={language}
                  translate={translate}
                />
              ) : (
                getStepContent(
                  activeStep, 
                  effectiveOrderItems, 
                  effectiveOrderTotal, 
                  formData, 
                  { extras, setExtras }, 
                  ttsEnabled,
                  language,
                  translate
                )
              )}
            </Box>
            <CheckoutButtons
              activeStep={activeStep}
              onBack={handleBack}
              onNext={handleNext}
              isSubmitting={isSubmitting}
              speak={speak}
              translate={translate}
            />
          </Box>
        </Grid>
      </Grid>
    </AppTheme>
  );
}
