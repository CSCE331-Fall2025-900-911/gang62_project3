import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  Alert,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const API_BASE_URL = process.env.REACT_APP_API || 'http://localhost:3001';

export default function CashierViewPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0.0);
  const [customizationDialogOpen, setCustomizationDialogOpen] = useState(false);
  const [currentMenuItem, setCurrentMenuItem] = useState(null);
  const [customizationData, setCustomizationData] = useState({
    sugarLevel: 'normal',
    iceLevel: 'normal',
    pearls: false,
    jelly: false,
    pudding: false,
    whippedCream: false,
  });
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [addMenuItemDialogOpen, setAddMenuItemDialogOpen] = useState(false);
  const [editMenuItemDialogOpen, setEditMenuItemDialogOpen] = useState(false);
  const [newMenuItemName, setNewMenuItemName] = useState('');
  const [newMenuItemPrice, setNewMenuItemPrice] = useState('');
  const [editingMenuItem, setEditingMenuItem] = useState(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    updateTotal();
  }, [cartItems]);

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

  const updateTotal = () => {
    let total = 0.0;
    cartItems.forEach((item) => {
      total += item.subtotal;
    });
    setTotalAmount(total);
  };

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  const calculateCustomizedPrice = (basePrice, customizations) => {
    let price = basePrice;
    if (customizations.sugarLevel === 'extra') price += 0.50;
    if (customizations.iceLevel === 'extra') price += 0.25;
    if (customizations.pearls) price += 0.75;
    if (customizations.jelly) price += 0.50;
    if (customizations.pudding) price += 0.60;
    if (customizations.whippedCream) price += 0.40;
    return price;
  };

  const getCustomizedName = (itemName, customizations) => {
    let name = itemName;
    const parts = [];
    if (customizations.sugarLevel === 'extra') parts.push('+Extra Sugar');
    if (customizations.sugarLevel === 'no') parts.push('+No Sugar');
    if (customizations.iceLevel === 'extra') parts.push('+Extra Ice');
    if (customizations.iceLevel === 'no') parts.push('+No Ice');
    if (customizations.pearls) parts.push('+Boba');
    if (customizations.jelly) parts.push('+Jelly');
    if (customizations.pudding) parts.push('+Pudding');
    if (customizations.whippedCream) parts.push('+Cream');
    if (parts.length > 0) {
      name += ' ' + parts.join(' ');
    }
    return name;
  };

  const handleMenuItemClick = (item) => {
    setCurrentMenuItem(item);
    setCustomizationData({
      sugarLevel: 'normal',
      iceLevel: 'normal',
      pearls: false,
      jelly: false,
      pudding: false,
      whippedCream: false,
    });
    setCustomizationDialogOpen(true);
  };

  const handleMenuItemRightClick = (e, item) => {
    e.preventDefault();
    setEditingMenuItem(item);
    setNewMenuItemName(item.name);
    setNewMenuItemPrice(item.price.toString());
    setEditMenuItemDialogOpen(true);
  };

  const handleAddToCart = () => {
    if (!currentMenuItem) return;

    const customizedPrice = calculateCustomizedPrice(
      currentMenuItem.price,
      customizationData
    );
    const customizedName = getCustomizedName(
      currentMenuItem.name,
      customizationData
    );

    // Check if exact item (name and price) already exists in cart
    const existingIndex = cartItems.findIndex(
      (item) =>
        item.name === customizedName &&
        Math.abs(item.price - customizedPrice) < 0.01
    );

    if (existingIndex !== -1) {
      // Increment quantity
      const updatedItems = [...cartItems];
      updatedItems[existingIndex].quantity += 1;
      updatedItems[existingIndex].subtotal =
        updatedItems[existingIndex].quantity * customizedPrice;
      setCartItems(updatedItems);
    } else {
      // Add new item
      const newItem = {
        id: currentMenuItem.id,
        name: customizedName,
        price: customizedPrice,
        quantity: 1,
        subtotal: customizedPrice,
        originalItem: currentMenuItem,
        customizations: { ...customizationData },
      };
      setCartItems([...cartItems, newItem]);
    }

    setCustomizationDialogOpen(false);
    setCurrentMenuItem(null);
  };

  const removeSelectedItem = (index) => {
    const updatedItems = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedItems);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const processPayment = () => {
    if (cartItems.length === 0) {
      alert('Cart is empty!');
      return;
    }
    setPaymentDialogOpen(true);
  };

  const handlePaymentSubmit = async (paymentMethod) => {
    try {
      // Prepare order items - send items with quantities (matching Java behavior)
      // Each cart item represents the base menu item, quantity indicates how many times to add it
      const orderItems = cartItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      }));

      const response = await fetch(`${API_BASE_URL}/api/submit-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeID: 1, // TODO: update to be dynamic
          customerID: 1, // TODO: update to be dynamic
          items: orderItems,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit order');
      }

      alert(
        `Payment of ${formatPrice(
          totalAmount
        )} processed successfully via ${paymentMethod}!`
      );
      clearCart();
      setPaymentDialogOpen(false);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order: ' + error.message);
    }
  };

  const newSale = () => {
    clearCart();
    alert('Ready for new sale!');
  };

  const handleAddMenuItem = async () => {
    try {
      const name = newMenuItemName.trim();
      const price = parseFloat(newMenuItemPrice);

      if (!name) {
        alert('Please enter a menu item name!');
        return;
      }

      if (isNaN(price) || price <= 0) {
        alert('Price must be greater than 0!');
        return;
      }

      // TODO: Implement API endpoint for adding menu items
      // For now, just refresh the menu
      alert('Menu item addition not yet implemented via API');
      setAddMenuItemDialogOpen(false);
      setNewMenuItemName('');
      setNewMenuItemPrice('');
    } catch (error) {
      alert('Error adding menu item: ' + error.message);
    }
  };

  const handleEditMenuItem = async () => {
    try {
      const name = newMenuItemName.trim();
      const price = parseFloat(newMenuItemPrice);

      if (!name) {
        alert('Please enter a menu item name!');
        return;
      }

      if (isNaN(price) || price <= 0) {
        alert('Price must be greater than 0!');
        return;
      }

      // TODO: Implement API endpoint for editing menu items
      alert('Menu item editing not yet implemented via API');
      setEditMenuItemDialogOpen(false);
      setEditingMenuItem(null);
      setNewMenuItemName('');
      setNewMenuItemPrice('');
    } catch (error) {
      alert('Error updating menu item: ' + error.message);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Error: {error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <PointOfSaleRoundedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Cashier View
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Menu Items Panel */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6">Menu Items</Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setAddMenuItemDialogOpen(true)}
                >
                  Add Menu Item
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                Left-click to order, Right-click to edit
              </Typography>
              <Grid container spacing={2}>
                {menuItems.map((item) => (
                  <Grid item xs={6} sm={4} key={item.id}>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{
                        minHeight: 80,
                        flexDirection: 'column',
                        textTransform: 'none',
                      }}
                      onClick={() => handleMenuItemClick(item)}
                      onContextMenu={(e) => handleMenuItemRightClick(e, item)}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {item.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatPrice(item.price)}
                      </Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Shopping Cart Panel */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Shopping Cart
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cartItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          Cart is empty
                        </TableCell>
                      </TableRow>
                    ) : (
                      cartItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell align="right">
                            {formatPrice(item.price)}
                          </TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">
                            {formatPrice(item.subtotal)}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => removeSelectedItem(index)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={clearCart}
                  disabled={cartItems.length === 0}
                >
                  Clear Cart
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Checkout Panel */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h5" fontWeight="bold">
                  Total: {formatPrice(totalAmount)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={processPayment}
                    disabled={cartItems.length === 0}
                  >
                    Process Payment
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={newSale}
                    disabled={cartItems.length === 0}
                  >
                    New Sale
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Customization Dialog */}
      <Dialog
        open={customizationDialogOpen}
        onClose={() => setCustomizationDialogOpen(false)}
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
          <Button onClick={() => setCustomizationDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddToCart} variant="contained">
            Add to Cart
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
      >
        <DialogTitle>Payment Method</DialogTitle>
        <DialogContent>
          <Typography>
            Select payment method for {formatPrice(totalAmount)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => handlePaymentSubmit('Cash')}
            variant="contained"
          >
            Cash
          </Button>
          <Button
            onClick={() => handlePaymentSubmit('Card')}
            variant="contained"
          >
            Card
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Menu Item Dialog */}
      <Dialog
        open={addMenuItemDialogOpen}
        onClose={() => setAddMenuItemDialogOpen(false)}
      >
        <DialogTitle>Add New Menu Item</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={newMenuItemName}
              onChange={(e) => setNewMenuItemName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Price ($)"
              type="number"
              value={newMenuItemPrice}
              onChange={(e) => setNewMenuItemPrice(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMenuItemDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddMenuItem} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Menu Item Dialog */}
      <Dialog
        open={editMenuItemDialogOpen}
        onClose={() => setEditMenuItemDialogOpen(false)}
      >
        <DialogTitle>Edit Menu Item</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={newMenuItemName}
              onChange={(e) => setNewMenuItemName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Price ($)"
              type="number"
              value={newMenuItemPrice}
              onChange={(e) => setNewMenuItemPrice(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditMenuItemDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditMenuItem} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
