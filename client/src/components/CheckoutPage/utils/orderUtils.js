import {
  API_BASE_URL,
  KIOSK_EMPLOYEE_ID,
  WALK_IN_CUSTOMER_ID,
  STRAW_ITEM_ID,
  NAPKIN_ITEM_ID,
  BAG_ITEM_ID,
  CUP_HOLDER_ITEM_ID,
  CUP_SIZE_BY_KEY,
} from '../constants';

export function buildOrderPayload(orderItems, extras) {
  const quantityById = {};

  const incrementQuantity = (id, amount = 1) => {
    if (!id || amount <= 0) return;
    const key = String(id);
    quantityById[key] = (quantityById[key] || 0) + amount;
  };

  // Drinks from the kiosk
  orderItems.forEach((item) => {
    if (!item || typeof item.id === 'undefined') return;
    // Base drink
    incrementQuantity(item.id);

    // One cup per drink, based on selected size (default to medium)
    const sizeKey = (item.size || 'medium').toLowerCase();
    const cupId = CUP_SIZE_BY_KEY[sizeKey] || CUP_SIZE_BY_KEY.medium;
    incrementQuantity(cupId);

    // One straw per drink
    incrementQuantity(STRAW_ITEM_ID);
  });

  // Extras chosen at checkout
  if (extras.bag > 0) {
    incrementQuantity(BAG_ITEM_ID, extras.bag);
  }
  if (extras.cupHolder > 0) {
    incrementQuantity(CUP_HOLDER_ITEM_ID, extras.cupHolder);
  }
  if (extras.extraStraws > 0) {
    incrementQuantity(STRAW_ITEM_ID, extras.extraStraws);
  }
  if (extras.napkins > 0) {
    incrementQuantity(NAPKIN_ITEM_ID, extras.napkins);
  }

  return Object.entries(quantityById).map(([id, quantity]) => ({
    id: Number(id),
    quantity,
  }));
}

export async function submitOrder(orderItems, extras) {
  const itemsPayload = buildOrderPayload(orderItems, extras);

  if (itemsPayload.length === 0) {
    throw new Error('Unable to submit order: no valid items found.');
  }

  const response = await fetch(`${API_BASE_URL}/api/submit-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      employeeID: KIOSK_EMPLOYEE_ID,
      customerID: WALK_IN_CUSTOMER_ID,
      items: itemsPayload,
    }),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to submit order';
    try {
      const data = await response.json();
      if (data && data.error) {
        errorMessage = data.error;
      }
    } catch (err) {
      // Ignore JSON parse errors and fall back to default message
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

