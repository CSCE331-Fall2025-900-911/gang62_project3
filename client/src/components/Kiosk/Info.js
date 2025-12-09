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
import { CustomizationData } from '../../models/CustomizationData';

function Info({ totalPrice, orderItems = [], onDelete, onEdit }) {
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingIndex, setEditingIndex] = React.useState(null);
  
  const [editingSize, setEditingSize] = React.useState('medium');
  const [editingSugarLevel, setEditingSugarLevel] = React.useState('medium');
  const [editingIceLevel, setEditingIceLevel] = React.useState('medium');
  const [editingTemperature, setEditingTemperature] = React.useState('cold');
  const [editingToppings, setEditingToppings] = React.useState([]);

  const handleEditClick = (index, item) => {
    setEditingIndex(index);
    setEditingSize(item.size || 'medium');
    setEditingSugarLevel(item.sugarLevel || 'medium');
    setEditingIceLevel(item.iceLevel || 'medium');
    setEditingTemperature(item.temperature || 'cold');
    setEditingToppings(item.toppings || []);
    setEditDialogOpen(true);
  };

  const handleEditSave = () => {
    if (editingIndex !== null && onEdit) {
      const updatedItem = {
        ...orderItems[editingIndex],
        size: editingSize,
        sugarLevel: editingSugarLevel,
        iceLevel: editingTemperature === 'hot' ? 'no ice' : editingIceLevel,
        temperature: editingTemperature,
        toppings: editingToppings
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

  const formatSize = (size) => {
    if (!size) return 'Medium';
    const lower = String(size).toLowerCase();
    if (lower === 'small') return 'Small';
    if (lower === 'large') return 'Large';
    return 'Medium';
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
                secondary={
                  `Size: ${formatSize(item.size)} | ` +
                  `Temp: ${item.temperature || 'Cold'} | ` +
                  `Sugar: ${item.sugarLevel || 'N/A'} | ` +
                  `Ice: ${item.iceLevel || 'N/A'}` +
                  (item.toppings && item.toppings.length > 0 ? ` | Toppings: ${item.toppings.join(', ')}` : '')
                }
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
            {/* Size Selection */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Size
            </Typography>
            <ButtonGroup fullWidth variant="outlined" sx={{ mb: 4 }}>
              {CustomizationData.sizes.map((option) => (
                <Button
                  key={option.value}
                  variant={editingSize === option.value ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => setEditingSize(option.value)}
                  sx={{ py: 2, fontSize: '1rem', fontWeight: 600 }}
                >
                  {option.label}
                </Button>
              ))}
            </ButtonGroup>

            {/* Temperature Selection */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Temperature
            </Typography>
            <ButtonGroup fullWidth variant="outlined" sx={{ mb: 4 }}>
              {CustomizationData.temperatures.map((option) => (
                <Button
                  key={option.value}
                  variant={editingTemperature === option.value ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => setEditingTemperature(option.value)}
                  sx={{ py: 2, fontSize: '1rem', fontWeight: 600 }}
                >
                  {option.label}
                </Button>
              ))}
            </ButtonGroup>

            {/* Sugar Level Selection */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Sugar Level
            </Typography>
            <ButtonGroup fullWidth variant="outlined" sx={{ mb: 4 }}>
              {CustomizationData.sugarLevels.map((option) => (
                <Button
                  key={option.value}
                  variant={editingSugarLevel === option.value ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => setEditingSugarLevel(option.value)}
                  sx={{ py: 2, fontSize: '1rem', fontWeight: 600 }}
                >
                  {option.label}
                </Button>
              ))}
            </ButtonGroup>

            {/* Ice Level Selection - Only show if cold */}
            {editingTemperature === 'cold' && (
              <>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  Ice Level
                </Typography>
                <ButtonGroup fullWidth variant="outlined" sx={{ mb: 4 }}>
                  {CustomizationData.iceLevels.map((option) => (
                    <Button
                      key={option.value}
                      variant={editingIceLevel === option.value ? 'contained' : 'outlined'}
                      color="primary"
                      onClick={() => setEditingIceLevel(option.value)}
                      sx={{ py: 2, fontSize: '1rem', fontWeight: 600 }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </ButtonGroup>
              </>
            )}

            {/* Toppings Selection */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Toppings
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {CustomizationData.toppings.map((topping) => {
                const isSelected = editingToppings.includes(topping.label);
                return (
                  <Button
                    key={topping.key}
                    variant={isSelected ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={() => {
                      if (isSelected) {
                        setEditingToppings(editingToppings.filter(t => t !== topping.label));
                      } else {
                        setEditingToppings([...editingToppings, topping.label]);
                      }
                    }}
                    fullWidth
                    sx={{ py: 2, fontSize: '1rem', fontWeight: 600 }}
                  >
                    {topping.label} {isSelected ? '✓' : ''}
                  </Button>
                );
              })}
            </Box>
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
