import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, CssBaseline } from '@mui/material';
import AppTheme from '../shared-theme/AppTheme';
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
function Kiosk() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

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
      <Typography 
        variant="h3" 
        component="h1" 
        gutterBottom 
        sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}
      >
        Menu
      </Typography>
      
      <Grid container spacing={3}>
        {menuItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
            <MenuItem item={item} />
          </Grid>
        ))}
      </Grid>
    </Box>
    </AppTheme>
  );
}

export default Kiosk;


