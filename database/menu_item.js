const DatabaseConnection = require('./connection');

/**
 * Class representing a menu item retrieved from the database.
 * Extends DatabaseConnection to provide database query functionality.
 * 
 * The MenuItem class might seem complicating so it deserves an explanation. It supports two usage patterns:
 * 
 * 1. **Factory Pattern (Recommended)**: Use `MenuItem.create(id)` to load from database
 *    @example
 *    const item = await MenuItem.create(1);
 *    console.log(item.name); // Gets name from database
 * 
 * 2. **Direct Instantiation**: Create with known data
 *    @example
 *    const item = new MenuItem(1, "Burger", 9.99);
 *    console.log(item.name); // "Burger"
 * 
 * Updating values after instantiation:
 * @example
 * const item = await MenuItem.create(1);
 * await item.setName("New Name"); // Updates database
 * await item.setPrice(12.99); // Updates database
 * 
 * @class MenuItem
 * @extends {DatabaseConnection}
 * @author Jonah Coffelt
 */
class MenuItem extends DatabaseConnection {
    /**
     * Constructs a new MenuItem instance with provided data.
     * 
     * @param {number} id - The unique identifier of the menu item in the database
     * @param {string} name - The menu item's name
     * @param {number} price - The menu item's price in dollars
     * @throws {Error} If database connection fails
     * @author Michael Nguyen
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

    /**
     * Gets the unique identifier of this menu item.
     * 
     * @returns {number} The menu item ID
     * @author Michael Nguyen
     */
    getID() {
        return this.id;
    }

    /**
     * Gets the name of this menu item.
     * 
     * @returns {string} The menu item name
     * @author Michael Nguyen
     */
    getName() {
        return this.name;
    }

    /**
     * Gets the price of this menu item.
     * 
     * @returns {number} The menu item price in dollars
     * @author Michael Nguyen
     */
    getPrice() {
        return this.price;
    }

    /**
     * Updates the name of this menu item both locally and in the database.
     * 
     * @param {string} name - The new name for the menu item
     * @returns {Promise<void>} Promise that resolves when the update is complete
     * @throws {Error} If database update fails
     * @author Michael Nguyen
     */
    async setName(name) {
        const query = {
            text: 'UPDATE menu_items SET name = $1 WHERE id = $2;',
            values: [name, this.id],
        };
        await this.runQuery(query);
        this.name = name;
    }

    /**
     * Updates the price of this menu item both locally and in the database.
     * 
     * @param {number} price - The new price in dollars
     * @returns {Promise<void>} Promise that resolves when the update is complete
     * @throws {Error} If database update fails
     * @author Michael Nguyen
     */
    async setPrice(price) {
        const query = {
            text: 'UPDATE menu_items SET base_price_cents = $1 WHERE id = $2;',
            values: [Math.round(price * 100), this.id],
        };
        await this.runQuery(query);
        this.price = price;
    }
}

module.exports = MenuItem;
