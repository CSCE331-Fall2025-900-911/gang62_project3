import { Box, Typography } from '@mui/material';
import PointOfSaleRoundedIcon from '@mui/icons-material/PointOfSaleRounded';

export default function CashierViewPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <PointOfSaleRoundedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Cashier View
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary">
        Point of sale interface for cashier operations.
      </Typography>
    </Box>
  );
}
