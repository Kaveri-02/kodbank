require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');

// Import db to trigger connection test on startup
require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://192.168.56.1:3000',
        'https://kodbank.vercel.app',
        'https://kodbank-git-main-kaveri-02s-projects.vercel.app',
        'https://kodbank-kaveri-02s-projects.vercel.app'
    ],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ─── Routes ──────────────────────────────────────────────────
app.use('/api', authRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'KodBank API is running 🏦', time: new Date().toISOString() });
});

// ─── Start Server ─────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 KodBank backend running at http://localhost:${PORT}`);
    });
}

module.exports = app;
