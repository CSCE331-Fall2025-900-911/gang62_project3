import React, { useState, useEffect } from 'react';
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
 * @author Michael Nguyen
 */
function MenuItem({ item, onItemClick, language = 'EN', translate }) {
  const [open, setOpen] = useState(false);
  const [sugarLevel, setSugarLevel] = useState('medium');
  const [iceLevel, setIceLevel] = useState('medium');
  const [size, setSize] = useState('medium');
  const [translatedName, setTranslatedName] = useState(item.name);
  const [translatedTexts, setTranslatedTexts] = useState({
    customize: 'Customize',
    size: 'Size',
    sugarLevel: 'Sugar Level',
    iceLevel: 'Ice Level',
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

  const handleAddToOrder = () => {
    const customizedItem = {
      ...item,
      size,
      sugarLevel,
      iceLevel
    };
    
    if (onItemClick) {
      onItemClick(customizedItem);
    } else {
      console.log('Selected item:', customizedItem);
    }
    
    handleClose();
    // Reset to defaults for next time
    setSugarLevel('medium');
    setIceLevel('medium');
    setSize('medium');
  };

  return (
    <>
      <Card 
        sx={{ 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          bgcolor: 'background.paper',
          borderWidth: 2,
          borderStyle: 'solid',
          borderColor: 'transparent',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: 4,
            borderColor: 'primary.main',
          },
          '&:active': {
            transform: 'scale(0.98)'
          }
          ,
          // Visible focus styles for keyboard users
          '&:focus': {
            outline: 'none',
            borderColor: 'primary.main',
            boxShadow: (theme) => `0 0 0 4px ${theme.palette.action.focus || 'rgba(25,118,210,0.16)'}`,
            transform: 'scale(1.02)'
          },
          '&:focus-visible': {
            outline: 'none'
          }
        }}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Customize ${translatedName}`}
      >
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            {translatedName}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            ${item.price.toFixed(2)}
          </Typography>
        </CardContent>
      </Card>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            backgroundImage: 'none',
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem', color: 'text.primary' }}>
          {translatedTexts.customize} {translatedName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            {/* Size Selection */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
              {translatedTexts.size}
            </Typography>
            <ButtonGroup 
              fullWidth 
              variant="outlined" 
              sx={{ mb: 4 }}
            >
              <Button
                variant={size === 'small' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setSize('small')}
                sx={{ 
                  py: 2,
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {translatedTexts.smallSize}
              </Button>
              <Button
                variant={size === 'medium' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setSize('medium')}
                sx={{ 
                  py: 2,
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {translatedTexts.mediumSize}
              </Button>
              <Button
                variant={size === 'large' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setSize('large')}
                sx={{ 
                  py: 2,
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {translatedTexts.largeSize}
              </Button>
            </ButtonGroup>

            {/* Sugar Level Selection */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
              {translatedTexts.sugarLevel}
            </Typography>
            <ButtonGroup 
              fullWidth 
              variant="outlined" 
              sx={{ mb: 4 }}
            >
              <Button
                variant={sugarLevel === 'low' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setSugarLevel('low')}
                sx={{ 
                  py: 2,
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {translatedTexts.low}
              </Button>
              <Button
                variant={sugarLevel === 'medium' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setSugarLevel('medium')}
                sx={{ 
                  py: 2,
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {translatedTexts.medium}
              </Button>
              <Button
                variant={sugarLevel === 'high' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setSugarLevel('high')}
                sx={{ 
                  py: 2,
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {translatedTexts.high}
              </Button>
            </ButtonGroup>

            {/* Ice Level Selection */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
              {translatedTexts.iceLevel}
            </Typography>
            <ButtonGroup 
              fullWidth 
              variant="outlined"
            >
              <Button
                variant={iceLevel === 'low' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setIceLevel('low')}
                sx={{ 
                  py: 2,
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {translatedTexts.low}
              </Button>
              <Button
                variant={iceLevel === 'medium' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setIceLevel('medium')}
                sx={{ 
                  py: 2,
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {translatedTexts.medium}
              </Button>
              <Button
                variant={iceLevel === 'high' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setIceLevel('high')}
                sx={{ 
                  py: 2,
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                {translatedTexts.high}
              </Button>
            </ButtonGroup>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={handleClose}
            variant="outlined"
            color="primary"
            size="large"
            sx={{ minWidth: 120 }}
          >
            {translatedTexts.cancel}
          </Button>
          <Button 
            onClick={handleAddToOrder}
            variant="contained"
            color="primary"
            size="large"
            sx={{ minWidth: 120 }}
          >
            {translatedTexts.addToOrder}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default MenuItem;
