import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, CssBaseline, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AppTheme from '../../shared-theme/AppTheme';
import MenuItem from './MenuItem';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Kiosk component for displaying menu items in a touchscreen-friendly interface.
 * Fetches menu items from the API and displays them in a responsive grid layout.
 * Designed for casual end users in a publicly viewable restaurant lobby space.
 * 
 * @component
 * @author Michael Nguyen
 */
function Kiosk({ orderItems, setOrderItems, orderTotal, setOrderTotal }) {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    // Calculate total whenever orderItems changes
    const total = orderItems.reduce((sum, item) => sum + item.price, 0);
    setOrderTotal(total);
  }, [orderItems, setOrderTotal]);

  /**
   * Fetches all menu items from the API endpoint.
   * Updates the component state with the retrieved menu items.
   * 
   * @returns {Promise<void>} Promise that resolves when menu items are fetched
   * @throws {Error} If API request fails, sets error state
   * @author Michael Nguyen
   */
  const fetchMenuItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/menu-items`);
      if (!response.ok) {
        throw new Error('Failed to fetch menu items');
      }
      const data = await response.json();
      setMenuItems(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  /**
   * Handles adding an item to the order
   * 
   * @param {Object} item - The menu item to add to the order
   */
  const handleAddToOrder = (item) => {
    setOrderItems([...orderItems, item]);
    console.log('Item added to order:', item);
    console.log('Current order:', [...orderItems, item]);
  };

  if (loading) {
    return (
      <AppTheme>
        <CssBaseline />
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4">Loading menu...</Typography>
        </Box>
      </AppTheme>
    );
  }

  if (error) {
    return (
      <AppTheme>
        <CssBaseline />
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" color="error">Error: {error}</Typography>
        </Box>
      </AppTheme>
    );
  }

  return (
    <AppTheme>
      <CssBaseline />
      <Box sx={{ p: 4, minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ fontWeight: 'bold' }}
        >
          Menu
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              Order Total
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              ${orderTotal.toFixed(2)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {orderItems.length} {orderItems.length === 1 ? 'item' : 'items'}
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => navigate('/checkout')}
            sx={{ px: 4 }}
          >
            Checkout
          </Button>
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {menuItems.map((item) => (
          <Grid item key={item.id} sx={{ width: 'calc(20% - 24px)', minWidth: '200px' }}>
            <MenuItem item={item} onItemClick={handleAddToOrder} />
          </Grid>
        ))}
      </Grid>
    </Box>
    </AppTheme>
  );
}

export default Kiosk;


