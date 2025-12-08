import React from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
} from '@mui/material';
import { CustomizationData } from '../../../../models/CustomizationData';

const CustomizationDialog = ({
  open,
  onClose,
  currentMenuItem,
  customizationData,
  setCustomizationData,
  onAddToCart,
  calculateCustomizedPrice,
  formatPrice,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Customize {currentMenuItem?.name}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Size */}
          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel component="legend">Size</FormLabel>
            <RadioGroup
              row
              value={customizationData.size}
              onChange={(e) =>
                setCustomizationData({
                  ...customizationData,
                  size: e.target.value,
                })
              }
            >
              {CustomizationData.sizes.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {/* Temperature */}
          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel component="legend">Temperature</FormLabel>
            <RadioGroup
              row
              value={customizationData.temperature}
              onChange={(e) =>
                setCustomizationData({
                  ...customizationData,
                  temperature: e.target.value,
                  // Reset ice level if switching to hot
                  iceLevel: e.target.value === 'hot' ? 'medium' : customizationData.iceLevel
                })
              }
            >
              {CustomizationData.temperatures.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {/* Sugar Level */}
          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel component="legend">Sugar Level</FormLabel>
            <RadioGroup
              row
              value={customizationData.sugarLevel}
              onChange={(e) =>
                setCustomizationData({
                  ...customizationData,
                  sugarLevel: e.target.value,
                })
              }
            >
              {CustomizationData.sugarLevels.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {/* Ice Level - Only show if cold */}
          {customizationData.temperature === 'cold' && (
            <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
              <FormLabel component="legend">Ice Level</FormLabel>
              <RadioGroup
                row
                value={customizationData.iceLevel}
                onChange={(e) =>
                  setCustomizationData({
                    ...customizationData,
                    iceLevel: e.target.value,
                  })
                }
              >
                {CustomizationData.iceLevels.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={<Radio />}
                    label={option.label}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}

          {/* Toppings */}
          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel component="legend">Toppings</FormLabel>
            <Box>
              {CustomizationData.toppings.map((topping) => (
                <FormControlLabel
                  key={topping.key}
                  control={
                    <Checkbox
                      checked={customizationData[topping.key]}
                      onChange={(e) =>
                        setCustomizationData({
                          ...customizationData,
                          [topping.key]: e.target.checked,
                        })
                      }
                    />
                  }
                  label={topping.label}
                />
              ))}
            </Box>
          </FormControl>

          {/* Quantity */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
            <Button
              variant="outlined"
              onClick={() =>
                setCustomizationData({
                  ...customizationData,
                  quantity: Math.max(1, (customizationData.quantity || 1) - 1),
                })
              }
            >
              -
            </Button>
            <Typography variant="h6">{customizationData.quantity || 1}</Typography>
            <Button
              variant="outlined"
              onClick={() =>
                setCustomizationData({
                  ...customizationData,
                  quantity: (customizationData.quantity || 1) + 1,
                })
              }
            >
              +
            </Button>
          </Box>

          {/* Price Display */}
          <Typography variant="h6" align="center" sx={{ mt: 2 }}>
            Total Price:{' '}
            {formatPrice(
              (currentMenuItem
                ? calculateCustomizedPrice(
                    currentMenuItem.price,
                    customizationData
                  )
                : 0) * (customizationData.quantity || 1)
            )}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onAddToCart} variant="contained">
          Add to Cart
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomizationDialog;
