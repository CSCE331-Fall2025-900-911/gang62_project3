const express = require('express');
const cors = require('cors');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const axios = require('axios');
const Menu = require('./models/Menu');
const Order = require('./models/Order');
const MenuItem = require('./models/MenuItem');
const Staff = require('./models/Staff');
const Inventory = require('./models/Inventory');
const Ingredient = require('./models/Ingredient');
const DatabaseConnection = require('./config/db');

/**
 * Express server for the Point of Sale system.
 * Provides API endpoints for the kiosk interface and other client applications.
 * 
 * @author Michael Nguyen
 */
const app = express();
const PORT = process.env.PORT || 3001;

// Frontend origins allowed to call this API.
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const EXTRA_ORIGINS = process.env.EXTRA_ORIGINS
    ? process.env.EXTRA_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [];
const ALLOWED_ORIGINS = [CLIENT_URL, ...EXTRA_ORIGINS];
// Treat both standard NODE_ENV=production and Vercel's serverless environment
// as "production" for purposes of cookie security settings.
const IS_PRODUCTION =
    process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

// so that secure cookies and protocol detection work correctly.
app.set('trust proxy', 1);

// Base URL for this server (used for OAuth callback URLs).
// In production on Vercel, prefer the deployed URL if SERVER_BASE_URL is not explicitly set.
const SERVER_BASE_URL =
    process.env.SERVER_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${PORT}`);

// hard coded admin email allowlist for oauth logins.
// any google account with an email in this list will be treated as an admin
// and redirected to the manager dashboard after they successfully authenticate.
const ADMIN_EMAILS = new Set([
    'michaelmn@tamu.edu',
    'zhangdavid275@tamu.edu',
    'coffelt.jonah@tamu.edu',
]);

// Enable CORS for client requests (allow credentials for session cookies).
// For this project we keep CORS permissive and simply reflect the request origin.
// This works with credentials and avoids environment-specific misconfiguration.
app.use(
    cors({
        origin: true, // reflect request Origin header
        credentials: true,
    })
);
app.use(express.json());

const { Pool } = require('pg');

const pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
});

pgPool.on('error', (err) => {
    console.error('Unexpected PG pool error', err);
});

app.use(
    session({
        store: new PgSession({
            pool: pgPool,
            tableName: 'session',
            createTableIfMissing: true,
        }),
        secret: process.env.SESSION_SECRET || 'dev-session-secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: IS_PRODUCTION, // in production, requires HTTPS
            sameSite: IS_PRODUCTION ? 'none' : 'lax', // allow cross site cookies in production
        },
    })
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${SERVER_BASE_URL}/api/auth/google/callback`,
        },
        (accessToken, refreshToken, profile, done) => {
            // take email we get from google and convert it to lowercase
            const rawEmail =
                profile.emails && profile.emails[0] ? profile.emails[0].value : null;
            const email = rawEmail ? rawEmail.toLowerCase() : null;

            const isAdmin = email ? ADMIN_EMAILS.has(email) : false;
            const role = isAdmin ? 'admin' : 'customer';

            const user = {
                id: profile.id,
                displayName: profile.displayName,
                email,
                photo: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
                role,
                isAdmin,
            };

            done(null, user);
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

const DEEPL_API_KEY = 'ca69df7b-643d-475c-9b81-4a71e5078261:fx';
const DEEPL_API_URL = 'https://api-free.deepl.com/v2/translate';

/**
 * Root endpoint - health check
 * @route GET /
 */
app.get('/', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Server is running',
        endpoints: ['/api/menu-items', '/api/translate', '/api/submit-order', '/api/employees', '/api/inventory']
    });
});

/**
 * API endpoint to retrieve all menu items from the database.
 * Returns a JSON array of menu items with id, name, and price.
 * 
 * @route GET /api/menu-items
 * @returns {Promise<void>} Sends JSON response with menu items array
 * @throws {Error} If database query fails, returns 500 status with error message
 * @author Michael Nguyen
 */
app.get('/api/menu-items', async (req, res) => {
    try {
        const menu = new Menu();
        await menu.load();
        const menuItems = menu.getMenuItems();

        // Convert MenuItem objects to plain JSON
        const items = menuItems.map(item => ({
            id: item.getID(),
            name: item.getName(),
            price: item.getPrice(),
            drink_type: item.getDrinkType(),
            image_url: item.getImageURL()
        }));
        
        res.json(items);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ error: 'Failed to fetch menu items' });
    }
});

/**
 * API endpoint to add a new menu item to the database.
 * Accepts a JSON body with name and price (in dollars) and returns the created item.
 *
 * Request body:
 * {
 *   "name": string,
 *   "price": number,
 *   "drinkType": string,   // or "drink_type"
 *   "imageUrl": string     // or "image_url"
 * }
 *
 * @route POST /api/menu-items
 * @returns {Promise<void>} Sends JSON response with the created menu item
 * @throws {Error} If validation fails or database operations fail
 * @author Michael Nguyen
 */
app.post('/api/menu-items', async (req, res) => {
    try {
        const {
            name,
            price,
            drinkType,
            drink_type,
            imageUrl,
            image_url,
        } = req.body || {};

        const trimmedName = (name || '').trim();
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

        const rawDrinkType = drinkType !== undefined ? drinkType : drink_type;
        const rawImageUrl = imageUrl !== undefined ? imageUrl : image_url;

        const trimmedDrinkType = (rawDrinkType || '').toString().trim();
        const trimmedImageUrl = (rawImageUrl || '').toString().trim();

        if (!trimmedName) {
            return res.status(400).json({ error: 'Menu item name is required' });
        }

        if (Number.isNaN(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({ error: 'Price must be a number greater than 0' });
        }

        if (!trimmedDrinkType) {
            return res.status(400).json({ error: 'Drink type is required' });
        }

        const menu = new Menu();
        const newItem = await menu.addMenuItem(
            trimmedName,
            numericPrice,
            trimmedDrinkType,
            trimmedImageUrl || null
        );

        if (!newItem) {
            return res.status(500).json({ error: 'Failed to add menu item' });
        }

        res.status(201).json({
            id: newItem.getID(),
            name: newItem.getName(),
            price: newItem.getPrice(),
            drink_type: newItem.getDrinkType(),
            image_url: newItem.getImageURL()
        });
    } catch (error) {
        console.error('Error adding menu item:', error);
        res.status(500).json({ error: 'Failed to add menu item' });
    }
});

/**
 * Dashboard summary endpoint.
 * Returns aggregate metrics and daily time-series data for the last 30 days.
 *
 * - totalSales: total revenue in dollars
 * - orderCount: total number of orders
 * - avgOrderValue: average order value in dollars
 * - days: array of ISO date strings for the last 30 days
 * - dailyRevenue: revenue per day in dollars (aligned with days)
 * - dailyOrders: order count per day (aligned with days)
 * - dailyAvgOrderValue: average order value per day in dollars (aligned with days)
 *
 * @route GET /api/dashboard/summary
 * @returns {Promise<void>} Sends JSON response with dashboard summary metrics
 * @throws {Error} If database query fails, returns 500 status with error message
 * @author Michael Nguyen
 */
app.get('/api/dashboard/summary', async (req, res) => {
    try {
        const db = new DatabaseConnection();

        const rows = await db.runQuery({
            text: `
                SELECT
                    DATE(created_at) AS day,
                    SUM(total_cents) AS total_cents,
                    COUNT(*) AS order_count
                FROM orders
                WHERE created_at >= NOW() - INTERVAL '30 days'
                GROUP BY DATE(created_at)
                ORDER BY day;
            `,
        });

        const today = new Date();
        const days = [];
        const dailyRevenue = [];
        const dailyOrders = [];
        const dailyAvgOrderValue = [];

        let totalSalesCents = 0;
        let totalOrders = 0;

        // Build a map for quick lookup by date string
        const byDate = {};
        for (const row of rows) {
            const dayKey = row.day.toISOString().slice(0, 10);
            byDate[dayKey] = {
                total_cents: Number(row.total_cents) || 0,
                order_count: Number(row.order_count) || 0,
            };
        }

        // Generate last 30 days (oldest -> newest)
        for (let offset = 29; offset >= 0; offset -= 1) {
            const d = new Date(today);
            d.setDate(today.getDate() - offset);
            const key = d.toISOString().slice(0, 10);

            const row = byDate[key] || { total_cents: 0, order_count: 0 };
            const dayRevenueCents = row.total_cents;
            const dayOrders = row.order_count;

            days.push(key);
            dailyRevenue.push(dayRevenueCents / 100.0);
            dailyOrders.push(dayOrders);
            dailyAvgOrderValue.push(dayOrders > 0 ? (dayRevenueCents / 100.0) / dayOrders : 0);

            totalSalesCents += dayRevenueCents;
            totalOrders += dayOrders;
        }

        const totalSales = totalSalesCents / 100.0;
        const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

        res.json({
            totalSales,
            orderCount: totalOrders,
            avgOrderValue,
            days,
            dailyRevenue,
            dailyOrders,
            dailyAvgOrderValue,
        });
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard summary' });
    }
});

app.get('/api/reports/x-report', async (req, res) => {
    try {
        const db = new DatabaseConnection();
        
        // X Report: Sales since midnight today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        // 1. Revenue, Tax, Order Count
        const salesQuery = {
            text: `
                SELECT 
                    SUM(subtotal_cents) as revenue_cents,
                    SUM(tax_cents) as tax_cents,
                    COUNT(*) as order_count
                FROM orders
                WHERE created_at >= $1
            `,
            values: [todayStart]
        };
        const salesResult = await db.runQuery(salesQuery);
        const revenue = (Number(salesResult[0].revenue_cents) || 0) / 100;
        const taxes = (Number(salesResult[0].tax_cents) || 0) / 100;
        const orderCount = Number(salesResult[0].order_count) || 0;

        // 2. Top Employee
        const employeeQuery = {
            text: `
                SELECT e.name, COUNT(o.id) as order_count
                FROM orders o
                JOIN employees e ON o.employee_id = e.id
                WHERE o.created_at >= $1
                GROUP BY e.name
                ORDER BY order_count DESC
                LIMIT 1
            `,
            values: [todayStart]
        };
        const employeeResult = await db.runQuery(employeeQuery);
        const topEmployee = employeeResult.length > 0 ? employeeResult[0].name : "N/A";

        // 3. Most Popular Item
        const popularItemQuery = {
            text: `
                SELECT m.name, COUNT(t.id) as usage_count
                FROM tickets t
                JOIN orders o ON t.order_id = o.id
                JOIN menu_items m ON t.menu_item_id = m.id
                WHERE o.created_at >= $1
                GROUP BY m.name
                ORDER BY usage_count DESC
                LIMIT 1
            `,
            values: [todayStart]
        };
        const popularItemResult = await db.runQuery(popularItemQuery);
        const mostPopularItem = popularItemResult.length > 0 ? popularItemResult[0].name : "N/A";

        // 4. Low Stock Item
        const lowStockQuery = {
            text: `
                SELECT i.name, inv.stock
                FROM ingredients i
                JOIN inventory inv ON i.id = inv.ingredient_id
                ORDER BY inv.stock ASC
                LIMIT 1
            `
        };
        const lowStockResult = await db.runQuery(lowStockQuery);
        const lowStockItem = lowStockResult.length > 0 ? lowStockResult[0].name : "N/A";

        res.json({
            revenue,
            taxes,
            profit: revenue * 0.2, // Estimated profit margin
            orderCount,
            topEmployee,
            mostPopularItem,
            lowStockItem
        });

    } catch (error) {
        console.error('Error generating X Report:', error);
        res.status(500).json({ error: 'Failed to generate X Report' });
    }
});

app.get('/api/reports/z-report', async (req, res) => {
    try {
        const db = new DatabaseConnection();
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        
        const salesQuery = {
            text: `
                SELECT 
                    SUM(subtotal_cents) as revenue_cents,
                    SUM(tax_cents) as tax_cents,
                    COUNT(*) as order_count
                FROM orders
                WHERE created_at >= $1
            `,
            values: [todayStart]
        };
        const salesResult = await db.runQuery(salesQuery);
        const revenue = (Number(salesResult[0].revenue_cents) || 0) / 100;
        const taxes = (Number(salesResult[0].tax_cents) || 0) / 100;
        const orderCount = Number(salesResult[0].order_count) || 0;

        const employeeQuery = {
            text: `
                SELECT e.name, COUNT(o.id) as order_count
                FROM orders o
                JOIN employees e ON o.employee_id = e.id
                WHERE o.created_at >= $1
                GROUP BY e.name
                ORDER BY order_count DESC
                LIMIT 1
            `,
            values: [todayStart]
        };
        const employeeResult = await db.runQuery(employeeQuery);
        const topEmployee = employeeResult.length > 0 ? employeeResult[0].name : "N/A";

        const popularItemQuery = {
            text: `
                SELECT m.name, COUNT(t.id) as usage_count
                FROM tickets t
                JOIN orders o ON t.order_id = o.id
                JOIN menu_items m ON t.menu_item_id = m.id
                WHERE o.created_at >= $1
                GROUP BY m.name
                ORDER BY usage_count DESC
                LIMIT 1
            `,
            values: [todayStart]
        };
        const popularItemResult = await db.runQuery(popularItemQuery);
        const mostPopularItem = popularItemResult.length > 0 ? popularItemResult[0].name : "N/A";

        const lowStockQuery = {
            text: `
                SELECT i.name, inv.stock
                FROM ingredients i
                JOIN inventory inv ON i.id = inv.ingredient_id
                ORDER BY inv.stock ASC
                LIMIT 1
            `
        };
        const lowStockResult = await db.runQuery(lowStockQuery);
        const lowStockItem = lowStockResult.length > 0 ? lowStockResult[0].name : "N/A";

        res.json({
            revenue,
            taxes,
            profit: revenue * 0.2,
            orderCount,
            topEmployee,
            mostPopularItem,
            lowStockItem
        });

    } catch (error) {
        console.error('Error generating Z Report:', error);
        res.status(500).json({ error: 'Failed to generate Z Report' });
    }
});

app.get('/api/inventory/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const ingredient = await Ingredient.create(id);
        if (!ingredient) {
            return res.status(404).json({ error: 'Ingredient not found' });
        }

        res.json({
            id: ingredient.getID(),
            name: ingredient.getName(),
            stock: ingredient.getStock(),
            quantityPerUnit: ingredient.getQuantityPerUnit()
        });
    } catch (error) {
        console.error('Error fetching ingredient:', error);
        res.status(500).json({ error: 'Failed to fetch ingredient' });
    }
});


/**
 * API endpoint to retrieve all inventory items from the database.
 * Returns a JSON array of ingredients with id, name, stock, and quantityPerUnit.
 * 
 * @route GET /api/inventory
 * @returns {Promise<void>} Sends JSON response with inventory items array
 * @throws {Error} If database query fails, returns 500 status with error message
 */
app.get('/api/inventory', async (req, res) => {
    try {
        const inventory = new Inventory();
        await inventory.load();
        const ingredients = inventory.getIngredients();
        // Convert Ingredient objects to plain JSON
        const items = ingredients.map(item => ({
            id: item.getID(),
            name: item.getName(),
            stock: item.getStock(),
            quantityPerUnit: item.getQuantityPerUnit()
        }));
        res.json(items);
    } catch (error) {
        console.error('Error fetching inventory items:', error);
        res.status(500).json({ error: 'Failed to fetch inventory items' });
    }
});

/**
 * Dashboard top-items endpoint.
 * Returns top-selling menu items for the last 30 days using real ticket/order data.
 *
 * Response shape:
 * {
 *   items: [
 *     {
 *       id: number,
 *       name: string,
 *       basePrice: number,        // in dollars
 *       quantitySold: number,
 *       totalRevenue: number      // in dollars
 *     },
 *     ...
 *   ],
 *   totalSales: number            // total revenue across returned items, in dollars
 * }
 *
 * @route GET /api/dashboard/top-items
 * @returns {Promise<void>} Sends JSON response with top-selling menu items
 * @throws {Error} If database query fails, returns 500 status with error message
 * @author Michael Nguyen
 */
app.get('/api/dashboard/top-items', async (req, res) => {
    try {
        const db = new DatabaseConnection();

        const rows = await db.runQuery({
            text: `
                SELECT
                    mi.id,
                    mi.name,
                    mi.base_price_cents,
                    mi.drink_type,
                    COALESCE(SUM(t.qty), 0) AS quantity_sold,
                    COALESCE(SUM(t.qty * mi.base_price_cents), 0) AS total_cents
                FROM menu_items mi
                LEFT JOIN tickets t
                    ON t.menu_item_id = mi.id
                LEFT JOIN orders o
                    ON o.id = t.order_id
                    AND o.created_at >= NOW() - INTERVAL '30 days'
                GROUP BY mi.id, mi.name, mi.base_price_cents, mi.drink_type
                ORDER BY total_cents DESC
            `,
        });

        const items = rows.map((row) => ({
            id: row.id,
            name: row.name,
            basePrice: (Number(row.base_price_cents) || 0) / 100.0,
            drinkType: row.drink_type,
            quantitySold: Number(row.quantity_sold) || 0,
            totalRevenue: (Number(row.total_cents) || 0) / 100.0,
        }));

        const totalSales = items.reduce((sum, item) => sum + item.totalRevenue, 0);

        res.json({ items, totalSales });
    } catch (error) {
        console.error('Error fetching top items:', error);
        res.status(500).json({ error: 'Failed to fetch top items' });
    }
});

/**
 * API endpoint to retrieve all orders with their line items.
 *
 * Response shape:
 * [
 *   {
 *     id: number,
 *     createdAt: string,
 *     employeeId: number | null,
 *     customerId: number | null,
 *     subtotal: number,   // dollars
 *     tax: number,        // dollars
 *     total: number,      // dollars
 *     items: [
 *       {
 *         menuItemId: number,
 *         name: string,
 *         qty: number,
 *         lineTotal: number // dollars
 *       },
 *       ...
 *     ]
 *   },
 *   ...
 * ]
 *
 * @route GET /api/orders-with-items
 * @returns {Promise<void>} Sends JSON response with orders and their items
 * @author Michael Nguyen
 */
app.get('/api/orders-with-items', async (req, res) => {
    try {
        const db = new DatabaseConnection();

        // Optional limit query param to avoid returning too many rows by default
        const rawLimit = req.query.limit;
        let limit = 20;
        if (rawLimit !== undefined) {
            const parsed = parseInt(rawLimit, 10);
            if (!Number.isNaN(parsed) && parsed > 0) {
                // Cap the limit to a reasonable maximum to protect the server
                limit = Math.min(parsed, 1000);
            }
        }

        const rows = await db.runQuery({
            text: `
                WITH latest_orders AS (
                    SELECT *
                    FROM orders
                    ORDER BY created_at DESC, id DESC
                    LIMIT $1
                )
                SELECT
                    o.id AS order_id,
                    o.created_at,
                    o.employee_id,
                    o.customer_id,
                    o.subtotal_cents,
                    o.tax_cents,
                    o.total_cents,
                    t.menu_item_id,
                    t.qty,
                    t.line_total_cents,
                    mi.name AS menu_item_name
                FROM latest_orders o
                JOIN tickets t
                    ON t.order_id = o.id
                JOIN menu_items mi
                    ON mi.id = t.menu_item_id
                ORDER BY o.created_at DESC, o.id DESC, t.id ASC;
            `,
            values: [limit],
        });

        const ordersById = {};

        for (const row of rows) {
            const id = row.order_id;
            if (!ordersById[id]) {
                ordersById[id] = {
                    id,
                    createdAt: row.created_at,
                    employeeId: row.employee_id,
                    customerId: row.customer_id,
                    subtotal: (Number(row.subtotal_cents) || 0) / 100.0,
                    tax: (Number(row.tax_cents) || 0) / 100.0,
                    total: (Number(row.total_cents) || 0) / 100.0,
                    items: [],
                };
            }

            ordersById[id].items.push({
                menuItemId: row.menu_item_id,
                name: row.menu_item_name,
                qty: Number(row.qty) || 0,
                lineTotal: (Number(row.line_total_cents) || 0) / 100.0,
            });
        }

        res.json(Object.values(ordersById));
    } catch (error) {
        console.error('Error fetching orders with items:', error);
        res.status(500).json({ error: 'Failed to fetch orders with items' });
    }
});

/**
 * API endpoint to update inventory stock.
 * 
 * @route PUT /api/inventory/:id
 * @param {number} id - The ID of the ingredient to update
 * @param {number} stock - The new stock value
 * @returns {Promise<void>} Sends JSON response with success status
 */
app.put('/api/inventory/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;
        if (stock === undefined) {
            return res.status(400).json({ error: 'Stock value is required' });
        }
        const ingredient = await Ingredient.create(id);
        await ingredient.setStock(stock);
        res.json({ success: true, message: 'Stock updated successfully', stock: ingredient.getStock() });
    } catch (error) {
        console.error('Error updating inventory:', error);
        res.status(500).json({ error: 'Failed to update inventory' });
    }
});



/**
 * API endpoint to translate text using DeepL API.
 * 
 * @route POST /api/translate
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (e.g., 'ES', 'FR', 'DE')
 * @returns {Promise<void>} Sends JSON response with translated text
 * @author Michael Nguyen
 */
app.post('/api/translate', async (req, res) => {
    try {
        const { text, targetLang } = req.body;
        if (!text || !targetLang) {
            return res.status(400).json({ error: 'Text and targetLang are required' });
        }

        const formData = `auth_key=${encodeURIComponent(DEEPL_API_KEY)}&text=${encodeURIComponent(text)}&target_lang=${encodeURIComponent(targetLang)}`;

        const response = await axios.post(DEEPL_API_URL, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        res.json({ translatedText: response.data.translations[0].text });
    } catch (error) {
        console.error('Error translating text:', error);
        res.status(500).json({ error: 'Failed to translate text' });
    }
});

/**
 * API endpoint to submit an order to the database.
 * Creates an Order instance, adds menu items, and submits it.
 * 
 * @route POST /api/submit-order
 * @param {number} employeeID - The employee ID processing the order
 * @param {number} customerID - The customer ID (defaults to 1)
 * @param {Array} items - Array of objects with id and quantity, or array of menu item IDs
 * @returns {Promise<void>} Sends JSON response with success status
 * @throws {Error} If order submission fails, returns 500 status with error message
 * @author Michael Nguyen
 */
app.post('/api/submit-order', async (req, res) => {
    try {
        const { employeeID, customerID, items } = req.body;
        
        if (!employeeID || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'employeeID and items array are required' });
        }
        
        const order = new Order(employeeID, customerID || 1);
        
        // Add each menu item to the order (handle both formats: array of IDs or array of objects)
        for (const item of items) {
            const itemId = typeof item === 'object' ? item.id : item;
            const quantity = typeof item === 'object' && item.quantity ? item.quantity : 1;
            
            const menuItem = await MenuItem.create(itemId);
            
            // Add the item the specified number of times (matching Java behavior)
            for (let i = 0; i < quantity; i++) {
                order.addItem(menuItem);
            }
        }
        
        // Submit the order
        await order.submit();
        
        res.json({ success: true, message: 'Order submitted successfully' });
    } catch (error) {
        console.error('Error submitting order:', error);
        res.status(500).json({ error: 'Failed to submit order: ' + error.message });
    }
});

//Google OAuth routes
app.get(
    '/api/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    })
);

app.get(
    '/api/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${CLIENT_URL}/?error=google`,
        keepSessionInfo: true,
    }),
    (req, res) => {
        // afer successful oauth, redirect to the client root.
        // The client will handle navigation based on the user role using React Router.
        const user = req.user;

        if (user && (user.role === 'admin' || user.isAdmin)) { // if user is an admin, redirect to manager dashboard
            return res.redirect(`${CLIENT_URL}/manager`);
        }
        return res.redirect(`${CLIENT_URL}/kiosk`);
    }
);

app.get('/api/auth/user', (req, res) => {
    res.json({ user: req.user || null });
});

app.post('/api/auth/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.status(200).json({ success: true });
        });
    });
});

/**
 * API endpoint to retrieve all employees from the database.
 * Returns a JSON array of employees with id, name, role (status), and tips (calculated from sales).
 * 
 * @route GET /api/employees
 * @returns {Promise<void>} Sends JSON response with employees array
 * @throws {Error} If database query fails, returns 500 status with error message
 * @author Michael Nguyen
 */
app.get('/api/employees', async (req, res) => {
    try {
        const staff = new Staff();
        await staff.load();
        const employees = staff.getEmployees();
        
        // Query database directly to get status field (not stored in Employee model)
        const statusQuery = await staff.runQuery('SELECT id, status FROM employees');
        const statusMap = {};
        statusQuery.forEach(row => {
            statusMap[row.id] = row.status || 'Employee'; // Default to 'Employee' if status is null
        });
        
        // Convert Employee objects to plain JSON with sales/tips data
        const employeesData = await Promise.all(
            employees.map(async (employee) => {
                const salesCents = await employee.getSales();
                // Convert sales from cents to dollars, then calculate tips as 10% of sales
                const salesDollars = salesCents ? salesCents / 100 : 0;
                const tips = salesDollars * 0.10;
                
                return {
                    id: employee.getID(),
                    name: employee.getName(),
                    role: statusMap[employee.getID()] || 'Employee',
                    tips: tips,
                };
            })
        );
        
        res.json(employeesData);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

/**
 * Starts the Express server and listens on the specified port.
 * 
 * @param {number} PORT - The port number to listen on (defaults to 3001)
 * @author Michael Nguyen
 */
if (process.env.VERCEL !== '1') {
    // For Vercel deployment, export the app instead of starting the server
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}



module.exports = app;

// export default app;