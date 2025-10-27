require('dotenv').config();
const { Pool } = require('pg');

/**
 * Class representing a database connection pool for PostgreSQL.
 * 
 * @author Jonah Coffelt
 */
class DatabaseConnection {
    /**
     * Creates an instance of DatabaseConnection.
     * Initializes a PostgreSQL connection pool using environment variables.
     * 
     * @author Michael Nguyen
     */
    constructor() {
        this.pool = new Pool({
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
        });
    }

    /**
     * Executes a SQL query against the database and returns the results.
     * 
     * @param {string} query - The SQL query to execute
     * @returns {Promise<Array>} Promise that resolves to an array of result rows
     * @throws {Error} Throws an error if the query execution fails
     * @author Jonah Coffelt
     */
    async runQuery(query) {
        try {
            const res = await this.pool.query(query);
            console.log(res.rows);
            return res.rows;
        } catch (err) {
            console.error('Error executing query', err.stack);
            throw err;
        }
    }

    async close() {
        await this.pool.end();
    }
}

module.exports = DatabaseConnection;
