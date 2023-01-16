import { default as cors } from 'cors';
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
app.options("/*", (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.status(200).send();
  });
  
app.use(cors({
  origin: 'https://exquisite-naiad-58c7e6.netlify.app/',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// Using the botRouter file
app.use(botRouter);




// listening To Port
app.listen(port, () => {
    console.log(`This is the ${port} active port`);
});