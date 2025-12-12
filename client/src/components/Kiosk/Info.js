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

const EN_TEXTS = {
  totalLabel: 'Total',
  emptyPrimary: 'No items in order',
  emptySecondary: 'Add items from the kiosk',
  sizePrefix: 'Size:',
  tempPrefix: 'Temp:',
  sugarPrefix: 'Sugar:',
  icePrefix: 'Ice:',
  toppingsPrefix: 'Toppings:',
  sugarNA: 'N/A',
  iceNA: 'N/A',
  dialogTitle: 'Edit Item',
  sizeLabel: 'Size',
  temperatureLabel: 'Temperature',
  sugarLevelLabel: 'Sugar Level',
  iceLevelLabel: 'Ice Level',
  toppingsLabel: 'Toppings',
  cancelButton: 'Cancel',
  saveButton: 'Save',
};

function Info({ totalPrice, orderItems = [], onDelete, onEdit, language = 'EN', translate }) {
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingIndex, setEditingIndex] = React.useState(null);
  
  const [editingSize, setEditingSize] = React.useState('medium');
  const [editingSugarLevel, setEditingSugarLevel] = React.useState('medium');
  const [editingIceLevel, setEditingIceLevel] = React.useState('medium');
  const [editingTemperature, setEditingTemperature] = React.useState('cold');
  const [editingToppings, setEditingToppings] = React.useState([]);
  const [texts, setTexts] = React.useState(EN_TEXTS);
  const [translatedNames, setTranslatedNames] = React.useState({});
  const nameTranslationsRef = React.useRef({});
  const [translatedOptionLabels, setTranslatedOptionLabels] = React.useState({});
  const optionTranslationsRef = React.useRef({});

  React.useEffect(() => {
    let cancelled = false;

    const updateTexts = async () => {
      if (!translate || language === 'EN') {
        if (!cancelled) setTexts(EN_TEXTS);
        return;
      }

      const translated = {};
      for (const [key, value] of Object.entries(EN_TEXTS)) {
        // "Total" often comes back unchanged from translation services (e.g., ES -> "Total"),
        // which looks like it didn't translate. Use a more explicit seed text while
        // keeping the English UI label as "Total".
        if (key === 'totalLabel') {
          translated[key] = await translate('Order total');
        } else {
          translated[key] = await translate(value);
        }
      }
      if (!cancelled) setTexts(translated);
    };

    updateTexts();

    return () => {
      cancelled = true;
    };
  }, [language, translate]);

  // Translate item names shown in the cart when language changes
  React.useEffect(() => {
    let cancelled = false;

    const updateNames = async () => {
      if (!translate || language === 'EN') {
        nameTranslationsRef.current = {};
        setTranslatedNames({});
        return;
      }

      const currentMap = { ...nameTranslationsRef.current };
      const promises = orderItems.map(async (item) => {
        const key = item.name;
        if (!key) return;
        if (!currentMap[key]) {
          currentMap[key] = await translate(key);
        }
      });

      await Promise.all(promises);
      if (cancelled) return;
      nameTranslationsRef.current = currentMap;
      setTranslatedNames(currentMap);
    };

    updateNames();

    return () => {
      cancelled = true;
    };
  }, [orderItems, language, translate]);

  // Translate option labels (size/sugar/ice/temp/toppings) shown in the cart when language changes
  React.useEffect(() => {
    let cancelled = false;

    const updateOptionLabels = async () => {
      if (!translate || language === 'EN') {
        optionTranslationsRef.current = {};
        setTranslatedOptionLabels({});
        return;
      }

      const labelSet = new Set();

      // Ensure the common option labels are translated even if not currently selected.
      [
        ...CustomizationData.sizes.map((o) => o.label),
        ...CustomizationData.sugarLevels.map((o) => o.label),
        ...CustomizationData.iceLevels.map((o) => o.label),
        ...CustomizationData.temperatures.map((o) => o.label),
        ...CustomizationData.toppings.map((o) => o.label),
        'No ice',
      ].forEach((label) => labelSet.add(label));

      // Also translate any toppings strings already present in existing items.
      orderItems.forEach((item) => {
        if (Array.isArray(item.toppings)) {
          item.toppings.forEach((t) => t && labelSet.add(String(t)));
        }
      });

      const currentMap = { ...optionTranslationsRef.current };
      const labels = Array.from(labelSet);
      await Promise.all(
        labels.map(async (label) => {
          if (!label) return;
          if (!currentMap[label]) currentMap[label] = await translate(label);
        }),
      );

      if (cancelled) return;
      optionTranslationsRef.current = currentMap;
      setTranslatedOptionLabels(currentMap);
    };

    updateOptionLabels();

    return () => {
      cancelled = true;
    };
  }, [orderItems, language, translate]);

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

  const getLabelForValue = React.useCallback((category, value) => {
    if (!value) return '';
    const v = String(value).toLowerCase();

    if (category === 'size') {
      const match = CustomizationData.sizes.find((o) => o.value === v);
      return match?.label || value;
    }
    if (category === 'temperature') {
      const match = CustomizationData.temperatures.find((o) => o.value === v);
      return match?.label || value;
    }
    if (category === 'sugar') {
      const match = CustomizationData.sugarLevels.find((o) => o.value === v);
      return match?.label || value;
    }
    if (category === 'ice') {
      if (v === 'no ice') return 'No ice';
      const match = CustomizationData.iceLevels.find((o) => o.value === v);
      return match?.label || value;
    }
    return value;
  }, []);

  const tLabel = React.useCallback(
    (englishLabel) => {
      if (!translate || language === 'EN') return englishLabel;
      return translatedOptionLabels[englishLabel] || englishLabel;
    },
    [language, translate, translatedOptionLabels],
  );

  return (
    <React.Fragment>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
        {texts.totalLabel}
      </Typography>
      <Typography variant="h4" gutterBottom>
        {typeof totalPrice === 'number' ? "$" + totalPrice.toFixed(2) : totalPrice}
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
                primary={
                  translate && language !== 'EN'
                    ? translatedNames[item.name] || item.name
                    : item.name
                }
                secondary={
                  `${texts.sizePrefix} ${tLabel(getLabelForValue('size', item.size || 'medium'))} | ` +
                  `${texts.tempPrefix} ${tLabel(getLabelForValue('temperature', item.temperature || 'cold'))} | ` +
                  `${texts.sugarPrefix} ${
                    item.sugarLevel
                      ? tLabel(getLabelForValue('sugar', item.sugarLevel))
                      : texts.sugarNA
                  } | ` +
                  `${texts.icePrefix} ${
                    (item.temperature || 'cold') === 'hot'
                      ? texts.iceNA
                      : item.iceLevel
                        ? tLabel(getLabelForValue('ice', item.iceLevel))
                        : texts.iceNA
                  }` +
                  (item.toppings && item.toppings.length > 0
                    ? ` | ${texts.toppingsPrefix} ${item.toppings.map((t) => tLabel(String(t))).join(', ')}`
                    : '')
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
              primary={texts.emptyPrimary}
              secondary={texts.emptySecondary}
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
          {texts.dialogTitle}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            {/* Size Selection */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              {texts.sizeLabel}
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
                  {tLabel(option.label)}
                </Button>
              ))}
            </ButtonGroup>

            {/* Temperature Selection */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              {texts.temperatureLabel}
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
                  {tLabel(option.label)}
                </Button>
              ))}
            </ButtonGroup>

            {/* Sugar Level Selection */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              {texts.sugarLevelLabel}
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
                  {tLabel(option.label)}
                </Button>
              ))}
            </ButtonGroup>

            {/* Ice Level Selection - Only show if cold */}
            {editingTemperature === 'cold' && (
              <>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  {texts.iceLevelLabel}
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
                      {tLabel(option.label)}
                    </Button>
                  ))}
                </ButtonGroup>
              </>
            )}

            {/* Toppings Selection */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              {texts.toppingsLabel}
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
                    {tLabel(topping.label)} {isSelected ? '✓' : ''}
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
            {texts.cancelButton}
          </Button>
          <Button 
            onClick={handleEditSave}
            variant="contained"
            color="primary"
            size="large"
            sx={{ minWidth: 120 }}
          >
            {texts.saveButton}
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
