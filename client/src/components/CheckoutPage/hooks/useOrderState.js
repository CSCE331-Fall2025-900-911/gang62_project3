import { useState, useEffect } from 'react';

export function useOrderState(orderItemsProp, orderTotalProp, setOrderItemsProp, setOrderTotalProp, fromDashboard, stateOrderItems, stateOrderTotal) {
  // Use order items from navigation state if in dashboard mode, otherwise use props
  const orderItems = fromDashboard && stateOrderItems ? stateOrderItems : orderItemsProp;
  const orderTotal = fromDashboard && stateOrderTotal !== undefined ? stateOrderTotal : orderTotalProp;

  // For dashboard mode, we need to handle state updates differently
  // Since we can't directly update dashboard state from here, we'll use local state
  // and sync back when navigating
  const [localOrderItems, setLocalOrderItems] = useState(orderItems);
  const [localOrderTotal, setLocalOrderTotal] = useState(orderTotal);

  // Update local state when orderItems from props/state change
  useEffect(() => {
    setLocalOrderItems(orderItems);
    setLocalOrderTotal(orderTotal);
  }, [orderItems, orderTotal]);

  // Use local state for dashboard mode, props for standalone mode
  const effectiveOrderItems = fromDashboard ? localOrderItems : orderItems;
  const effectiveSetOrderItems = fromDashboard ? setLocalOrderItems : setOrderItemsProp;
  const effectiveOrderTotal = fromDashboard ? localOrderTotal : orderTotal;
  const effectiveSetOrderTotal = fromDashboard ? setLocalOrderTotal : setOrderTotalProp;

  return {
    effectiveOrderItems,
    effectiveSetOrderItems,
    effectiveOrderTotal,
    effectiveSetOrderTotal,
  };
}

