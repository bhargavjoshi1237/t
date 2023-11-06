const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
// import { kv } from "@vercel/kv";

require('dotenv').config();
const middlewares = require('./middlewares');
const api = require('./api');

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
  let page = req.query.page;
  try {
    // Make a fetch request to an external API
    const apiUrl = 'https://caring-fawn-44928.upstash.io/get/user';
    const fetchOptions = {
      headers: {
        Authorization: "Bearer Aa-AASQgNTkwY2Q2NjAtN2FjZC00MzdhLWI4ZDQtZDQwMmQxOGJjODNjZTA0YjkzZDU1MDIyNDQyNDliN2QwNjE5NWQxOTI5NDA="
      }
    };

    fetch("https://caring-fawn-44928.upstash.io/get/"+page, {
      headers: {
        Authorization: "Bearer Aa-AASQgNTkwY2Q2NjAtN2FjZC00MzdhLWI4ZDQtZDQwMmQxOGJjODNjZTA0YjkzZDU1MDIyNDQyNDliN2QwNjE5NWQxOTI1NDA="
      }
    }).then(response => response.json())
      .then(data => res.json(data.result));


    const response = await fetch(apiUrl, fetchOptions);
    if (!response.ok) {
      console.log(JSON.stringify(response.result))
    }

  } catch (error) {
    // Handle any errors that occur during the fetch or JSON parsing
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/v1', api);



app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
