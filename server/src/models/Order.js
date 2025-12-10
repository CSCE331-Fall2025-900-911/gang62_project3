const DatabaseConnection = require('../config/db');
const MenuItem = require('./MenuItem')

const TAX = 0.062;

/**
 * Class representing a order retrieved from the database.
 * 
 * Order instances are typically created via the Menu class, which loads
 * all orders from the database. Individual items can also be created
 * using the factory method `Order.create(id)`.
 * 
 * @class Order
 * @extends {DatabaseConnection}
 * @author Jonah Coffelt
 */
class Order extends DatabaseConnection {
    /**
     * 
     * @param {number} employeeID 
     * @param {number} customerID 
     * @author Jonah Coffelt
     */
    constructor(employeeID = null, customerID = null) {
        super();
        this.employeeID = employeeID;
        this.customerID = customerID;
        this.orderItems = []
    }

    /**
     * Adds a menu item to the order. Each item will generate a ticket when submitted.
     * 
     * @param {MenuItem} item the menu item to add to the order
     * @author Jonah Coffelt
     */
    addItem(item) {
        this.orderItems.push(item);
    }

    /**
     * Removes a menu item from the order.
     * 
     * @param {MenuItem} item the menu item to remove from the order
     * @author Jonah Coffelt
     */
    removeItem(item) {
        let index = this.orderItems.indexOf(item);
        if (index !== -1) {
            orderItems.splice(index, 1);
        }
    }

    /**
     * Gets the list of menu items in this order.
     * 
     * @returns {Array<MenuItem>}
     */
    getItems() {
        return this.orderItems;
    }

    /**
     * Submits the order and its associated tickets to the database.
     * Calculates subtotal, tax, and total amounts before submission.
     * 
     * @author Jonah Coffelt
     */
    async submit() {

        // Get subtotal from all menu items
        let subtotal = 0.0;
        this.orderItems.forEach(item => {
            subtotal += item.getPrice();
        });

        // Calculate tax
        let tax = subtotal * TAX;

        // Get current timestamp in UTC
        const now = new Date();
        const timestamp = now.getUTCFullYear() + '-' +
        String(now.getUTCMonth() + 1).padStart(2, '0') + '-' +
        String(now.getUTCDate()).padStart(2, '0') + ' ' +
        String(now.getUTCHours()).padStart(2, '0') + ':' +
        String(now.getUTCMinutes()).padStart(2, '0') + ':' +
        String(now.getUTCSeconds()).padStart(2, '0');

        // Get the id for the order
        const getOrderIdQuery = 'SELECT MAX(id) as max_id FROM orders;';
        const orderIdResult = await this.runQuery(getOrderIdQuery);
        let orderID = 1;
        if (orderIdResult && orderIdResult.length > 0 && orderIdResult[0].max_id !== null) {
            orderID = parseInt(orderIdResult[0].max_id) + 1;
        }

        // Get the id for the ticket
        const getTicketIdQuery = 'SELECT MAX(id) as max_id FROM tickets;';
        const ticketIdResult = await this.runQuery(getTicketIdQuery);
        let ticketID = 1;
        if (ticketIdResult && ticketIdResult.length > 0 && ticketIdResult[0].max_id !== null) {
            ticketID = parseInt(ticketIdResult[0].max_id) + 1;
        }

        const subtotalCents = Math.round(subtotal * 100);
        const taxCents = Math.round(tax * 100);
        const totalCents = Math.round((subtotal + tax) * 100);

        let orderQuery = {
            text: "INSERT INTO orders (id, employee_id, customer_id, status, subtotal_cents, tax_cents, total_cents, created_at) \
                VALUES ($1, $2, $3, 1, $4, $5, $6, $7);",
            values: [
                orderID,
                this.employeeID,
                this.customerID,
                subtotalCents,
                taxCents,
                totalCents,
                timestamp
            ]
        };
        this.runQuery(orderQuery);

        for (const item of this.orderItems) {
            const ticketQuery = {
                text: `INSERT INTO tickets
                    (id, order_id, menu_item_id, qty, line_total_cents)
                    VALUES ($1, $2, $3, $4, $5);`,
                values: [
                    ticketID,
                    orderID,
                    item.getID(),
                    1,
                    Math.round(item.getPrice() * 100)
                ]
            };

            await this.runQuery(ticketQuery);
            ticketID++;
        }
    }
}

module.exports = Order;