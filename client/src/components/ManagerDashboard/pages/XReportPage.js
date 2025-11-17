import { Box, Typography } from '@mui/material';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';

export default function XReportPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <DescriptionRoundedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          X Report
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary">
        View current shift report without closing the register.
      </Typography>
    </Box>
  );
}
