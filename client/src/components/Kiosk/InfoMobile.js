import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import Info from './Info';

const EN_TEXTS = {
  viewDetailsButton: 'View details',
};

function InfoMobile({ totalPrice, orderItems = [], onDelete, onEdit, language = 'EN', translate }) {
  const [open, setOpen] = React.useState(false);
  const [texts, setTexts] = React.useState(EN_TEXTS);

  React.useEffect(() => {
    let cancelled = false;

    const updateTexts = async () => {
      if (!translate || language === 'EN') {
        if (!cancelled) setTexts(EN_TEXTS);
        return;
      }

      const translated = {};
      for (const [key, value] of Object.entries(EN_TEXTS)) {
        translated[key] = await translate(value);
      }
      if (!cancelled) setTexts(translated);
    };

    updateTexts();

    return () => {
      cancelled = true;
    };
  }, [language, translate]);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box sx={{ width: 'auto', px: 3, pb: 3, pt: 8 }} role="presentation">
      <IconButton
        onClick={toggleDrawer(false)}
        sx={{ position: 'absolute', right: 8, top: 8 }}
      >
        <CloseIcon />
      </IconButton>
      <Info 
        totalPrice={totalPrice} 
        orderItems={orderItems}
        onDelete={onDelete}
        onEdit={onEdit}
        language={language}
        translate={translate}
      />
    </Box>
  );

  return (
    <div>
      <Button
        variant="text"
        endIcon={<ExpandMoreRoundedIcon />}
        onClick={toggleDrawer(true)}
      >
        {texts.viewDetailsButton}
      </Button>
      <Drawer
        open={open}
        anchor="top"
        onClose={toggleDrawer(false)}
        PaperProps={{
          sx: {
            top: 'var(--template-frame-height, 0px)',
            backgroundImage: 'none',
            backgroundColor: 'background.paper',
          },
        }}
      >
        {DrawerList}
      </Drawer>
    </div>
  );
}

InfoMobile.propTypes = {
  totalPrice: PropTypes.string.isRequired,
  orderItems: PropTypes.array,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
};

export default InfoMobile;
