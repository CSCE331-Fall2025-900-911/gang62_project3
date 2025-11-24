import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Grid, Typography, CssBaseline, Button, Select, MenuItem as MuiMenuItem, FormControl, InputLabel, IconButton, Card, CardMedia, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AppTheme from '../../shared-theme/AppTheme';
import ColorModeIconDropdown from '../../shared-theme/ColorModeIconDropdown';
import MenuItem from './MenuItem';
import { useWeather } from "./weather";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const languages = [
  { code: 'EN', name: 'English' },
  { code: 'ES', name: 'Español' },
  { code: 'FR', name: 'Français' },
  { code: 'DE', name: 'Deutsch' },
  { code: 'IT', name: 'Italiano' },
  { code: 'PT', name: 'Português' },
  { code: 'JA', name: 'Japanese' },
  { code: 'ZH', name: 'Chinese' }
];

// Carousel promotional items
const carouselItems = [
  {
    id: 1,
    title: 'Festive Green Tea Boba',
    image: 'https://www.kerryfoodservice.com/cdn/shop/files/Kerry_WinterSeasonal_Photoshoot_GermanChocolateBoba_014_2024_1000x.jpg?v=1729524670',
    description: 'Try our seasonal beverages'
  },
  {
    id: 2,
    title: 'Fruit collection',
    image: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fbiyopos.com%2Fwp-content%2Fuploads%2F2025%2F08%2Fboba-flavors-collection.png&f=1&nofb=1&ipt=06f3d63629bc2383e39a4189637bc2397016b4eed438e199ec072b78fa2f8994',
    description: '3-6 PM - Special pricing'
  }
];

/**
 * Kiosk component for displaying menu items in a touchscreen-friendly interface.
 * Fetches menu items from the API and displays them in a responsive grid layout.
 * Designed for casual end users in a publicly viewable restaurant lobby space.
 * 
 * @component
 * @author Michael Nguyen
 */
function Kiosk({ orderItems, setOrderItems, orderTotal, setOrderTotal, user }) {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('EN');
  const translationsRef = useRef({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    translationsRef.current = {};
  }, [language]);

  const translate = useCallback(async (text) => {
    if (language === 'EN' || !text) return text;
    if (translationsRef.current[text]) return translationsRef.current[text];
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang: language })
      });
      const data = await response.json();
      const translated = data.translatedText || text;
      translationsRef.current[text] = translated;
      return translated;
    } catch (err) {
      return text;
    }
  }, [language]);

  const [translatedTexts, setTranslatedTexts] = useState({
    menu: 'Menu',
    orderTotal: 'Order Total',
    item: 'item',
    items: 'items',
    checkout: 'Checkout',
    loading: 'Loading menu...',
    error: 'Error:'
  });

  useEffect(() => {
    const updateTranslations = async () => {
      if (language === 'EN') {
        setTranslatedTexts({
          menu: 'Menu',
          orderTotal: 'Order Total',
          item: 'item',
          items: 'items',
          checkout: 'Checkout',
          loading: 'Loading menu...',
          error: 'Error:'
        });
        return;
      }
      
      const texts = {
        menu: 'Menu',
        orderTotal: 'Order Total',
        item: 'item',
        items: 'items',
        checkout: 'Checkout',
        loading: 'Loading menu...',
        error: 'Error:'
      };
      
      const translated = {};
      for (const [key, value] of Object.entries(texts)) {
        translated[key] = await translate(value);
      }
      setTranslatedTexts(translated);
    };
    updateTranslations();
  }, [language, translate]);
  
  const { temp, weather_error } = useWeather();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    // Calculate total whenever orderItems changes
    const total = orderItems.reduce((sum, item) => sum + item.price, 0);
    setOrderTotal(total);
  }, [orderItems, setOrderTotal]);


  /**
   * Fetches all menu items from the API endpoint.
   * Updates the component state with the retrieved menu items.
   * 
   * @returns {Promise<void>} Promise that resolves when menu items are fetched
   * @throws {Error} If API request fails, sets error state
   * @author Michael Nguyen
   */
  const fetchMenuItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/menu-items`);
      if (!response.ok) {
        throw new Error('Failed to fetch menu items');
      }
      const data = await response.json();
      setMenuItems(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  /**
   * Handles adding an item to the order
   * 
   * @param {Object} item - The menu item to add to the order
   */
  const handleAddToOrder = (item) => {
    setOrderItems([...orderItems, item]);
    console.log('Item added to order:', item);
    console.log('Current order:', [...orderItems, item]);
  };

  /**
   * Handles carousel navigation
   */
  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? carouselItems.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === carouselItems.length - 1 ? 0 : prev + 1));
  };
  if (loading) {
    return (
      <AppTheme>
        <CssBaseline />
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4">{translatedTexts.loading}</Typography>
        </Box>
      </AppTheme>
    );
  }

  if (error) {
    return (
      <AppTheme>
        <CssBaseline />
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" color="error">{translatedTexts.error} {error}</Typography>
        </Box>
      </AppTheme>
    );
  }

  return (
    <AppTheme>
      <CssBaseline />
      <Box sx={{ p: 4, minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ fontWeight: 'bold' }}
        >
          {translatedTexts.menu}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {weather_error ? (
            <Typography variant="body2" color="error">
              Weather unavailable
            </Typography>
          ) : temp === null ? (
            <Typography variant="body2" color="text.secondary">
              Loading weather...
            </Typography>
          ) : (
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              🌤 {temp.toFixed(0)}°F
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <ColorModeIconDropdown />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Language</InputLabel>
            <Select
              value={language}
              label="Language"
              onChange={(e) => setLanguage(e.target.value)}
            >
              {languages.map((lang) => (
                <MuiMenuItem key={lang.code} value={lang.code}>
                  {lang.name}
                </MuiMenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              {translatedTexts.orderTotal}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              ${orderTotal.toFixed(2)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {orderItems.length} {orderItems.length === 1 ? translatedTexts.item : translatedTexts.items}
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => navigate('/checkout')}
            sx={{ px: 4 }}
          >
            {translatedTexts.checkout}
          </Button>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar
                alt={user.displayName || user.email || 'Account'}
                src={user.photo || undefined}
                sx={{ width: 48, height: 48 }}
              >
                {(user.displayName || user.email || 'A')
                  .split(' ')
                  .map((segment) => segment.charAt(0))
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {user.displayName || user.email || 'Signed in'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Carousel Section */}
      <Box sx={{ position: 'relative', mb: 4, width: '100%' }}>
        <Box
          ref={carouselRef}
          sx={{
            display: 'flex',
            overflow: 'hidden',
            borderRadius: 2,
            position: 'relative',
            width: '100%',
            aspectRatio: '3/1',
          }}
        >
          {carouselItems.map((item, index) => (
            <Box
              key={item.id}
              sx={{
                minWidth: '100%',
                transition: 'transform 0.5s ease-in-out',
                transform: `translateX(-${currentSlide * 100}%)`,
                height: '100%',
              }}
            >
              <Card sx={{ height: '100%', position: 'relative', p: 0, overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  image={item.image}
                  alt={item.title}
                  sx={{ objectFit: 'cover', display: 'block', height: '100%', width: '100%' }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                    color: 'white',
                    p: 2,
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body1">
                    {item.description}
                  </Typography>
                </Box>
              </Card>
            </Box>
          ))}
        </Box>

        {/* Navigation Buttons */}
        <IconButton
          onClick={handlePrevSlide}
          sx={{
            position: 'absolute',
            left: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <IconButton
          onClick={handleNextSlide}
          sx={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <ChevronRightIcon />
        </IconButton>

        {/* Indicator Dots */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 1,
          }}
        >
          {carouselItems.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentSlide(index)}
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: currentSlide === index ? 'white' : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'white',
                },
              }}
            />
          ))}
        </Box>
      </Box>
      
      <Grid container spacing={3}>
        {menuItems.map((item) => (
          <Grid item key={item.id} sx={{ width: 'calc(20% - 24px)', minWidth: '200px' }}>
            <MenuItem item={item} onItemClick={handleAddToOrder} language={language} translate={translate} />
          </Grid>
        ))}
      </Grid>
    </Box>
    </AppTheme>
  );
}

export default Kiosk;

