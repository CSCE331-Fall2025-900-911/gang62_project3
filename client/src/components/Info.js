import * as React from 'react';
import PropTypes from 'prop-types';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';

function Info({ totalPrice, orderItems = [] }) {
  return (
    <React.Fragment>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
        Total
      </Typography>
      <Typography variant="h4" gutterBottom>
        {totalPrice}
      </Typography>
      <List disablePadding>
        {orderItems.length > 0 ? (
          orderItems.map((item, index) => (
            <ListItem key={`${item.id}-${index}`} sx={{ py: 1, px: 0 }}>
              <ListItemText
                sx={{ mr: 2 }}
                primary={item.name}
                secondary={`Sugar: ${item.sugarLevel || 'N/A'} | Ice: ${item.iceLevel || 'N/A'}`}
              />
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                ${item.price.toFixed(2)}
              </Typography>
            </ListItem>
          ))
        ) : (
          <ListItem sx={{ py: 1, px: 0 }}>
            <ListItemText
              primary="No items in order"
              secondary="Add items from the kiosk"
            />
          </ListItem>
        )}
      </List>
    </React.Fragment>
  );
}

Info.propTypes = {
  totalPrice: PropTypes.string.isRequired,
  orderItems: PropTypes.array,
};

export default Info;
