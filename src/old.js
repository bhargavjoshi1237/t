const express = require('express');
const req = require('express/lib/request');
const { Pool } = require('pg');
const pgp = require('pg-promise')(/* options */)
const app = express();
const mysql = require('mysql2/promise');
require('dotenv').config()

// PostgreSQL connection pool
// const pool = new Pool({
//   connectionString: 'psql "postgresql://bhargavjoshi1237:JtqLix7po8Ws@ep-weathered-frog-53534052.ap-southeast-1.aws.neon.tech/data?sslmode=require"',
// });



const fetchData = async () => {
  try {
    const response = await fetch('http://oga.onrender.com');
    const data = await response.json();
    console.log('Fetch successful:', data);
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
};



const u = "efy3xddy7nombc38gfd8mwwwww";
const p = "pscale_pw_cxuv59p1vxWHpJk70lQk9Ej0sSpN06rbjxTFK3NdF3Awwwwww";
console.log(u.slice(0, -3))
const dbConfig = {
  host: 'aws.connect.psdb.cloud',
  user: u.slice(0, -5),
  password: p.slice(0, -5),
  database: 'wss',
  ssl: {
    rejectUnauthorized: true
  }
};

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://wss-hqv8eibx9-bhargavjoshi1237.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
console.log(process.env.PSU)
});

app.get('/upt', async (req, res) => {
  const name = req.params.username;  
  const notes = req.params.notes;
  const temp = req.params.temp;
  const windval = req.params.windval;
  const cloudval = req.params.cloudval;
  const selectedTab = req.params.selectedTab;
  const extra = req.params.extra;

  // Format the current date and time to match MySQL datetime format
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');

  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows, fields] = await connection.execute(
      `select anime_id from anime_raws;`
    );

    res.json(rows);
  } catch (error) {
    console.error('Error inserting data into the database:', error);
    res.status(500).send('Internal Server Error');
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

app.get('/create/:username/', async (req, res) => {
  const name = req.params.username;  
  const db = pgp('postgresql://bhargavjoshi1237:JtqLix7po8Ws@ep-weathered-frog-53534052.ap-southeast-1.aws.neon.tech/data?sslmode=require')
  db.one(`INSERT INTO users (username, name, celsius, notifications, pro, pfp) VALUES ('${name}', '${name}', 'true','true','false','default') RETURNING * ;`)
  .then((data) => {  
    let op = JSON.parse(JSON.stringify(data))
    res.json(op)
  })
  .catch((error) => {console.log('ERROR:', error) })
});





app.get('/set/pfp/:username/:data', async (req, res) => {
  const name = req.params.username;  
  const pfpid = req.params.data;  
  const db = pgp('postgresql://bhargavjoshi1237:JtqLix7po8Ws@ep-weathered-frog-53534052.ap-southeast-1.aws.neon.tech/data?sslmode=require')
  db.one(`UPDATE users SET pfp = '${pfpid}' WHERE username = '${name}' RETURNING * ;`)
  .then((data) => {  
    let op = JSON.parse(JSON.stringify(data))
    res.json(op)
  })
  .catch((error) => {console.log('ERROR:', error) })
});




app.get('/set/:username/:realname', async (req, res) => {
  const name = req.params.username;  
  const realname = req.params.realname;  
  const db = pgp('postgresql://bhargavjoshi1237:JtqLix7po8Ws@ep-weathered-frog-53534052.ap-southeast-1.aws.neon.tech/data?sslmode=require')
  db.one(`UPDATE users SET Name = '${realname}' WHERE username = '${name}' RETURNING * ;`)
  .then((data) => {  
    let op = JSON.parse(JSON.stringify(data))
    res.json(op)
  })
  .catch((error) => {console.log('ERROR:', error) })
});




app.get('/ag', async (req, res) => {
  const name = req.params.username;  
  const db = pgp('postgresql://bhargavjoshi1237:JtqLix7po8Ws@ep-weathered-frog-53534052.ap-southeast-1.aws.neon.tech/data?sslmode=require')
  db.one(`UPDATE PageViews SET ViewCount = ViewCount + 1 WHERE PageID = 1 RETURNING * ;`)
  .then((data) => {  
    let op = JSON.parse(JSON.stringify(data))
    res.json(op)
  })
  .catch((error) => {console.log('ERROR:', error) })
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
  try {
    const name = req.params.username;
    
    // Use parameterized query to prevent SQL injection
    const data = await db.one(`
      UPDATE users
      SET notifications = CASE
        WHEN notifications = true THEN false
        ELSE true
      END
      WHERE username = $1
      RETURNING *;
    `, [name]);

    // Send the updated data as a response
    res.json(data);
  } catch (error) {
    // Handle errors and send an appropriate response to the client
    console.error('ERROR:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
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


app.get('/get/ticket/id/:id', async (req, res) => {
  const name = req.params.id;
  try {
    // Capture the start time
    const startTime = new Date();

    // Establish a connection to the database
    const connection = await mysql.createConnection(dbConfig);

    // Example query to select data based on the username
    const [rows, fields] = await connection.execute(`SELECT * FROM ticket_data WHERE id = '${name}'`);

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


app.get('/set/location/:username/:city/:contry', async (req, res) => {
  const name = req.params.username;  
  const city = req.params.city;  
  const contry = req.params.contry;  
  const db = pgp('postgresql://bhargavjoshi1237:JtqLix7po8Ws@ep-weathered-frog-53534052.ap-southeast-1.aws.neon.tech/data?sslmode=require')
  db.one(`UPDATE users SET location = '{"country": "${contry}", "city": "${city}"}' WHERE username = '${name}' RETURNING *;`)
  .then((data) => {  
    let op = JSON.parse(JSON.stringify(data))
    res.json(op)
  })
  .catch((error) => {console.log('ERROR:', error) })
});

module.exports = app;
