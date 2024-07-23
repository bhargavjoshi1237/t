const express = require('express');
const axios = require('axios');  
const nodemailer = require('nodemailer'); 
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const wtf = require('wtf_wikipedia');
const wiki = require('wikipedia');
const NodeCache = require( "node-cache" );
const cache = new NodeCache({ stdTTL: 86400 }); // TTL is 10 seconds
const moment = require('moment');
const { createClient } = require('@supabase/supabase-js');
const cron = require('node-cron')
const transporter = nodemailer.createTransport({
  host: 'smtp.resend.com',
  port: 465,
  auth: {
    user: 'resend',
    pass: 're_YnujrVoN_C3RfTaVLHeBV1oNDP1ZcZPP2'
  }
});
const bodyParser = require('body-parser');
// Create a single supabase client for interacting with your database
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  // CORS headers for allowing cross-origin requests
  res.header('Access-Control-Allow-Origin', 'https://wss-hqv8eibx9-bhargavjoshi1237.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

const supabaseUrl = 'https://imyvybtnpcbilsvgelve.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlteXZ5YnRucGNiaWxzdmdlbHZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMDY0MjkzNiwiZXhwIjoyMDM2MjE4OTM2fQ.9i8lh1ajWsqeWLF1QtqsrGC-cj2RhETeoGwEl3_RNcA';  // Replace with your Supabase API Key
const supabase = createClient(supabaseUrl, supabaseKey);

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

app.get('/bwd/:url', async (req, res) => {
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
    const url = `https://www.amazon.in/s?k=${isbn+" Paperback"}`;

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



app.get('/abe/:name', async (req, res) => {
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



app.get('/homepage', async (req, res) => {
  const cachedData = cache.get('homepage');
  if (cachedData) {
    console.log("SENDED CASHED DATA")
    return res.json(cachedData);
  }
  try {
   
    const [highestRated, topUpcoming, topPublishing, trendingThisWeek, anilist] = await Promise.all([
      axios.get(urls.highestRated),
      axios.get(urls.topUpcoming),
      axios.get(urls.topPublishing),
      axios.get(urls.trendingThisWeek),
      axios(urls.anilist.url, urls.anilist.options)
    ]);

    const response = {
      highestRated: highestRated.data,
      topUpcoming: topUpcoming.data,
      topPublishing: topPublishing.data,
      trendingThisWeek: trendingThisWeek.data,
      anilist: anilist.data
    };
    cache.set('homepage', response);
    console.log("Date Cashed")
    res.json(response);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

const urls = {
  highestRated: 'https://kitsu.io/api/edge/manga?page%5Blimit%5D=10&sort=-average_rating',
  topUpcoming: 'https://kitsu.io/api/edge/manga?filter%5Bstatus%5D=upcoming&page%5Blimit%5D=10&sort=-user_count',
  topPublishing: 'https://kitsu.io/api/edge/manga?page%5Blimit%5D=10&sort=-user_count',
  trendingThisWeek: 'https://kitsu.io/api/edge/trending/manga?limit=10',
  anilist: {
    url: 'https://graphql.anilist.co',
    options: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      data: JSON.stringify({
        query: `
        query($page:Int = 1 $id:Int $type:MediaType $isAdult:Boolean = false $search:String $format:[MediaFormat]$status:MediaStatus $countryOfOrigin:CountryCode $source:MediaSource $season:MediaSeason $seasonYear:Int $year:String $onList:Boolean $yearLesser:FuzzyDateInt $yearGreater:FuzzyDateInt $episodeLesser:Int $episodeGreater:Int $durationLesser:Int $durationGreater:Int $chapterLesser:Int $chapterGreater:Int $volumeLesser:Int $volumeGreater:Int $licensedBy:[Int]$isLicensed:Boolean $genres:[String]$excludedGenres:[String]$tags:[String]$excludedTags:[String]$minimumTagRank:Int $sort:[MediaSort]=[POPULARITY_DESC,SCORE_DESC]){Page(page:$page,perPage:20){pageInfo{total perPage currentPage lastPage hasNextPage}media(id:$id type:$type season:$season format_in:$format status:$status countryOfOrigin:$countryOfOrigin source:$source search:$search onList:$onList seasonYear:$seasonYear startDate_like:$year startDate_lesser:$yearLesser startDate_greater:$yearGreater episodes_lesser:$episodeLesser episodes_greater:$episodeGreater duration_lesser:$durationLesser duration_greater:$durationGreater chapters_lesser:$chapterLesser chapters_greater:$chapterGreater volumes_lesser:$volumeLesser volumes_greater:$volumeGreater licensedById_in:$licensedBy isLicensed:$isLicensed genre_in:$genres genre_not_in:$excludedGenres tag_in:$tags tag_not_in:$excludedTags minimumTagRank:$minimumTagRank sort:$sort isAdult:$isAdult){id title{userPreferred}coverImage{extraLarge large color}startDate{year month day}endDate{year month day}bannerImage season seasonYear description type format status(version:2)episodes duration chapters volumes genres isAdult averageScore popularity nextAiringEpisode{airingAt timeUntilAiring episode}mediaListEntry{id status}studios(isMain:true){edges{isMain node{id name}}}}}}
        `,
        variables: {
          page: 1,
          type: 'MANGA',
          sort: ["TRENDING_DESC","POPULARITY_DESC"]
        }
        
      })
    }
  }
};

app.get('/bw/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const url = `https://www.bookswagon.com/search-books/${encodeURIComponent(name)}`;

    // Fetch the page from Bookswagon
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const books = [];

    $('.list-view-books').each((index, element) => {
      const book = {};
      book.serialNo = $(element).find('.serialno').text().trim();
      book.cover = $(element).find('.cover img').attr('src');
      book.title = $(element).find('.title a').text().trim();
      book.link = $(element).find('.title a').attr('href');
      book.author = $(element).find('.author-publisher a').first().text().trim();
      book.publisher = $(element).find('.author-publisher a').last().text().trim();
      book.rating = $(element).find('.avergageratingslider').val();
      book.priceList = $(element).find('.price .list').text().trim();
      book.priceSell = $(element).find('.price .sell').text().trim();
      book.binding = $(element).find('.attributes-head:contains("Binding:")').next().text().trim();
      book.releaseDate = $(element).find('.attributes-head:contains("Release:")').next().text().trim();
      book.language = $(element).find('.attributes-head:contains("Language:")').next().text().trim();
      book.stockInfo = $(element).find('.available-stock').text().trim();
      book.shippingInfo = $(element).find('.shipping-info').text().trim();

      books.push(book);
    });

    res.json(books);
  } catch (error) {
    console.error('Error fetching Bookswagon page:', error);
    res.status(500).json({ error: 'Failed to fetch Bookswagon page' });
  }
});



app.get('/isbn/:name', async (req, res) => {
  try {
    const { name } = req.params;

    // Search criteria
    const searchcrit1 = name;
    const ebooks_yesno = "no";
    const subject = "manga";
    const binding = "paperback";

    // Fetch data from ABC API
    const response = await axios.post('https://abc.nl/api/advanced_search_results/search', new URLSearchParams({
      searchcrit1,
      subject,
      binding,
      ebooks_yesno
    }));
    let items = response.data.items;
    const uniqueItems = [];
    const isbnSet = new Set();

    for (const item of items) {
      if (!isbnSet.has(item.isbn)) {
        isbnSet.add(item.isbn);
        uniqueItems.push(item);
      }
    }

    uniqueItems.sort((a, b) => a.pubdate_sort.localeCompare(b.pubdate_sort));

    const processedItems = uniqueItems.map(item => {
      const updatedCover = item.cover.slice(0, -3) + '300';
      return {
        cover: `https://abc.nl${updatedCover}`,
        title: item.title,
        slug: item.slug,
        isbn: item.isbn,
        valuta: item.valuta,
        publisher: item.publisher,
        price: item.price,
        pubdate: item.pubdate,
        pubdate_sort: item.pubdate_sort,
        author: item.author,
        favorite: item.favorite,
        binding: item.binding,
        coreTitle: item.coreTitle,
        info: item.info
      };
    });
    res.json(processedItems);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

async function checkPrices() {
  try {
    const { data, error } = await supabase
      .from('watchlist')
      .select();

    if (error) {
      console.error('Error fetching watchlist:', error);
      return;
    }
    const priceChanges = [];
    for (const item of data) {
      if (item.platform === 'amazon') {
        const currentPrice = await amazonfetch(item.isbn);
        const currentPrices = parseInt(currentPrice.substring(1))
        const oldPrice = (item.price_when_added);
        console.log(currentPrices,oldPrice)
        if (currentPrices < oldPrice ) {
          console.log("Price Changed REPOT CREATING")
          const priceChange = {
            title: item.title,
            oldPrice: oldPrice,
            newPrice: currentPrices,
            isbn: item.isbn,
            link: item.link,
            email: item.email,
          };

          priceChanges.push(priceChange);

          // Send email notification
          await sendEmailNotification(item.email, 'Price Drop Alert', `The price of ${item.title} has dropped from ₹${oldPrice} to ₹${currentPrice}. Check it out here: ${item.link}`);
        }
      }
    }

    if (priceChanges.length > 0) {
      // Insert price change report into PriceHistory table
      const { error: insertError } = await supabase.from('pricehistory').insert([{ report: priceChanges, date:Date() }]);
      if (insertError) throw insertError;

      console.log('Price change report inserted into PriceHistory table');
    }
  } catch (error) {
    console.error('Error in checkPrices:', error);
  }
}

// sendEmailNotification("bhargavjoshi1237@gmail.com")
async function sendEmailNotification(email,title,price) {
  const mailOptions = {
    from: 'onboarding@animealley.online',
    to: email,
    subject: `${title} price drop alert!`,
    text: `The price of ${title} has dropped to ${price}!`,
    html: `<h3>The price of ${title} has dropped to ${price}!</h3>`
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    console.log(`Email successfully sent to ${email} regarding the price drop of `);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
// cron.schedule('0 0 * * *', () => {
//   console.log('Running price check...');
//   checkPrices();
// });

async function amazonfetch(isbn){
 
    const url = `https://www.amazon.in/s?k=${isbn+" Paperback"}`;

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
  
     const price = prices[0] || 'N/A' 
      console.log(price)
      return price
   
  }


// GraphQL query
const query = `query{genres:GenreCollection tags:MediaTagCollection{name description category isAdult}}`;

// GraphQL query variables
const variables = {
  search: "Fate/Zero",
  page: 1,
  perPage: 3
};





module.exports = app;
