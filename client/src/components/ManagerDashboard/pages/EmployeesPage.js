import { Box, Typography } from '@mui/material';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';

export default function EmployeesPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <PeopleRoundedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Employees
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary">
        Manage employee information and schedules.
      </Typography>
    </Box>
  );
}
