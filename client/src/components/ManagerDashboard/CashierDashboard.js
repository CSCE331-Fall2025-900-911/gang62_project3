import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppNavbar from './components/AppNavbar';
import Header from './components/Header';
import SideMenu from './components/SideMenu';
import CartSidebar from './components/CartSidebar';
import AppTheme from '../../shared-theme/AppTheme';
import CashierViewPage from './pages/CashierViewPage';
import KioskPage from './pages/KioskPage';
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded';
import StoreRoundedIcon from '@mui/icons-material/StoreRounded';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from './theme/customizations';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

const cashierMenuItems = [
  { text: 'Cashier View', icon: <PointOfSaleRoundedIcon /> },
  { text: 'Kiosk', icon: <StoreRoundedIcon /> },
];

export default function CashierDashboard(props) {
  const location = useLocation();
  const [activePage, setActivePage] = useState('Cashier View');
  const [kioskCartOpen, setKioskCartOpen] = useState(false);
  const [kioskOrderItems, setKioskOrderItems] = useState([]);
  const [kioskOrderTotal, setKioskOrderTotal] = useState(0);

  const handleKioskCartStateChange = (isOpen) => {
    setKioskCartOpen(isOpen);
  };

  // Handle navigation state from Checkout page
  useEffect(() => {
    if (location.state) {
      const { activePage: targetPage, cartOpen, orderItems, orderTotal } = location.state;
      if (targetPage === 'Kiosk') {
        setActivePage('Kiosk');
        // Always show side menu by default (cart closed) when returning from checkout
        setKioskCartOpen(false);
        if (orderItems) {
          setKioskOrderItems(orderItems);
        }
        if (orderTotal !== undefined) {
          setKioskOrderTotal(orderTotal);
        }
      }
      // Clear the state to prevent re-applying on re-renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Calculate order total whenever order items change
  useEffect(() => {
    const total = kioskOrderItems.reduce((sum, item) => sum + (item.price || 0), 0);
    setKioskOrderTotal(total);
  }, [kioskOrderItems]);

  const renderPage = () => {
    switch (activePage) {
      case 'Cashier View':
        return <CashierViewPage />;
      case 'Kiosk':
        return (
          <KioskPage 
            user={props.user} 
            onCartStateChange={handleKioskCartStateChange}
            orderItems={kioskOrderItems}
            setOrderItems={setKioskOrderItems}
            orderTotal={kioskOrderTotal}
            setOrderTotal={setKioskOrderTotal}
            dashboardType="cashier"
          />
        );
      default:
        return <CashierViewPage />;
    }
  };

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        {activePage === 'Kiosk' && kioskCartOpen ? (
          <CartSidebar 
            orderItems={kioskOrderItems}
            orderTotal={kioskOrderTotal}
            onDeleteItem={(index) => {
              setKioskOrderItems(prev => prev.filter((_, i) => i !== index));
            }}
            onEditItem={(index, updatedItem) => {
              setKioskOrderItems(prev => prev.map((item, i) => i === index ? updatedItem : item));
            }}
          />
        ) : (
          <SideMenu activePage={activePage} setActivePage={setActivePage} menuItems={cashierMenuItems} user={props.user} />
        )}
        <AppNavbar activePage={activePage} setActivePage={setActivePage} menuItems={cashierMenuItems} user={props.user} />
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            <Header />
            {renderPage()}
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
