const express = require('express');
const connectToDB = require('./db/db.js');
const cookieParser = require('cookie-parser')
const cors = require('cors')


connectToDB();

const app = express();


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(cors());



module.exports = app;
