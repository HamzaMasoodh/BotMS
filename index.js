const express = require('express');
const app = express();
var cors = require('cors')
require('./src/db/connectdb.js')
const botRouter = require('./src/routers/botRouter');
const Bot = require('./src/model/botModel')


// Connecting To Port
const port = process.env.port || 8080;
// Automatically parse incoming JSON to an object so we access it in our request handlers
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors())
// Using the botRouter file
app.use(botRouter);



// listening To Port
app.listen(port, () => {
    console.log(`This is the ${port} active port`);
});