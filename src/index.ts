import cors from 'cors';
import {conection} from './db/connectdb'
require('./db/connectdb')
import {botRouter} from'./routers/botRouter'
import {Bot} from'./model/botModel'
import express, { Express } from 'express';
const app: Express = express();

// app.use(conection)
conection

// Connecting To Port
const port = process.env.port || 8080;
// Automatically parse incoming JSON to an object so we access it in our request handlers
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cors());
// Using the botRouter file
app.use(botRouter);




// listening To Port
app.listen(port, () => {
    console.log(`This is the ${port} active port`);
});