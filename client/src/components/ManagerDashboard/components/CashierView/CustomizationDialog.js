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
              <FormControlLabel
                value="no"
                control={<Radio />}
                label="No Sugar"
              />
              <FormControlLabel
                value="normal"
                control={<Radio />}
                label="Normal Sugar"
              />
              <FormControlLabel
                value="extra"
                control={<Radio />}
                label="Extra Sugar (+$0.50)"
              />
            </RadioGroup>
          </FormControl>

          {/* Ice Level */}
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
              <FormControlLabel
                value="no"
                control={<Radio />}
                label="No Ice"
              />
              <FormControlLabel
                value="normal"
                control={<Radio />}
                label="Normal Ice"
              />
              <FormControlLabel
                value="extra"
                control={<Radio />}
                label="Extra Ice (+$0.25)"
              />
            </RadioGroup>
          </FormControl>

          {/* Toppings */}
          <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
            <FormLabel component="legend">Toppings</FormLabel>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={customizationData.pearls}
                    onChange={(e) =>
                      setCustomizationData({
                        ...customizationData,
                        pearls: e.target.checked,
                      })
                    }
                  />
                }
                label="Boba Pearls (+$0.75)"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={customizationData.jelly}
                    onChange={(e) =>
                      setCustomizationData({
                        ...customizationData,
                        jelly: e.target.checked,
                      })
                    }
                  />
                }
                label="Coconut Jelly (+$0.50)"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={customizationData.pudding}
                    onChange={(e) =>
                      setCustomizationData({
                        ...customizationData,
                        pudding: e.target.checked,
                      })
                    }
                  />
                }
                label="Pudding (+$0.60)"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={customizationData.whippedCream}
                    onChange={(e) =>
                      setCustomizationData({
                        ...customizationData,
                        whippedCream: e.target.checked,
                      })
                    }
                  />
                }
                label="Whipped Cream (+$0.40)"
              />
            </Box>
          </FormControl>

          {/* Price Display */}
          <Typography variant="h6" align="center" sx={{ mt: 2 }}>
            Total Price:{' '}
            {formatPrice(
              currentMenuItem
                ? calculateCustomizedPrice(
                    currentMenuItem.price,
                    customizationData
                  )
                : 0
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
