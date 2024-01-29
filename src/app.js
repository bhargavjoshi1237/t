const express = require('express');
const mysql = require('mysql2/promise');
const compression = require('compression');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const dbConfig = {
  host: 'aws.connect.psdb.cloud',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'animes',
  ssl: {
    rejectUnauthorized: true
  }
};

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(compression());

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

app.get('/', async (req, res) => {
  res.json("hello");
});

app.get('/f/:username', async (req, res) => {
  const name = req.params.username;
  try {
    const startTime = new Date();

    const [rows, fields] = await pool.execute(`SELECT * FROM anime_raws WHERE anime_id = ?`, [name]);

    const endTime = new Date();
    const responseTime = endTime - startTime;

    console.log(`Database response time: ${responseTime} ms`);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching data from the database:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
