const DatabaseConnection = require('../config/db');

/**
 * Class representing a employee retrieved from the database.
 * 
 * Employee instances are typically created via the Menu class, which loads
 * all employees from the database. Individual items can also be created
 * using the factory method `Employee.create(id)`.
 * 
 * @class Employee
 * @extends {DatabaseConnection}
 * @author Jonah Coffelt
 */
class Employee extends DatabaseConnection {
    /**
     * Constructs a new Employee instance.
     * 
     * @param {number} id - The unique identifier of the employee
     * @param {string} name - The employee's name
     * @author Jonah Coffelt
     */
    constructor(id = null, name = null) {
        super();
        this.id = id;
        this.name = name;
    }

    /**
     * Factory method to create a Employee instance from the database.
     * Retrieves employee data based on the provided ID and returns a populated Employee instance.
     * 
     * @static
     * @param {number} id - The ID of the employee to retrieve
     * @returns {Promise<Employee>} Promise that resolves to a Employee instance with database data
     * @throws {Error} Throws an error if the employee with the given ID is not found in the database
     * @author Jonah Coffelt
     */
    static async create(id) {
        const instance = new Employee();

        const query = {
            text: 'SELECT * FROM employees WHERE id = $1;',
            values: [id],
        };

        const result = await instance.runQuery(query);

        if (result.length === 0) {
            throw new Error(`Employee with ID ${id} not found`);
        }

        const item = result[0];

        instance.id = id;
        instance.name = item.name;

        return instance;
    }

    /**
     * Gets the unique identifier of this employee.
     * 
     * @returns {number} The employee ID
     * @author Jonah Coffelt
     */
    getID() {
        return this.id;
    }

    /**
     * Gets the name of this employee.
     * 
     * @returns {string} The employee name
     * @author Jonah Coffelt
     */
    getName() {
        return this.name;
    }

    /**
     * Query the database for this employee's lifetime sales. 
     * 
     * @returns {number} The total value of sales this employee has ever done
     */
    async getSales() {
        const query = {
            text: 'SELECT SUM(total_cents) AS total_sales FROM orders WHERE employee_id = $1',
            values: [this.id]
        }
        const result = await this.runQuery(query);
        return result[0].total_sales;
    }

    /**
     * Updates the name of this employee both locally and in the database.
     * 
     * @param {string} name - The new name for the employee
     * @returns {Promise<void>} Promise that resolves when the update is complete
     * @throws {Error} If database update fails
     * @author Jonah Coffelt
     */
    async setName(name) {
        const query = {
            text: 'UPDATE employees SET name = $1 WHERE id = $2;',
            values: [name, this.id],
        };
        await this.runQuery(query);
        this.name = name;
    }
}

module.exports = Employee;

