const express = require('express');
const cors = require('cors');
const axios = require('axios');
const Menu = require('./models/Menu');
const Inventory = require('./models/Inventory');
const Ingredient = require('./models/Ingredient');

/**
 * Express server for the Point of Sale system.
 * Provides API endpoints for the kiosk interface and other client applications.
 * 
 * @author Michael Nguyen
 */
const app = express();
const PORT = 3001;

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
        endpoints: ['/api/menu-items', '/api/translate', '/api/inventory']
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

app.get('/api/inventory/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const ingredient = await Ingredient.create(id);
        if (!ingredient) {
            return res.status(404).json({ error: 'Ingredient not found' });
        }

        res.json({
            id: ingredient.getID(),
            name: ingredient.getName(),
            stock: ingredient.getStock(),
            quantityPerUnit: ingredient.getQuantityPerUnit()
        });
    } catch (error) {
        console.error('Error fetching ingredient:', error);
        res.status(500).json({ error: 'Failed to fetch ingredient' });
    }
});


/**
 * API endpoint to retrieve all inventory items from the database.
 * Returns a JSON array of ingredients with id, name, stock, and quantityPerUnit.
 * 
 * @route GET /api/inventory
 * @returns {Promise<void>} Sends JSON response with inventory items array
 * @throws {Error} If database query fails, returns 500 status with error message
 */
app.get('/api/inventory', async (req, res) => {
    try {
        const inventory = new Inventory();
        await inventory.load();
        const ingredients = inventory.getIngredients();
        
        // Convert Ingredient objects to plain JSON
        const items = ingredients.map(item => ({
            id: item.getID(),
            name: item.getName(),
            stock: item.getStock(),
            quantityPerUnit: item.getQuantityPerUnit()
        }));
        
        res.json(items);
    } catch (error) {
        console.error('Error fetching inventory items:', error);
        res.status(500).json({ error: 'Failed to fetch inventory items' });
    }
});

/**
 * API endpoint to update inventory stock.
 * 
 * @route PUT /api/inventory/:id
 * @param {number} id - The ID of the ingredient to update
 * @param {number} stock - The new stock value
 * @returns {Promise<void>} Sends JSON response with success status
 */
app.put('/api/inventory/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;
        
        if (stock === undefined) {
            return res.status(400).json({ error: 'Stock value is required' });
        }

        const ingredient = await Ingredient.create(id);
        await ingredient.setStock(stock);
        
        res.json({ success: true, message: 'Stock updated successfully', stock: ingredient.getStock() });
    } catch (error) {
        console.error('Error updating inventory:', error);
        res.status(500).json({ error: 'Failed to update inventory' });
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