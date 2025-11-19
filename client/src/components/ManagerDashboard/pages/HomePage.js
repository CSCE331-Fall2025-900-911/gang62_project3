import { Box, Typography } from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';

export default function HomePage() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <HomeRoundedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Home
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary">
        Welcome to the Manager Dashboard. Select an option from the menu to get started.
      </Typography>
    </Box>
  );
}
