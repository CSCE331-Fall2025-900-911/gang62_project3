import React, { useState } from 'react';
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
 * @author Michael Nguyen
 */
function MenuItem({ item, onItemClick }) {
  const [open, setOpen] = useState(false);
  const [sugarLevel, setSugarLevel] = useState('medium');
  const [iceLevel, setIceLevel] = useState('medium');

  const handleCardClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAddToOrder = () => {
    const customizedItem = {
      ...item,
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
        }}
        onClick={handleCardClick}
      >
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            {item.name}
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
          Customize {item.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            {/* Sugar Level Selection */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
              Sugar Level
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
                Low
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
                Medium
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
                High
              </Button>
            </ButtonGroup>

            {/* Ice Level Selection */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
              Ice Level
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
                Low
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
                Medium
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
                High
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
            Cancel
          </Button>
          <Button 
            onClick={handleAddToOrder}
            variant="contained"
            color="primary"
            size="large"
            sx={{ minWidth: 120 }}
          >
            Add to Order
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default MenuItem;
