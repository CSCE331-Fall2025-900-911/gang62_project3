import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

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

/**
 * Employees page component for displaying and managing employee information.
 * Fetches employees from the database and displays them in a data grid with
 * their ID, name, role, and calculated tips.
 * 
 * @component
 * @author Michael Nguyen
 */
export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  /**
   * Fetches all employees from the API endpoint.
   * Updates the component state with the retrieved employees.
   * 
   * @returns {Promise<void>} Promise that resolves when employees are fetched
   * @throws {Error} If API request fails, sets error state
   * @author Michael Nguyen
   */
  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/employees`);
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      const data = await response.json();
      setEmployees(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Error: {error}</Alert>
      </Box>
    );
  }

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
          rows={employees}
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
