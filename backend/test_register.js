const pool = require('./db');

async function testRegister() {
    try {
        const uid = 'test' + Date.now();
        const uname = 'testuser' + Date.now();
        const email = 'test' + Date.now() + '@example.com';
        const password = 'password123';
        const phone = '1234567890';
        const role = 'customer';

        console.log('Testing registration...');

        // 1. Check existing
        const [existing] = await pool.execute(
            'SELECT uid FROM kodusers WHERE uid = ? OR username = ? OR email = ?',
            [uid, uname, email]
        );
        console.log('Existing check:', existing);

        // 2. Hash password (mocking bcrypt for simplicity in this script if needed, but I'll just use a string)
        const hashedPassword = 'mock_hash';

        // 3. Insert
        const [result] = await pool.execute(
            'INSERT INTO kodusers (uid, username, email, password, balance, phone, role) VALUES (?, ?, ?, ?, 100000.00, ?, ?)',
            [uid, uname, email, hashedPassword, phone, role]
        );
        console.log('Registration result:', result);

        process.exit(0);
    } catch (err) {
        console.error('Test Failed:', err);
        process.exit(1);
    }
}

testRegister();
