const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const wiki = require('wikipedia');
const NodeCache = require( "node-cache" );
const cache = new NodeCache({ stdTTL: 86400 }); // TTL is 10 seconds

const app = express();

app.use((req, res, next) => {
  // CORS headers for allowing cross-origin requests
  res.header('Access-Control-Allow-Origin', 'https://wss-hqv8eibx9-bhargavjoshi1237.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.get('/updatecashtime/:time', (req, res) => {
  const newCacheTime = parseInt(req.params.time, 10);

  if (isNaN(newCacheTime) || newCacheTime <= 0) {
    return res.status(400).json({ error: 'Invalid cache time provided' });
  }

  cache.options.stdTTL = newCacheTime;
  res.json({ message: `Cache time updated to ${newCacheTime} seconds` });
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

app.get('/amazon/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params;
    const url = `https://www.amazon.in/s?k=${isbn}`;

    // Launch Puppeteer in headless mode
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set a random user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Go to the URL
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for the page to load
    await page.waitForFunction(
      'window.performance.timing.loadEventEnd - window.performance.timing.navigationStart >= 500'
    );
  
    // Get the HTML content
    const pageSourceHTML = await page.content();
  
    // Close the browser
    await browser.close();
  
    // Load the HTML into Cheerio
    const $ = cheerio.load(pageSourceHTML);
  
    // Extract the price elements
    const prices = [];
    $('.a-price-whole').each((index, element) => {
      prices.push("₹"+$(element).text().trim());
    });

    // Extract the links with target="_blank"
    const externalLinks = [];
    $('a[target="_blank"]').each((index, element) => {
      externalLinks.push("https://www.amazon.in/"+$(element).attr('href'));
    });

    // Prepare the response
    const response = {
      price: prices[0] || 'N/A', // Default to 'N/A' if no price found
      externalLink: externalLinks[0] || 'N/A' // Default to 'N/A' if no link found
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching Amazon page:', error);
    res.status(500).json({ error: 'Failed to fetch Amazon page' });
  }
});

app.get('/flipkart/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params;
    const url = `https://www.flipkart.com/search?q=${isbn}`;

    // Launch Puppeteer in headless mode
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set a random user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Go to the URL
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for the page to load
    await page.waitForFunction(
      'window.performance.timing.loadEventEnd - window.performance.timing.navigationStart >= 500'
    );
  
    // Get the HTML content
    const pageSourceHTML = await page.content();
  
    // Close the browser
    await browser.close();
  
    // Load the HTML into Cheerio
    const $ = cheerio.load(pageSourceHTML);
  
    // Extract the price elements
    const prices = [];
    $('.Nx9bqj').each((index, element) => {
      prices.push($(element).text().trim());
    });

    // Extract the links
    const links = [];
    $('.DMMoT0').each((index, element) => {
      links.push($(element).attr('href'));
    });

    // Prepare the response
    const response = {
      price: prices[0] || 'N/A', // Default to 'N/A' if no price found
      link: links[0] ? `https://www.flipkart.com${links[0]}` : 'N/A' // Default to 'N/A' if no link found
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching Flipkart page:', error);
    res.status(500).json({ error: 'Failed to fetch Flipkart page' });
  }
});

app.get('/crossword/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params;
    const url = `https://www.crossword.in/pages/search?q=${isbn}`;

    // Launch Puppeteer in headless mode
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set a random user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Go to the URL
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for the page to load
    await page.waitForFunction(
      'window.performance.timing.loadEventEnd - window.performance.timing.navigationStart >= 500'
    );
  
    // Get the HTML content
    const pageSourceHTML = await page.content();
  
    // Close the browser
    await browser.close();
  
    // Load the HTML into Cheerio
    const $ = cheerio.load(pageSourceHTML);
  
    // Extract the price elements
    const prices = [];
    $('.wizzy-product-item-price').each((index, element) => {
      prices.push($(element).text().trim());
    });

    // Extract the links
    const links = [];
    $('a.wizzy-result-product-item').each((index, element) => {
      const href = $(element).attr('href');
      if (href) {
        links.push(href);
      }
    });

    // Check if price contains '\n' indicating no product found
    let price = prices[0] || 'N/A';
    let link = links[0] || 'N/A';

    if (price.includes('\n')) {
      price = 'Not available';
      link = 'Not available';
    }

    // Prepare the response
    const response = { price, link };
    res.json(response);
  } catch (error) {
    console.error('Error fetching Crossword page:', error);
    res.status(500).json({ error: 'Failed to fetch Crossword page' });
  }
});



app.get('/name/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const url = `https://www.abebooks.com/servlet/HighlightInventory?ds=30&kn=${name}`;

    // Fetch data from AbeBooks API
    const response = await axios.get(url);
    const data = response.data;

    // Extract the first item from SORT_MODE_RELEVANCE
    const relevantItems = data.highlightedItemsMap.SORT_MODE_RELEVANCE;
    if (relevantItems.length === 0) {
      return res.status(404).json({ error: 'No relevant items found' });
    }

    const firstItem = relevantItems[0];
    const { title, author, imageUrl } = firstItem;

    // Extract ISBN from imageUrl
    const isbnMatch = imageUrl.match(/isbn\/(\d+)-/i);
    const isbn = isbnMatch ? isbnMatch[1] : '';

    // Check if the title matches the name parameter
    const isTitleMatch = title.toLowerCase() === name.toLowerCase();

    // Prepare response JSON
    const responseData = {
      title,
      author,
      imageLink: imageUrl,
      isbn,
      isTitleMatch
    };

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching AbeBooks data:', error);
    res.status(500).json({ error: 'Failed to fetch AbeBooks data' });
  }
});


app.get('/wikipidia/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const url = `https://en.wikipedia.org/api/rest_v1/page/segments/${name}`;

    // Fetch data from Wikipedia API
    const response = await axios.get(url);
    const { segmentedContent } = response.data;

    // Load the HTML into Cheerio
    const $ = cheerio.load(segmentedContent);

    // Find the table with class wikitable
    const mangaTable = $('table.wikitable');
    if (mangaTable.length === 0) {
      return res.status(404).json({ error: 'Manga table not found' });
    }

    // Check if the table has headers for English release date and English ISBN
    const headers = mangaTable.find('th');
    const englishReleaseDateIndex = headers.toArray().findIndex(header => $(header).text().trim().toLowerCase() === 'english release date');
    const englishISBNIndex = headers.toArray().findIndex(header => $(header).text().trim().toLowerCase() === 'english isbn');

    if (englishReleaseDateIndex === -1 || englishISBNIndex === -1) {
      return res.status(404).json({ error: 'English release date or English ISBN not found in table' });
    }

    // Extract the release dates and ISBNs from the table
    const mangaData = [];
    mangaTable.find('tbody > tr').each((index, row) => {
      if (index === 0) return; // Skip the header row

      const volumeNumber = $(row).find('th').text().trim();
      const englishReleaseDate = $(row).find('td').eq(englishReleaseDateIndex - 1).contents().filter((_, el) => el.type === 'text').text().trim();
      const englishISBN = $(row).find('td').eq(englishISBNIndex - 1).text().trim().replace(/-/g, '');
      
      // Push the extracted data into the mangaData array if both values are present
      if (englishReleaseDate && englishISBN) {
        mangaData.push({
          volume: volumeNumber,
          englishReleaseDate,
          englishISBN
        });
      }
      
    });

    res.json(mangaData);
  } catch (error) {
    console.error('Error fetching Wikipedia page:', error);
    res.status(500).json({ error: 'Failed to fetch Wikipedia page' });
  }
});


const fetchMangaDexData = async (title) => {
  const response = await fetch(`https://api.mangadex.org/manga?title=${encodeURIComponent(title)}&includes[]=cover_art&limit=1`);
  const data = await response.json();
  const manga = data.data[0];
  if (manga) {
    const id = manga.id;
    const malLink = manga.attributes.links?.mal || null;
    const coverArt = manga.relationships.find(rel => rel.type === 'cover_art');
    return {
      title,
      id,
      malLink,
      coverArt: coverArt ? {
        volume: coverArt.attributes.volume,
        fileName: `https://uploads.mangadex.org/covers/${id}/${coverArt.attributes.fileName}`
      } : null
    };
  }
  return null;
};

const fetchComics = async (comicsArray, limit = 5, requireMalLink = true) => {
  const results = [];
  let attempts = 0;
  const maxAttempts = comicsArray.length;

  for (const comic of comicsArray) {
    if (results.length >= limit || attempts >= maxAttempts) break;
    const title = comic.title;
    const mangaData = await fetchMangaDexData(title);
    if (mangaData && (mangaData.malLink || !requireMalLink)) {
      results.push(mangaData);
    }
    attempts++;
  }

  return results;
};

app.get('/homepage', async (req, res) => {
  const cachedData = cache.get('homepage');
  if (cachedData) {
    console.log("SENDED CASHED DATA")
    return res.json(cachedData);
  }
  try {
    const comickResponse = await fetch('https://api.comick.io/top?accept_mature_content=true');
    const comickData = await comickResponse.json();

    const topFollowComics7 = await fetchComics(comickData.topFollowComics['7'], 5);
    const topFollowComics30 = await fetchComics(comickData.topFollowComics['30'], 5);
    const topFollowComics90 = await fetchComics(comickData.topFollowComics['90'], 5);

    const topFollowNewComics7 = await fetchComics(comickData.topFollowNewComics['7'], 5);
    const topFollowNewComics30 = await fetchComics(comickData.topFollowNewComics['30'], 5);
    const topFollowNewComics90 = await fetchComics(comickData.topFollowNewComics['90'], 5);

    const trending7 = await fetchComics(comickData.trending['7'], 5);
    const trending30 = await fetchComics(comickData.trending['30'], 5);
    const trending90 = await fetchComics(comickData.trending['90'], 5);

    const recentRank = await fetchComics(comickData.recentRank, 5, false); // Allow results without MAL links
    const topRank = await fetchComics(comickData.rank, 5);
    cache.set('homepage', ({
      topFollowComics: {
        '7': topFollowComics7,
        '30': topFollowComics30,
        '90': topFollowComics90
      },
      topFollowNewComics: {
        '7': topFollowNewComics7,
        '30': topFollowNewComics30,
        '90': topFollowNewComics90
      },
      trending: {
        '7': trending7,
        '30': trending30,
        '90': trending90
      },
      recentRank,
      topRank
    }));
    console.log(" DATA CASHED")

    res.json({
      topFollowComics: {
        '7': topFollowComics7,
        '30': topFollowComics30,
        '90': topFollowComics90
      },
      topFollowNewComics: {
        '7': topFollowNewComics7,
        '30': topFollowNewComics30,
        '90': topFollowNewComics90
      },
      trending: {
        '7': trending7,
        '30': trending30,
        '90': trending90
      },
      recentRank,
      topRank
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});


module.exports = app;
