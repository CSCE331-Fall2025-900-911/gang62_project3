import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';

const MenuItemDialog = ({
  open,
  onClose,
  title,
  name,
  price,
  onNameChange,
  onPriceChange,
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
