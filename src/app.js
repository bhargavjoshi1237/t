const express = require('express');
const req = require('express/lib/request');
const { Pool } = require('pg');
const pgp = require('pg-promise')(/* options */)
const app = express();
const mysql = require('mysql2/promise');

// PostgreSQL connection pool
// const pool = new Pool({
//   connectionString: 'psql "postgresql://bhargavjoshi1237:JtqLix7po8Ws@ep-weathered-frog-53534052.ap-southeast-1.aws.neon.tech/data?sslmode=require"',
// });
const dbConfig = {
  host: 'aws.connect.psdb.cloud',
  user: 'ig7hn43hshskk2w14xy8',
  password: 'pscale_pw_oYSMXweuL7ufvcuJtgSbwH4bop1RAjjYX3HmHDayiJa',
  database: 'wss',
  ssl: {
    rejectUnauthorized: true
  }
};

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.get('/get/user/:username', (req, res) => {
  const xop = req.params.username;
  
  if (xop) {

  const db = pgp('postgresql://bhargavjoshi1237:JtqLix7po8Ws@ep-weathered-frog-53534052.ap-southeast-1.aws.neon.tech/data?sslmode=require')
  db.one(`SELECT * FROM users  WHERE username = '${xop}';`)
  .then((data) => {  
    let op = JSON.parse(JSON.stringify(data))
    res.json(op)
  })
  .catch((error) => {console.log('ERROR:', error) })}
  
  else {
    res.send('Please provide a valid item name in the URL.');
  }
});

// Define a route to perform the SELECT query
app.get('/', async (req, res) => {
res.json("hello")
});



app.get('/set/user/:username/', async (req, res) => {
  const name = req.params.username;  
  const db = pgp('postgresql://bhargavjoshi1237:JtqLix7po8Ws@ep-weathered-frog-53534052.ap-southeast-1.aws.neon.tech/data?sslmode=require')
  db.one(`INSERT INTO users (username, "Name", tickets, location, celsius, notifications, pro, pfp)
  VALUES
  ('${name}', '${name}', '{"empty": "empty"}', '[{"country": "USA"}, {"city": "New York"}]', true, false, true, 'https://i.ibb.co/zrw0zv1/pfp-modified.png') RETURNING * ;`)
  .then((data) => {  
    let op = JSON.parse(JSON.stringify(data))
    res.json(op)
  })
  .catch((error) => {console.log('ERROR:', error) })
});


app.get('/set/notification/:username/', async (req, res) => {
  const name = req.params.username;  
  const db = pgp('postgresql://bhargavjoshi1237:JtqLix7po8Ws@ep-weathered-frog-53534052.ap-southeast-1.aws.neon.tech/data?sslmode=require')
  db.one(`UPDATE users  SET notifications = CASE      WHEN notifications = true THEN false      ELSE true  END  WHERE username = '${name}' RETURNING *;`)
  .then((data) => {  
    let op = JSON.parse(JSON.stringify(data))
    res.json(op)
  })
  .catch((error) => {console.log('ERROR:', error) })
});

app.get('/set/unit/:username/', async (req, res) => {
  const name = req.params.username;  
  const db = pgp('postgresql://bhargavjoshi1237:JtqLix7po8Ws@ep-weathered-frog-53534052.ap-southeast-1.aws.neon.tech/data?sslmode=require')
  db.one(`UPDATE users  SET celsius = CASE      WHEN celsius = true THEN false      ELSE true  END  WHERE username = '${name}' RETURNING *;`)
  .then((data) => {  
    let op = JSON.parse(JSON.stringify(data))
    res.json(op)
  })
  .catch((error) => {console.log('ERROR:', error) })
});

app.get('/get/ticket/:username',  async (req, res) => {
  const name = req.params.username; 
  try {
    // Capture the start time
    const startTime = new Date();

    // Establish a connection to the database
    const connection = await mysql.createConnection(dbConfig);

    // Example query to select data from a table
    const [rows, fields] = await connection.execute(`SELECT id FROM ticket_data where username = '${name}'`);

    // Capture the end time
    const endTime = new Date();

    // Calculate the response time in milliseconds
    const responseTime = endTime - startTime;

    // Close the database connection
    await connection.end();

    // Log the response time
    console.log(`Database response time: ${responseTime} ms`);

    // Send the data as a JSON response
    res.json(rows);
  } catch (error) {
    // Handle errors
    console.error('Error fetching data from the database:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/get/ticket/location/:username', async (req, res) => {
  const name = req.params.username;
  try {
    // Capture the start time
    const startTime = new Date();

    // Establish a connection to the database
    const connection = await mysql.createConnection(dbConfig);

    // Example query to select data based on the username
    const [rows, fields] = await connection.execute(`SELECT id FROM ticket_data WHERE locname = '${name}'`);

    // Capture the end time
    const endTime = new Date();

    // Calculate the response time in milliseconds
    const responseTime = endTime - startTime;

    // Close the database connection
    await connection.end();

    // Log the response time
    console.log(`Database response time: ${responseTime} ms`);

    // Send the data as a JSON response
    res.json(rows);
  } catch (error) {
    // Handle errors
    console.error('Error fetching data from the database:', error);
    res.status(500).send('Internal Server Error');
  }
});



module.exports = app;
