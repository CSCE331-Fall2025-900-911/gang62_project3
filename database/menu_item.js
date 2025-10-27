const DatabaseConnection = require('./connection');

/**
 * Class representing a menu item retrieved from the database.
 * Extends DatabaseConnection to provide database query functionality.
 * 
 * @class MenuItem
 * @extends {DatabaseConnection}
 * @author Jonah Coffelt
 */
class MenuItem extends DatabaseConnection {
    /**
     * Creates an instance of MenuItem.
     * 
     * @param {number} id - The menu item's ID
     * @param {string} name - The menu item's name
     * @param {number} price - The menu item's price in dollars
     * @author Jonah Coffelt
     */
    constructor(id, name, price) {
        super();
        this.id = id;
        this.name = name;
        this.price = price;
    }

    /**
     * Factory method to create a MenuItem instance from the database.
     * Retrieves menu item data based on the provided ID and returns a populated MenuItem instance.
     * 
     * @static
     * @param {number} id - The ID of the menu item to retrieve
     * @returns {Promise<MenuItem>} Promise that resolves to a MenuItem instance with database data
     * @throws {Error} Throws an error if the menu item with the given ID is not found in the database
     * @author Jonah Coffelt
     */
    static async create(id) {
        const instance = new MenuItem(null, null, null);
        
        const query = {
            text: 'SELECT * FROM menu_items WHERE id = $1;', // id = $1 refers to the first element in the values array
            values: [id],
        };

        const result = await instance.runQuery(query);

        if (result.length === 0) {
            throw new Error(`Menu item with ID ${id} not found`);
        }

        const item = result[0];

        instance.id = id;
        instance.name = item.name;
        instance.price = item.base_price_cents / 100.0;

        return instance;
    }
}

module.exports = MenuItem;
