const express = require('express');
const req = require('express/lib/request');
const { Pool } = require('pg');
const pgp = require('pg-promise')(/* options */)
const app = express();
// var requests = require('requests');
const mysql = require('mysql2/promise');
require('dotenv').config()
// const scrapeHtmlWeb = require('scrape-html-web'); // Assuming you have installed the scrape-html-web package
const { scrapeHtmlWeb } = require("scrape-html-web");


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

  
  app.get('/', async (req, res) => {
    try {
      const options = {
        url: "https://www.animenewsnetwork.com/news/",
        bypassCors: true,
        // list: true,
        mainSelector: ".mainfeed-section ",
        childrenSelector: [
          { key: "date", selector: "div",type: "text" } ,
          // { key: "link", selector: "text", attr: "href" } ,
          // { key: "linkx", selector: "a",type: "text" } 
        ],
      };
      
      const data = await scrapeHtmlWeb(options);
      console.log(data)
     res.json(data)
     
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });







module.exports = app;
