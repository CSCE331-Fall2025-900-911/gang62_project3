export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
export const KIOSK_EMPLOYEE_ID = 1; // Default employee for kiosk orders
export const WALK_IN_CUSTOMER_ID = 1; // Default "walk-in" customer

// Menu item IDs for accessories and packaging (must match data/menu_items.csv)
export const STRAW_ITEM_ID = 46;
export const NAPKIN_ITEM_ID = 47;
export const SMALL_CUP_ITEM_ID = 48;
export const MEDIUM_CUP_ITEM_ID = 49;
export const LARGE_CUP_ITEM_ID = 50;
export const BAG_ITEM_ID = 51;
export const CUP_HOLDER_ITEM_ID = 52;

export const CUP_SIZE_BY_KEY = {
  small: SMALL_CUP_ITEM_ID,
  medium: MEDIUM_CUP_ITEM_ID,
  large: LARGE_CUP_ITEM_ID,
};

export const STEPS = ['Name', 'Payment details', 'Review your order'];
export const TAX_RATE = 0.0825; // Match tax used in Review component

