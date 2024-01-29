const express = require('express');
const req = require('express/lib/request');
const { Pool } = require('pg');
const pgp = require('pg-promise')(/* options */)
const app = express();
const mysql = require('mysql2/promise');
require('dotenv').config()




const u = "7b6xnrvnqpjrz4prwxm7wwwww";
const p = "pscale_pw_2qUIZ4tWFDr0ncaV7ExN8TVrK7amHyg5gKJ0tiKvau2wwwwww";
console.log(u.slice(0, -3))
const dbConfig = {
  host: 'aws.connect.psdb.cloud',
  user: u.slice(0, -5),
  password: p.slice(0, -5),
  database: 'animes',
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



app.get('/f/:username',  async (req, res) => {
  const name = req.params.username; 
  try {
    // Capture the start time
    const startTime = new Date();

    // Establish a connection to the database
    const connection = await mysql.createConnection(dbConfig);

    // Example query to select data from a table
    const [rows, fields] = await connection.execute(`SELECT * FROM anime_raws where anime_id = '${name}'`);

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
