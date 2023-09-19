const express = require("express");
const app = express();
const path = require('path');

const cookieParser = require('cookie-parser');

const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');


const errorMiddleWare = require('./middlewares/error');

// Setting up config file
require('dotenv').config({ path: 'backend/config/config.env' })



app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended:true }));
app.use(fileUpload());

//import routes
const products = require('./routes/products');
const user = require('./routes/user');
const order = require('./routes/order');
const payment = require('./routes/payment');




app.use('/api/v1', products);
app.use('/api/v1', user);
app.use('/api/v1', order);
app.use('/api/v1', payment);




//Error handling Middleware
app.use(errorMiddleWare);


module.exports = app;