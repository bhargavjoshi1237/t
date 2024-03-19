const express = require('express');
const app = express();
const Redis = require("ioredis");

const { scrapeHtmlWeb } = require("scrape-html-web");
const client = new Redis("redis://default:553e61e7c64649478d1ff784688c052b@correct-stud-36874.upstash.io:36874");



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
    // Record the start time
    const startTime = new Date();

    const options = {
      url: "https://myanimelist.net/news",
      list: true,
      bypassCors: true,
      mainSelector: ".news-list ",
      childrenSelector: [
        { key: "tags", selector: ".tags ", type: "text" },
        { key: "title", selector: ".title", type: "text" },
        { key: "writer", selector: ".info  ", type: "text" }, 
        { key: "description", selector: ".text ", type: "text" },
        { key: "imagex", selector: ".image ", attr: "src" },
       

        // { key: "image", selector: ".clearfix", type: "text" },

       ],
    };

    // Perform the scraping operation
    const data = await scrapeHtmlWeb(options);
    console.log(data)
    res.json(data.slice(0,20))
    // Calculate the time taken
    const endTime = new Date();
    const elapsedTime = endTime - startTime; // Time difference in milliseconds

    console.log('Time taken to fetch scrape data:', elapsedTime, 'ms');
    await client.set('myanimelist_news', JSON.stringify(data.slice(0,20)));
    // Send the data as response
    

  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
const scrapeAndStoreData = async () => {
  try {
    const response = await fetch('https://oga.onrender.com/');
    if (!response.ok) {
      throw new Error('Failed to fetch data from API');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data from API:', error);
    throw error;
  }
  try {
    const startTime = new Date();

    const options = {
      url: "https://myanimelist.net/news",
      list: true,
      bypassCors: true,
      mainSelector: ".news-list ",
      childrenSelector: [
        { key: "tags", selector: ".tags ", type: "text" },
        { key: "title", selector: ".title", type: "text" },
        { key: "writer", selector: ".info  ", type: "text" }, 
        { key: "description", selector: ".text ", type: "text" },
        { key: "imagex", selector: ".image ", attr: "src" },
      ],
    };

    // Perform the scraping operation
    const data = await scrapeHtmlWeb(options);
    
    // Store data in Redis
    await client.set('myanimelist_news', JSON.stringify(data.slice(0,20)));

    // Calculate the time taken
    const endTime = new Date();
    const elapsedTime = endTime - startTime; // Time difference in milliseconds

    console.log('Time taken to fetch scrape data:', elapsedTime, 'ms');
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// Execute the function initially
scrapeAndStoreData();

// Set up a scheduler to execute the function every 10 minutes
const intervalId = setInterval(scrapeAndStoreData, 1 * 60 * 1000);

// Handle process termination to clear the interval
process.on('SIGINT', () => {
  clearInterval(intervalId);
  console.log('Process terminated. Interval cleared.');
});






module.exports = app;
