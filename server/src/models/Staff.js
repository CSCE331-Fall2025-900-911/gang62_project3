const DatabaseConnection = require('../config/db');
const Employee = require('./Employee');

/**
 * Manages the staff of items in the Point of Sale system.
 * This class provides functionality to load all employees from the database
 * and manage employees including adding new employees.
 * 
 * @author Jonah Coffelt
 */
class Staff extends DatabaseConnection {
    /**
     * Constructs a new Staff instance.
     * Note: Must call load() to fetch employees from the database.
     * 
     * @throws {Error} If database connection fails
     * @author Jonah Coffelt
     */
    constructor() {
        super();
        this.employees = [];
    }

    /**
     * Loads all employees from the database asynchronously.
     * Populates the staffItems array with Employee instances.
     * 
     * @returns {Promise<Staff>} Promise that resolves to this Staff instance
     * @throws {Error} If database query fails
     * @author Jonah Coffelt
     */
    async load() {
        const result = await this.runQuery('SELECT * FROM employees');

        this.employees = [];
        for (const itemData of result) {
            const item = await Employee.create(itemData.id);
            this.employees.push(item);
        }

        return this;
    }

    /**
     * Gets the list of all employees.
     * 
     * @returns {Array<Employee>} An Array of Employee objects
     * @author Jonah Coffelt
     */
    getEmployees() {
        return this.employees;
    }

    /**
     * Adds a new employee to both the database and local Array.
     * 
     * @param {string} name The name of the employee
     * @returns {Promise<Employee|null>} The newly created Employee object if successful, null otherwise
     * @throws {Error} If database operations fail
     * @author Jonah Coffelt
     */
    async addEmployee(name) {
        try {
            const getIdQuery = 'SELECT MAX(id) as max_id FROM employees;';
            const idResult = await this.runQuery(getIdQuery);
            
            let nextId = 1;
            if (idResult && idResult.length > 0 && idResult[0].max_id !== null) {
                nextId = parseInt(idResult[0].max_id) + 1;
            }
            
            const query = {
                text: "INSERT INTO employees (id, name, status) VALUES ($1, $2, 'active');",
                values: [nextId, name]
            };
            await this.runQuery(query);

            const newItem = await Employee.create(nextId);
            this.employees.push(newItem);
            return newItem;

        } catch (err) {
            console.error('Error adding staff item:', err);
            return null;
        }
    }
}

module.exports = Staff;

