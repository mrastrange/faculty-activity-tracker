const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: "postgres",          // your postgres username
  host: "localhost",
  database: "faculty_tracker",  // change this
  password: "Alpha@2005#", // change this
  port: 5432,
});


pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
