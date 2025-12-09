import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppNavbar from './components/AppNavbar';
import Header from './components/Header';
import MainGrid from './components/MainGrid';
import SideMenu from './components/SideMenu';
import AppTheme from '../../shared-theme/AppTheme';
import InventoryPage from './pages/InventoryPage';
import CashierViewPage from './pages/CashierViewPage';
import EmployeesPage from './pages/EmployeesPage';
import XReportPage from './pages/XReportPage';
import ZReportPage from './pages/ZReportPage';
import OrdersPage from './pages/OrdersPage';
import {
  chartsCustomizations,
  dataGridCustomizations,
  datePickersCustomizations,
  treeViewCustomizations,
} from './theme/customizations';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Dashboard(props) {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('Home');
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          const user = data.user;
          
          // Check if user is authenticated and is an admin
          if (!user || (!user.isAdmin && user.role !== 'admin')) {
            // Not an admin, redirect to login
            setIsAuthorized(false);
            setAuthChecked(true);
            navigate('/', { replace: true });
            return;
          }
          
          // User is admin, allow access
          setIsAuthorized(true);
        } else {
          // Not authenticated, redirect to login
          setIsAuthorized(false);
          setAuthChecked(true);
          navigate('/', { replace: true });
          return;
        }
      } catch (error) {
        console.error('Failed to verify admin access:', error);
        setIsAuthorized(false);
        setAuthChecked(true);
        navigate('/', { replace: true });
        return;
      } finally {
        setAuthChecked(true);
      }
    };

    checkAdminAccess();
  }, [navigate]);

  const renderPage = () => {
    switch (activePage) {
      case 'Home':
        return <MainGrid />;
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

      default:
        return <MainGrid />;
    }
  };

  // Don't render dashboard until auth check is complete
  if (!authChecked) {
    return null;
  }

  // If not authorized, don't render anything (redirect is in progress)
  if (!isAuthorized) {
    return null;
  }

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu activePage={activePage} setActivePage={setActivePage} />
        <AppNavbar activePage={activePage} setActivePage={setActivePage} />
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
