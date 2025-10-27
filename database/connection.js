const { Pool } = require('pg');

class DatabaseConnection {
    constructor() {
        this.pool = new Pool({
            user: 'your_user',
            host: 'localhost',
            database: 'your_database',
            password: 'your_password',
            port: 5432,
        });
    }

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