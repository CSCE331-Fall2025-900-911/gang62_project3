const DatabaseConnection = require('./connection');
const MenuItem = require('./menu_item');

/**
 * Manages the menu of items in the Point of Sale system.
 * This class provides functionality to load all menu items from the database
 * and manage menu items including adding new items.
 * 
 * @author Michael Nguyen
 */
class Menu extends DatabaseConnection {
    /**
     * Constructs a new Menu instance.
     * Note: Must call load() to fetch menu items from the database.
     * 
     * @throws {Error} If database connection fails
     * @author Michael Nguyen
     */
    constructor() {
        super();
        this.menuItems = [];
    }

    /**
     * Loads all menu items from the database asynchronously.
     * Populates the menuItems array with MenuItem instances.
     * 
     * @returns {Promise<Menu>} Promise that resolves to this Menu instance
     * @throws {Error} If database query fails
     * @author Michael Nguyen
     */
    async load() {
        const result = await this.runQuery('SELECT * FROM menu_items');

        this.menuItems = [];
        for (const itemData of result) {
            const item = await MenuItem.create(itemData.id);
            this.menuItems.push(item);
        }

        return this;
    }

    /**
     * Gets the list of all menu items.
     * 
     * @returns {Array<MenuItem>} An Array of MenuItem objects
     * @author Michael Nguyen
     */
    getMenuItems() {
        return this.menuItems;
    }

    /**
     * Adds a new menu item to both the database and local Array.
     * 
     * @param {string} name - The name of the menu item
     * @param {number} price - The price in dollars
     * @returns {Promise<MenuItem|null>} The newly created MenuItem object if successful, null otherwise
     * @throws {Error} If database operations fail
     * @author Michael Nguyen
     */
    async addMenuItem(name, price) {
        try {
            const getIdQuery = 'SELECT MAX(id) as max_id FROM menu_items;';
            const idResult = await this.runQuery(getIdQuery);
            
            let nextId = 1;
            if (idResult && idResult.length > 0 && idResult[0].max_id !== null) {
                nextId = parseInt(idResult[0].max_id) + 1;
            }
            
            const query = {
                text: 'INSERT INTO menu_items (id, name, base_price_cents) VALUES ($1, $2, $3);',
                values: [nextId, name, Math.round(price * 100)]
            };
            
            await this.runQuery(query);

            const newItem = await MenuItem.create(nextId);
            this.menuItems.push(newItem);
            return newItem;
        } catch (err) {
            console.error('Error adding menu item:', err);
            return null;
        }
    }
}

module.exports = Menu;
