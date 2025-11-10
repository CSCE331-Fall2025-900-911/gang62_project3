import * as React from 'react';
import PropTypes from 'prop-types';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Box from '@mui/material/Box';

function Info({ totalPrice, orderItems = [], onDelete, onEdit }) {
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingIndex, setEditingIndex] = React.useState(null);
  const [editingSugarLevel, setEditingSugarLevel] = React.useState('medium');
  const [editingIceLevel, setEditingIceLevel] = React.useState('medium');

  const handleEditClick = (index, item) => {
    setEditingIndex(index);
    setEditingSugarLevel(item.sugarLevel || 'medium');
    setEditingIceLevel(item.iceLevel || 'medium');
    setEditDialogOpen(true);
  };

  const handleEditSave = () => {
    if (editingIndex !== null && onEdit) {
      const updatedItem = {
        ...orderItems[editingIndex],
        sugarLevel: editingSugarLevel,
        iceLevel: editingIceLevel
      };
      onEdit(editingIndex, updatedItem);
    }
    setEditDialogOpen(false);
    setEditingIndex(null);
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setEditingIndex(null);
  };

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
            <ListItem 
              key={`${item.id}-${index}`} 
              sx={{ 
                py: 1, 
                px: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <ListItemText
                sx={{ mr: 2, flex: 1 }}
                primary={item.name}
                secondary={`Sugar: ${item.sugarLevel || 'N/A'} | Ice: ${item.iceLevel || 'N/A'}`}
              />
              <Typography variant="body1" sx={{ fontWeight: 'medium', mr: 1 }}>
                ${item.price.toFixed(2)}
              </Typography>
              {onEdit && (
                <IconButton 
                  size="small" 
                  onClick={() => handleEditClick(index, item)}
                  sx={{ color: 'primary.main' }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
              {onDelete && (
                <IconButton 
                  size="small" 
                  onClick={() => onDelete(index)}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
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

      {/* Edit Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={handleEditCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
          Edit Item
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            {/* Sugar Level Selection */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Sugar Level
            </Typography>
            <ButtonGroup fullWidth variant="outlined" sx={{ mb: 4 }}>
              <Button
                variant={editingSugarLevel === 'low' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setEditingSugarLevel('low')}
                sx={{ py: 2, fontSize: '1rem', fontWeight: 600 }}
              >
                Low
              </Button>
              <Button
                variant={editingSugarLevel === 'medium' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setEditingSugarLevel('medium')}
                sx={{ py: 2, fontSize: '1rem', fontWeight: 600 }}
              >
                Medium
              </Button>
              <Button
                variant={editingSugarLevel === 'high' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setEditingSugarLevel('high')}
                sx={{ py: 2, fontSize: '1rem', fontWeight: 600 }}
              >
                High
              </Button>
            </ButtonGroup>

            {/* Ice Level Selection */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Ice Level
            </Typography>
            <ButtonGroup fullWidth variant="outlined">
              <Button
                variant={editingIceLevel === 'low' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setEditingIceLevel('low')}
                sx={{ py: 2, fontSize: '1rem', fontWeight: 600 }}
              >
                Low
              </Button>
              <Button
                variant={editingIceLevel === 'medium' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setEditingIceLevel('medium')}
                sx={{ py: 2, fontSize: '1rem', fontWeight: 600 }}
              >
                Medium
              </Button>
              <Button
                variant={editingIceLevel === 'high' ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setEditingIceLevel('high')}
                sx={{ py: 2, fontSize: '1rem', fontWeight: 600 }}
              >
                High
              </Button>
            </ButtonGroup>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={handleEditCancel}
            variant="outlined"
            color="primary"
            size="large"
            sx={{ minWidth: 120 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditSave}
            variant="contained"
            color="primary"
            size="large"
            sx={{ minWidth: 120 }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

Info.propTypes = {
  totalPrice: PropTypes.string.isRequired,
  orderItems: PropTypes.array,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
};

export default Info;
