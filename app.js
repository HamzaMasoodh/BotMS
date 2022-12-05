const express = require('express');
const app = express();
require('../server-side/src/db/connectdb.js')
const botRouter = require('../server-side/src/routers/botRouter');

// Connecting To Port
const port = 8080;

// Automatically parse incoming JSON to an object so we access it in our request handlers
app.use(express.json())
app.use(express.urlencoded({extended: false}))

// Using the botRouter file
app.use(botRouter);

// listening To Port
app.listen(port, () => {
    console.log(`This is the ${port} active port`);
});