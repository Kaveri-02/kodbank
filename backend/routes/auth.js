const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
require('dotenv').config();

// ─────────────────────────────────────────────────────────────
// POST /api/register
// ─────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { uid, uname, password, email, phone, role } = req.body;

        // Basic validation
        if (!uid || !uname || !password || !email || !phone) {
            return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        // Force role to 'customer' regardless of input
        const userRole = 'customer';

        // Check for duplicate uid or email
        const [existing] = await pool.execute(
            'SELECT uid FROM kodusers WHERE uid = ? OR username = ? OR email = ?',
            [uid, uname, email]
        );
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: 'User with this UID, username, or email already exists.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into kodusers (balance defaults to 100000)
        await pool.execute(
            'INSERT INTO kodusers (uid, username, email, password, balance, phone, role) VALUES (?, ?, ?, ?, 100000.00, ?, ?)',
            [uid, uname, email, hashedPassword, phone, userRole]
        );

        return res.status(201).json({ success: true, message: 'Registration successful! Please login.' });

    } catch (err) {
        console.error('Register error:', err.message);
        return res.status(500).json({ success: false, message: 'Server error during registration.' });
    }
});

// ─────────────────────────────────────────────────────────────
// POST /api/login
// ─────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Username and password are required.' });
        }

        // Fetch user by username
        const [users] = await pool.execute(
            'SELECT * FROM kodusers WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }

        const user = users[0];

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }

        // Generate JWT (HS256, sub=username, role=claim, 1h expiry)
        const token = jwt.sign(
            { sub: user.username, role: user.role },
            process.env.JWT_SECRET,
            { algorithm: 'HS256', expiresIn: '1h' }
        );

        // Calculate expiry time (1 hour from now)
        const expiryDate = new Date(Date.now() + 60 * 60 * 1000);

        // Store token in CJWT table
        await pool.execute(
            'INSERT INTO CJWT (tokenuid, token, expiry) VALUES (?, ?, ?)',
            [user.uid, token, expiryDate]
        );

        // Set JWT as HTTP-only cookie
        res.cookie('kodbank_token', token, {
            httpOnly: true,
            secure: false, // set to true in production with HTTPS
            maxAge: 60 * 60 * 1000, // 1 hour in ms
            sameSite: 'lax'
        });

        return res.status(200).json({
            success: true,
            message: 'Login successful!',
            user: { username: user.username, role: user.role }
        });

    } catch (err) {
        console.error('Login error:', err.message);
        return res.status(500).json({ success: false, message: 'Server error during login.' });
    }
});

// ─────────────────────────────────────────────────────────────
// GET /api/balance  (Protected)
// ─────────────────────────────────────────────────────────────
router.get('/balance', authMiddleware, async (req, res) => {
    try {
        // req.user.sub = username (from JWT payload)
        const username = req.user.sub;

        const [rows] = await pool.execute(
            'SELECT balance FROM kodusers WHERE username = ?',
            [username]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        return res.status(200).json({
            success: true,
            balance: rows[0].balance,
            username: username
        });

    } catch (err) {
        console.error('Balance error:', err.message);
        return res.status(500).json({ success: false, message: 'Server error fetching balance.' });
    }
});

// ─────────────────────────────────────────────────────────────
// POST /api/logout
// ─────────────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
    res.clearCookie('kodbank_token');
    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

module.exports = router;
