const express = require('express');
const cors = require('cors');
const Menu = require('./models/Menu');

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
 * Starts the Express server and listens on the specified port.
 * 
 * @param {number} PORT - The port number to listen on (defaults to 3001)
 * @author Michael Nguyen
 */
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;

