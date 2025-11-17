import { Box, Typography } from '@mui/material';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';

export default function InventoryPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <InventoryRoundedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Inventory
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary">
        Manage your inventory items here.
      </Typography>
    </Box>
  );
}
