const DatabaseConnection = require('../config/db');

/**
 * Class representing an ingredient retrieved from the database.
 * 
 * Ingredient instances are typically created via the Inventory class, which loads
 * all menu items from the database. Individual items can also be created
 * using the factory method `Ingredient.create(id)`.
 * 
 * @class Ingredient
 * 
 * @extends {DatabaseConnection}
 * @author Jonah Coffelt
 */
class Ingredient extends DatabaseConnection {

    /**
     * Constructs a new Ingredient instance.
     * 
     * @param {number} id 
     * @param {string} name 
     * @param {number} quantityPerUnit 
     * @param {number} stock 
     * 
     * @author Jonah Coffelt
     */
    constructor(id = null, name = null, quantityPerUnit = null, stock = null) {
        super();
        this.id = id;
        this.name = name;
        this.stock = stock;
        this.quantityPerUnit = quantityPerUnit;
    }

    /**
     * Factory method to create a Ingredient instance from the database.
     * Retrieves ingredient data based on the provided ID and returns a populated Ingredient instance.
     * 
     * @static
     * @param {number} id The ID of the ingredient to retrieve
     * @throws {Error} Throws an error if the ingredient with the given ID is not found in the database
     * @returns {Promise<MenuItem>} Promise that resolves to a Ingredient instance with database data
     * @author Jonah Coffelt
     */
    static async create(id) {
        const instance = new Ingredient();
        
        const query = {
            text: 'SELECT * FROM ingredients WHERE id = $1;',
            values: [id],
        };

        const result = await instance.runQuery(query);

        if (result.length === 0) {
            throw new Error(`Ingredient with ID ${id} not found`);
        }

        const item = result[0];

        instance.id = id;
        instance.name = item.name;
        instance.stock = item.stock;
        instance.quantityPerUnit = item.quantityPerUnit;

        return instance;
    }

    /**
     * Gets the name of the ingredient
     * 
     * @returns {number} ID of the ingredient in the database
     * @author Jonah Coffelt
     */
    getID() {
        return this.id;
    }

    /**
     * Gets the ID of the ingredient
     * 
     * @returns {string} Name of the ingredient in the database
     * @author Jonah Coffelt
     */
    getName() {
        return this.name;
    }

    /**
     * Gets the stick of the ingredient
     * 
     * @returns {number} Stock of the ingredient in the database
     * @author Jonah Coffelt
     */
    getStock() {
        return this.stock;
    }

    /**
     * Gets the quantity of the ingredient per unit
     * 
     * @returns {number} Quantity of the ingredient per unit
     * @author Jonah Coffelt
     */
    getQuantityPerUnit() {
        return this.quantityPerUnit;
    }

    /**
     * Updates the name of this ingredient locally and on the databse
     * 
     * @param {string} name Name to set this ingredient to
     * @author Jonah Coffelt
     */
    async setName(name) {
        query = {
            text: "UPDATE ingredients SET name = $1 WHERE id = $2;",
            values: [name, this.id]
        } 
        await this.runQuery(query);
        this.name = name;
    }

    /**
     * Updates the stock of this ingredient locally and on the databse
     * 
     * @param {number} stock 
     * @author Jonah Coffelt
     */
    async setStock(stock) {
        query = {
            text: "UPDATE inventory SET stock = $1 WHERE ingredient_id = $2;",
            values: [stock, this.id]
        } 
        await this.runQuery(query);
        this.stock = stock;
    }
}

module.exports = Ingredient;

