const mysql = require('mysql2/promise');

async function setupLocalDB() {
    const configs = [
        { host: 'localhost', user: 'root', password: '' },
        { host: 'localhost', user: 'root', password: 'password' },
        { host: 'localhost', user: 'root', password: 'root' }
    ];

    for (const config of configs) {
        try {
            console.log(`Trying config: ${JSON.stringify(config)}`);
            const connection = await mysql.createConnection(config);
            console.log('✅ Connected successfully!');
            await connection.query('CREATE DATABASE IF NOT EXISTS kodbank');
            console.log('✅ Database "kodbank" created/verified.');
            await connection.end();
            return config;
        } catch (err) {
            console.log(`❌ Failed: ${err.message}`);
        }
    }
    return null;
}

setupLocalDB().then(config => {
    if (config) {
        process.exit(0);
    } else {
        process.exit(1);
    }
});
