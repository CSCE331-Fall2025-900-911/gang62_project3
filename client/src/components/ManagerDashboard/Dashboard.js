import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useState } from 'react';
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


const xThemeComponents = {
  ...chartsCustomizations,
  ...dataGridCustomizations,
  ...datePickersCustomizations,
  ...treeViewCustomizations,
};

export default function Dashboard(props) {
  const [activePage, setActivePage] = useState('Home');
  

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

  return (
    <AppTheme {...props} themeComponents={xThemeComponents}>
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        <SideMenu activePage={activePage} setActivePage={setActivePage} user={props.user} />
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
            <Header />
            {renderPage()}
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
