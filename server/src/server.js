require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const axios = require('axios');
const Menu = require('./models/Menu');

/**
 * Express server for the Point of Sale system.
 * Provides API endpoints for the kiosk interface and other client applications.
 * 
 * @author Michael Nguyen
 */
const app = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
const SERVER_BASE_URL = process.env.SERVER_BASE_URL || `http://localhost:${PORT}`;

// Enable CORS for client requests (allow credentials for session cookies)
app.use(
    cors({
        origin: CLIENT_URL,
        credentials: true,
    })
);
app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET || 'dev-session-secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production',
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
            const user = {
                id: profile.id,
                displayName: profile.displayName,
                email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
                photo: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
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
            price: item.getPrice()
        }));
        
        res.json(items);
    } catch (error) {
        console.error('Error fetching menu items:', error);
        res.status(500).json({ error: 'Failed to fetch menu items' });
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

// --- Google OAuth routes ---
app.get(
    '/api/auth/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    })
);

app.get(
    '/api/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${CLIENT_URL}/signin?error=google`,
        keepSessionInfo: true,
    }),
    (req, res) => {
        res.redirect(`${CLIENT_URL}/kiosk`);
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
 * Starts the Express server and listens on the specified port.
 * 
 * @param {number} PORT - The port number to listen on (defaults to 3001)
 * @author Michael Nguyen
 */
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;

