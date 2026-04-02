const app = require('./src/app');
const pool = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Test DB Connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err.stack);
    } else {
        console.log('Connected to Database at:', res.rows[0].now);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
