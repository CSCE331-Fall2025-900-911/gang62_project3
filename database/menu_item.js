const DatabaseConnection = require('./DatabaseConnection');

class MenuItem extends DatabaseConnection {
    constructor(id, name, price) {
        super();
        this.id = id;
        this.name = name;
        this.price = price;
    }

    static async create(id) {
        const instance = new MenuItem(null, null, null);
        
        const query = {
            text: 'SELECT * FROM menu_items WHERE id = $1;',
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
