import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
} from '@mui/material';
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded';

import MenuItemsPanel from '../components/CashierView/MenuItemsPanel';
import ShoppingCartPanel from '../components/CashierView/ShoppingCartPanel';
import CheckoutPanel from '../components/CashierView/CheckoutPanel';
import CustomizationDialog from '../components/CashierView/CustomizationDialog';
import PaymentDialog from '../components/CashierView/PaymentDialog';
import MenuItemDialog from '../components/CashierView/MenuItemDialog';
import { CustomizationData } from '../../../models/CustomizationData';

const DRINK_TYPES = [
  { id: 'all', label: 'All Drinks' },
  { id: 'flavored tea', label: 'Flavored Tea' },
  { id: 'milk tea', label: 'Milk Tea' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'blended', label: 'Blended' },
  { id: 'matcha', label: 'Matcha' },
  { id: 'fruit', label: 'Fruit' },
];

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Cashier interface for processing customer orders and managing the point of sale.
 * 
 * @component
 * @author Michael Nguyen
 */
export default function CashierViewPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0.0);
  const [customizationDialogOpen, setCustomizationDialogOpen] = useState(false);
  const [currentMenuItem, setCurrentMenuItem] = useState(null);
  const [customizationData, setCustomizationData] = useState(new CustomizationData());
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [addMenuItemDialogOpen, setAddMenuItemDialogOpen] = useState(false);
  const [editMenuItemDialogOpen, setEditMenuItemDialogOpen] = useState(false);
  const [newMenuItemName, setNewMenuItemName] = useState('');
  const [newMenuItemPrice, setNewMenuItemPrice] = useState('');
  const [newMenuItemDrinkType, setNewMenuItemDrinkType] = useState('milk tea');
  const [newMenuItemImageUrl, setNewMenuItemImageUrl] = useState('');
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [selectedDrinkType, setSelectedDrinkType] = useState('all');
  const [sortBy, setSortBy] = useState('default'); // 'default', 'price-low', 'price-high'

  // Normalize drink type strings so we are resilient to casing/whitespace from the DB
  const normalizeDrinkType = (value) =>
    (value || '').toString().trim().toLowerCase();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    let total = 0.0;
    cartItems.forEach((item) => {
      total += item.subtotal;
    });
    setTotalAmount(total);
  }, [cartItems]);

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
   * Formats a price value as a currency string.
   * 
   * @param {number} price - The price value to format
   * @returns {string} Formatted price string (e.g., "$5.99")
   * @author Michael Nguyen
   */
  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  /**
   * Calculates the total price of a menu item with customizations applied.
   * Adds additional charges for extra sugar, extra ice, and toppings.
   * 
   * @param {number} basePrice - The base price of the menu item
   * @param {Object} customizations - Customization options object
   * @param {string} customizations.sugarLevel - Sugar level ('no', 'normal', 'extra')
   * @param {string} customizations.iceLevel - Ice level ('no', 'normal', 'extra')
   * @param {boolean} customizations.pearls - Whether boba pearls are selected
   * @param {boolean} customizations.jelly - Whether coconut jelly is selected
   * @param {boolean} customizations.pudding - Whether pudding is selected
   * @param {boolean} customizations.whippedCream - Whether whipped cream is selected
   * @returns {number} The calculated total price with customizations
   * @author Michael Nguyen
   */
  const calculateCustomizedPrice = (basePrice, customizations) => {
    let price = basePrice;
    // Add pricing logic if needed, for now matching Kiosk which seems to not add price
    // But preserving some logic if we want to add it back later
    // if (customizations.hasBoba) price += 0.75;
    // if (customizations.hasAiyuJelly) price += 0.50;
    return price;
  };

  /**
   * Generates a customized item name by appending customization modifiers.
   * 
   * @param {string} itemName - The base name of the menu item
   * @param {Object} customizations - Customization options object
   * @returns {string} The customized item name with modifiers (e.g., "Green Tea +Extra Sugar +Boba")
   * @author Michael Nguyen
   */
  const getCustomizedName = (itemName, customizations) => {
    let name = itemName;
    const parts = [];
    
    if (customizations.size !== 'medium') parts.push(`(${customizations.size})`);
    if (customizations.temperature !== 'cold') parts.push(`(${customizations.temperature})`);
    if (customizations.sugarLevel !== 'medium') parts.push(`${customizations.sugarLevel} Sugar`);
    if (customizations.temperature === 'cold' && customizations.iceLevel !== 'medium') {
      parts.push(`${customizations.iceLevel} Ice`);
    }
    
    if (customizations.hasBoba) parts.push('+Boba');
    if (customizations.hasAiyuJelly) parts.push('+Aiyu Jelly');
    
    if (parts.length > 0) {
      name += ' ' + parts.join(' ');
    }
    return name;
  };

  /**
   * Handles left-click on a menu item button.
   * Opens the customization dialog for the selected menu item.
   * 
   * @param {Object} item - The menu item that was clicked
   * @param {number} item.id - The menu item ID
   * @param {string} item.name - The menu item name
   * @param {number} item.price - The menu item base price
   * @author Michael Nguyen
   */
  const handleMenuItemClick = (item) => {
    setCurrentMenuItem(item);
    setCustomizationData(new CustomizationData());
    setCustomizationDialogOpen(true);
  };

  /**
   * Handles right-click on a menu item button.
   * Opens the edit menu item dialog for the selected menu item.
   * 
   * @param {Event} e - The mouse event
   * @param {Object} item - The menu item that was right-clicked
   * @param {number} item.id - The menu item ID
   * @param {string} item.name - The menu item name
   * @param {number} item.price - The menu item base price
   * @author Michael Nguyen
   */
  const handleMenuItemRightClick = (e, item) => {
    e.preventDefault();
    setEditingMenuItem(item);
    setNewMenuItemName(item.name);
    setNewMenuItemPrice(item.price.toString());
    setNewMenuItemDrinkType(item.drink_type || '');
    setNewMenuItemImageUrl(item.image_url || '');
    setEditMenuItemDialogOpen(true);
  };

  /**
   * Adds the current menu item with customizations to the shopping cart.
   * If an identical item (same name and price) already exists, increments its quantity.
   * Otherwise, adds a new item to the cart.
   * 
   * @author Michael Nguyen
   */
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
      updatedItems[existingIndex].quantity += customizationData.quantity;
      updatedItems[existingIndex].subtotal =
        updatedItems[existingIndex].quantity * customizedPrice;
      setCartItems(updatedItems);
    } else {
      // Add new item
      const newItem = {
        id: currentMenuItem.id,
        name: customizedName,
        price: customizedPrice,
        quantity: customizationData.quantity,
        subtotal: customizedPrice * customizationData.quantity,
        originalItem: currentMenuItem,
        customizations: { ...customizationData },
      };
      setCartItems([...cartItems, newItem]);
    }

    setCustomizationDialogOpen(false);
    setCurrentMenuItem(null);
  };

  /**
   * Removes the selected item from the shopping cart at the specified index.
   * 
   * @param {number} index - The index of the item to remove from the cart
   * @author Michael Nguyen
   */
  const removeSelectedItem = (index) => {
    const updatedItems = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedItems);
  };

  /**
   * Clears all items from the shopping cart.
   * 
   * @author Michael Nguyen
   */
  const clearCart = () => {
    setCartItems([]);
  };

  /**
   * Opens the payment dialog if the cart is not empty.
   * Shows an alert if the cart is empty.
   * 
   * @author Michael Nguyen
   */
  const processPayment = () => {
    if (cartItems.length === 0) {
      alert('Cart is empty!');
      return;
    }
    setPaymentDialogOpen(true);
  };

  /**
   * Submits the order to the database and processes the payment.
   * Sends order items with quantities to the API endpoint, which uses the Order class
   * to persist the order and tickets to the database.
   * 
   * @param {string} paymentMethod - The payment method used ('Cash' or 'Card')
   * @returns {Promise<void>} Promise that resolves when order is submitted
   * @throws {Error} If order submission fails, shows error alert
   * @author Michael Nguyen
   */
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

  /**
   * Clears the cart and prepares for a new sale.
   * Shows a confirmation message to the user.
   * 
   * @author Michael Nguyen
   */
  const newSale = () => {
    clearCart();
    alert('Ready for new sale!');
  };

  // Filter and sort menu items by drink type and price
  const filteredMenuItems = menuItems
    .filter((item) => {
      if (selectedDrinkType === 'all') return true;
      const drinkTypeId = normalizeDrinkType(item.drink_type);
      return drinkTypeId === selectedDrinkType;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') {
        return a.price - b.price;
      } else if (sortBy === 'price-high') {
        return b.price - a.price;
      }
      return 0; // default order
    });

  /**
   * Handles adding a new menu item to the database.
   * Validates input and calls the API endpoint to create the menu item.
   * 
   * @returns {Promise<void>} Promise that resolves when menu item is added
   * @throws {Error} If validation fails or API call fails, shows error alert
   * @author Michael Nguyen
   */
  const handleAddMenuItem = async () => {
    try {
      const name = newMenuItemName.trim();
      const price = parseFloat(newMenuItemPrice);
      const drinkType = newMenuItemDrinkType.trim();
      const imageUrl = newMenuItemImageUrl.trim();

      if (!name) {
        alert('Please enter a menu item name!');
        return;
      }

      if (isNaN(price) || price <= 0) {
        alert('Price must be greater than 0!');
        return;
      }

      if (!drinkType) {
        alert('Please enter a drink type!');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/menu-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, price, drinkType, imageUrl }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const message = errorBody.error || 'Failed to add menu item';
        throw new Error(message);
      }

      const createdItem = await response.json();

      // Optimistically update local state so the new item appears immediately
      setMenuItems((prev) => [...prev, createdItem]);

      alert('Menu item added successfully!');
      setAddMenuItemDialogOpen(false);
      setNewMenuItemName('');
      setNewMenuItemPrice('');
      setNewMenuItemDrinkType('milk tea');
      setNewMenuItemImageUrl('');
    } catch (error) {
      alert('Error adding menu item: ' + error.message);
    }
  };

  /**
   * Handles editing an existing menu item in the database.
   * Validates input and calls the API endpoint to update the menu item.
   * Currently shows a placeholder alert as the API endpoint is not yet implemented.
   * 
   * @returns {Promise<void>} Promise that resolves when menu item is updated
   * @throws {Error} If validation fails or API call fails, shows error alert
   * @author Michael Nguyen
   */
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
      console.log('Editing item:', editingMenuItem);
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

      {/* Filter and sort controls */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Drink Type</InputLabel>
          <Select
            value={selectedDrinkType}
            label="Drink Type"
            onChange={(e) => setSelectedDrinkType(e.target.value)}
          >
            {DRINK_TYPES.map((type) => (
              <MuiMenuItem key={type.id} value={type.id}>
                {type.label}
              </MuiMenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            label="Sort By"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MuiMenuItem value="default">Default</MuiMenuItem>
            <MuiMenuItem value="price-low">Price: Low to High</MuiMenuItem>
            <MuiMenuItem value="price-high">Price: High to Low</MuiMenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        {/* Menu Items Panel */}
        <Grid item xs={12} md={6}>
          <MenuItemsPanel
            menuItems={filteredMenuItems}
            onAddClick={() => setAddMenuItemDialogOpen(true)}
            onItemClick={handleMenuItemClick}
            onItemRightClick={handleMenuItemRightClick}
            formatPrice={formatPrice}
          />
        </Grid>

        {/* Shopping Cart Panel */}
        <Grid item xs={12} md={6}>
          <ShoppingCartPanel
            cartItems={cartItems}
            onRemoveItem={removeSelectedItem}
            onClearCart={clearCart}
            formatPrice={formatPrice}
          />
        </Grid>

        {/* Checkout Panel */}
        <Grid item xs={12}>
          <CheckoutPanel
            totalAmount={totalAmount}
            cartItemCount={cartItems.length}
            onProcessPayment={processPayment}
            onNewSale={newSale}
            formatPrice={formatPrice}
          />
        </Grid>
      </Grid>

      {/* Customization Dialog */}
      <CustomizationDialog
        open={customizationDialogOpen}
        onClose={() => setCustomizationDialogOpen(false)}
        currentMenuItem={currentMenuItem}
        customizationData={customizationData}
        setCustomizationData={setCustomizationData}
        onAddToCart={handleAddToCart}
        calculateCustomizedPrice={calculateCustomizedPrice}
        formatPrice={formatPrice}
      />

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        totalAmount={totalAmount}
        onPaymentSubmit={handlePaymentSubmit}
        formatPrice={formatPrice}
      />

      {/* Add Menu Item Dialog */}
      <MenuItemDialog
        open={addMenuItemDialogOpen}
        onClose={() => setAddMenuItemDialogOpen(false)}
        title="Add New Menu Item"
        name={newMenuItemName}
        price={newMenuItemPrice}
        drinkType={newMenuItemDrinkType}
        imageUrl={newMenuItemImageUrl}
        drinkTypeOptions={DRINK_TYPES.filter((type) => type.id !== 'all')}
        onNameChange={setNewMenuItemName}
        onPriceChange={setNewMenuItemPrice}
        onDrinkTypeChange={setNewMenuItemDrinkType}
        onImageUrlChange={setNewMenuItemImageUrl}
        onSubmit={handleAddMenuItem}
        submitLabel="Add"
      />

      {/* Edit Menu Item Dialog */}
      <MenuItemDialog
        open={editMenuItemDialogOpen}
        onClose={() => setEditMenuItemDialogOpen(false)}
        title="Edit Menu Item"
        name={newMenuItemName}
        price={newMenuItemPrice}
        drinkType={newMenuItemDrinkType}
        imageUrl={newMenuItemImageUrl}
        drinkTypeOptions={DRINK_TYPES.filter((type) => type.id !== 'all')}
        onNameChange={setNewMenuItemName}
        onPriceChange={setNewMenuItemPrice}
        onDrinkTypeChange={setNewMenuItemDrinkType}
        onImageUrlChange={setNewMenuItemImageUrl}
        onSubmit={handleEditMenuItem}
        submitLabel="Save"
      />
    </Box>
  );
}
