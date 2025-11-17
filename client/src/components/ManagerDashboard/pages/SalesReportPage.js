import { Box, Typography } from '@mui/material';
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded';

export default function SalesReportPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <AssessmentRoundedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Sales Report
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary">
        Analyze sales data and performance metrics.
      </Typography>
    </Box>
  );
}
