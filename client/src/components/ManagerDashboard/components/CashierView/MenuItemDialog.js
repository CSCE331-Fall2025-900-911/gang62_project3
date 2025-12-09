import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';

const MenuItemDialog = ({
  open,
  onClose,
  title,
  name,
  price,
  drinkType,
  imageUrl,
  drinkTypeOptions = [],
  onNameChange,
  onPriceChange,
  onDrinkTypeChange,
  onImageUrlChange,
  onSubmit,
  submitLabel,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Price ($)"
            type="number"
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            fullWidth
            label="Drink Type"
            value={drinkType}
            onChange={(e) => onDrinkTypeChange && onDrinkTypeChange(e.target.value)}
            sx={{ mb: 2 }}
          >
            {drinkTypeOptions.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Image URL"
            value={imageUrl}
            onChange={(e) => onImageUrlChange && onImageUrlChange(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained">
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MenuItemDialog;
