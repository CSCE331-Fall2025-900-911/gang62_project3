import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  ButtonGroup
} from '@mui/material';
import { CustomizationData } from '../../models/CustomizationData';

/**
 * MenuItem component that displays a single menu item card.
 * Provides a touchscreen-friendly interactive card with hover effects.
 * Opens a customization dialog for sugar and ice levels when clicked.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.item - Menu item object containing id, name, and price
 * @param {number} props.item.id - Unique identifier for the menu item
 * @param {string} props.item.name - Display name of the menu item
 * @param {number} props.item.price - Price of the menu item
 * @param {Function} [props.onItemClick] - Optional callback function when item is added to order
 * @param {string} [props.language] - Language code for translation
 * @param {Function} [props.translate] - Translation function
 * @param {boolean} [props.ttsEnabled] - Whether text-to-speech is enabled
 * @param {Function} [props.speak] - Function to speak text
 * @author Michael Nguyen
 */
function MenuItem({ item, imageUrl, onItemClick, language = 'EN', translate, ttsEnabled, speak }) {
  const defaultData = new CustomizationData();
  const [open, setOpen] = useState(false);
  const [sugarLevel, setSugarLevel] = useState(defaultData.sugarLevel);
  const [iceLevel, setIceLevel] = useState(defaultData.iceLevel);
  const [size, setSize] = useState(defaultData.size);
  const [temperature, setTemperature] = useState(defaultData.temperature);
  const [hasBoba, setHasBoba] = useState(defaultData.hasBoba);
  const [hasAiyuJelly, setHasAiyuJelly] = useState(defaultData.hasAiyuJelly);
  const [quantity, setQuantity] = useState(defaultData.quantity);
  const [translatedName, setTranslatedName] = useState(item.name);
  const skipNextFocusRef = useRef(false);
  const [translatedTexts, setTranslatedTexts] = useState({
    customize: 'Customize',
    size: 'Size',
    sugarLevel: 'Sugar Level',
    iceLevel: 'Ice Level',
    temperature: 'Temperature',
    hot: 'Hot',
    cold: 'Cold',
    toppings: 'Toppings',
    hasBoba: 'Boba',
    hasAiyuJelly: 'Aiyu Jelly',
    quantity: 'Quantity',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    smallSize: 'Small',
    mediumSize: 'Medium',
    largeSize: 'Large',
    cancel: 'Cancel',
    addToOrder: 'Add to Order'
  });

  useEffect(() => {
    const updateTranslations = async () => {
      if (language === 'EN' || !translate) {
        setTranslatedName(item.name);
        setTranslatedTexts({
          customize: 'Customize',
          size: 'Size',
          sugarLevel: 'Sugar Level',
          iceLevel: 'Ice Level',
          temperature: 'Temperature',
          hot: 'Hot',
          cold: 'Cold',
          toppings: 'Toppings',
          boba: 'Boba',
          aiyuJelly: 'Aiyu Jelly',
          quantity: 'Quantity',
          low: 'Low',
          medium: 'Medium',
          high: 'High',
          smallSize: 'Small',
          mediumSize: 'Medium',
          largeSize: 'Large',
          cancel: 'Cancel',
          addToOrder: 'Add to Order'
        });
        return;
      }
      
      const name = await translate(item.name);
      setTranslatedName(name);
      
      const texts = {
        customize: 'Customize',
        size: 'Size',
        sugarLevel: 'Sugar Level',
        iceLevel: 'Ice Level',
        temperature: 'Temperature',
        hot: 'Hot',
        cold: 'Cold',
        toppings: 'Toppings',
        boba: 'Boba',
        aiyuJelly: 'Aiyu Jelly',
        quantity: 'Quantity',
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        smallSize: 'Small',
        mediumSize: 'Medium',
        largeSize: 'Large',
        cancel: 'Cancel',
        addToOrder: 'Add to Order'
      };
      
      const translated = {};
      for (const [key, value] of Object.entries(texts)) {
        translated[key] = await translate(value);
      }
      setTranslatedTexts(translated);
    };
    updateTranslations();
  }, [language, item.name, translate]);

  const handleCardClick = () => {
    setOpen(true);
  };

  const handleFocus = () => {
    if (skipNextFocusRef.current) {
      skipNextFocusRef.current = false;
      return;
    }
    if (ttsEnabled && speak) {
      speak(`${translatedName} for ${item.price} dollars.`);
    }
  };

  const handleKeyDown = (e) => {
    // Activate card on Enter or Space
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const speakOption = (category, value) => {
    if (ttsEnabled && speak) {
      speak(`${category} ${value}`);
    }
  };

  const handleAddToOrder = () => {
    const toppings = [];
    if (hasBoba) toppings.push('Boba');
    if (hasAiyuJelly) toppings.push('Aiyu Jelly');

    const customizedItem = {
      ...item,
      size,
      sugarLevel,
      iceLevel: temperature === 'hot' ? 'no ice' : iceLevel,
      temperature,
      toppings
    };
    
    if (onItemClick) {
      for (let i = 0; i < quantity; i++) {
        onItemClick(customizedItem);
      }
    } else {
      console.log('Selected item:', customizedItem, 'Quantity:', quantity);
    }
    
    skipNextFocusRef.current = true;
    handleClose();
    // Reset to defaults for next time
    const defaults = new CustomizationData();
    setSugarLevel(defaults.sugarLevel);
    setIceLevel(defaults.iceLevel);
    setSize(defaults.size);
    setTemperature(defaults.temperature);
    setHasBoba(defaults.hasBoba);
    setHasAiyuJelly(defaults.hasAiyuJelly);
    setQuantity(defaults.quantity);
  };

  const toppingState = {
    hasBoba: { value: hasBoba, setter: setHasBoba },
    hasAiyuJelly: { value: hasAiyuJelly, setter: setHasAiyuJelly }
  };

  return (
    <>
      <Card 
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={handleCardClick}
        onFocus={handleFocus}
        role="button"
        aria-label={`${translatedName}, price $${item.price}`}
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          height: '300px',
          width: '100%'
        }}
      >
        {/* Image Section - Always reserve space */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            height: '180px',
            width: '100%',
            bgcolor: 'grey.100'
          }}
        >
          {imageUrl ? (
            <Box
              component="img"
              src={imageUrl}
              alt={translatedName}
              sx={{
                objectFit: 'cover',
                width: '100%',
                height: '100%'
              }}
              onError={(e) => {
                // Hide image if it fails to load, but keep the container
                e.target.style.display = 'none';
              }}
            />
          ) : null}
        </Box>
        
        <CardContent sx={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <Typography 
            variant="h6" 
            component="h2" 
            gutterBottom
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.2
            }}
          >
            {translatedName}
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
          >
            ${item.price.toFixed(2)}
          </Typography>
        </CardContent>
      </Card>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {translatedTexts.customize} {translatedName}
        </DialogTitle>
        <DialogContent>
          <Box>
            {/* Size Selection */}
            <Typography variant="h6" gutterBottom>
              {translatedTexts.size}
            </Typography>
            <ButtonGroup 
              fullWidth 
              variant="outlined" 
            >
              {CustomizationData.sizes.map((option) => (
                <Button
                  key={option.value}
                  variant={size === option.value ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => setSize(option.value)}
                  onFocus={() => speakOption(translatedTexts.size, translatedTexts[`${option.value}Size`] || option.label)}
                >
                  {translatedTexts[`${option.value}Size`] || option.label}
                </Button>
              ))}
            </ButtonGroup>

            {/* Temperature Selection */}
            <Typography variant="h6" gutterBottom>
              {translatedTexts.temperature}
            </Typography>
            <ButtonGroup 
              fullWidth 
              variant="outlined" 
            >
              {CustomizationData.temperatures.map((option) => (
                <Button
                  key={option.value}
                  variant={temperature === option.value ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => setTemperature(option.value)}
                  onFocus={() => speakOption(translatedTexts.temperature, translatedTexts[option.value] || option.label)}
                >
                  {translatedTexts[option.value] || option.label}
                </Button>
              ))}
            </ButtonGroup>

            {/* Sugar Level Selection */}
            <Typography variant="h6" gutterBottom>
              {translatedTexts.sugarLevel}
            </Typography>
            <ButtonGroup 
              fullWidth 
              variant="outlined" 
            >
              {CustomizationData.sugarLevels.map((option) => (
                <Button
                  key={option.value}
                  variant={sugarLevel === option.value ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => setSugarLevel(option.value)}
                  onFocus={() => speakOption(translatedTexts.sugarLevel, translatedTexts[option.value] || option.label)}
                >
                  {translatedTexts[option.value] || option.label}
                </Button>
              ))}
            </ButtonGroup>

            {/* Ice Level Selection - Only show if cold */}
            {temperature === 'cold' && (
              <>
                <Typography variant="h6" gutterBottom>
                  {translatedTexts.iceLevel}
                </Typography>
                <ButtonGroup 
                  fullWidth 
                  variant="outlined"
                >
                  {CustomizationData.iceLevels.map((option) => (
                    <Button
                      key={option.value}
                      variant={iceLevel === option.value ? 'contained' : 'outlined'}
                      color="primary"
                      onClick={() => setIceLevel(option.value)}
                      onFocus={() => speakOption(translatedTexts.iceLevel, translatedTexts[option.value] || option.label)}
                    >
                      {translatedTexts[option.value] || option.label}
                    </Button>
                  ))}
                </ButtonGroup>
              </>
            )}

            {/* Toppings Selection */}
            <Typography variant="h6" gutterBottom>
              {translatedTexts.toppings}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {CustomizationData.toppings.map((topping) => {
                const state = toppingState[topping.key];
                if (!state) return null; // Safety check
                return (
                  <Button
                    key={topping.key}
                    variant={state.value ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={() => state.setter(!state.value)}
                    onFocus={() => speakOption(translatedTexts.toppings, translatedTexts[topping.key] || topping.label)}
                    fullWidth
                  >
                    {translatedTexts[topping.key] || topping.label} {state.value ? '✓' : ''}
                  </Button>
                );
              })}
            </Box>

            {/* Quantity Selection */}
            <Typography variant="h6" gutterBottom>
              {translatedTexts.quantity}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
              <Button
                variant="outlined"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                onFocus={() => speakOption(translatedTexts.quantity, "decrease")}
              >
                -
              </Button>
              <Typography variant="h5">
                {quantity}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setQuantity(quantity + 1)}
                onFocus={() => speakOption(translatedTexts.quantity, "increase")}
              >
                +
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleClose}
            onFocus={() => ttsEnabled && speak && speak(translatedTexts.cancel)}
            variant="outlined"
            color="primary"
            size="large"
          >
            {translatedTexts.cancel}
          </Button>
          <Button 
            onClick={handleAddToOrder}
            onFocus={() => ttsEnabled && speak && speak(translatedTexts.addToOrder)}
            variant="contained"
            color="primary"
            size="large"
          >
            {translatedTexts.addToOrder}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default MenuItem;
