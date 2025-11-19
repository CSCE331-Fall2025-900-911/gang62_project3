import { Box, Typography } from '@mui/material';
import SummarizeRoundedIcon from '@mui/icons-material/SummarizeRounded';

export default function ZReportPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <SummarizeRoundedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Z Report
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary">
        End of day report for closing the register.
      </Typography>
    </Box>
  );
}
