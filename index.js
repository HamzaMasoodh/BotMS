const express = require('express');
const app = express();
require('./src/db/connectdb.js')
const botRouter = require('./src/routers/botRouter');
const Bot = require('./src/model/botModel')


// Connecting To Port
const port = process.env.port || 8080;

// Automatically parse incoming JSON to an object so we access it in our request handlers
app.use(express.json())
app.use(express.urlencoded({extended: false}))

// Using the botRouter file
app.use(botRouter);

app.get('/readingBot', async (req, res) => {
    try {
        const readBot = "await Bot.find({})"
        console.log(new Date().toLocaleString() + ' ' + 'Loading To Read Bot...')
        res.send(readBot) 
        console.log(new Date().toLocaleString() + ' ' + 'Reading Bot...')    
    } catch(e) {
        res.status(500).send(e);
    }
})

// listening To Port
app.listen(port, () => {
    console.log(`This is the ${port} active port`);
});