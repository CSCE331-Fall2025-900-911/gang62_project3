const DatabaseConnection = require('../config/db');
const Ingredient = require('./Ingredient');

/**
 * Manages the inventory of items in the Point of Sale system.
 * This class provides functionality to load all inventory items from the database
 * and manage inventory items including adding new items.
 * 
 * @author Jonah Coffelt
 */
class Inventory extends DatabaseConnection {
    /**
     * Constructs a new Inventory instance.
     * Note: Must call load() to fetch inventory items from the database.
     * 
     * @throws {Error} If database connection fails
     * @author Jonah Coffelt
     */
    constructor() {
        super();
        this.ingredients = [];
    }

    /**
     * Loads all inventory items from the database asynchronously.
     * Populates the inventoryItems array with Ingredient instances.
     * 
     * @returns {Promise<Inventory>} Promise that resolves to this Inventory instance
     * @throws {Error} If database query fails
     * @author Jonah Coffelt
     */
    async load() {
        const result = await this.runQuery('SELECT * FROM ingredients');

        this.ingredients = [];
        for (const itemData of result) {
            const item = await Ingredient.create(itemData.id);
            this.ingredients.push(item);
        }

        return this;
    }

    /**
     * Gets the list of all inventory items.
     * 
     * @returns {Array<Ingredient>} An Array of Ingredient objects
     * @author Jonah Coffelt
     */
    getIngredients() {
        return this.ingredients;
    }

    /**
     * Adds a new ingredient to both the database and local Array.
     * 
     * @param {string} name The name of the ingredient
     * @param {number} stock Inital stock of the ingredient
     * @param {number} quantityPerUnit Quantity per unit
     * @returns {Promise<Ingredient|null>} The newly created Ingredient object if successful, null otherwise
     * @throws {Error} If database operations fail
     * @author Jonah Coffelt
     */
    async addIngredient(name, stock, quantityPerUnit) {
        try {
            const getIdQuery = 'SELECT MAX(id) as max_id FROM ingredients;';
            const idResult = await this.runQuery(getIdQuery);
            
            let nextId = 1;
            if (idResult && idResult.length > 0 && idResult[0].max_id !== null) {
                nextId = parseInt(idResult[0].max_id) + 1;
            }
            
            const ingredientQuery = {
                text: 'INSERT INTO ingredients (id, name, qty_per_unit) VALUES ($1, $2, $3);',
                values: [nextId, name, quantityPerUnit]
            };
            await this.runQuery(ingredientQuery);

            const inventoryQuery = {
                text: 'INSERT INTO inventory (id, ingredient_id, stock) VALUES ($1, $2, $3);',
                values: [nextId, nextId, stock]
            };
            await this.runQuery(inventoryQuery);

            const newItem = await Ingredient.create(nextId);
            this.ingredients.push(newItem);
            return newItem;

        } catch (err) {
            console.error('Error adding inventory item:', err);
            return null;
        }
    }
}

module.exports = Inventory;

