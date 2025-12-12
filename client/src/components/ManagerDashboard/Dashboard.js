import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppNavbar from './components/AppNavbar';
import Header from './components/Header';
import MainGrid from './components/MainGrid';
import SideMenu from './components/SideMenu';
import CartSidebar from './components/CartSidebar';
import AppTheme from '../../shared-theme/AppTheme';
import InventoryPage from './pages/InventoryPage';
import CashierViewPage from './pages/CashierViewPage';
import EmployeesPage from './pages/EmployeesPage';
import XReportPage from './pages/XReportPage';
import ZReportPage from './pages/ZReportPage';
import OrdersPage from './pages/OrdersPage';
import KioskPage from './pages/KioskPage';
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

export default function Dashboard(props) {
  const location = useLocation();
  const [activePage, setActivePage] = useState('Home');
  const [kioskCartOpen, setKioskCartOpen] = useState(false);
  const [kioskOrderItems, setKioskOrderItems] = useState([]);
  const [kioskOrderTotal, setKioskOrderTotal] = useState(0);

  function setTab(tab) {
    setActivePage(tab);
  }

  const handleKioskCartStateChange = (isOpen) => {
    setKioskCartOpen(isOpen);
  };

  // Handle navigation state from Checkout page
  useEffect(() => {
    if (location.state) {
      const { activePage: targetPage, orderItems, orderTotal } = location.state;
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
      case 'Home':
        return <MainGrid setActivePage={setTab} />;
      case 'Inventory':
        return <InventoryPage />;
      case 'Cashier View':
        return <CashierViewPage />;
      case 'Employees':
        return <EmployeesPage />;
      case 'Orders':
        return <OrdersPage />;
      case 'X Report':
        return <XReportPage />;
      case 'Z Report':
        return <ZReportPage />;
      case 'Kiosk':
        return (
          <KioskPage 
            user={props.user} 
            onCartStateChange={handleKioskCartStateChange}
            orderItems={kioskOrderItems}
            setOrderItems={setKioskOrderItems}
            orderTotal={kioskOrderTotal}
            setOrderTotal={setKioskOrderTotal}
            dashboardType="manager"
          />
        );

      default:
        return <MainGrid />;
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
          <SideMenu activePage={activePage} setActivePage={setActivePage} user={props.user} />
        )}
        <AppNavbar activePage={activePage} setActivePage={setActivePage} user={props.user} />
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
            <Header activePage={activePage} />
            {renderPage()}
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
