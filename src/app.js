const express = require('express');
const app = express();
const Redis = require("ioredis");
const { Client } = require("pg");
const { scrapeHtmlWeb } = require("scrape-html-web");
const client = new Redis("redis://default:553e61e7c64649478d1ff784688c052b@correct-stud-36874.upstash.io:36874");
const clientx = new Client("postgresql://jack:jy0LTlC8AlTandmUfJEv3A@wss-uesrs-3515.7s5.aws-ap-south-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full");



// const u = "7b6xnrvnqpjrz4prwxm7wwwww";
// const p = "pscale_pw_2qUIZ4tWFDr0ncaV7ExN8TVrK7amHyg5gKJ0tiKvau2wwwww";
// console.log(u.slice(0, -3))
// const dbConfig = {
//   host: 'aws.connect.psdb.cloud',
//   user: u.slice(0, -5),
//   password: p.slice(0, -5),
//   database: 'animes',
//   ssl: {
//     rejectUnauthorized: true
//   }
// };



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


// app.get('/', async (req, res) => {
//   res.json("hello")
//   console.log(process.env.PSU)
//   });

app.get('/:id', async (req, res) => {
  const { id } = req.params;
  const start = Date.now(); // Record the start time

  try {
    // Fetch the username associated with the token from Redis
    const username = await client.get(id);
    res.json(JSON.parse(username));

    const end = Date.now(); // Record the end time
    const responseTime = end - start; // Calculate response time
    console.log(`Response time: ${responseTime} ms`);
  } catch (error) {
    console.error('Error fetching username from Redis:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

 


});









module.exports = app;
