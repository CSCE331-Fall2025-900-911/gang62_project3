import { styled } from '@mui/material/styles';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Info from '../../Kiosk/Info';

const drawerWidth = 280;

const Drawer = styled(MuiDrawer)({
  width: drawerWidth,
  flexShrink: 0,
  boxSizing: 'border-box',
  mt: 10,
  [`& .${drawerClasses.paper}`]: {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

export default function CartSidebar({ orderItems, orderTotal, onDeleteItem, onEditItem }) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        [`& .${drawerClasses.paper}`]: {
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box
        sx={{
          overflow: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          <Info 
            totalPrice={orderTotal} 
            orderItems={orderItems} 
            onDelete={onDeleteItem} 
            onEdit={onEditItem} 
          />
        </Box>
      </Box>
    </Drawer>
  );
}

