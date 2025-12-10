import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Grid, Typography, CssBaseline, Button, Select, MenuItem as MuiMenuItem, FormControl, InputLabel, IconButton, Card, CardMedia, Avatar, Tabs, Tab, Collapse, Fade, Drawer, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AppTheme from '../../shared-theme/AppTheme';
import ColorModeIconDropdown from '../../shared-theme/ColorModeIconDropdown';
import MenuItem from './MenuItem';
import Info from './Info';
import { useWeather } from "./weather";

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Menu item IDs for accessories/packaging that should not appear as main drink tiles
const ACCESSORY_ITEM_IDS = new Set([46, 47, 48, 49, 50, 51, 52]);

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

// Category definitions
const CATEGORIES = [
  { id: 'all', label: 'All Drinks' },
  { id: 'flavored tea', label: 'Flavored Tea' },
  { id: 'milk tea', label: 'Milk Tea' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'blended', label: 'Blended' },
  { id: 'matcha', label: 'Matcha' },
  { id: 'fruit', label: 'Fruit' },
  { id: 'special', label: 'Specials' }
];


// Carousel promotional items
let carouselItems = [
  {
    id: 1,
    title: 'Pokemon Legends Drinks',
    image: 'https://i.imgur.com/m5NSorh.jpeg',
    description: ''
  },
  {
    id: 2,
    title: 'None',
    image: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fbiyopos.com%2Fwp-content%2Fuploads%2F2025%2F08%2Fboba-flavors-collection.png&f=1&nofb=1&ipt=06f3d63629bc2383e39a4189637bc2397016b4eed438e199ec072b78fa2f8994',
    description: 'None'
  },
  {
    id: 3,
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
function Kiosk({ orderItems, setOrderItems, orderTotal, setOrderTotal, user, ttsEnabled, setTtsEnabled, showCart: showCartProp, setShowCart: setShowCartProp, inDashboard = false, dashboardType }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('EN');
  const translationsRef = useRef({});
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default'); // 'default', 'price-low', 'price-high'
  const [internalShowCart, setInternalShowCart] = useState(false);
  
  // Use prop if provided (dashboard mode), otherwise use internal state (standalone mode)
  const showCart = showCartProp !== undefined ? showCartProp : internalShowCart;
  const setShowCart = setShowCartProp || setInternalShowCart;

  const speak = useCallback((text) => {
    if (ttsEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  }, [ttsEnabled]);

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

  if (temp < 60) {
    carouselItems[1] = {
      id: 2,
      title: 'Hot Boba Bubble Tea',
      image: 'https://www.hungryhuy.com/wp-content/uploads/adding-boba-to-milk-tea.jpg',
      description: 'Warm up with our hot boba special'
    };  
  }
  else {
    carouselItems[1] = {
      id: 2,
      title: 'Boba Fruit Smoothie',
      image: 'https://foodsocial.io/wp-content/uploads/2022/07/Bubble-Tea-2-1080x720.jpg',
      description: 'Cool off with our special Boba Fruit Smoothie'
    }
  }

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
    setOrderItems(prevItems => {
      const newItems = [...prevItems, item];
      console.log('Item added to order:', item);
      console.log('Current order:', newItems);
      return newItems;
    });
    speak(`Added ${item.name} to order for ${item.price} dollars.`);
  };

  /**
   * Handles deleting an item from the order
   * 
   * @param {number} index - The index of the item to delete
   */
  const handleDeleteItem = (index) => {
    setOrderItems(prevItems => prevItems.filter((_, i) => i !== index));
  };

  /**
   * Handles editing an item in the order
   * 
   * @param {number} index - The index of the item to edit
   * @param {Object} updatedItem - The updated item
   */
  const handleEditItem = (index, updatedItem) => {
    setOrderItems(prevItems => prevItems.map((item, i) => i === index ? updatedItem : item));
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

  const filteredMenuItems = menuItems
  .filter((item) => !ACCESSORY_ITEM_IDS.has(item.id))
  .filter((item) => {
    if (selectedCategory === 'all') return true;
    const drinkType = (item.drink_type || '').toLowerCase().trim();
    return drinkType === selectedCategory.toLowerCase().trim();
  })
  .sort((a, b) => {
    if (sortBy === 'price-low') {
      return a.price - b.price;
    } else if (sortBy === 'price-high') {
      return b.price - a.price;
    }
    return 0; // default order
  });

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
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default', width: '100%' }}>
        {/* Cart Sidebar - Only render if NOT in dashboard mode (standalone mode) */}
        {!inDashboard && (
          <>
            {isMobile ? (
              <Drawer
                anchor="right"
                open={showCart}
                onClose={() => {
                  if (typeof setShowCart === 'function') {
                    setShowCart(false);
                  }
                }}
                sx={{
                  '& .MuiDrawer-paper': {
                    width: { xs: '100%', sm: '350px' },
                    p: 2,
                  },
                }}
              >
                <Info totalPrice={orderTotal} orderItems={orderItems} onDelete={handleDeleteItem} onEdit={handleEditItem} />
              </Drawer>
            ) : (
              <Collapse in={showCart} orientation="horizontal" timeout={300}>
                <Box sx={{ width: '350px', p: 2, borderRight: 1, borderColor: 'divider', backgroundColor: 'background.paper', height: '100%' }}>
                  <Info totalPrice={orderTotal} orderItems={orderItems} onDelete={handleDeleteItem} onEdit={handleEditItem} />
                </Box>
              </Collapse>
            )}
          </>
        )}
        <Box sx={{ flex: 1, p: { xs: 2, sm: 3, md: 4 }, width: '100%' }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', md: 'center' }, 
            mb: 4,
            gap: 2
          }}>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ fontWeight: 'bold', fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}
            >
              {translatedTexts.menu}
            </Typography>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
              {weather_error ? (
                <Typography variant="body2" color="error">
                  Weather unavailable
                </Typography>
              ) : temp === null ? (
                <Typography variant="body2" color="text.secondary">
                </Typography>
              ) : (
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                </Typography>
              )}
            </Box>

            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' }, 
              gap: { xs: 1.5, sm: 2, md: 3 },
              width: { xs: '100%', md: 'auto' },
              flexWrap: 'wrap'
            }}>
              <IconButton 
                onClick={() => {
                  const newEnabled = !ttsEnabled;
                  setTtsEnabled(newEnabled);
                  if (newEnabled && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance("Text to speech enabled");
                    window.speechSynthesis.speak(utterance);
                  }
                }} 
                onFocus={() => {
                  if (ttsEnabled) speak("Disable text to speech");
                }}
                color="primary" 
                aria-label={ttsEnabled ? "Disable text to speech" : "Enable text to speech"}
              >
                {ttsEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
              </IconButton>
              <ColorModeIconDropdown />
              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
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
              <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, width: { xs: '100%', sm: 'auto' } }}>
                <Typography variant="body2" color="text.secondary">
                  {translatedTexts.orderTotal}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                  ${orderTotal.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {orderItems.length} {orderItems.length === 1 ? translatedTexts.item : translatedTexts.items}
                </Typography>
              </Box>
              <IconButton
                onClick={() => {
                  const newState = !showCart;
                  if (typeof setShowCart === 'function') {
                    setShowCart(newState);
                  }
                }}
                onFocus={() => speak(showCart ? "Hide shopping cart" : "Show shopping cart")}
                color="primary"
                aria-label={showCart ? "Hide shopping cart" : "Show shopping cart"}
                size={isMobile ? "small" : "medium"}
              >
                <ShoppingCartIcon />
              </IconButton>
              <Button
                variant="contained" 
                color="primary" 
                size={isMobile ? "small" : (inDashboard ? "large" : (showCart ? "medium" : "large"))}
                onFocus={() => speak(translatedTexts.checkout)}
                onClick={() => {
                  if (inDashboard) {
                    // In dashboard mode, pass context and current order items via state
                    navigate('/checkout', { 
                      state: { 
                        fromDashboard: true, 
                        dashboardType: dashboardType || 'cashier',
                        orderItems: orderItems,
                        orderTotal: orderTotal
                      } 
                    });
                  } else {
                    navigate('/checkout', { state: { fromDashboard: false } });
                  }
                }}
                sx={{ px: { xs: 2, sm: (inDashboard ? 4 : (showCart ? 2 : 4)) }, width: { xs: '100%', sm: 'auto' } }}
                fullWidth={isMobile}
              >
                {translatedTexts.checkout}
              </Button>
              {user && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
                  <Avatar
                    alt={user.displayName || user.email || 'Account'}
                    src={user.photo || undefined}
                    sx={{ width: { xs: 36, sm: 48 }, height: { xs: 36, sm: 48 } }}
                  >
                    {(user.displayName || user.email || 'A')
                      .split(' ')
                      .map((segment) => segment.charAt(0))
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
                    {user.displayName || user.email || 'Signed in'}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Carousel Section */}
          <Box sx={{ position: 'relative', mb: { xs: 2, sm: 4 }, width: '100%'}}>
            <Box
              ref={carouselRef}
              sx={{
                display: 'flex',
                overflow: 'hidden',
                borderRadius: 2,
                position: 'relative',
                width: '100%',
                aspectRatio: { xs: '2/1', sm: '7/2' },
              }}
            >
              {carouselItems.map((item, index) => (
                <Box
                  key={item.id}
                  sx={{
                    minWidth: '100%',
                    height: '100%',
                    transition: 'transform 0.5s ease-in-out',
                    transform: `translateX(-${currentSlide * 100}%)`,
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
                        p: { xs: 1.5, sm: 2 },
                      }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '1.25rem', sm: '2rem' } }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
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
              size={isMobile ? "small" : (inDashboard ? "medium" : (showCart ? "small" : "medium"))}
              sx={{
                position: 'absolute',
                left: { xs: 8, sm: 16 },
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                },
                width: { xs: 32, sm: (inDashboard ? 48 : (showCart ? 40 : 48)) },
                height: { xs: 32, sm: (inDashboard ? 48 : (showCart ? 40 : 48)) },
              }}
            >
              <ChevronLeftIcon fontSize={isMobile ? "small" : (inDashboard ? "medium" : (showCart ? "small" : "medium"))} />
            </IconButton>
            <IconButton
              onClick={handleNextSlide}
              size={isMobile ? "small" : (inDashboard ? "medium" : (showCart ? "small" : "medium"))}
              sx={{
                position: 'absolute',
                right: { xs: 8, sm: 16 },
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                },
                width: { xs: 32, sm: (inDashboard ? 48 : (showCart ? 40 : 48)) },
                height: { xs: 32, sm: (inDashboard ? 48 : (showCart ? 40 : 48)) },
              }}
            >
              <ChevronRightIcon fontSize={isMobile ? "small" : (inDashboard ? "medium" : (showCart ? "small" : "medium"))} />
            </IconButton>

            {/* Indicator Dots */}
            <Box
              sx={{
                position: 'absolute',
                bottom: { xs: 8, sm: 16 },
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 1,
                zIndex: 10,
              }}
            >
              {carouselItems.map((_, index) => (
                <Box
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  sx={{
                    width: { xs: 8, sm: 12 },
                    height: { xs: 8, sm: 12 },
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

          {/* Category Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: { xs: 2, sm: 3 } }}>
            <Tabs 
              value={selectedCategory} 
              onChange={(e, newValue) => setSelectedCategory(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="drink categories"
              sx={{
                '& .MuiTab-root': {
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                  minWidth: { xs: 80, sm: 100 },
                  px: { xs: 1, sm: 2 },
                }
              }}
            >
              {CATEGORIES.map((category) => (
                <Tab 
                  key={category.id} 
                  label={category.label} 
                  value={category.id}
                  sx={{ 
                    fontWeight: 'medium',
                    textTransform: 'capitalize'
                  }}
                />
              ))}
            </Tabs>

            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 }, mr: { xs: 0, sm: 2 }, mt: 2 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MuiMenuItem value="default">Default</MuiMenuItem>
                <MuiMenuItem value="price-low">Price: Low to High</MuiMenuItem>
                <MuiMenuItem value="price-high">Price: High to Low</MuiMenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ minHeight: { xs: '400px', sm: '600px' } }}>
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              {filteredMenuItems.map((item, index) => (
                <Grid 
                  item 
                  key={item.id} 
                  xs={6}
                  sm={4}
                  md={3}
                  lg={2}
                  xl={2}
                  sx={{ 
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <Fade in={true} timeout={(index % 10) * 100 + 300}>
                    <Box sx={{ height: '100%', width: '100%', maxWidth: { xs: '200px', sm: 'none' } }}>
                      <MenuItem 
                        item={item} 
                        imageUrl={item.image_url}
                        onItemClick={handleAddToOrder} 
                        language={language} 
                        translate={translate}
                        ttsEnabled={ttsEnabled}
                        speak={speak}
                      />
                    </Box>
                  </Fade>
                </Grid>
              ))}
            </Grid>

            {/* Empty State */}
            {filteredMenuItems.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h5" color="text.secondary">
                  No items found in this category
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </AppTheme>
  );
}

export default Kiosk;

