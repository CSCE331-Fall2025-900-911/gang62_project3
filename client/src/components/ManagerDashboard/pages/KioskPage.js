import React, { useState } from 'react';
import { Box } from '@mui/material';
import Kiosk from '../../Kiosk/Kiosk';

export default function KioskPage({ user, onCartStateChange, orderItems: orderItemsProp, setOrderItems: setOrderItemsProp, orderTotal: orderTotalProp, setOrderTotal: setOrderTotalProp, dashboardType }) {
  const [internalOrderItems, setInternalOrderItems] = useState([]);
  const [internalOrderTotal, setInternalOrderTotal] = useState(0);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [showCart, setShowCart] = useState(false);

  // Use props if provided (dashboard mode with shared state), otherwise use internal state
  const orderItems = orderItemsProp !== undefined ? orderItemsProp : internalOrderItems;
  const setOrderItems = setOrderItemsProp || setInternalOrderItems;
  const orderTotal = orderTotalProp !== undefined ? orderTotalProp : internalOrderTotal;
  const setOrderTotal = setOrderTotalProp || setInternalOrderTotal;

  const handleCartToggle = (newState) => {
    setShowCart(newState);
    if (onCartStateChange) {
      onCartStateChange(newState);
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Kiosk
        orderItems={orderItems}
        setOrderItems={setOrderItems}
        orderTotal={orderTotal}
        setOrderTotal={setOrderTotal}
        user={user}
        ttsEnabled={ttsEnabled}
        setTtsEnabled={setTtsEnabled}
        showCart={showCart}
        setShowCart={handleCartToggle}
        inDashboard={!!onCartStateChange}
        dashboardType={dashboardType}
      />
    </Box>
  );
}

