import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Table, TableHead, TableRow, TableCell, TableBody, Button } from '@mui/material';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Minimal page that lists all orders and their line items.
 * Intended for manager use; focuses on raw data visibility instead of styling.
 */
export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentLimit, setCurrentLimit] = useState(20);
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    const fetchOrders = async (limit = 20) => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/orders-with-items?limit=${limit}`);
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        const data = await response.json();
        // Sort client-side by most recent (createdAt desc, then id desc)
        const sorted = [...data].sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          if (aTime !== bTime) {
            return bTime - aTime;
          }
          return (b.id || 0) - (a.id || 0);
        });
        setOrders(sorted);
        setCurrentLimit(limit);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchOrders(20);
  }, []);

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

  const toggleOrderExpanded = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <ListAltRoundedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Orders
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="body2">
          Showing {orders.length} most recent orders (limit {currentLimit}).
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              (async () => {
                try {
                  const response = await fetch(`${API_BASE_URL}/api/orders-with-items?limit=20`);
                  if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                  }
                  const data = await response.json();
                  const sorted = [...data].sort((a, b) => {
                    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    if (aTime !== bTime) {
                      return bTime - aTime;
                    }
                    return (b.id || 0) - (a.id || 0);
                  });
                  setOrders(sorted);
                  setCurrentLimit(20);
                  setExpandedOrders({});
                } catch (err) {
                  setError(err.message);
                }
              })();
            }}
            disabled={currentLimit === 20}
          >
            Show latest 20
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              (async () => {
                try {
                  const response = await fetch(`${API_BASE_URL}/api/orders-with-items?limit=200`);
                  if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                  }
                  const data = await response.json();
                  const sorted = [...data].sort((a, b) => {
                    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    if (aTime !== bTime) {
                      return bTime - aTime;
                    }
                    return (b.id || 0) - (a.id || 0);
                  });
                  setOrders(sorted);
                  setCurrentLimit(200);
                  setExpandedOrders({});
                } catch (err) {
                  setError(err.message);
                }
              })();
            }}
          >
            Show more
          </Button>
        </Box>
      </Box>

      <Paper sx={{ width: '100%', overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Employee ID</TableCell>
              <TableCell>Customer ID</TableCell>
              <TableCell>Subtotal</TableCell>
              <TableCell>Tax</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Items</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.createdAt}</TableCell>
                <TableCell>{order.employeeId ?? '-'}</TableCell>
                <TableCell>{order.customerId ?? '-'}</TableCell>
                <TableCell>${order.subtotal.toFixed(2)}</TableCell>
                <TableCell>${order.tax.toFixed(2)}</TableCell>
                <TableCell>${order.total.toFixed(2)}</TableCell>
                <TableCell>
                  {order.items && order.items.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => toggleOrderExpanded(order.id)}
                      >
                        {expandedOrders[order.id]
                          ? 'Hide items'
                          : `Show items (${order.items.length})`}
                      </Button>
                      {expandedOrders[order.id] && (
                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                          {order.items.map((item, index) => (
                            <Box
                              key={`${order.id}-${item.menuItemId}-${index}`}
                              component="li"
                            >
                              {item.name} x{item.qty} (${item.lineTotal.toFixed(2)})
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No items
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}


