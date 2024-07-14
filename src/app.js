const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

app.use((req, res, next) => {
  // CORS headers for allowing cross-origin requests
  res.header('Access-Control-Allow-Origin', 'https://wss-hqv8eibx9-bhargavjoshi1237.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.get('/', async (req, res) => {
  res.json("Hello, this is the root endpoint.");
});

app.get('/bookswagon/:url', async (req, res) => {
  try {
    const { url } = req.params;
    const response = await axios.get("https://www.bookswagon.com/search-books/" + url);
    const html = response.data;
    const $ = cheerio.load(html);

    // Extracting the label content
    const label = $('#ctl00_phBody_ProductDetail_lblourPrice').text().trim();

    // Extracting book details
    const bookDetailDiv = $('#bookdetail');
    const details = {};
    bookDetailDiv.find('li').each((i, elem) => {
      const key = $(elem).find('span.font-weight-bold').text().replace(':', '').trim();
      const value = $(elem).contents().not($(elem).find('span.font-weight-bold')).text().trim();
      details[key] = value;
    });

    // Extracting release label
    const release = $('#ctl00_phBody_ProductDetail_lblRelease').text().replace(` | Released: `, '').trim();

    // Extracting paragraphs
    const aboutBookText = $('#aboutbook').text().replace('About the Book', '').trim();

    // Extracting author details
    const authorDetailDiv = $('.authordetailtext');
    const authors = [];
    authorDetailDiv.find('label').each((i, elem) => {
      const text = $(elem).text().trim().replace(`By: `, '');
      if (text) {
        const labelId = $(elem).attr('id');
        if (labelId.includes('lblAuthor') && !labelId.includes('Type')) {
          authors.push({ author: text });
        } else if (labelId.includes('lblAuthorType')) {
          const lastAuthor = authors[authors.length - 1];
          if (lastAuthor) {
            lastAuthor.role = text;
          }
        }
      }
    });

    // Checking availability
    const availability = $('#ctl00_phBody_ProductDetail_lblAvailable').text().trim();
    const isAvailable = availability !== 'Out of Stock';

    // Extracting bestseller books
    const bestsellerBooksArray = [];
    $('#bestsellerdetail .card.cardtest').each((i, elem) => {
      const book = {};
      const anchor = $(elem).find('a');
      const img = $(elem).find('img');
      book.name = anchor.attr('title');
      book.image = img.attr('src');
      book.link = anchor.attr('href');
      bestsellerBooksArray.push(book);
    });

    // Constructing JSON response
    const responseData = {
      labelContent: label,
      bookDetails: details,
      releaseLabel: release,
      paragraphs: aboutBookText,
      authorDetails: authors,
      isOutOfStock: !isAvailable,
      bestsellerBooks: bestsellerBooksArray
    };

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching and parsing HTML:', error);
    res.status(500).json({ error: 'Failed to fetch data from Bookswagon' });
  }
});

module.exports = app;
