import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';

const columns = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'Name', width: 200 },
  { field: 'role', headerName: 'Role', width: 150 },
  { 
    field: 'tips', 
    headerName: 'Tips', 
    type: 'number', 
    width: 150, 
    headerAlign: 'left',
    align: 'left',
    valueFormatter: (value) => {
      if (value == null) {
        return '';
      }
      return `$${value.toFixed(2)}`;
    },
  },
];

const rows = [
  { id: 1, name: 'Jonah Coffelt', role: 'Manager', tips: 150.50 },
  { id: 2, name: 'Michael Nguyen', role: 'Barista', tips: 85.20 },
  { id: 3, name: 'Zane', role: 'Cashier', tips: 45.00 },
  { id: 4, name: 'Alice Smith', role: 'Barista', tips: 92.75 },
  { id: 5, name: 'Bob Jones', role: 'Kitchen Staff', tips: 30.00 },
  { id: 6, name: 'Charlie Brown', role: 'Cashier', tips: 55.50 },
  { id: 7, name: 'David Wilson', role: 'Barista', tips: 110.25 },
  { id: 8, name: 'Eva Davis', role: 'Manager', tips: 175.00 },
  { id: 9, name: 'Frank Miller', role: 'Kitchen Staff', tips: 25.50 },
  { id: 10, name: 'Grace Lee', role: 'Cashier', tips: 60.00 },
];

export default function EmployeesPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <PeopleRoundedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Employees
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage employee information and view their tips.
      </Typography>
      
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Paper>
    </Box>
  );
}
