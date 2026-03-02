require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
    multipleStatements: true
};

const createTables = async () => {
    const conn = await mysql.createConnection(dbConfig);
    console.log('🔗 Connected to AIVEN MySQL for migration...');

    try {
        // Create kodusers table
        await conn.execute(`
      CREATE TABLE IF NOT EXISTS kodusers (
        uid VARCHAR(50) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        balance DECIMAL(12,2) NOT NULL DEFAULT 100000.00,
        phone VARCHAR(20),
        role ENUM('customer','manager','admin') NOT NULL DEFAULT 'customer'
      )
    `);
        console.log('✅ Table "kodusers" ready.');

        // Create CJWT table
        await conn.execute(`
      CREATE TABLE IF NOT EXISTS CJWT (
        tid INT AUTO_INCREMENT PRIMARY KEY,
        tokenuid VARCHAR(50) NOT NULL,
        token TEXT NOT NULL,
        expiry DATETIME NOT NULL,
        FOREIGN KEY (tokenuid) REFERENCES kodusers(uid) ON DELETE CASCADE
      )
    `);
        console.log('✅ Table "CJWT" ready.');

        console.log('\n🎉 Migration complete! Both tables are set up in AIVEN.');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    } finally {
        await conn.end();
    }
};

createTables();
