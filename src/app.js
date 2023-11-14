const express = require('express');
const { Pool } = require('pg');
const pgp = require('pg-promise')(/* options */)
const app = express();

// PostgreSQL connection pool
// const pool = new Pool({
//   connectionString: 'psql "postgresql://bhargavjoshi1237:JtqLix7po8Ws@ep-weathered-frog-53534052.ap-southeast-1.aws.neon.tech/data?sslmode=require"',
// });



// Define a route to perform the SELECT query
app.get('/', async (req, res) => {
  // try {
  //   // Execute the SELECT query
  //   const client = await pool.connect();
  //   const queryResult = await client.query('SELECT * FROM data'); // Replace your_table_name with your actual table name
  //   client.release();

  //   // Send the query result as a JSON response
  //   res.json(queryResult.rows);
  // } catch (err) {
  //   console.error('Error executing query:', err);
  //   res.status(500).send(err);
  // }

const db = pgp('postgresql://bhargavjoshi1237:JtqLix7po8Ws@ep-weathered-frog-53534052.ap-southeast-1.aws.neon.tech/data?sslmode=require')

db.one('SELECT * FROM data;')
  .then((data) => {
    console.log('DATA:', data)
    res.json(data)
  })
  .catch((error) => {
    console.log('ERROR:', error)
  })
});

module.exports = app;
