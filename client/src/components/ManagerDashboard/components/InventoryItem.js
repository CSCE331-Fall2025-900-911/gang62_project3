import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const API_BASE_URL = process.env.REACT_APP_API || 'http://localhost:3001';

export default function InventoryItem({ item }) {
  const [stock, setStock] = useState(item.stock);
  const [updating, setUpdating] = useState(false);
  const [open, setOpen] = useState(false);
  const [newStock, setNewStock] = useState('');

  const handleOpen = () => {
    setNewStock(stock.toString());
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleUpdateStock = async () => {
    const stockValue = parseInt(newStock, 10);
    // console.log('Updating stock for item:', item.id, 'New stock value:', stockValue);
    if (isNaN(stockValue) || stockValue < 0) {
      // Basic validation
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock: stockValue }),
      });
      console.log("Response from server:", response);
      
      if (!response.ok) {
        throw new Error('Failed to update stock');
      }
      
      setStock(stockValue);
      handleClose();
    } catch (error) {
      console.error('Error updating stock:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', width : '100%' }}>
        <CardContent>
          <Typography variant="h6" component="div" gutterBottom>
            {item.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ID: {item.id}
          </Typography>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" fontWeight="bold">
                Stock: {stock}
              </Typography>
              <Button 
                size="small" 
                startIcon={<EditIcon />}
                onClick={handleOpen}
                disabled={updating}
              >
                Edit
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Update Stock for {item.name}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="stock"
            label="New Stock Quantity"
            type="number"
            fullWidth
            variant="outlined"
            value={newStock}
            onChange={(e) => setNewStock(e.target.value)}
            inputProps={{ min: 0 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleUpdateStock} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
