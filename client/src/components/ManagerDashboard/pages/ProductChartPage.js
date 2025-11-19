import { Box, Typography } from '@mui/material';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';

export default function ProductChartPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <BarChartRoundedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Product Chart
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary">
        View product sales charts and analytics.
      </Typography>
    </Box>
  );
}
