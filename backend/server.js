const app = require('./src/app');
const pool = require('./src/config/db');
const ensureRuntimeSchema = require('./src/config/ensureRuntimeSchema');

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('Connected to Database at:', res.rows[0].now);

        await ensureRuntimeSchema();
        console.log('Runtime schema checks completed.');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Database connection error:', err.stack);
        process.exit(1);
    }
}

startServer();
