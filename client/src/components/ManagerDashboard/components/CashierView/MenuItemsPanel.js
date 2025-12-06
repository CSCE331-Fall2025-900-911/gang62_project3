import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
} from '@mui/material';

const MenuItemsPanel = ({ menuItems, onAddClick, onItemClick, onItemRightClick, formatPrice }) => {
  return (
    <Card>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="h6">Menu Items</Typography>
          <Button
            variant="contained"
            size="small"
            onClick={onAddClick}
          >
            Add Menu Item
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
          Left-click to order, Right-click to edit
        </Typography>
        <Grid container spacing={2}>
          {menuItems.map((item) => (
            <Grid item xs={6} sm={4} key={item.id}>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  minHeight: 80,
                  flexDirection: 'column',
                  textTransform: 'none',
                }}
                onClick={() => onItemClick(item)}
                onContextMenu={(e) => onItemRightClick(e, item)}
              >
                <Typography variant="body2" fontWeight="bold">
                  {item.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatPrice(item.price)}
                </Typography>
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default MenuItemsPanel;
