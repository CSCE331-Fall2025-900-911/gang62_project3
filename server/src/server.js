const express = require('express');
const cors = require('cors');
const axios = require('axios');
const Menu = require('./models/Menu');
const Order = require('./models/Order');
const MenuItem = require('./models/MenuItem');

/**
 * Express server for the Point of Sale system.
 * Provides API endpoints for the kiosk interface and other client applications.
 * 
 * @author Michael Nguyen
 */
const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for client requests
app.use(cors());
app.use(express.json());

const DEEPL_API_KEY = 'ca69df7b-643d-475c-9b81-4a71e5078261:fx';
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

/**
 * Root endpoint - health check
 * @route GET /
 */
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Server is running',
        endpoints: ['/api/menu-items', '/api/translate', '/api/submit-order']
    });
});

/**
 * API endpoint to retrieve all menu items from the database.
 * Returns a JSON array of menu items with id, name, and price.
 * 
 * @route GET /api/menu-items
 * @returns {Promise<void>} Sends JSON response with menu items array
 * @throws {Error} If database query fails, returns 500 status with error message
 * @author Michael Nguyen
 */
app.get('/api/menu-items', async (req, res) => {
    try {
        const menu = new Menu();
        await menu.load();
        const menuItems = menu.getMenuItems();
        
        // Convert MenuItem objects to plain JSON
        const items = menuItems.map(item => ({
            id: item.getID(),
            name: item.getName(),
            price: item.getPrice()
        }));
        
        res.json(items);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ error: 'Failed to fetch menu items' });
    }
});

/**
 * API endpoint to translate text using DeepL API.
 * 
 * @route POST /api/translate
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (e.g., 'ES', 'FR', 'DE')
 * @returns {Promise<void>} Sends JSON response with translated text
 * @author Michael Nguyen
 */
app.post('/api/translate', async (req, res) => {
    try {
        const { text, targetLang } = req.body;
        if (!text || !targetLang) {
            return res.status(400).json({ error: 'Text and targetLang are required' });
        }

        const formData = `auth_key=${encodeURIComponent(DEEPL_API_KEY)}&text=${encodeURIComponent(text)}&target_lang=${encodeURIComponent(targetLang)}`;

        const response = await axios.post(DEEPL_API_URL, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        res.json({ translatedText: response.data.translations[0].text });
    } catch (error) {
        console.error('Error translating text:', error);
        res.status(500).json({ error: 'Failed to translate text' });
    }
});

/**
 * API endpoint to submit an order to the database.
 * Creates an Order instance, adds menu items, and submits it.
 * 
 * @route POST /api/submit-order
 * @param {number} employeeID - The employee ID processing the order
 * @param {number} customerID - The customer ID (defaults to 1)
 * @param {Array} items - Array of objects with id and quantity, or array of menu item IDs
 * @returns {Promise<void>} Sends JSON response with success status
 * @throws {Error} If order submission fails, returns 500 status with error message
 */
app.post('/api/submit-order', async (req, res) => {
    try {
        const { employeeID, customerID, items } = req.body;
        
        if (!employeeID || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'employeeID and items array are required' });
        }
        
        const order = new Order(employeeID, customerID || 1);
        
        // Add each menu item to the order (handle both formats: array of IDs or array of objects)
        for (const item of items) {
            const itemId = typeof item === 'object' ? item.id : item;
            const quantity = typeof item === 'object' && item.quantity ? item.quantity : 1;
            
            const menuItem = await MenuItem.create(itemId);
            
            // Add the item the specified number of times (matching Java behavior)
            for (let i = 0; i < quantity; i++) {
                order.addItem(menuItem);
            }
        }
        
        // Submit the order
        await order.submit();
        
        res.json({ success: true, message: 'Order submitted successfully' });
    } catch (error) {
        console.error('Error submitting order:', error);
        res.status(500).json({ error: 'Failed to submit order: ' + error.message });
    }
});

/**
 * Starts the Express server and listens on the specified port.
 * 
 * @param {number} PORT - The port number to listen on (defaults to 3001)
 * @author Michael Nguyen
 */
if (process.env.VERCEL !== '1') {
    // For Vercel deployment, export the app instead of starting the server
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;

// export default app;